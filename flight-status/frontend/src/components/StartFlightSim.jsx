// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState } from "react";
import { post } from "aws-amplify/api";
import { events } from "aws-amplify/data";

export default function StartFlightSim() {
  const [ clicked, setClicked ] = useState(false);

  const [ flightCode, setFlightCode ] = useState("");
  const [ channels, setChannels ] = useState(null);
  const [ flightStatus, setFlightStatus ] = useState("");
  const [ seat, setSeat ] = useState("");

  useEffect(() => {    
    const connect = async () => {
      // TODO: update to AWS IAM auth?
      return (await events.connect(channels.seat)).subscribe({
        next: ( data ) => {
          console.log("Seat update: ", data.event);
          setSeat(data.event.newSeat);
        },
        error: (err) => console.log(err)
      })
    };

    if (! (channels && channels.seat)) return;

    connect();
  }, [ channels ]);

  useEffect(() => {    
    const connect = async () => {
      return (await events.connect(channels.status)).subscribe({
        next: ( data ) => {
          console.log("Status update: ", data.event);
          setFlightStatus(data.event.event);
        },
        error: (err) => console.log(err)
      })
    };

    if (! (channels && channels.status)) return;

    connect();
  }, [ channels ]);

  async function handleStartSimulation() {
    setClicked(true);

    /**
     * Expected response:
     * 
     * {
     *   "flightId": "",
     *   "airlineCode": "",
     *   "flightNum": "",
     *   "passengerId": "",
     *   "channels": {
     *     "status": "",
     *     "seat": ""
     *   }
     * }
     */
    await post({ apiName: "shared", path: "/start-producer", }).response
      .then(({ body }) => {
        return body.json();
      })
      .then(async (result) => {
        if (result.channels && result.flightId) {
          setFlightCode(`${result.airlineCode}${result.flightNum}`);
          setFlightStatus("SCHEDULED");
          setSeat(result.seat);
          setChannels(result.channels);
        }
      });
  };

  return (
    <>
      <div className="pt-4 px-4">
        <div className="w-full align-middle border-2 border-slate-300 rounded-md text-slate-300 text-bolded">
          <div className="p-4 grid gap-2 grid-cols-4 align-middle">
            
            <span className="pt-2 text-xl">
              <b>My flight:</b> { flightCode }
            </span>

            <span className="pt-2 text-xl">
              <b>Status:</b> { flightStatus }
            </span>

            <span className="pt-2 text-xl font-semibold">
              <b>My seat:</b> { seat }
            </span>
            
            <span className="flex justify-end space-x-2">
              <button onClick={ handleStartSimulation } disabled={ clicked } className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Start Simulation
              </button>
            </span>

          </div>
        </div>
      </div>
    </>
  )
}
