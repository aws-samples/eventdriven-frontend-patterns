// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState } from "react";
import { PubSub, CONNECTION_STATE_CHANGE } from "@aws-amplify/pubsub";
import { Hub } from 'aws-amplify/utils';
import UpdatesTable from "./UpdatesTable";
import config  from "../appconfig";

const pubsub = new PubSub({
  region: config.region,
  endpoint: `wss://${config.mqttEndpoint}/mqtt`
})

export default function Pattern4() {
  const [ updates, setUpdates ] = useState([]);
  const [ isConnected, setIsConnected ] = useState(false);

  Hub.listen('pubsub', (data) => {
    const { payload } = data;
    if (payload.event === CONNECTION_STATE_CHANGE) {
      const connectionState = payload.data.connectionState;

      console.warn(connectionState)
      if (connectionState === "Connected") {
        setIsConnected(true);
      } else if (connectionState === "Disconnected") {
        setIsConnected(false);
      }
    }
  });

  useEffect(() => {
    const addUpdateToListing = (data) => {
      const newItem = {
        event: data.event,
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

    if (!pubsub) { return; }

    let subscription = pubsub.subscribe({topics: [ "orders/events" ]}).subscribe({
      next: (data) => {
        addUpdateToListing(data);
      },
      error: (error) => console.error(error),
    });

    return (() => {
      subscription.unsubscribe();
    })
  }, [ updates ]);


  return (
    <>
      <UpdatesTable title="Pattern 4: AWS IoT Core"
                    updates={ updates }
                    isConnected={ isConnected } />
    </>
  )
}