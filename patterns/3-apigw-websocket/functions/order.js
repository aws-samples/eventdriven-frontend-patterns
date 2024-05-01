// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// Adapted from Alex DeBrie's The DynamoDB Book

import { unmarshall } from "@aws-sdk/util-dynamodb";

const generateOrderId = () => {
  throw new Error('OrderId should be set by producer');
}

const OrderStatus = [
  "SUBMITTED",
  "ACCEPTED_BY_STORE",
  "IN_KITCHEN",
  "READY_FOR_PICKUP",
  "PICKED_UP_BY_DRIVER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "COMPLETED"
];

class Order {
  constructor({ orderId, currency, customerId, items = [], status = "SUBMITTED" }) {
    if (orderId) {
      this.orderId = orderId;
    } else {
      this.orderId = generateOrderId();
    }

    this.currency = currency;
    this.customerId = customerId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.expiresAt = new Date().getTime() + (60 * 60 * 24);
    
    if (status && !OrderStatus.includes(status)) {
      throw new Error("Unknown order status");
    }
    this.status = status;

    let numItems = 0, total = 0;
    for (let item of items) {
      numItems += item.quantity;
      total += item.unitPrice * item.quantity;
    }

    this.total = total;
    this.numItems = numItems;

    if (items.length) {
      this.items = items.map((item) => new OrderItem({
        orderId: this.orderId,
        itemId: item.itemId,
        description: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity
      }))
    }
  }

  static fromStream(record) {
    const r = unmarshall(record);

    return new Order({
      orderId: r.orderId,
      createdAt: r.createdAt,
      customerId: r.customerId,
      currency: r.currency,
      status: r.status
    });
  }

  key() {
    return {
      pk: `ORDER#${this.orderId}`,
      sk: `ORDER#${this.orderId}`
    }
  }

  gsi1() {
    return {
      gsi1pk: `ORDER#${this.orderId}`,
      gsi1sk: `ORDER#${this.orderId}`
    }
  }

  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      orderId: this.orderId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      currency: this.currency,
      customerId: this.customerId,
      status: this.status,
      numItems: this.numItems,
      total: this.total,
      type: "Order",
      expiresAt: new Date().getTime() + (60 * 60 * 24)
    }
  }
}

class OrderItem {
  constructor({ orderId, itemId, description, unitPrice, quantity}) {
    if (!orderId) {
      throw new Error("Must be associated with an order");
    }

    if (!itemId) {
      throw new Error("Must have an item id");
    }

    this.orderId = orderId;
    this.itemId = itemId;
    this.description = description;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }

  key() {
    return {
      pk: `ORDER#${this.orderId}#ITEM#${this.itemId}`,
      sk: `ORDER#${this.orderId}#ITEM#${this.itemId}`
    }
  }

  gsi1() {
    return {
      gsi1pk: `ORDER#${this.orderId}`,
      gsi1sk: `ITEM#${this.itemId}`
    }
  }

  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      orderId: this.orderId,
      itemId: this.itemId,
      description: this.description,
      unitPrice: this.unitPrice,
      quantity: this.quantity,
      type: "OrderItem",
      expiresAt: new Date().getTime() + (60 * 60 * 24)
    }
  }
}

module.exports = {
  Order,
  OrderItem,
  OrderStatus
}