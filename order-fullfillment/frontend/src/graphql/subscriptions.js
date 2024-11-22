import { gql } from "@apollo/client";

export const onCreateOrUpdateOrder = gql `
  subscription OnCreateOrUpdateOrder($orderId: ID) {
    onCreateOrUpdateOrder(orderId: $orderId) {
      orderId
      currency
      customerId
      createdAt
      updatedAt
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