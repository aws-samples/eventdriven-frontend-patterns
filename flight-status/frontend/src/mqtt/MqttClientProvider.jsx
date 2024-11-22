// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { createContext, useEffect, useRef, useState } from "react";
import { mqtt5, iot } from "aws-iot-device-sdk-v2";
import PropTypes from "prop-types";
import { fetchAuthSession } from "aws-amplify/auth";
import { once } from "events";
import config  from "../appconfig";


export const MqttClientContext = createContext(null);
export const MqttClientConnectedContext = createContext(false);

// @see https://github.com/aws/aws-iot-device-sdk-js-v2/blob/main/samples/browser/react_sample/src/PubSub5.tsx
// @see https://github.com/aws-samples/aws-amplify-react-iot-pub-sub-using-cp/blob/main/src/MQTTDisplay.js

let didInitMqttClient = false;

class GuestCredentialsProvider {
  constructor({ identityPoolId, region }) {
    this.identityPoolId = identityPoolId;
    this.region = region;
    this.credentials = null;
  }

  getCredentials = () => {
    return {
      aws_access_id: this.credentials?.accessKeyId ?? "",
      aws_secret_key: this.credentials?.secretAccessKey ?? "",
      aws_sts_token: this.credentials?.sessionToken,
      aws_region: this.region
    };
  }

  refreshCredentials = async () => {
    this.credentials = (await fetchAuthSession()).credentials;
  }
}

export function MqttClientProvider({ children }) {
  const [ isConnected, setIsConnected ] = useState(false);
  // const [ client, setClient ] = useState(undefined);
  const client = useRef(null);

  useEffect(() => {
    const createClient = async (region, endpoint) => {
      const credentialsProvider = new GuestCredentialsProvider({
        identityPoolId: config.identityPoolId,
        region: region
      });
    
      let mqttClientConfig = {
        credentialsProvider,
        region: region
      };
    
      await credentialsProvider.refreshCredentials();
    
      let clientBuilder = iot.AwsIotMqtt5ClientConfigBuilder.newWebsocketMqttBuilderWithSigv4Auth (
        endpoint,
        mqttClientConfig
      );
    
      let client = new mqtt5.Mqtt5Client(clientBuilder.build());
      
      client.on("error", (error) => {
        console.error(`[MQTT Client Error]: ${error.toString()}`);
      });

      client.on("disconnection", () => {
        // setIsConnected(false);
      });
    
      client.on("connectionSuccess", () => {
        setIsConnected(true);
      });
    
      client.on("connectionFailure", (eventData) => {
        console.error(`[MQTT Connection Failed] ${eventData.error.toString()}`);
      });
    
      const attemptingConnect = once(client, "attemptingConnect");
      const connectionSuccess = once(client, "connectionSuccess");

      client.start();
    
      await attemptingConnect;
      await connectionSuccess;
    
      return client;
    }

    const mqttClient = async() => {
      if (!didInitMqttClient) {
        // setClient(await createClient(config.region, config.mqttEndpoint));
        client.current = await createClient(config.region, config.pattern4.mqttEndpoint);
        didInitMqttClient = true;
      }
    };

    mqttClient();

    return async () => {
      if (client.current) {
        const stopped = once(client.current, "stopped");
        client.current.stop();
        await stopped;
        client.current.close();
      }
    }
  }, [ ]);

  return (
    <MqttClientContext.Provider value={ client.current }>
      <MqttClientConnectedContext.Provider value={ isConnected }>
        { children }
      </MqttClientConnectedContext.Provider>
    </MqttClientContext.Provider>
  )
}

MqttClientProvider.propTypes = {
  children: PropTypes.object
}
