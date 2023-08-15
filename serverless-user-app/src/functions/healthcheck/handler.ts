import { APIGatewayProxyResult } from "aws-lambda";
import { formatResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    return formatResponse({ message: "pong" }, 200);
  } catch (error) {
    return formatResponse({ error }, 500);
  }
};

export const hello = middyfy(handler);
