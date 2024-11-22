// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { IoTDataPlaneClient, PayloadFormatIndicator, PublishCommand } from "@aws-sdk/client-iot-data-plane";
import middy from "@middy/core";
import { Logger } from "@aws-lambda-powertools/logger";
import { parser } from "@aws-lambda-powertools/parser/middleware";
import { KinesisEnvelope } from "@aws-lambda-powertools/parser/envelopes"
import { FlightData, FlightDataStreamSchema } from "../../lib/flight";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('../../lib/flight') }
 */

const { IoTCoreEndpoint, FlightStatusTopic, AWS_REGION } = process.env;

const logger = new Logger();

const client = new IoTDataPlaneClient({
  //endpoint: IoTCoreEndpoint,
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

const create = async(flight) => {
  await publish({
    topic: FlightStatusTopic,
    payload: {
      operation: "CREATE",
      flightId: flight.flightId,
      origin: flight.origin,
      dest: flight.dest,
      airlineCode: flight.airlineCode,
      flightNum: flight.flightNum,
      gate: flight.gate,
      terminal: flight.terminal,
      event: flight.event,
      eventDetails: flight.eventDetails,
      createdAt: flight.createdAt,
      updatedAt: flight.updatedAt
    }
  });
};

/**
 * Update the flight status via IoT
 * @param {*} flight 
 */
const update = async(flight) => {
  await publish({
    topic: FlightStatusTopic,
    payload: {
      operation: "UPDATE",
      flightId: flight.flightId,
      origin: flight.origin,
      dest: flight.dest,
      airlineCode: flight.airlineCode,
      flightNum: flight.flightNum,
      gate: flight.gate,
      terminal: flight.terminal,
      event: flight.event,
      eventDetails: flight.eventDetails,
      createdAt: flight.createdAt,
      updatedAt: flight.updatedAt
    }
  });
};

/**
 * 
 * @param {import("@types/aws-lambda").DynamoDBStreamEvent} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
export const handler = middy(async(event, _) => {
  logger.debug(event);
  
  let batchItemFailures = [];
  for (let record of event.values()) {
    try {
      const flight = FlightData.fromStream(record.dynamodb.NewImage);

      if (record.eventName === "MODIFY") {
        await update(flight);
      } else if (record.eventName === "INSERT") {
        await create(flight);
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
}).use( parser({ schema: FlightDataStreamSchema, envelope: KinesisEnvelope }));
