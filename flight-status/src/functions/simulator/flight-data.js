exports.flights = [
  {
    flightId: "174498b0-e0ab-42f3-add2-a6fa91ad7e98",
    event: "SCHEDULED",
    eventDetails: "",
    origin: "LAS",
    dest: "YUL",
    eventDetails: "",
    airlineCode: "API",
    flightNum: "246",
    gate: "B42",
    terminal: 2,
    nextStates: [
      {
        event: "DEPARTURE_DELAYED",
        eventDetails: "Late crew"
      }, 
      {
        event: "TOOK_OFF",
        eventDetails: "Flight took off at 1:15 PM"
      },
      {
        event: "LANDED",
        eventDetails: ""
      },
      {
        event: "ARRIVED_AT_GATE",
        eventDetails: ""
      }
    ]
  },
  {
    flightId: "5da8a310-2d5b-4b5b-8bdb-799060a02475",
    event: "SCHEDULED",
    eventDetails: "",
    origin: "LAS",
    dest: "ORD",
    eventDetails: "",
    airlineCode: "SVS",
    flightNum: "123",
    gate: "A12",
    terminal: 1,
    nextStates: [
      {
        event: "DEPARTURE_DELAYED",
        eventDetails: "Weather delay"
      }, 
      {
        event: "TOOK_OFF",
        eventDetails: ""
      },
      {
        event: "LANDED",
        eventDetails: ""
      },
      {
        event: "ARRIVED_AT_GATE",
        eventDetails: "Arrived at gate B42."
      }
    ]
  },
  {
    flightId: "56167d51-fcad-4bd4-aa89-77caf1f04a13",
    event: "SCHEDULED",
    eventDetails: "",
    origin: "LAS",
    dest: "LAX",
    eventDetails: "",
    airlineCode: "RIV",
    flightNum: "764",
    gate: "B16",
    terminal: 2,
    nextStates: [
       {
         event: "ARRIVAL_DELAYED",
         eventDetails: "In-air delay"
       }, 
       {
         event: "TOOK_OFF",
         eventDetails: "Flight took off at 4:45 PM"
       },
       {
         event: "LANDED",
         eventDetails: "Landed in EWR. Taxing to gate."
       },
       {
         event: "ARRIVED_AT_GATE",
         eventDetails: "Arrived at gate A10."
       }
    ]
  },
  {
    flightId: "a71d0526-7e8f-4ff4-8b1c-5b15c04f0570",
    event: "SCHEDULED",
    eventDetails: "",
    origin: "LAS",
    dest: "SEA",
    eventDetails: "",
    airlineCode: "SVS",
    flightNum: "202",
    gate: "C15",
    terminal: 3,
    nextStates: [
       {
         event: "TOOK_OFF",
         eventDetails: "On-time departure."
       },
       {
         event: "LANDED",
         eventDetails: "Landed in PDX."
       },
       {
         event: "ARRIVED_AT_GATE",
         eventDetails: "Arrived at gate A12."
       }
    ]
  },
  // {
  //   flightId: "62f0c54b-04a8-4db5-a9bb-3b4d178ddd61",
  //   event: "SCHEDULED",
  //   eventDetails: "",
  //   origin: "LAS",
  //   dest: "JFK",
  //   eventDetails: "",
  //   airlineCode: "API",
  //   flightNum: "305",
  //   gate: "D14",
  //   terminal: 4,
  //   nextStates: [
  //       {
  //         event: "TOOK_OFF",
  //         eventDetails: "On-time departure."
  //       },
  //       {
  //         event: "LANDED",
  //         eventDetails: "Landed in JFK."
  //       },
  //       {
  //         event: "ARRIVED_AT_GATE",
  //         eventDetails: "Arrived at gate E24."
  //       }
  //   ]
  // },
  // {
  //   flightId: "a5f84e34-5874-484e-854a-5fe2486a96fa",
  //   origin: "LAS",
  //   dest: "PDX",
  //   event: "SCHEDULED",
  //   eventDetails: "",
  //   airlineCode: "RIV",
  //   flightNum: "222",
  //   gate: "B22",
  //   terminal: 2,
  //   nextStates: [
  //     {
  //       event: "TOOK_OFF",
  //       eventDetails: "On-time departure."
  //     },
  //     {
  //       event: "LANDED",
  //       eventDetails: "Landed in PDX."
  //     },
  //     {
  //       event: "ARRIVED_AT_GATE",
  //       eventDetails: "Arrived at gate A12."
  //     }
  //   ]
  // },
  // {
  //   flightId: "5c2f64e7-a38f-4469-a25f-dd44a5317800",
  //   event: "SCHEDULED",
  //   eventDetails: "",
  //   origin: "LAS",
  //   dest: "EWR",
  //   eventDetails: "",
  //   airlineCode: "API",
  //   flightNum: "101",
  //   gate: "A10",
  //   terminal: 1,
  //   nextStates: [
  //     {
  //       event: "TOOK_OFF",
  //       eventDetails: "On-time departure."
  //     },
  //     {
  //       event: "LANDED",
  //       eventDetails: "Landed in EWR."
  //     },
  //     {
  //       event: "ARRIVED_AT_GATE",
  //       eventDetails: "Arrived at gate C10."
  //     }
  //   ]
  // },
  // {
  //   flightId: "35638fda-b89e-45f3-9e8a-eb2812c57e2c",
  //   event: "SCHEDULED",
  //   eventDetails: "New gate assigned: C10",
  //   origin: "LAS",
  //   dest: "YYZ",
  //   airlineCode: "SVS",
  //   flightNum: "405",
  //   gate: "D17",
  //   terminal: 4,
  //   nextStates: [
  //     {
  //       event: "ARRIVAL_DELAYED",
  //       eventDetails: "In-air delay"
  //     }, 
  //     {
  //       event: "TOOK_OFF",
  //       eventDetails: "Flight took off at 4:45 PM"
  //     },
  //     {
  //       event: "LANDED",
  //       eventDetails: "Landed in EWR. Taxing to gate."
  //     },
  //     {
  //       event: "ARRIVED_AT_GATE",
  //       eventDetails: "Arrived at gate A10."
  //     }
  //   ]
  // }
];