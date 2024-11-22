import { gql } from "@apollo/client";

export const onCreateFlight = gql `
  subscription OnCreateFlight($flightId: ID) {
    onCreateFlight(flightId: $flightId) {
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
      __typename
    }
  }
`;

export const onUpdateFlight = gql `
  subscription OnUpdateFlight($flightId: ID) {
    onUpdateFlight(flightId: $flightId) {
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
      __typename
    }
  }
`;

export const onResponse = gql `
  subscription OnResponse ($chatId: ID!) {
    onResponse (id: $chatId) {
      id
      text
      createdAt
      __typename
    }
  }
`;