// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { FlightData } from "../../lib/flight";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
* @typedef { import('../../lib/flight') }
 */


const { FlightStatusTable, AWS_REGION } = process.env;

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION}));

const logger = new Logger();

/**
 * Main handler.
 * @param {import("@types/aws-lambda").APIGatewayEvent} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
exports.handler = async(event, _) => {
  logger.debug(event);

  const flightId = event.pathParameters.flightId;

  if (!flightId) { return { statusCode: 400, body: 'Missing flightId' };}

  const resp = await client.send(new GetCommand({
    TableName: FlightStatusTable,
    Key: {
      flightId: flightId
    }
  }));

  if (resp.Item) {
    logger.debug(`Found flight ${flightId}`)

    let flight = FlightData.fromItem(resp.Item);

    return {
      statusCode: 200,
      body: JSON.stringify(flight.toJson()),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "content-type, x-amz-security-token, x-amz-date, authorization",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },
    };
  } else {
    logger.debug(`Could not find flight ${flightId}`);
    return { statusCode: 404, body: 'Flight not found' };
  }
};
