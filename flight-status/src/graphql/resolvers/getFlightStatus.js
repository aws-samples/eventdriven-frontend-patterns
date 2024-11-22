// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { get } from "@aws-appsync/utils/dynamodb";

/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
  const { flightId } = ctx.args.input;
  const key = { flightId };
  return get({
    key,
  });
}

/**
* Returns the resolver result
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
