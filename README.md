# Lumina Solar - Data Cloud

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Integrate Heroku and Data Cloud using the [Heroku PostgreSQL Connector](https://devcenter.heroku.com/articles/connecting-heroku-postgres-to-salesforce-data-cloud) and the [Web and Mobile Application Connector](https://help.salesforce.com/s/articleView?id=sf.c360_a_web_mobile_app_connector.htm&type=5)

## Requirements

- Node.js LTS (>v20.x)
- An [Heroku](https://signup.heroku.com/) account
- A [Salesforce Data Cloud Developer Edition](https://trailhead.salesforce.com/content/learn/projects/create-a-data-stream-in-data-cloud/get-started-with-a-data-cloud-developer-edition?trail_id=get-hands-on-with-data-cloud) account
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- PostgreSQL [psql](https://www.postgresql.org/download/) client

## Installation

Install dependencies by running:

```sh
npm install
```

Create an Heroku application with:

```sh
heroku create <app-name>
```

Install the [Heroku PostgreSQL addon](https://elements.heroku.com/addons/heroku-postgresql):

```sh
 heroku addons:create heroku-postgresql:essential-0
```

Once the PostgreSQL database is created, setup the database schema with:

```sh
heroku pg:psql < data/schema.sql
```

Make sure to fetch the database configuration to your local project by running:

```sh
heroku config --shell > .env
```

Seed the database with mock data by running:

```sh
node data/seed.js
```

Run the project locally with:

```sh
npm run dev
```

## Manual Deployment

To manually deploy to Heroku you can run:

```sh
git push heroku main
```
