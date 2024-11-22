# Patterns for building event-driven web and mobile app backends

User interfaces by their nature are event driven - interactions trigger events that drive the application. But integrations between frontend and backend are often built synchronously using a request/response pattern. The samples in this repository explore patterns to enable asynchronous, event-driven integrations with the frontend. These real-world patterns bring the agility and responsiveness of EDA across client-server interactions.

> Patterns in this repository accompany API305: Asynchronous frontends: Building seamless event-driven experiences.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
      </ul>
    </li>
    <li>
      <a href="#deploy-patterns">Deploy patterns</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#option-1-deploy-all-resources-at-once">Option 1: Deploy all resources at once</a></li>
        <li><a href="#option-2-deploy-pattern-independently">Option 2: Deploy pattern independently</a></li>
      </ul>
    </li>
    <li><a href="#available-patterns">Available patterns</a></li>
    <li><a href="#starting-the-frontend">Starting the frontend</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#authors">Authors</a></li>
  </ol>
</details>

## Getting started

To get started, clone this repository and change directories to the `flight-status` example.

``` bash
git clone https://github.com/aws-samples/eventdriven-frontends
cd eventdriven-frontends/flight-status
```

### Prerequisites

Patterns are deployed to the AWS Region of your choice. Note that all services must be [available in the selected Region](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/):

1. Select your preferred AWS Region.
2. [Install AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html). All deployments are via SAM CLI.
3. Install [Node.js](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) and [esbuild](https://esbuild.github.io/getting-started/) or build with the `--use-container` option.

## Deploy patterns

### Option 1: Deploy all resources at once

All shared resources and patterns will be deployed using a similar CloudFormation / AWS SAM template. Patterns are deployed as nested stacks. Note that this option can take a few minutes to complete.

To deploy all shared resources and patterns:

``` bash
sam build --base-dir . && sam deploy --guided --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_IAM CAPABILITY_NAMED_IAM
```

Respond to the prompts:

  - `Stack Name [patterns-eventdriven-frontends-shared]:` *enter your own stack name or accept default*
  - `AWS Region [us-west-2]:` *select a Region, any will work*
  - `Parameter ProjectName [patterns-eventdriven-frontends]:` *keep the default*
  - `Parameter IoTCoreEndpoint []:` *see below*
  - `Parameter MaxSecondsToNextFlight [20]:` *keep the default*
  - `Parameter MaxWaitBetweenStatusChange [30]:` *keep the default*
  - `Parameter pDeployPattern0 [true]:` *true to enable pattern; else false*
  - `Parameter pDeployPattern1 [true]:` *true to enable pattern; else false*
  - `Parameter pDeployPattern2 [true]:` *true to enable pattern; else false*
  - `Parameter pDeployPattern3 [true]:` *true to enable pattern; else false*
  - `Parameter pDeployPattern4 [true]:` *true to enable pattern; else false*
  - `Parameter pDeployPattern5 [true]:` *true to enable pattern; else false*
  - `Parameter pAppSyncEventsEndponts []:` *see below*
  - `Parameter pAppSyncEventsApiKey []:` *see below*
  - `Parameter pEventsApiChannel [flights/events]:` *keep the default*
  - `Confirm changes before deploy [y/N]:` *N*
  - `Allow SAM CLI IAM role creation [Y/n]:` *Y*
  - `Disable rollback [y/N]:` *N*
  - `Save arguments to configuration file [Y/n]:` *Y*
  - `SAM configuration file [samconfig.toml]:` *accept default*
  - `SAM configuration environment [default]:` *accept default*

#### `IoTCoreEndpoint`

IoT Core provides an [endpoint](https://docs.aws.amazon.com/iot/latest/developerguide/iot-connect-devices.html#iot-connect-device-endpoints) that is unique to your account and region. To find the endpoint for a region, use the `describe-endpoint` CLI command:

``` bash
aws iot describe-endpoint --endpoint-type iot:Data-ATS
```

You can also find the endpoint in the [AWS IoT Core console](https://console.aws.amazon.com/iot/home#/settings) settings page. Look for **Endpoint** in the **Device data endpoint** panel. Make note of the endpoint, we refer to it as `mqttEndpoint` moving forward.

Wait a few minutes while the shared resources are deployed. Make note of all outputs as you will need them to configure the frontend web application.

*We encourage you to review the `README` for all patterns you deploy for further details.*

---

### Option 2: Deploy pattern independently

To deploy one or more patterns separate from the others, folow the steps in Option 1 and select only the pattern(s) you want to deploy. The CloudFormation template will also deploy shared resources required to run the demo project.

> NOTE: Lambda functions included in this project are targeted for the `arm64` architecture. If your development machine is on an Intel processor, you will need to (1) install Docker and (2) add a flag in the build step `sam build --base-dir . --use-container && sam deploy --guided`.

*We encourage you to review the `README` for all patterns you deploy for further details.*

## Available patterns

- [Polling](./docs/0-polling.md)
- [Pattern #1: AWS AppSync + DynamoDB Stream](./docs/1-appsync.md)
- [Pattern #2: AWS AppSync + Amazon EventBridge](./docs/2-eventbridge.md)
- [Pattern #3: Amazon API Gateway WebSockets](./docs/3-apigw.md)
- [Pattern #4: AWS IoT Core](./docs/4-iot.md)
- [Pattern #5: AWS AppSync Events](./docs/#)

## Starting the frontend

The frontend included in this project is built using [React.js](https://react.dev). Other web and mobile application platforms could also be used.

Please note that some implementation decisions in the frontend were made to accommodate multiple patterns on the same screen, at the same time. We generally recommend the [AWS Amplify](https://docs.amplify.aws/javascript/start/getting-started/) client libraries to integrate your frontend applications with AWS resources used in the project (e.g., [Amazon API Gateway](https://aws.amazon.com/api-gateway/), [AWS AppSync](https://aws.amazon.com/appsync/), and [AWS IoT Core](https://aws.amazon.com/iot-core/)).

``` bash
cd frontend
```

Rename `frontend/src/appconfig.js.sample` to `frontend/src/appconfig.js`.

Open `frontend/src/appconfig.js` in your editor of choice. Update the configuration using outputs from the shared and pattern stacks.

``` js
const config = {
  region: "", // AWS region you deployed to
  identityPoolId: "", // `IdentityPoolId` from shared stack output
  sharedEndpoint: "", // `ApiEndpoint` from shared stack output, you must include `/Prod` at end
  pattern1: {
    endpoint: "" // `GraphQLEndpoint` from pattern 1 stack output
  },
  pattern2: {
    endpoint: "" // `GraphQLEndpoint` from pattern 2 stack output
  },
  pattern3: {
    wssEndpoint: "", // `WebSocketEndpoint` from pattern 3 stack output, you must include `wss://` at start and `/prod` at end
  },
  pattern4: {
    mqttEndpoint: "", // IoT Core endpoint for your account, see pattern 4 README
  },
  pattern5: {
    endpoint: "", // `Pattern5EventsEndpoint` from pattern 5 stack output
    apiKey: "" // `Pattern5EventsApiKey` from pattern 5 stack output
  },
  polling: {
    endpoint: "" // `ApiEndpoint` from polling stack output
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


## Roadmap

- [ ] Add custom resource to retrieve IoT Core endpoint instead of passing parameter


## Authors

* **Josh Kahn** - *initial work*
* **Kim Wendt** - *flight status version*