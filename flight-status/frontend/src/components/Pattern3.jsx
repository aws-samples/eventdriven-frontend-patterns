// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState, useReducer } from "react";
import { get } from "aws-amplify/api";
import useWebSocket, { ReadyState } from "react-use-websocket";
import flightUpdateReducer from "../lib/flightUpdateReducer";
import config  from "../appconfig";
import UpdatesTable from "./UpdatesTable";

export default function Pattern3() {
  const [ isConnected, setIsConnected ] = useState(false);

  const [flights, dispatch] = useReducer(flightUpdateReducer, []);

  const { readyState } = useWebSocket(config.pattern3.wssEndpoint, {
    shouldReconnect: () => true,
    onMessage: ((event) => {
      const parsedEvent = JSON.parse(event.data);
      if (parsedEvent.operation === "UPDATE") 
        dispatch({ type: "UPDATE", data: { ...parsedEvent, received: Date.now() } });
    })
  });

  useEffect(() => {
    const getFlights = async () => {
      const { body } = await get({ apiName: "shared", path: "/flights" }).response;
      const data = await body.json();
      dispatch({ type: "INIT", data });
    };

    getFlights();
  }, []);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      setIsConnected(true);
    } else if (readyState === ReadyState.CLOSED) {
      setIsConnected(false);
    }
  }, [ readyState, isConnected ]);

  return (
    <>
      <UpdatesTable title="Terminal C: Two-way WebSocket pattern"
                    updates={ flights }
                    isConnected={ isConnected } />
    </>
  )
}