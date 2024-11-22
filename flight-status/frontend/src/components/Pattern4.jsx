// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useContext, useEffect, useState, useReducer } from "react";
import { mqtt5 } from "aws-iot-device-sdk-v2";
import { get } from "aws-amplify/api";
import flightUpdateReducer from "../lib/flightUpdateReducer";
import { MqttClientContext, MqttClientConnectedContext } from "../mqtt";
import UpdatesTable from "./UpdatesTable";

export default function Pattern4() {
  const mqttClient = useContext(MqttClientContext);
  const isConnected = useContext(MqttClientConnectedContext);

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
    async function subscribeToTopics() {
      if (!mqttClient) { return; }

      mqttClient.on("messageReceived", (eventData) => {
        if (eventData.message?.payload) {
          const data = JSON.parse(eventData.message?.payload.toString("utf8"));
          if (data.operation === "UPDATE") {
            dispatch({ type: "UPDATE", data: { ...data, received: Date.now() } });
          }
        }
      }, []);

      await mqttClient.subscribe({
        subscriptions: [
          { qos: mqtt5.QoS.AtLeastOnce, topicFilter: "flights/events" }
        ]
      });
    }
    
    subscribeToTopics();

    return async () => {
      if (!mqttClient) { return; }

      await mqttClient.unsubscribe({
        topicFilters: [ "flights/events" ]
      });
    }
  }, [ mqttClient ]);


  return (
    <>
      <UpdatesTable title="Terminal D: MQTT pattern"
                    updates={ flights }
                    isConnected={ isConnected } />
    </>
  )
}