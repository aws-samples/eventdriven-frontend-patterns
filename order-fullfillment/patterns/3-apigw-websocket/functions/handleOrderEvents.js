// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { Order, OrderStatus } from "./order";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 * @typedef { import('./order') }
 */

const logger = new Logger();

const { OrdersTable, AWS_REGION } = process.env;

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION}));

/**
 * Determine if the order event is a new order or an update.
 * @param {*} event 
 * @returns 
 */
const isNewOrder = (event) => {
  return event['detail-type'] === "New order created";
};

/**
 * Create a new order in the dynamodb table.
 * @param {Order} order 
 */
const createOrder = async(order) => {
  let putItems = [
    {
      Put: {
        Item: order.toItem(),
        TableName: OrdersTable,
        ConditionExpression: "attribute_not_exists(pk)"
      }
    }
  ];

  for (let item of order.items) {
    putItems.push({
      Put: {
        Item: item.toItem(),
        TableName: OrdersTable
      }
    })
  }

  await client.send(
    new TransactWriteCommand({
      TransactItems: putItems
    })
  );
};

/**
 * Update order status in order table
 * @param {*} param0 
 */
const updateOrder = async({ orderId, status }) => {
  if (status && !OrderStatus.includes(status)) {
    throw new Error("Unknown order status");
  }

  await client.send(
    new UpdateCommand({
      /** @type {import("@aws-sdk/lib-dynamodb").UpdateCommandInput} */
      TableName: OrdersTable,
      Key: {
        pk: `ORDER#${orderId}`,
        sk: `ORDER#${orderId}`
      },
      UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt"
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString()
      },
      ReturnValues: "NONE"
    })
  );
}

/**
 * Main handler.
 * @param {import("@types/aws-lambda").EventBridgeEvent<Order>} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
exports.handler = async(event, _) => {
  logger.debug(event);

  try {
    if (isNewOrder(event)){
      const order = new Order(event.detail);
      await createOrder(order);
      logger.info(`Created new order ${order.orderId}`);
    } else {
      const { orderId, status } = event.detail;
      await updateOrder({ orderId, status })
      logger.info(`Updated order ${orderId} to status ${status}`);
    }
  } catch (err) {
    logger.error("Error writing items to table");
    logger.error(err);
    if (err.code === 'TransactionCanceledException') {
      if (err.cancellationReasons[0].Code === 'ConditionalCheckFailed') {
          logger.error(`Order with id ${order.orderId} already exists`);
      }
    }
    throw err;
  }
};
