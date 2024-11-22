/**
 * Shim to add unmarshal function when parsing in Zod + add
 * a missing type in Powertools parser (DDB -> Kinesis stream payload
 * is different than standard Kinesis stream)
 */

import { z } from "zod";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const DDBUnmarshalled = (schema) => {
  return z
    .record(z.string(), z.any())
    .transform((str, ctx) => {
      try {
        return unmarshall(str);
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Could not unmarshal DynamoDB Stream record",
          fatal: true
        });
        return z.NEVER;
      }
    })
    .pipe(schema);
};

const DynamoDBStreamRecord = z.object({
  awsRegion: z.string(),
  eventID: z.string(),
  eventName: z.enum(['INSERT', 'MODIFY', 'REMOVE']),
  userIdentity: z.null(),
  recordFormat: z.string(),
  tableName: z.string(),
  dynamodb: z.object({
    ApproximateCreationDateTime: z.number(),
    SizeBytes: z.number(),
    Keys: z.object().optional(),
    NewImage: z.object().optional(),
    OldImage: z.object().optional(),
  }),
});

export {
  DynamoDBStreamRecord,
  DDBUnmarshalled
}

