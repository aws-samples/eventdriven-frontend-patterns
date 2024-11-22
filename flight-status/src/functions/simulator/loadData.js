// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { PutEventsCommand, EventBridgeClient } from "@aws-sdk/client-eventbridge";
import middy from "@middy/core";
import { Logger } from "@aws-lambda-powertools/logger";
import { parser } from "@aws-lambda-powertools/parser/middleware";
import { APIGatewayProxyEventSchema } from "@aws-lambda-powertools/parser/schemas";
import { FlightData } from "../../lib/flight";
import { flights as data } from "./flight-data";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 * @typedef { import('../../lib/flight') }
 */

const {
  FlightStatusEventBus,
  FlightStatusTable,
  AWS_REGION
} = process.env;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION}));

const eb = new EventBridgeClient({ region: AWS_REGION });

const logger = new Logger();

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Headers": "content-type, x-amz-security-token, x-amz-date, authorization",
  "Access-Control-Allow-Methods": "POST,DELETE,OPTIONS"
}

const writeItems = () => {
  return data.reduce((acc, flight) => {
    acc.push({
      PutRequest: {
        Item: new FlightData(flight).toItem()
      }
    });
    return acc;
  }, []);
};

const putEvents = (detailType) => {
  return data.reduce((acc, flight) => {
    acc.push({
      DetailType: detailType,
      Source: "flights.events",
      EventBusName: FlightStatusEventBus,
      Detail: JSON.stringify(new FlightData(flight))
    });
    return acc;
  }, []);
};

const deleteItems = () => {
  return data.reduce((acc, flight) => {
    acc.push({
      DeleteRequest: {
        Key: new FlightData(flight).key()
      }
    });
    return acc;
  }, []);
};

/**
 * Main handler.
 * @param {import("@types/aws-lambda").APIGatewayEvent} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
export const handler = middy(async(event, _) => {
  logger.debug(JSON.stringify(event));

  let items = [];

  if (event.httpMethod === "POST") {
    items = writeItems();
  } else if (event.httpMethod === "DELETE") {
    items = deleteItems();
  }

  try {
    await ddb.send(new BatchWriteCommand({
      RequestItems: {
        [FlightStatusTable]: items
      }
    }));

    if (event.httpMethod === "POST") {
      await eb.send(new PutEventsCommand({
        Entries: putEvents("[Load] New flight scheduled")
      }));
    } else if (event.httpMethod === "DELETE") {
      await eb.send(new PutEventsCommand({
        Entries: putEvents("[Reset] Flight deleted")
      }));
    }

  } catch (error) {
    logger.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.errorType }),
      headers
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
    headers
  };

}).use( parser({ schema: APIGatewayProxyEventSchema }));
