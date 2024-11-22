// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { get } from "@aws-appsync/utils/dynamodb";

/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
  // handle direct use of the query or pipeline
  const orderId = ctx.prev.result.orderId || ctx.args.orderId;

  return get({
    key: {
      pk: `ORDER#${orderId}`,
      sk: `ORDER#${orderId}`
    }
  });
}

/**
* Returns the resolver result
* @param {import('@aws-appsync/utils').Context} ctx the context
* @returns {*} the result
*/
export function response(ctx) {
  return ctx.result;
}
