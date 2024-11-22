// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import PropTypes from "prop-types";
import { format } from "date-fns";
import StatusIndicator from "./StatusIndicator";

export default function UpdatesTable({ title, updates = [], isConnected = false }) {
  

  return (
    <>
      <div className="pt-2 px-4">
        <div className="flex items-stretch w-full align-middle">
          <h2 className="grow text-2xl font-semibold pb-4">{ title }</h2>
          <StatusIndicator isConnected={isConnected} />
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
                { updates.map(item => (
                  <tr key={ `${item.orderId}-${item.updated}` } className="odd:bg-white even:bg-gray-50 text-sm border-b transition-colors ease-in-out highlight">
                    {/* <th scope="row" className="py-2 font-medium text-gray-900 whitespace-nowrap">
                      <div className="py-2 mx-2 rounded-full text-white font-semibold text-m text-center  bg-slate-500 border-slate-500">
                        { item.event }
                      </div>
                    </th> */}
                    <td className="py-2">{ item.orderId }</td>
                    <td className="py-2">{ item.status }</td>
                    <td className="py-2">{ format(item.updated, "HH:mm:ss:SS") }</td>
                    <td className="py-2">{ format(item.received, "HH:mm:ss:SS") }</td>
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

UpdatesTable.propTypes = {
  title: PropTypes.string,
  updates: PropTypes.array,
  isConnected: PropTypes.bool
}
