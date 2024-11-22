// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useId } from "react";
import PropTypes from "prop-types";
import svs from "../images/svs.png";
import api from "../images/api.png";
import riv from "../images/riv.png";
import StatusIndicator from "./StatusIndicator";
import { compareFlights, formatDeliveryDelay } from "../lib/util";

export default function UpdatesTable({ title, updates = [], isConnected = false, pollConfig = false, selectedPollingInterval = "5000", pollingIntervalCallback = () => null}) {
  const pollingerIntervalId = useId();

  const renderAirlineImage = (airlineCode) => {
    if (airlineCode === 'SVS') {
      return <img src={svs} alt="SVS" className="h-6 inline-block" />;
    } else if (airlineCode === 'RIV') {
      return <img src={riv} alt="RIV" className="h-6 inline-block" />;
    } else {
      return <img src={api} alt="API" className="h-6 inline-block" />;
    }
  }

  const renderTerminal = (terminal) => {
    let color;
    switch(Number(terminal)) {
      case 1:
        color = "bg-orange-700";
        break;
      case 2:
        color = "bg-violet-700";
        break;
      case 3:
        color = "bg-rose-500";
        break;
      case 4:
        color = "bg-yellow-500";
        break;
      case 5:
        color = "bg-green-800";
        break;
      default:
        color = "bg-gray-500";
        break;
    }
    return <div className={`w-6 h-6 ${color} rounded-full inherit mx-auto`}>{terminal}</div>
  }

  return (
    <>
      <div className="mx-4 border-2 border-gray-200 rounded-md">
        <div className="flex items-stretch w-full bg-blue-900 rounded-md">
            <h2 className="grow text-lg font-semibold mt-4 pb-4 text-center text-slate-50">{ title }</h2>
            {pollConfig ?
              <label htmlFor={ pollingerIntervalId }>
                <b className="text-sm text-slate-50">{"Polling Interval: "}</b> 
                <select id={ pollingerIntervalId }
                        value={ selectedPollingInterval }
                        onChange={ e => pollingIntervalCallback(e.target.value) }
                        className="border border-slate-300 rounded-md h-10 mx-4 mt-2 px-2">
                  <option value="5000">5 sec</option>
                  <option value="10000">10 sec</option>
                  <option value="15000">15 sec</option>
                </select>
              </label>
            : <></>
            }
              <StatusIndicator isConnected={isConnected} />
        </div>

        <div className="h-auto min-h-52 overflow-y-auto">
          <div className="h-[calc(100%-2rem)]">
            <table className="w-full table-auto text-center">
              <thead className="sticky top-0">
                <tr className="bg-blue-950 font-semibold text-sm text-slate-50">
                  <th className="py-2">Dest</th>
                  <th className="py-2">Airline</th>
                  <th className="py-2">Flight #</th>
                  <th className="py-2">Term</th>
                  <th className="py-2">Gate</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Event age</th>
                </tr>
              </thead>
              <tbody className="align-text-top">
                { updates.sort(compareFlights).map(item => (
                  <tr key={ `${item.flightId}-${item.event}-${item.received}` } className="text-sm align-middle odd:bg-blue-700 even:bg-blue-900 text-md text-slate-50 transition-colors ease-in-out highlight">
                    <td className="py-2">{ item.dest }</td>
                    <td className="py-2">{renderAirlineImage(item.airlineCode)}</td>
                    <td className="py-2">{ `${item.airlineCode} ${item.flightNum}` }</td>
                    <td className="py-2">{renderTerminal(item.terminal)}</td>
                    <td className="py-2">{ item.gate }</td>
                    <td className="py-2">{ item.event }</td>
                    <td className="py-2">{ item.updatedAt ? formatDeliveryDelay(item.updatedAt, item.received) : "" }</td>
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
  title: PropTypes.string.isRequired,
  updates: PropTypes.array,
  isConnected: PropTypes.bool,
  pollConfig: PropTypes.bool,
  selectedPollingInterval: PropTypes.string,
  pollingIntervalCallback: PropTypes.func
}
