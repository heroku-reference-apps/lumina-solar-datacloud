export default async function (fastify, _opts) {
  fastify.addSchema({
    $id: 'notification',
    type: 'object',
    properties: {
      systemId: { type: 'string' },
      totalProducedEnergy: { type: 'number' },
      totalConsumedEnergy: { type: 'number' },
      remainingEnergy: { type: 'number' },
    },
    required: [
      'systemId',
      'totalProducedEnergy',
      'totalConsumedEnergy',
      'remainingEnergy',
    ],
  });

  fastify.post('/webhook', async function (request, reply) {
    const payload = request.body;
    fastify.log.info(payload);
    reply.send({ status: 'success' });
  });

  fastify.post(
    '/notify',
    { schema: { body: { $ref: 'notification#' } } },
    async function (request, reply) {
      const payload = request.body;
      fastify.log.info(payload);
      await fastify.db.createNotification(payload);
      reply.send({ status: 'success' });
    }
  );

  fastify.get('/notifications', async function (request, reply) {
    const notifications = await fastify.db.getNotifications();
    reply.send(notifications);
  });
}
