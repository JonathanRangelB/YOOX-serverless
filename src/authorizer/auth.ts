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
  // TODO: add context object
  // context: { stringKey: 'string value', numberKey: 123, booleanKey: true },
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
      // TODO: add response with error message correctly
      console.warn({ err });
      callback('Unauthorized', generateResponse('user', 'Deny', routeArn));
      // callback('Unauthorized, invalid token');
      return;
    }
    callback(null, generateResponse('user', 'Allow', routeArn));
  });
};

// example of authorization header used in AWS API Gateway with Lambda Authorizer
// {
//   "User-Agent": "PostmanRuntime/7.35.0",
//   "Accept": "*/*",
//   "Postman-Token": "353408d0-c44c-42a2-a4b3-66fbc1c0a9c1",
//   "Host": "localhost:3000",
//   "Accept-Encoding": "gzip, deflate, br",
//   "Connection": "keep-alive",
//   "Autorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWNvcmRzZXQiOlt7IklEIjoxLCJOT01CUkUiOiJTVVBFUlZJU09SIiwiUk9MIjoiQWRtaW5pc3RyYWRvciIsIkFDVElWTyI6dHJ1ZSwiSURfR1JVUE8iOm51bGwsIklEX1JPTCI6MX1dLCJpYXQiOjE3MDIxNzYyMDEsImV4cCI6MTcwMjE3ODAwMX0.WGERlIUhs0cRKUod891__frYcRX4KL-fRHW2N2uCFTY"
// }
