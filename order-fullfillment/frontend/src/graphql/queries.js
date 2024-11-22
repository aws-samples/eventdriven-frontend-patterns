import { gql } from "@apollo/client";

export const orders = gql `
  query Orders($limit: Int, $nextToken: String) {
    orders(limit: $limit, nextToken: $nextToken) {
      items {
        orderId
        currency
        customerId
        numItems
        status
        total
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const order = gql `
  query Order($orderId: ID!) {
    order(orderId: $orderId) {
      orderId
      currency
      customerId
      items {
        itemId
        description
        quantity
        unitPrice
        __typename
      }
      numItems
      status
      total
      __typename
    }
  }
`;
