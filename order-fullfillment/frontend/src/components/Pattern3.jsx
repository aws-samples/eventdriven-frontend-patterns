// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import config  from "../appconfig";
import UpdatesTable from "./UpdatesTable";

export default function Pattern3() {
  const [ updates, setUpdates ] = useState([]);
  const [ isConnected, setIsConnected ] = useState(false);

  const { readyState } = useWebSocket(config.pattern3.endpoint, {
    shouldReconnect: () => true,
    onMessage: ((event) => {
      addUpdateToListing(JSON.parse(event.data))
    })
  });

  const addUpdateToListing = (data) => {
    const newItem = {
      orderId: data.orderId,
      status: data.status,
      updated: data.updatedAt,
      received: new Date()
    };

    setUpdates([
      newItem,
      ...updates
    ]);
  };

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      setIsConnected(true);
    } else if (readyState === ReadyState.CLOSED) {
      setIsConnected(false);
    }
  }, [ readyState, isConnected ]);

  return (
    <>
      <UpdatesTable title="Pattern 3: Amazon API Gateway WebSocket"
                    updates={ updates }
                    isConnected={ isConnected } />
    </>
  )
}