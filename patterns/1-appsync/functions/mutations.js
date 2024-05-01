// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const createOrder = `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      currency
      customerId
      items {
        itemId
        description
        quantity
        unitPrice
      }
      orderId
      numItems
      status
      total
      createdAt
      updatedAt
    }
  }
`;

export const updateOrder = `
  mutation UpdateOrder($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      orderId
      currency
      customerId
      items {
        itemId
        description
        quantity
        unitPrice
      }
      numItems
      status
      total
      createdAt
      updatedAt
    }
  }
`;