// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState } from "react";
import UpdatesTable from "./UpdatesTable";
import { createClient } from "../graphql";
import { onCreateOrUpdateOrder } from "../graphql/subscriptions";
import config  from "../appconfig";

export default function Pattern2() {
  const url = config.pattern2.endpoint;

  const [ updates, setUpdates ] = useState([]);
  const [ client, setClient ] = useState(null);
  const [ isConnected, setIsConnected ] = useState(false);

  useEffect(() => {
    async function graphqlClient() {
      const client = await createClient(url);
      setClient(client);

      // assume that connection is good if there is no error
      // no easy way to get network status from apollo sub
      setIsConnected(true);
    }

    graphqlClient();
  }, [ url ]);

  useEffect(() => {
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

    if (!client) return;

    const subscription = client.subscribe({ query: onCreateOrUpdateOrder })
        .subscribe({
          next: ({ data }) => {
            const { onCreateOrUpdateOrder } = data;
            addUpdateToListing(onCreateOrUpdateOrder);
          },
          error: (error) => console.warn(error)
        });
    
    return () => subscription.unsubscribe();
  }, [ client, updates ]);

  return (
    <>
      <UpdatesTable title="Pattern 2: AppSync + EventBridge"
                    updates={ updates }
                    isConnected={ isConnected } />
    </>
  )
}