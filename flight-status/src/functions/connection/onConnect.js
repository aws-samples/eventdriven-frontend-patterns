// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 */

const { ConnectionsTable, AWS_REGION } = process.env;

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION}));

const logger = new Logger();

/**
 * Main handler.
 * @param {import("@types/aws-lambda").APIGatewayProxyWebsocketEventV2} event 
 * @param {import("@types/aws-lambda/handler").Context} _ 
 */
exports.handler = async(event, _) => {
  logger.debug(event);

  try {
    await client.send(
      new PutCommand({
        Item: {
          connectionId: event.requestContext.connectionId,
          // TODO: add flightId if one is provided in request
          ttl: parseInt((Date.now() / 1000) + 3600)
        },
        TableName: ConnectionsTable
      })
    );
  } catch (err) {
    logger.error(err);
    return { statusCode: 500, body: `Connect failed: ${JSON.stringify(err)}` };
  }

  return { statusCode: 200, body: "Connected" };
};
