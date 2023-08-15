import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const dynamoDBClient = (): DocumentClient => {
  if (process.env.IS_OFFLINE) {
    console.info("Creating a local dynamoDB");
    return new AWS.DynamoDB.DocumentClient({
      region: "us-east-1",
      endpoint: "dynamodb-local:8000",
    });
  }
  return new AWS.DynamoDB.DocumentClient();
};

export default dynamoDBClient;
