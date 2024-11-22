// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState, useReducer } from "react";
import flightUpdateReducer from "../lib/flightUpdateReducer";
import UpdatesTable from "./UpdatesTable";
import { createClient } from "../graphql";
import { listFlights } from "../graphql/queries";
import { onUpdateFlight } from "../graphql/subscriptions";
import config from "../appconfig";

export default function Pattern1() {
  const url = config.pattern1.endpoint;
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function graphqlClient() {
      const client = await createClient(url);
      setClient(client);
      // assume that connection is good if there is no error
      // no easy way to get network status from apollo sub
      setIsConnected(true);
    }

    graphqlClient();
  }, [url]);

  const [flights, dispatch] = useReducer(flightUpdateReducer, []);

  useEffect(() => {
    const getFlights = async () => {
      const { data } = await client.query({ query: listFlights });
      dispatch({ type: "INIT", data: data.listFlights.items });
    };

    if (!client) return;

    getFlights();

    const updateSub = client.subscribe({ query: onUpdateFlight })
      .subscribe({
        next: ({ data }) => {
          const { onUpdateFlight } = data;
          dispatch({ type: "UPDATE", data: { ...onUpdateFlight, received: Date.now() } });
        },
        error: (error) => console.warn(error)
      });

    return () => updateSub.unsubscribe();
  }, [client]);

  return (
    <>
      <UpdatesTable title="Terminal A: GraphQL pattern"
        updates={flights}
        isConnected={isConnected} />
    </>
  )
}