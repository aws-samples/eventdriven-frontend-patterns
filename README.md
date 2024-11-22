# Patterns for building event-driven web and mobile app backends

User interfaces by their nature are event driven - interactions trigger events that drive the application. But integrations between frontend and backend are often built synchronously using a request/response pattern. The samples in this repository explore patterns to enable asynchronous, event-driven integrations with the frontend. These real-world patterns bring the agility and responsiveness of EDA across client-server interactions.

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
      <a href="#available-examples">Example use cases</a>
    </li>
    <li><a href="#authors">Authors</a></li>
  </ol>
</details>

## Getting started

To get started, clone this repository:

``` bash
git clone https://github.com/aws-samples/eventdriven-frontends
```

### Prerequisites

Patterns are deployed to the AWS Region of your choice. Note that all services must be [available in the selected Region](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/):

1. Select your preferred AWS Region.
2. [Install AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html). All deployments are via SAM CLI.
3. Install [Node.js](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) and [esbuild](https://esbuild.github.io/getting-started/) or build with the `--use-container` option.

## Available examples

- [Order Fulfillment example](./order-fulfillment-example/README.md)
- [Flight Status example](./flight-status-example/README.md)

## Authors

* **Josh Kahn** - *initial work*
* **Kim Wendt** - *flight status example*