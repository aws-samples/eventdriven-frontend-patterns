// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { IoTDataPlaneClient, PayloadFormatIndicator, PublishCommand } from "@aws-sdk/client-iot-data-plane";
import { Logger } from "@aws-lambda-powertools/logger";
import { Order } from "./order";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 * @typedef { import('./order') }
 */

const { IoTCoreEndpoint, OrdersTopic, AWS_REGION } = process.env;

const logger = new Logger();

const client = new IoTDataPlaneClient({
  // endpoint: IoTCoreEndpoint,
  region: AWS_REGION
});

/**
 * Execute the GraphQL mutation.
 * @param {string} query 
 * @param {*} variables 
 */
const publish = async({ topic, payload }) => {
  const r = await client.send(
    new PublishCommand({
      topic,
      payload: JSON.stringify(payload),
      payloadFormatIndicator: PayloadFormatIndicator.UTF8_DATA
    })
  );

  console.log(JSON.stringify(r));
};

const create = async(order) => {
  await publish({
    topic: OrdersTopic,
    payload: {
      orderId: order.orderId,
      status: order.status,
      updatedAt: order.updatedAt,
      event: "CREATED"
    }
  });
};

/**
 * Update the order via the GraphQL API
 * @param {*} order 
 */
const update = async(order) => {
  await publish({
    topic: OrdersTopic,
    payload: {
      orderId: order.orderId,
      status: order.status,
      updatedAt: order.updatedAt,
      event: "UPDATED"
    }
  });
};

/**
 * 
 * @param {import("@types/aws-lambda").DynamoDBStreamEvent} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
exports.handler = async(event, _) => {
  logger.debug(event);
  
  let batchItemFailures = [];
  for (let record of event.Records) {
    try {
      const order = Order.fromStream(record.dynamodb.NewImage);

      if (record.eventName === "MODIFY") {
        await update(order);
      } else if (record.eventName === "INSERT") {
        await create(order);
      }
    } catch (err) {
      logger.error('Operation failed');
      logger.error(err);
      batchItemFailures.push({ "itemIdentifier": record.dynamodb.SequenceNumber })
    }
  }

  return {
    batchItemFailures
  }
};
