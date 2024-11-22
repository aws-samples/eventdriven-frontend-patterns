// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const createFlight = `
  mutation CreateFlight($input: CreateFlightInput!) {
    createFlight(input: $input) {
      flightId
      origin
      dest
      airlineCode
      flightNum
      gate
      terminal
      event
      eventDetails
      createdAt
      updatedAt
    }
  }
`;

export const updateFlight = `
  mutation UpdateFlight($input: UpdateFlightInput!) {
    updateFlight(input: $input) {
      flightId
      origin
      dest
      airlineCode
      flightNum
      gate
      terminal
      event
      eventDetails
      createdAt
      updatedAt
    }
  }
`;