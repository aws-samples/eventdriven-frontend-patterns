// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useContext, useEffect, useState } from "react";
import { mqtt5 } from "aws-iot-device-sdk-v2";
import UpdatesTable from "./UpdatesTable";
import { MqttClientContext, MqttClientConnectedContext } from "../mqtt";

export default function Pattern4a() {
  const mqttClient = useContext(MqttClientContext);
  const isConnected = useContext(MqttClientConnectedContext);

  const [ updates, setUpdates ] = useState([]);

  useEffect(() => {
    const addUpdateToListing = (data) => {
      const newItem = {
        event: data.event,
        orderId: data.orderId,
        status: data.status,
        updated: data.updatedAt,
        received: new Date()
      };
  
      // use functional update to avoid re-render
      // and creating more and more subscriptions.....
      setUpdates((prevUpdates) => [
        newItem,
        ...prevUpdates
      ]);
    };

    async function subscribeToTopics() {
      if (!mqttClient) { return; }

      mqttClient.on("messageReceived", (eventData) => {
        if (eventData.message?.payload) {
          const data = JSON.parse(eventData.message?.payload.toString("utf8"));
          addUpdateToListing(data)
        }
      }, []);

      await mqttClient.subscribe({
        subscriptions: [
          { qos: mqtt5.QoS.AtLeastOnce, topicFilter: "orders/events" }
        ]
      });
    }
    
    subscribeToTopics();

    return async () => {
      if (!mqttClient) { return; }

      await mqttClient.unsubscribe({
        topicFilters: [ "orders/events" ]
      });
    }
  }, [ mqttClient ]);


  return (
    <>
      <UpdatesTable title="Pattern 4: AWS IoT Core"
                    updates={ updates }
                    isConnected={ isConnected } />
    </>
  )
}