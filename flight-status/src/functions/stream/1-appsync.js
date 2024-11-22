// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { fromEnv } from "@aws-sdk/credential-providers";
import { SignatureV4 } from "@smithy/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import axios from "axios";
import middy from "@middy/core";
import { Logger } from "@aws-lambda-powertools/logger";
import { parser } from "@aws-lambda-powertools/parser/middleware";
import { KinesisEnvelope } from "@aws-lambda-powertools/parser/envelopes"
import { createFlight, updateFlight } from "./mutations";
import { FlightData, FlightDataStreamSchema } from "../../lib/flight";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('../../lib/flight') }
 */

const { FlightStatusApiEndpoint, AWS_REGION } = process.env;

const logger = new Logger();

/**
 * Execute the GraphQL mutation.
 * @param {string} query 
 * @param {*} variables 
 */
const executeMutation = async(operation, query, variables) => {
  const endpoint = new URL(FlightStatusApiEndpoint);
  const signer = new SignatureV4({
    service: "appsync",
    region: AWS_REGION,
    credentials: fromEnv(),
    sha256: Sha256
  });

  const signedRequest = await signer.sign({
    method: "POST",
    hostname: endpoint.host,
    path: endpoint.pathname,
    protocol: endpoint.protocol,
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.hostname
    },
    body: JSON.stringify({
      operationName: operation,
      query,
      variables
    })
  });

  await axios({
    method: signedRequest.method,
    data: signedRequest.body,
    headers: signedRequest.headers,
    url: FlightStatusApiEndpoint
  });
};

const create = async(flight) => {
  await executeMutation(
    "CreateFlight",
    createFlight,
    {
      input: {
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
    }
  );
};

/**
 * Update the flight via the GraphQL API
 * @param {*} flight 
 */
const update = async(flight) => {
  await executeMutation(
    "UpdateFlight",
    updateFlight,
    {
      input: {
        flightId: flight.flightId,
        event: flight.event,
        eventDetails: flight.eventDetails,
        gate: flight?.gate,
        terminal: flight?.terminal,
        updatedAt: flight.updatedAt
      }
    }
  );
};

/**
 * 
 * @param {import("@types/aws-lambda").KinesisStreamEvent} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
export const handler = middy(async(event, _) => {
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
