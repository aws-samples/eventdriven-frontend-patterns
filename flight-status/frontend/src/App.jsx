// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import "./App.css";

// Amplify configuration -- for auth, etc.
import { Amplify } from "aws-amplify";
import config from "./appconfig";

Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: config.identityPoolId,
      allowGuestAccess: true
    }
  },
  API: {
    Events: {
      endpoint: config.pattern5.endpoint,
      region: config.region,
      defaultAuthMode: "apiKey",
      apiKey: config.pattern5.apiKey
    },
    REST: {
      shared: {
        endpoint: config.sharedEndpoint,
        region: config.region,
      },
      polling: {
        endpoint: config.polling.endpoint,
        region: config.region
      }
    }
  }
});

// demo components
import StartFlightSim from './components/StartFlightSim';
import Pattern1 from './components/Pattern1';
import Pattern2 from './components/Pattern2';
import Pattern3 from './components/Pattern3';
import Pattern4 from './components/Pattern4';
import Pattern5 from './components/Pattern5';
import Polling from "./components/Polling";
import LoadDataControls from "./components/LoadDataControls";
import { MqttClientProvider } from './mqtt/MqttClientProvider';

function App() {
  return (
    <>
      <div className="h-screen grid grid-flow-row gap-4 grid-cols-6 grid-rows-auto bg-slate-800">
        <div className="col-span-6 max-h-24">
          <StartFlightSim />
        </div>
        <div className="col-span-3">
          <Polling />
        </div>
        <div className="col-span-3">
          <Pattern5 />
        </div>
        
        <div className="col-span-3">
          <Pattern1 />
        </div>

        <div className="col-span-3">
          <Pattern2 />
        </div>

        <div className="col-span-3">
          <Pattern3 />
        </div>

        <div className="col-span-3">
          <MqttClientProvider>
            <Pattern4 />
          </MqttClientProvider>
        </div>

        {/*<div className="col-span-2 mb-20">
          <Chat />
        </div>*/}
        <div className="col-span-6 max-h-24">
          <LoadDataControls />
        </div>
      </div>
    </>
  )
}

export default App;
