// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
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

  // NOTE: would rather avoid SCAN operation but works for this
  // limited use case. Next time, better table design to list all
  // orders. A more full-featured approach might segment by customer
  // or store so that we could use QUERY to get only those results.
  const resp = await client.send(new ScanCommand({
    TableName: OrdersTable,
    IndexName: "Orders",
    FilterExpression: "begins_with( gsi1sk, :order )",
    ExpressionAttributeValues: {
      ":order": "ORDER"
    },
  }));

  if (resp.Items) {
    logger.debug(`Found ${resp.Items.length} orders`)

    let orders = [];
    for (const item of resp.Items) {
      let order = Order.fromItem(item);
      orders.push(order.toJson());
    }

    return {
      statusCode: 200,
      body: JSON.stringify(orders.sort((a, z) => { return new Date(z.updatedAt) - new Date(a.updatedAt) })),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "content-type, x-amz-security-token, x-amz-date, authorization",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },
    };
  } else {
    logger.debug(`Could not find orders`);
    return { statusCode: 404, body: 'No orders found' };
  }
};
