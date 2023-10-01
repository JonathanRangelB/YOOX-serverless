<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS'
description: 'This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node HTTP API on AWS

This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.

This template does not include any kind of persistence (database). For more advanced examples, check out the [serverless/examples repository](https://github.com/serverless/examples/) which includes Typescript, Mongo, DynamoDB and other examples.

## Usage

### pnpm installation

This project currently uses pnpm instead the normal node npm, its matter of preference but pnpm offers a fast installation time compared with npm, you can use either though.

If you dont have pnpm installed you can follow their istructions on the [documentation page](https://pnpm.io/installation)

### Infisical .env manager

To get the corresponding .env file you need to get infisical installed into your machine, follow the instructions for your current OS on their [documentation page](https://infisical.com/docs/cli/overview#installation)

_NOTE_: make sure you are added to the project, for this you need to create a infisical account and request to be added to the owner of the project.

To fetch the env variables run the following command present on package.json file:

```bash
pnpm run getenv
```

this will fetch all env vars present on infisical servers and writen into .env file on the root folder.

Example .env file content:

```
SERVER='server_url'
DB_NAME='db_name'
USUARIO='db_user'
PASSWORD='db_password'
TOKEN_JWT='super_secret_token'
```

### Deployment

```bash
pnpm run publish
```

After deploying, you should see output similar to:

```bash
Deploying aws-node-http-api-project to stage dev (us-east-2)

✔ Service deployed to stack aws-node-http-api-project-dev (152s)

endpoint: POST: http://localhost:3000/v1/login
functions:
  login: login-service-dev-login
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/).

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl --location 'http://localhost:3000/v1/login' \
--header 'Content-Type: application/json' \
--data '{
    "userId": <USER>,
    "password": <PASSWORD>
}'
```

Which should result in response similar to the following (removed `data` content for brevity):

```json
{
  "recordset": [
    {
      ...
      "ID": 99999,
      "NOMBRE": "Jonathan Rangel",
      "ROL": "Administrador",
      ...
    }
  ],
  "rowsAffected": 1
}
```

### Local development

It is possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, execute the following command:

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```
serverless offline
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).
