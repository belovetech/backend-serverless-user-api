import "dotenv/config";
import { AWS } from "@serverless/typescript";
import { ping } from "@functions/healthcheck";

const serverlessConfiguration: AWS = {
  service: "${env:SERVICE_NAME}",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-dynamodb-local",
    "serverless-dotenv-plugin",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: "arn:aws:dynamodb:us-east-1:*:table/UsersTable",
          },
        ],
      },
    },
    lambdaHashingVersion: "20201221",
  },
  functions: { ping },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node16",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    dynamodb: {
      start: { port: 8000, inMemory: true, docker: true, noStart: true },
      stage: "dev",
    },
    "serverless-offline": {
      httpPort: 3000,
      babelOptions: {
        presets: ["env"],
      },
    },
  },
  resources: {
    Resources: {
      UsersTable: {
        Type: "AWS:DynamoDB::Table",
        Properties: {
          TableName: "UsersTable",
          AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "email", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "email", KeyType: "RANGE" },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
