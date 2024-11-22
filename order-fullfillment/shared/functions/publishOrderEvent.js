// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { SchedulerClient, CreateScheduleCommand, ActionAfterCompletion, FlexibleTimeWindowMode } from '@aws-sdk/client-scheduler';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { Logger } from "@aws-lambda-powertools/logger";
import { addSeconds, format } from 'date-fns';
import { orders } from './orders';
const KSUID = require('ksuid');

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-eventbridge') }
 * @typedef { import('@aws-sdk/client-scheduler') }
 * @typedef { import('@aws-sdk/client-sfn') }
 */

const {
        EventBusName,
        MaxSecondsToNextOrder,
        OrderWorkflowArn,
        SchedulerRoleArn,
        AWS_REGION
      } = process.env;

const orderStates = [
  "ACCEPTED_BY_STORE",
  "IN_KITCHEN",
  "READY_FOR_PICKUP",
  "PICKED_UP_BY_DRIVER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED"
];

const logger = new Logger();

/**
 * Submits a new order to the event bus. Mock of payment or order
 * service creating and broadcasting to subscribers.
 * @param {*} newOrder
 */
const submitNewOrder = async(newOrder) => {
  if (! EventBusName) {
    throw new Error('No EventBus defined!');
  }

  const client = new EventBridgeClient({ region: AWS_REGION });
  const orderId = KSUID.randomSync().string;
  newOrder.orderId = orderId;

  await client.send(
    new PutEventsCommand({
      Entries: [
        {
          Detail: JSON.stringify(newOrder),
          DetailType: "New order created",
          EventBusName,
          Source: "orders.events.ordering"
        }
      ]
    })
  );

  return orderId;
};

/**
 * Starts the mock order workflow to simulate an order being prepared
 * and delivered.
 * @param {String} orderId 
 */
const startMockOrderWorkflow = async(orderId) => {
  if (! OrderWorkflowArn) {
    throw new Error('No OrderWorkflowArn defined!');
  }

  const client = new SFNClient({ region: AWS_REGION });

  const payload = {
    orderId,
    orderStates
  };

  await client.send(
    new StartExecutionCommand({
      stateMachineArn: OrderWorkflowArn,
      input: JSON.stringify(payload)
    })
  );
};

/**
 * Schedules the next mock order to be submitted for processing.
 * @param {number} nextIndex
 * @param {string} targetArn
 */
const scheduleNextOrder = async(nextIndex, targetArn) => {
  const client = new SchedulerClient({ region: AWS_REGION });

  const waitTime = Math.random() * MaxSecondsToNextOrder;
  const scheduleAt = format(addSeconds(new Date(), waitTime), "yyyy-MM-dd'T'HH:mm:ss");

  logger.info(`Scheduled next order to be submitted at ${scheduleAt}`);

  await client.send(
    new CreateScheduleCommand({
      Name: "submitNextOrder",
      ScheduleExpression: `at(${scheduleAt})`,
      ActionAfterCompletion: ActionAfterCompletion.DELETE,
      FlexibleTimeWindow: {
        Mode: FlexibleTimeWindowMode.OFF
      },
      Target: {
        Arn: targetArn,
        Input: JSON.stringify({ nextIndex }),
        RoleArn: SchedulerRoleArn
      }
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
  
  const orderIndex = event.nextIndex || 0;
  const newOrder = orders[orderIndex];

  let orderId;

  try {
    orderId = await submitNewOrder(newOrder);
    logger.info(`New order created: ${orderId}`);
    await startMockOrderWorkflow(orderId);
  } catch (err) {
    logger.error('Could not submit new order and start mock workflow');
    logger.error(err);
    throw err;
  }

  const nextOrderIndex = orderIndex + 1;
  if (orders.length > nextOrderIndex) {
    try {
      await scheduleNextOrder(nextOrderIndex, context.invokedFunctionArn);
    } catch (err) {
      logger.error('Could not set schedule for next order');
      logger.error(err);
      throw err;
    }
  }

  if (event.requestContext && orderId) {
    return {
      statusCode: 200,
      body: JSON.stringify({ orderId, status: "SUBMITTED" }),
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allows-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "content-type, x-amz-security-token, x-amz-date, authorization"
      }
    }
  }
};