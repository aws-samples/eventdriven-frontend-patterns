// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { SchedulerClient, CreateScheduleCommand, ActionAfterCompletion, FlexibleTimeWindowMode } from '@aws-sdk/client-scheduler';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { Logger } from "@aws-lambda-powertools/logger";
import { addSeconds, format } from 'date-fns';
import { flights } from "./flight-data";
import { seatAssignments } from "./seat-assignment-data";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-eventbridge') }
 * @typedef { import('@aws-sdk/client-scheduler') }
 * @typedef { import('@aws-sdk/client-sfn') }
 */

const {
        EventBusArn,
        MaxSecondsToNextFlightStatus,
        StartFlightSimulationWorkflow,
        SchedulerRoleArn,
        AWS_REGION
      } = process.env;

const logger = new Logger();

/**
 * Send event to start upgrade workflow
 */
const scheduleSeatAssignment = async(seatChannel, flightId) => {
  const seatAssignment = seatAssignments.find((seat) => seat.flightId === flightId);

  const payload = {
    seatChannel,
    seatAssignment
  };

  const client = new SchedulerClient({ region: AWS_REGION });

  const waitTime = Math.random() * MaxSecondsToNextFlightStatus;
  const scheduleAt = format(addSeconds(new Date(), waitTime), "yyyy-MM-dd'T'HH:mm:ss");

  logger.info(`Scheduled seat assignment to be triggered at ${scheduleAt}`);

  await client.send(
    new CreateScheduleCommand({
      Name: "scheduleSeatAssignment",
      ScheduleExpression: `at(${scheduleAt})`,
      ActionAfterCompletion: ActionAfterCompletion.DELETE,
      FlexibleTimeWindow: {
        Mode: FlexibleTimeWindowMode.OFF
      },
      Target: {
        Arn: EventBusArn,
        Input: JSON.stringify(payload),
        RoleArn: SchedulerRoleArn,
        EventBridgeParameters: {
          DetailType: "Seat assignment",
          Source: "flights.seats"
        }
      }
    })
  );
};

/**
 * 
 * @param {*} flights 
 */
const startFlightsSimuation = async(flights) => {
  if (! StartFlightSimulationWorkflow) {
    throw new Error('No StartFlightSimulationWorkflow defined!');
  }

  const client = new SFNClient({ region: AWS_REGION });

  await client.send(
    new StartExecutionCommand({
      stateMachineArn: StartFlightSimulationWorkflow,
      input: JSON.stringify({ flights })
    })
  );
};

/**
 * Main function handler. Function is invoked by EventBridge Scheduler.
 * @param {AWSLambda.ScheduledEvent | AWSLambda.APIGatewayProxyHandlerV2} event Incoming payload
 * @param {AWSLambda.Context} context Function context
 */
exports.handler = async(event, context) => {
  logger.debug(event);
  
  logger.info("Starting flight simulation");
  await startFlightsSimuation(flights);
  
  // grab a flight in the sample data for demo purposes`
  const flight = flights[0];
  // fake passenger id
  const passengerId = "abc123";

  const seatChannel = `seats/${flight.airlineCode}${flight.flightNum}/${passengerId}`;

  await scheduleSeatAssignment(seatChannel, flight.flightId);

  return {
    statusCode: 200,
    body: JSON.stringify({ 
      flightId: flight.flightId,
      airlineCode: flight.airlineCode,
      flightNum: flight.flightNum,
      seat: "23F", // cheating a bit as we don't have this in fake data
      passengerId,
      channels: {
        status: `flights/events/${flight.airlineCode}/${flight.flightNum}`,
        seat: seatChannel
      }
    }),
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allows-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type, x-amz-security-token, x-amz-date, authorization"
    }
  }
};
