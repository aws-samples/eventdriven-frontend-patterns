interface Flight {
  flightId: string,
  origin: string,
  dest: string,
  airlineCode: string,
  flightNum: string,
  gate: string,
  terminal: number,
  event: string,
  eventDetails: string,
  createdAt: string,
  updatedAt: string
}

declare enum FlightStatus {
  ARRIVED_AT_GATE,
  ARRIVAL_DELAYED,
  SCHEDULED,
  BOARDING,
  CANCELLED,
  DEPARTED_GATE,
  DEPARTURE_DELAYED,
  GATE_CHANGED,
  LANDED,
  TOOK_OFF
}

export {
  Flight,
  FlightStatus
}