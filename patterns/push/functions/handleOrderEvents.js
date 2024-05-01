// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { setVapidDetails, sendNotification } from "web-push";
import { Logger } from "@aws-lambda-powertools/logger";
import { Order } from "./order";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 * @typedef { import('./order') }
 */

const {
  SubscriptionsTable,
  WEBPUSH_PUBLIC_TOKEN,
  WEBPUSH_PRIVATE_TOKEN,
  AWS_REGION
} = process.env;

// configure VAPID details to send notifications
setVapidDetails(
  "mailto:example@example.com",
  WEBPUSH_PUBLIC_TOKEN,
  WEBPUSH_PRIVATE_TOKEN
);

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

const logger = new Logger();

/**
 * 
 * @param {*} subscription 
 * @param {*} notification 
 */
const sendNotificationToSubscription = async(subscription, notification) => {
  try {
    const r = await sendNotification(subscription, JSON.stringify(notification));
    logger.info(JSON.stringify(r));
  } catch(err) {
    logger.error(err);
    if (err.statusCode === 404 || err.statusCode === 410) {
      logger.error("Subscription has expired or is no longer valid: ", err)
      await deleteSubscription();
    }
  }
};

const deleteSubscription = async(subscription) => {

};

/**
 * Lookup subscriptions associated with this order.
 * @param {string} orderId 
 * @returns 
 */
const lookupSubscriptionByOrderId = async(orderId) => {
  // get subscription for this order
  const r = await client.send(new GetCommand({
    TableName: SubscriptionsTable,
    Key: {
      pk: `ORDER#${orderId}`
    }
  }));
  
  if (r.Item === undefined) {
    logger.error("No subscriptions found for this order.");
    return null;
  }

  const sub = await client.send(new GetCommand({
    TableName: SubscriptionsTable,
    Key: {
      pk: `SUB#${r.Item?.subscriptionId}`
    }
  }));

  return sub.Item;
};

/**
 * Main handler.
 * @param {import("@types/aws-lambda").EventBridgeEvent<Order>} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
exports.handler = async(event, _) => {
  logger.debug(event);

  try {
    const order = new Order(event.detail);

    const subscription = await lookupSubscriptionByOrderId(order.orderId);
    logger.info(subscription);

    const notification = {
      title: "Pizza delivery",
      body: "Your pizza is on the way!"
    }

    await sendNotificationToSubscription({
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.auth,
        p256dh: subscription.p256dh
      }
    }, notification);


  } catch (err) {
    logger.error("Error sending message.");
    logger.error(err);
    throw err;
  }
};
