// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { parser } from "@aws-lambda-powertools/parser/middleware";
import { EventBridgeSchema } from "@aws-lambda-powertools/parser/schemas";
import middy from "@middy/core";
import { z } from "zod";
import { FlightData, FlightStatus } from "../../lib/flight";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 * @typedef { import('./flight') }
 */


const { FlightStatusTable, AWS_REGION } = process.env;

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION}));

const flightStatusUpdateSchema = z.object({
  flightId: z.string(),
  event: z.enum(FlightStatus),
  eventDetails: z.string().optional()
});

const FlightStatusEventSchema = EventBridgeSchema.extend({
  detail: flightStatusUpdateSchema
});

/**
 * Determine if the event is a new flight or an update.
 * @param {*} event 
 * @returns 
 */
const isNewFlight = (event) => {
  return event['detail-type'] === "New flight scheduled";
};

/**
 * Create a new flight in the dynamodb table.
 * @param {FlightData} flight 
 */
const createFlight = async(flight) => {
  console.log(JSON.stringify(flight.toItem()));

  let putItems = [
    {
      Put: {
        Item: flight.toItem(),
        TableName: FlightStatusTable,
        ConditionExpression: "attribute_not_exists(flightId)"
      }
    }
  ];

  await client.send(
    new TransactWriteCommand({
      TransactItems: putItems
    })
  );
};

/**
 * Update flight status in flight table
 * @param {*} param0 
 */
const updateFlight = async({ flightId, fltEvent, eventDetails, eventTime }) => {
  if (fltEvent && !FlightStatus.includes(fltEvent)) {
    throw new Error("Unknown flight status");
  }

  await client.send(
    new UpdateCommand({
      /** @type {import("@aws-sdk/lib-dynamodb").UpdateCommandInput} */
      TableName: FlightStatusTable,
      Key: {
        flightId: flightId,
      },
      UpdateExpression: "SET #event = :event, #eventDetails = :eventDetails, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#event": "event",
        "#eventDetails": "eventDetails",
        "#updatedAt": "updatedAt"
      },
      ExpressionAttributeValues: {
        ":event": fltEvent,
        ":eventDetails": eventDetails,
        ":updatedAt": eventTime
      },
      ReturnValues: "NONE"
    })
  );
}

const logger = new Logger();

/**
 * Main handler.
 * @param {import("@types/aws-lambda").EventBridgeEvent<Flight>} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
export const handler = middy(async(event, _) => {
  logger.debug(event);

  try {
    if (isNewFlight(event)){
      const flight = new FlightData(event.detail);
      await createFlight(flight);
      logger.info(`Created new flight ${flight.flightId}`);
    } else {
      const { flightId, event: fltEvent, eventDetails } = event.detail;
      const eventTime = event.time;
      await updateFlight({ flightId, fltEvent, eventDetails, eventTime } )
      logger.info(`Updated flight ${flightId} to status ${fltEvent}`);
    }
  } catch (err) {
    logger.error("Error writing items to table");
    logger.error(err);
    if (err.code === 'TransactionCanceledException') {
      if (err.cancellationReasons[0].Code === 'ConditionalCheckFailed') {
          logger.error(`Flight with id ${flight.flightId} already exists`);
      }
    }
    throw err;
  }
}).use( parser({ schema: FlightStatusEventSchema }));
