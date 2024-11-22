// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { util } from "@aws-appsync/utils";
import { update } from "@aws-appsync/utils/dynamodb";

/**
 * Puts flight entries in DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns 
 */
export function request(ctx) {
  const { flightId, event, eventDetails } = ctx.args.input;

  const key = {
    flightId: flightId
  };

  return update({
    key,
    update: {
      event,
      eventDetails,
      updatedAt: util.time.nowISO8601()
    },
    condition: {
      flightId: { attributeExists: true }
    }
  });
}

/**
 * Returns the item or throws an error if the operation failed
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the inserted item
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
}