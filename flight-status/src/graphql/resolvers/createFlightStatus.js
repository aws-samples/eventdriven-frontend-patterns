// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { util } from "@aws-appsync/utils";
import * as ddb from '@aws-appsync/utils/dynamodb';

/**
 * Puts flight entries in DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns 
 */
export function request(ctx) {
  const { input: values } = ctx.args;
    const key = { flightId: values.flightId };
    const condition = { flightId: { attributeExists: false } };
    values.createdAt = util.time.nowISO8601();
    values.updatedAt = values.createdAt;
    values.expiresAt = util.time.nowISO8601() + 24*60*60 // 1 day
    return ddb.put({key, item: values, condition});
}

/**
 * Returns the item or throws an error if the operation failed.
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
      return util.appendError(error.message, error.type, result);
  }
  return result;
}
