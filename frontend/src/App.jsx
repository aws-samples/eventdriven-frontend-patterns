// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import "./App.css";

// Amplify configuration -- for auth, etc.
import { Amplify } from "aws-amplify";
import config  from "./appconfig";

Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: config.identityPoolId,
      allowGuestAccess: true
    }
  },
  API: {
    REST: {
      shared: {
        endpoint: config.sharedEndpoint,
        region: config.region
      }
    }
  }
});

// demo components
import PlaceNewOrder from './components/PlaceNewOrder';
import Pattern1 from './components/Pattern1';
import Pattern2 from './components/Pattern2';
import Pattern3 from './components/Pattern3';
// import Pattern4 from './components/Pattern4';
import { MqttClientProvider } from './mqtt/MqttClientProvider';
import Pattern4a from './components/Pattern4a';
import Chat from "./components/Chat";

function App() {
  return (
    <>
      <div className="w-screen grid grid-flow-row grid-cols-2 grid-rows-auto">
        <div className="col-span-2">
          <PlaceNewOrder />
        </div>
        <Pattern1 />
        <Pattern2 />
        <Pattern3 />
        {/* <Pattern4 /> */}
        
        <MqttClientProvider>
          <Pattern4a />
        </MqttClientProvider>

        <div className="col-span-2">
          <Chat />
        </div>
      </div>
    </>
  )
}

export default App
