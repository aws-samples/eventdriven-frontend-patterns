// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState } from "react";
import { get, post } from "aws-amplify/api";
import Subscribe from "./Subscribe";
import { createClient } from "../graphql";
import { onCreateOrUpdateOrder } from "../graphql/subscriptions";
import config  from "../appconfig";

export default function PlaceNewOrder() {
  const [ client, setClient ] = useState(null);
  // start button status
  const [ clicked, setClicked ] = useState(false);
  // order operation
  const [ orderId, setOrderId ] = useState(null);
  const [ orderStatus, setOrderStatus ] = useState("");

  const [ subscriptionId, setSubscriptionId ] = useState(null);

  useEffect(() => {
    async function graphqlClient() {
      const client = await createClient(config.pattern1.endpoint);
      setClient(client);
    }

    graphqlClient();
  }, []);

  useEffect(() => {
    if (!client || !orderId) return;

    const subscription = client.subscribe({ query: onCreateOrUpdateOrder, variables: { orderId } })
        .subscribe({
          next: ({ data }) => {
            const { onCreateOrUpdateOrder: { status } } = data;
            setOrderStatus(status);
          },
          error: (error) => console.warn(error)
        });
    
    return () => subscription.unsubscribe();
  }, [ client, orderId ]);

  function updateSubscriptionId(subId) {
    setSubscriptionId(subId);
  }

  async function handleStartSimulation() {
    setClicked(true);

    await get({ apiName: "shared", path: "/order", }).response
      .then(({ body }) => {
        return body.json();
      })
      .then(async (result) => {
        if (result.orderId) {
          setOrderId(result.orderId);
          setOrderStatus(result.status);

          await post({
            apiName: "shared",
            path: "/subscribe/order",
            options: {
              body: {
                orderId: result.orderId,
                subscriptionId: subscriptionId
              }
            }
          }).response;
        }
      });
  }

  return (
    <>
      <div className="p-8 px-4">
        <div className="w-full align-middle border-2 border-slate-300 rounded-md">
          <div className="p-4 grid gap-4 grid-cols-3 align-middle">
            
            <span className="pt-2 text-xl">
              Order ID: { orderId }
            </span>
            <span className="pt-2 text-xl font-semibold">
              Status: { orderStatus }
            </span>
            
            <span className="flex justify-end space-x-2">
              <button onClick={ handleStartSimulation } disabled={ clicked } className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Start Simulation
              </button>
              <Subscribe subscriptionComplete={ updateSubscriptionId } />
            </span>

          </div>
        </div>
      </div>
    </>
  )
}
