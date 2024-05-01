import { util } from "@aws-appsync/utils";

/**
 * Puts order entries in DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns 
 */
export function request(ctx) {
  const { text } = ctx.args;
  const { stateMachineArn } = ctx.stash;

  const chatId = ctx.stash.chatId = util.autoUlid();
  const createdAt = util.time.nowISO8601();
  
  return {
    version: "2018-05-29",
    method: "POST",
    resourcePath: "/",
    params: {
      headers: {
        "content-type": "application/x-amz-json-1.0",
        "x-amz-target":"AWSStepFunctions.StartExecution"
      },
      body: {
        stateMachineArn,
        input: JSON.stringify({ chatId, createdAt, message: text })
      }
    }
  };
}

/**
 * Returns the item or throws an error if the operation failed
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*}
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return {
    id: ctx.stash.chatId
  };
}