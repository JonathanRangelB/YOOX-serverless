import { APIGatewayEvent } from "aws-lambda";
import { generateJsonResponse } from "./helpers/generateJsonResponse";

module.exports.handler = async (event: APIGatewayEvent) => {
    console.log(event);
    return generateJsonResponse({ message: "Autorización éxitosa!" }, 200)
}