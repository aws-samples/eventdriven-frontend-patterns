// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// Adapted from Alex DeBrie's The DynamoDB Book

import { z } from "zod";
import { DDBUnmarshalled, DynamoDBStreamRecord } from "./ddb";

const generateFlightId = () => {
  throw new Error('FlightId should be set by producer');
}

const FlightStatus = [
  "ARRIVED_AT_GATE",
  "ARRIVAL_DELAYED",
  "SCHEDULED",
  "BOARDING",
  "CANCELLED",
  "DEPARTED_GATE",
  "DEPARTURE_DELAYED",
  "GATE_CHANGED",
  "LANDED",
  "TOOK_OFF"
];

class FlightData {
  constructor({ flightId, origin, dest, airlineCode, flightNum, gate, terminal, event = "SCHEDULED", eventDetails = "", createdAt, updatedAt }) {
    if (flightId) {
      this.flightId = flightId;
    } else {
      this.flightId = generateFlightId();
    }

    this.origin = origin;
    this.dest = dest;
    this.airlineCode = airlineCode;
    this.flightNum = flightNum;
    this.gate = gate;
    this.terminal = terminal;
    this.createdAt = createdAt ?? new Date().toISOString();
    this.updatedAt = updatedAt ?? new Date().toISOString();
    this.expiresAt = Math.floor((new Date().getTime() + 24 * 60 * 60 * 1000) / 1000); // 1 day
    
    if (event && !FlightStatus.includes(event)) {
      throw new Error("Unknown flight status");
    }
    this.event = event;
    this.eventDetails = eventDetails;
  }

  static fromStream(record) {
    // const r = unmarshall(record);
    const r = record;

    return new FlightData({
      flightId: r.flightId,
      origin: r.origin,
      dest: r.dest,
      airlineCode: r.airlineCode,
      flightNum: r.flightNum,
      gate: r.gate,
      terminal: r.terminal,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      event: r.event,
      eventDetails: r.eventDetails
    });
  }

  static fromItem(item) {
    let flight = new FlightData({
      flightId: item.flightId,
      origin: item.origin,
      dest: item.dest,
      airlineCode: item.airlineCode,
      flightNum: item.flightNum,
      gate: item.gate,
      terminal: item.terminal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      event: item.event,
      eventDetails: item.eventDetails
    });

    return flight;
  }

  key() {
    return {
      flightId: this.flightId
    }
  }

  toItem() {
    return {
      ...this.key(),
      origin: this.origin,
      dest: this.dest,
      airlineCode: this.airlineCode,
      flightNum: this.flightNum,
      gate: this.gate,
      terminal: this.terminal,
      event: this.event,
      eventDetails: this.eventDetails,
      type: "FlightStatus",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: Math.floor((new Date().getTime() + 24 * 60 * 60 * 1000) / 1000), // 1 day
    }
  }

  toJson() {
    return {
      flightId: this.flightId,
      origin: this.origin,
      dest: this.dest,
      airlineCode: this.airlineCode,
      flightNum: this.flightNum,
      gate: this.gate,
      terminal: this.terminal,
      event: this.event,
      eventDetails: this.eventDetails,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

/**
 * @type {z.ZodObject}
 */
const FlightDataSchema = z.object({
  flightId: z.string().trim().uuid(),
  origin: z.string(),
  dest: z.string(),
  airlineCode: z.string(),
  flightNum: z.string(),
  gate: z.string().optional(),
  terminal: z.number().optional(),
  event: z.any(),
  eventDetails: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * 
 */
const FlightDataStreamSchema = DynamoDBStreamRecord.extend({
  dynamodb: z.object({
    Keys: DDBUnmarshalled(
      z.object({ flightId: z.string() })
    ).optional(),
    NewImage: DDBUnmarshalled(FlightDataSchema).optional(),
  })
});

export {
  FlightData,
  FlightDataSchema,
  FlightDataStreamSchema,
  FlightStatus
}