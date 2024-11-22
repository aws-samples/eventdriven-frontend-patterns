// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { util } from "@aws-appsync/utils";

/**
 * Puts order entries in DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns 
 */
export function request(ctx) {
  const order = ctx.stash.order = orderFromInput(ctx.args.input);
  const tableName = ctx.stash.tableName;
  
  return {
    operation: "TransactWriteItems",
    transactItems: [
      createOrder(tableName, order),
      // createOrderItems returns an array of TransactWriteItems, so we need to flatten it
      ...createOrderItems(tableName, order)
    ]
  };
}

/**
 * Returns the item or throws an error if the operation failed
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the inserted item
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type, null, ctx.result.cancellationReasons);
  }

  // TransactWriteItem does not return the new record, only metrics
  return {
    ...ctx.stash.order
  };
}

/**
 * Returns DDB TransactWriteItems JSON
 * @param {String} tableName 
 * @param {*} order
 * @returns 
 */
function createOrder(tableName, order) {
  const newOrder = {
    ...order,
    gsi1pk: order.gsi1.pk,
    gsi1sk: order.gsi1.sk,
    expiresAt: util.time.nowEpochSeconds() + (60 * 60 * 24) // 1 day
  };

  delete newOrder.key;
  delete newOrder.gsi1;
  delete newOrder.items;

  return {
    table: tableName,
    operation: "PutItem",
    key: util.dynamodb.toMapValues(order.key),
    attributeValues: util.dynamodb.toMapValues(newOrder)
  };
}

/**
 * Returns an array of DDB TransactWriteItems JSON
 * @param {String} tableName 
 * @param {*} order
 * @returns 
 */
function createOrderItems(tableName, order) {
  return order.items.map(item => {
    const newItem = {
      ...item,
      gsi1pk: item.gsi1.pk,
      gsi1sk: item.gsi1.sk,
      expiresAt: util.time.nowEpochSeconds() + (60 * 60 * 24) // 1 day
    }

    delete newItem.key;
    delete newItem.gsi1;

    return {
      table: tableName,
      operation: "PutItem",
      key: util.dynamodb.toMapValues(item.key),
      attributeValues: util.dynamodb.toMapValues(newItem)
    };
  });
}

/**
 * 
 * @param {*} input 
 * @returns 
 */
function orderFromInput(input) {
  const {
      orderId = util.autoKsuid(),
      currency = "USD",
      customerId,
      items = [],
      status = "SUBMITTED",
      createdAt = util.time.nowISO8601(),
      updatedAt = util.time.nowISO8601()
    } = input;
  
  let numItems = 0, total = 0;
  for (let item of items) {
    numItems += item.quantity;
    total += item.unitPrice * item.quantity;
  }

  return {
    orderId,
    currency,
    customerId,
    status,
    createdAt,
    updatedAt,
    numItems,
    total,
    key: {
      pk: `ORDER#${orderId}`,
      sk: `ORDER#${orderId}`
    },
    gsi1: {
      pk: `ORDER#${orderId}`,
      sk: `ORDER#${orderId}`
    },
    items: items.map((i) => orderItemFromInput(orderId, i))
  }
}

/**
 * 
 * @param {string} orderId 
 * @param {*} input 
 * @returns 
 */
function orderItemFromInput(orderId, input) {
  const {
      itemId,
      quantity,
      unitPrice,
      description
    } = input;

  return {
    itemId,
    quantity,
    unitPrice,
    description,
    key: {
      pk: `ORDER#${orderId}#ITEM#${itemId}`,
      sk: `ORDER#${orderId}#ITEM#${itemId}`
    },
    gsi1: {
      pk: `ORDER#${orderId}`,
      sk: `ITEM#${itemId}`
    }
  }
}
