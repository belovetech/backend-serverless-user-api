# AWS Serverless User App API

This project provides a Serverless API for a user app using AWS Lambda, DynamoDB, and other modern tools. It's built with TypeScript and Serverless Framework, making it easy to develop and deploy serverless applications.

## Getting Started

Follow these steps to set up and run the project on your local machine:

### Prerequisites

- Node.js (>=14.15.0)
- Serverless Framework (`npm install -g serverless`)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/belovetech/backend-serverless-api/tree/main/serverless-user-api
   cd aws-serverless-user-api
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

### Usage

- Run the application locally:

  ```sh
  npm start
  ```

  This starts the Serverless Offline plugin, allowing you to develop and test your API endpoints on your local machine.

- Build the application:

  ```sh
  npm run build
  ```

  This builds your Serverless application, which is ready for deployment.

- Run tests:

  ```sh
  npm test
  ```

  This runs tests using Mocha and TypeScript.

- Lint your code:

  ```sh
  npm run lint
  ```

  This runs ESLint to analyze your code for potential issues.

## Configuration

### `serverless.yml`

The `serverless.yml` file contains the Serverless Framework configuration for your application. Customize it to define your AWS resources, Lambda functions, and other settings.

### `package.json`

The `package.json` file lists the project's dependencies and provides various npm scripts for development, testing, and deployment. Make sure to keep your dependencies up to date.

