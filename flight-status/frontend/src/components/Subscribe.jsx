// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { post } from "aws-amplify/api";
import crypto from "crypto";
import StatusIndicator from "./StatusIndicator";
import config  from "../appconfig";

export default function Subscribe({ subscriptionComplete }) {
  // status indicator
  const [ isSubscribed, setIsSubscribed ] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      // setIsSubscribed(true);
      navigator.serviceWorker.getRegistration()
        .then((registration) => {
          registration.pushManager.subscribe({
            applicationServerKey: config.push.applicationServerKey,
            userVisibleOnly: true
          })
          .then((subscription) => {
            setIsSubscribed(true);
            subscriptionComplete(calculateEndpointHash(subscription.endpoint));
          });
        })
    }
  }, [ subscriptionComplete ]);

  function calculateEndpointHash(endpoint) {
    return crypto.createHash('sha256').update(endpoint).digest('base64');
  }

  function handleSubscribe() {
    if (navigator.serviceWorker && window.PushManager && window.Notification) {
      navigator.serviceWorker.getRegistration()
        .then((registration) => {
          registration.pushManager.subscribe({
            applicationServerKey: config.push.applicationServerKey,
            userVisibleOnly: true
          })
          .then((subscription) => {
            if (Notification.permission === "granted") {
              setIsSubscribed(true);
              return subscription;
            } else {
              console.log("Notification permission denied");
            }
          })
          .then((subscription) => {
            if (subscription) {
              subscriptionComplete(calculateEndpointHash(subscription.endpoint));

              post({
                apiName: "shared",
                path: "/subscribe",
                options: {
                  body: JSON.parse(JSON.stringify(subscription))
                }
              });
            }
          });
      })
    }
  }

  return (
    <>
      <button onClick={ handleSubscribe } hidden={ isSubscribed } className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">
        Subscribe
      </button>

      <StatusIndicator isConnected={ isSubscribed } />
    </>
  );
}

Subscribe.propTypes = {
  subscriptionComplete: PropTypes.func
}
