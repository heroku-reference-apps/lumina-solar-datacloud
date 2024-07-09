import 'dotenv/config';
import path from 'node:path';
import crypto from 'node:crypto';
import Fastify from 'fastify';
import FastifyAuth from '@fastify/auth';
import FastifyVite from '@fastify/vite';
import FastifyCookie from '@fastify/cookie';
import FastifySession from '@fastify/session';
import FastifyPostgres from '@fastify/postgres';
import FastifyFormBody from '@fastify/formbody';
import AutoLoad from '@fastify/autoload';
import Swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';

export async function build(opts = {}) {
  const fastify = Fastify(opts);

  await fastify.register(FastifyFormBody);
  await fastify.register(FastifyVite, {
    root: import.meta.url,
    renderer: '@fastify/react',
    dev: process.argv.includes('--dev'),
  });

  await fastify.vite.ready();

  fastify.register(FastifyCookie);
  fastify.register(FastifySession, {
    cookieName: 'SESSIONID',
    secret: crypto.randomBytes(32).toString('hex'),
    cookie: {
      secure: false,
    },
    expires: 60 * 60 * 1000,
  });

  fastify.register(Swagger, {
    openapi: {
      info: {
        title: 'Lumina Solar API',
        description: 'Provides access to the Lumina Solar API',
        version: '1.0',
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'SESSIONID',
          },
        },
      },
    },
    refResolver: {
      buildLocalReference: (json, _baseUri, _fragment, _i) => {
        return json.$id || `def-{i}`;
      },
    },
    transform: ({ schema, url, _route, _swaggerObject }) => {
      const transformedSchema = Object.assign({}, schema);
      if (!url.startsWith('/api')) {
        transformedSchema.hide = true;
      }

      return { schema: transformedSchema, url };
    },
  });

  fastify.register(SwaggerUI, {
    routePrefix: '/api-docs',
  });

  fastify.register(FastifyPostgres, {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'plugins'),
  });

  fastify
    .decorate('verifyUserAndPassword', async function (request, _reply) {
      const { username, password } = request.body;
      const isAuthenticated = await fastify.db.authenticate(username, password);
      if (!isAuthenticated) {
        throw new Error('Invalid credentials');
      }
    })
    .decorate('verifySession', async function (request, _reply) {
      if (!request.session || !request.session.user) {
        throw new Error('User not logged in');
      }
    })
    .register(FastifyAuth)
    .after(() => {
      // This loads all plugins defined in routes
      // define your routes in one of these
      fastify.register(AutoLoad, {
        dir: path.join(import.meta.dirname, 'routes'),
        options: {
          prefix: '/api',
        },
      });
    });

  await fastify.ready();
  fastify.swagger();
  return fastify;
}
