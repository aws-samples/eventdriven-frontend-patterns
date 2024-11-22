// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState, useRef, useReducer } from "react";
import { get } from "aws-amplify/api";
import flightUpdateReducer from "../lib/flightUpdateReducer";
import { usePageVisibility } from "../lib/usePageVisibility";
import UpdatesTable from "./UpdatesTable";

export default function Polling() {
  const isVisible = usePageVisibility();
  const pollingInterval = useRef(null);
  const [ selectedPollingInterval, setSelectedPollingInterval ] = useState("15000");
  const [ isPolling, setIsPolling ] = useState(false);
  
  const [flights, dispatch] = useReducer(flightUpdateReducer, []);

  useEffect(() => {
    const getFlights = async () => {
      const { body } = await get({ apiName: "polling", path: "/flights" }).response;
      const data = await body.json();
      dispatch({ type: "INIT", data });
    };

    getFlights();
  }, []);  

  useEffect(() => {
    const poll = async () => {
      console.log(`polling every ${selectedPollingInterval / 1000} seconds...`);
      setIsPolling(true);
      let localFlights = Object.create(flights);
      const getFlights = get({ apiName: "polling", path: "/flights" })
      const { body } = await getFlights.response;

      const newFlights = await body.json();
      localFlights.filter((existing) => {
        return newFlights.some((newFlight) => {
          if (newFlight.flightId === existing.flightId && newFlight.event !== existing.event) {
            dispatch({ type: "UPDATE", data: { ...newFlight, received: Date.now() } });
          }
        })
      });

      setIsPolling(false);
    };

    const startPolling = () => {
      pollingInterval.current = setInterval(poll, selectedPollingInterval);
    };

    const stopPolling = () => {
      clearInterval(pollingInterval.current);
    };

    if (isVisible) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [ isVisible, flights, selectedPollingInterval ]);

  const pollingIntervalControlCallback = (value) => {
    setSelectedPollingInterval(value);
  };

  return (
    <>
      <UpdatesTable title="Terminal P: Polling"
                    updates={ flights }
                    isConnected={ isPolling }
                    pollConfig={ true } 
                    selectedPollingInterval={selectedPollingInterval}
                    pollingIntervalCallback={pollingIntervalControlCallback}/>
    </>
  )
}