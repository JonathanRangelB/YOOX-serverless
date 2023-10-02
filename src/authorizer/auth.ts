const jwt = require("jsonwebtoken")

import {
    Context,
    APIGatewayRequestAuthorizerEventV2,
    PolicyDocument,
    Callback,
} from 'aws-lambda';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';


const generatePolicyDocument = (effect: string, resource: string): PolicyDocument => ({
    Version: "2012-10-17",
    Statement: [
        {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: [resource],
        },
    ],
});

const generateResponse = (principalId: string, effect: string, resource: string) => ({
    principalId,
    policyDocument: generatePolicyDocument(effect, resource),
});

module.exports.handler = (event: APIGatewayRequestAuthorizerEventV2, _: Context, callback: Callback) => {
    const { headers, routeArn } = event;
    console.log({ headers, routeArn });


    const authToken = headers?.authorization?.split("Bearer ")[1];

    if (!authToken) {
        console.error("Invalid authorization bearer token or not found");
        callback("Unauthorized");
    }


    jwt.verify(authToken, process.env.TOKEN_JWT, (err: any, decoded: any) => {
        if (err) {
            console.error(err.message);
            callback("Unauthorized");
            return
        }

        console.log({ decoded });
        callback(null, generateResponse("user", "Allow", routeArn));
    })
};