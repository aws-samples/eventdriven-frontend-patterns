// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState, useReducer } from "react";
import { get } from "aws-amplify/api";
import { events } from "aws-amplify/data";
import flightUpdateReducer from "../lib/flightUpdateReducer";
import UpdatesTable from "./UpdatesTable";

export default function Pattern5() {
  const [isConnected, setIsConnected] = useState(false);

  const [flights, dispatch] = useReducer(flightUpdateReducer, []);

  useEffect(() => {
    const getFlights = async () => {
      const { body } = await get({ apiName: "shared", path: "/flights" }).response;
      const data = await body.json();
      dispatch({ type: "INIT", data });
    };

    getFlights();
  }, []);

  useEffect(() => {    
    const connect = async () => {
      return (await events.connect("flights/events/*")).subscribe({
        next: ( data ) => {
          dispatch({ type: "UPDATE", data: { ...data.event, received: Date.now() } });
        },
        error: (err) => console.log(err)
      })
    };

    connect();
    setIsConnected(true);
  }, [ ]);

  return (
    <>
      <UpdatesTable title="Terminal Y: No GraphQL events pattern"
        updates={flights}
        isConnected={isConnected} />
    </>
  )
}