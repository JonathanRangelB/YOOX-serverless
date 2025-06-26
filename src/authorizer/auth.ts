import jwt from 'jsonwebtoken';

import {
  Context,
  APIGatewayRequestAuthorizerEventV2,
  PolicyDocument,
  Callback,
  StatementEffect,
} from 'aws-lambda';

const generatePolicyDocument = (
  effect: StatementEffect,
  resource: string
): PolicyDocument => ({
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: [resource],
    },
  ],
});

const generateResponse = (
  principalId: string,
  effect: StatementEffect,
  resource: string
) => ({
  principalId,
  policyDocument: generatePolicyDocument(effect, resource),
});

module.exports.handler = (
  event: APIGatewayRequestAuthorizerEventV2,
  _: Context,
  callback: Callback
) => {
  const { headers, routeArn } = event;

  const authToken = headers?.authorization?.split(' ')[1];

  if (!authToken) {
    console.error('Invalid authorization bearer token or not found');
    callback('Unauthorized, token cannot be null or undefined');
  }

  jwt.verify(authToken!, process.env.TOKEN_JWT!, (err: any, _: any) => {
    if (err) {
      console.warn({ err });
      callback('Unauthorized', generateResponse('user', 'Deny', routeArn));
      return;
    }
    callback(null, generateResponse('user', 'Allow', routeArn));
  });
};
