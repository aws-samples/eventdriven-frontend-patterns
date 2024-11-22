import { gql } from "@apollo/client";

export const listFlights = gql `
  query ListFlights($limit: Int, $nextToken: String) {
    listFlights(limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getFlight = gql `
  query GetFlight($flightId: ID!) {
    getFlight(flightId: $flightId) {
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
