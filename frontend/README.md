# Patterns for building event-driven web and mobile app backends

User interfaces by their nature are event driven - interactions trigger events that drive the application. But integrations between frontend and backend are often built synchronously using a request/response pattern. The samples in this repository explore patterns to enable asynchronous, event-driven integrations with the frontend. These real-world patterns bring the agility and responsiveness of EDA across client-server interactions.

## Sample frontend

The frontend included in this project is built using [React.js](https://react.dev), though integration with other web and mobile development platforms is similar. We generally recommend the [AWS Amplify](https://docs.amplify.aws/javascript/start/getting-started/) client libraries to integrate your frontend applications with AWS resources used in the project (e.g., [Amazon API Gateway](https://aws.amazon.com/api-gateway/), [AWS AppSync](https://aws.amazon.com/appsync/), and [AWS IoT Core](https://aws.amazon.com/iot-core/)).

Details on frontend integration is described in the `README` included with each pattern. Where applicable, we document why various implementation choices were made, mostly to accommodate multiple patterns on the same screen, at the same time.

- [Pattern #1: AWS AppSync + DyanmoDB Stream](../patterns/1-appsync/README.md)
- [Pattern #2: AWS AppSync + Amazon EventBridge](../patterns/2-eb-to-appsync/README.md)
- [Pattern #3: Amazon API Gateway WebSockets](../patterns/3-apigw-websocket/README.md)
- [Pattern #4: AWS IoT Core](../patterns/4-iot-core/README.md)
- [Web Push](../patterns/push/README.md)

The frontend application can easily be run locally, there is no requirement to deploy it to a hosting provider.

### Starting the frontend

To start the frontend:

``` bash
cd frontend
```

Rename `frontend/src/appconfig.js.sample` to `frontend/src/appconfig.js`.

Open `frontend/src/appconfig.js` in your editor of choice. Update the configuration using outputs from the shared and pattern stacks. Details on these configuration values and where to find those values is available in the pattern `README` documents.

``` js
const config = {
  region: "", // AWS region you deployed to
  identityPoolId: "", // `IdentityPoolId` from shared stack output
  sharedEndpoint: "", // `ApiEndpoint` from shared stack output, you must include `/Prod` at end
  mqttEndpoint: "", // IoT Core endpoint for your account, see pattern 4 README
  pattern1: {
    endpoint: "" // `GraphQLEndpoint` from pattern 1 stack output
  },
  pattern2: {
    endpoint: "" // `GraphQLEndpoint` from pattern 2 stack output
  },
  pattern3: {
    endpoint: "" // `WebSocketEndpoint` from pattern 3 stack output, you must include `wss://` at start and `/prod` at end
  },
  push: {
    applicationServerKey: "" // your public key for web push, see push pattern README for details
  },
  chat: {
    endpoint: "" // `GraphQLEndpoint` from long-running stack output
  }
};
```

Save your changes.

Then install dependencies and start the development server.

``` bash
npm install

npm run dev
```

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.