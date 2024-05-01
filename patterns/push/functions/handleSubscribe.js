// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
import { Logger } from "@aws-lambda-powertools/logger";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 */

const { SubscriptionsTable, AWS_REGION } = process.env;

const logger = new Logger();

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION}));

/**
 * Persist a new browser push notification subscription.
 * @param {*} subscription 
 */
const putSubscription = async (subscription) => {
  const hashedEndpoint = crypto.createHash('sha256').update(subscription.endpoint).digest('base64');
  logger.info(hashedEndpoint)

  await client.send(new PutCommand({
    TableName: SubscriptionsTable,
    Item: {
      pk: `SUB#${hashedEndpoint}`,
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh
    }
  }));
};

/**
 * Persist a subscription to an order.
 * @param {*} subscription 
 */
const subscribeToOrder = async (subscription) => {
  await client.send(new PutCommand({
    TableName: SubscriptionsTable,
    Item: {
      pk: `ORDER#${subscription.orderId}`,
      subscriptionId: subscription.subscriptionId
    }
  }));
};

/**
 * 
 * @param {import("@types/aws-lambda").EventBridgeEvent} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
exports.handler = async(event, _) => {
  logger.info(event);

  try {
    if (event["detail-type"] === "New subscription" && event.detail.endpoint) {
      await putSubscription(event.detail);
    } else if (event["detail-type"] === "Subscribe to order") {
      await subscribeToOrder(event.detail);
    }
  } catch (err) {
    logger.error(err);
    throw err;
  }
};