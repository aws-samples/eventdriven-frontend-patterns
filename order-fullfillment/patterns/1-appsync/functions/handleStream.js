// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { fromEnv } from "@aws-sdk/credential-providers";
import { SignatureV4 } from "@smithy/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import axios from "axios";
import { Logger } from "@aws-lambda-powertools/logger";
import { Order } from "./order";
import { createOrder, updateOrder } from "./mutations";

/**
 * @typedef { import('@types/aws-lambda') }
 * @typedef { import('@aws-sdk/client-dynamodb') }
 * @typedef { import('@aws-sdk/lib-dynamodb') }
 * @typedef { import('./order') }
 */

const { OrderApiEndpoint, AWS_REGION } = process.env;

const logger = new Logger();

/**
 * Execute the GraphQL mutation.
 * @param {string} query 
 * @param {*} variables 
 */
const executeMutation = async(operation, query, variables) => {
  const endpoint = new URL(OrderApiEndpoint);
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
    url: OrderApiEndpoint
  });
};

const create = async(order) => {
  await executeMutation(
    "CreateOrder",
    createOrder,
    {
      input: {
        orderId: order.orderId,
        currency: order.currency,
        customerId: order.customerId,
        // We do not need to include items here, already in table
        // this is just to trigger the subscription via out of band
        // mutation. The resolver will pull the complete object from
        // the table and return so that subscribers have access to the
        // complete object.
        items: []
      }
    }
  );
};

/**
 * Update the order via the GraphQL API
 * @param {*} order 
 */
const update = async(order) => {
  await executeMutation(
    "UpdateOrder",
    updateOrder,
    {
      input: {
        orderId: order.orderId,
        status: order.status
      }
    }
  );
};

/**
 * 
 * @param {import("@types/aws-lambda").DynamoDBStreamEvent} event 
 * @param {import("aws-lambda/handler").Context} _ 
 */
exports.handler = async(event, _) => {
  logger.debug(event);

  console.log(JSON.stringify(event));
  
  let batchItemFailures = [];
  for (let record of event.Records) {
    try {
      const order = Order.fromStream(record.dynamodb.NewImage);

      if (record.eventName === "MODIFY") {
        await update(order);
      } else if (record.eventName === "INSERT") {
        await create(order);
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
};