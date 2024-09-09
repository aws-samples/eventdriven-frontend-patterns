// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { Order } from "./order";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 * @typedef { import('../../lib/order') }
 */

const logger = new Logger();

const { OrdersTable, AWS_REGION } = process.env;

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION}));


/**
 * Main handler.
 * @param {import("@types/aws-lambda").APIGatewayEvent} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
exports.handler = async(event, _) => {
  logger.debug(event);

  const orderId = event.pathParameters.orderId;

  if (!orderId) { return { statusCode: 400, body: 'Missing orderId' };}

  const resp = await client.send(new GetCommand({
    TableName: OrdersTable,
    Key: {
      pk: `ORDER#${orderId}`,
      sk: `ORDER#${orderId}`,
    }
  }));

  if (resp.Item) {
    logger.debug(`Found order ${orderId}`)

    let order = Order.fromItem(resp.Item);
    // faking this for now....
    order.numItems = resp.Item.numItems;
    order.total = resp.Item.total;

    return {
      statusCode: 200,
      body: JSON.stringify(order.toJson()),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "content-type, x-amz-security-token, x-amz-date, authorization",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },
    };
  } else {
    logger.debug(`Could not find order ${orderId}`);
    return { statusCode: 404, body: 'Order not found' };
  }
};
