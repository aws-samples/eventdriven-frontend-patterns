// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { util } from "@aws-appsync/utils";
import * as ddb from '@aws-appsync/utils/dynamodb';

/**
 * Delete flight entry in DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns 
 */
export function request(ctx) {
  const { flightId} = ctx.args;
  const key = { flightId: flightId };
  return ddb.remove({ key });
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
