interface Order {
  orderId: string,
  currency: string,
  customerId: string,
  items: [OrderItem],
  numItems: number,
  status: OrderStatus,
  total: number
}

enum OrderStatus {
  SUBMITTED,
  ACCEPTED_BY_STORE,
  IN_KITCHEN,
  READY_FOR_PICKUP,
  PICKED_UP_BY_DRIVER,
  OUT_FOR_DELIVERY,
  DELIVERED,
  CANCELLED,
  COMPLETED
}

interface OrderItem {
  itemId: string,
  description: string,
  quantity: number,
  unitPrice: number
}

export {
  Order,
  OrderItem,
  OrderStatus
}