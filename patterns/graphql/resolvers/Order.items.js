// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { query } from "@aws-appsync/utils/dynamodb";

/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
  return query({
    index: "Orders",
    query: {
      gsi1pk: { eq: `ORDER#${ctx.source.orderId}` },
      gsi1sk: { beginsWith: "ITEM" }
    }
  });
}

/**
* Returns the resolver result
* @param {import('@aws-appsync/utils').Context} ctx the context
* @returns {*} the result
*/
export function response(ctx) {
  return ctx.result.items;
}
