// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useId, useState, useRef } from "react";
import { get } from "aws-amplify/api";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { usePageVisibility } from "../lib/usePageVisibility";
import StatusIndicator from "./StatusIndicator";

function PollingIndicator({ isPolling }) {
  return (
    <>
      <StatusIndicator isConnected= { isPolling } />
    </>
  )
}

export default function Polling() {
  const isVisible = usePageVisibility();
  const pollingInterval = useRef(null);
  const pollingerIntervalId = useId();
  const [ selectedPollingInterval, setSelectedPollingInterval ] = useState("5000");
  const [ isPolling, setIsPolling ] = useState(false);
  const [ orders, setOrders ] = useState([]);
  
  useEffect(() => {
    const poll = async () => {
      console.log(`polling every ${selectedPollingInterval / 1000} seconds...`);
      setIsPolling(true);
      const getOrders = get({ apiName: "polling", path: "/orders" })
      const { body } = await getOrders.response;

      const newOrders = await body.json();

      const delta = await newOrders.filter(({ orderId, updatedAt }) => {
        const idx = orders.findIndex((o) => {
          return (o.orderId === orderId && o.updatedAt === updatedAt)
        })
        return idx === -1; // if not found, return true
      });

      setOrders([
        ...delta,
        ...orders
      ]);
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
  }, [ isVisible, orders, selectedPollingInterval ]);

  return (
    <>
      <div className="pt-2 px-4">
        <div className="flex items-stretch w-full align-middle">
          <h2 className="grow text-2xl font-semibold pb-4">Bonus Pattern: Polling</h2>

          <label htmlFor={ pollingerIntervalId }>
            Polling Interval:  
            <select id={ pollingerIntervalId }
                    value={ selectedPollingInterval }
                    onChange={ e => setSelectedPollingInterval(e.target.value) }
                    className="border border-gray-300 rounded-md h-10 mx-4 px-2">
              <option value="5000">5 sec</option>
              <option value="10000">10 sec</option>
              <option value="15000">15 sec</option>
            </select>
          </label>
          
          <PollingIndicator isPolling={ isPolling } />
        </div>

        <div className="h-96">
          <div className="h-[calc(100%-2rem)] overflow-y-scroll">
            <table className="w-full table-auto text-left">
              <thead className="sticky top-0">
                <tr className="bg-slate-300 font-semibold text-md">
                  {/* <th className="py-2">Event</th> */}
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Updated</th>
                  <th className="py-2">Received</th>
                </tr>
              </thead>
              <tbody className="align-text-top">
                { orders.map(item => (
                  <tr key={ `${item.orderId}-${item.updatedAt}` } className="odd:bg-white even:bg-gray-50 text-sm border-b transition-colors ease-in-out highlight">
                    <td className="py-2">{ item.orderId }</td>
                    <td className="py-2">{ item.status }</td>
                    <td className="py-2">{ format(new Date(item.updatedAt), "HH:mm:ss:SS") }</td>
                    <td className="py-2">{ format(new Date(item.createdAt), "HH:mm:ss:SS") }</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

PollingIndicator.propTypes = {
  isPolling: PropTypes.bool
}