// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useRef, useState } from "react";
import { createClient } from "../graphql";
import { sendMessage } from "../graphql/mutations";
import { onResponse } from "../graphql/subscriptions";
import config  from "../appconfig";
import StatusIndicator from "./StatusIndicator";

export default function Chat() {
  const url = config.chat.endpoint;

  const [ client, setClient ] = useState(null);
  const [ isConnected, setIsConnected ] = useState(false);
  const [ clicked, setClicked ] = useState(false);
  const [ chatId, setChatId ] = useState(null);

  const responseRef = useRef(null);

  useEffect(() => {
    async function graphqlClient() {
      const client = await createClient(url);
      setClient(client);
    }

    graphqlClient();
  }, [ url ]);

  useEffect(() => {
    if (!client || !chatId) return;

    const subscription = client.subscribe({ query: onResponse, variables: { chatId } })
        .subscribe({
          next: ({ data }) => {
            const { onResponse: { text } } = data;
            responseRef.current.innerText = text;
          },
          error: (error) => console.warn(error)
        });
      
    setIsConnected(true);
    
    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    }
  }, [ client, chatId ]);

  async function onSubmit(e) {
    e.preventDefault();
    setClicked(true);

    responseRef.current.innerText = "Thinking...";

    const { data: { sendMessage: { id }, error }} = await client.mutate({ 
      mutation: sendMessage,
      variables: { text: e.target.text.value }
    });

    if (error) {
      console.error(error);
    } else {
      setChatId(id);
    }
  }

  return (
    <>
      <div className="pt-2 px-4">
        <div className="flex items-stretch w-full align-middle">
          <h2 className="grow text-2xl font-semibold pb-4">Long-running Query</h2>
          <StatusIndicator isConnected={isConnected} />
        </div>

        <p className="pb-4">
          Ask our chatbot to help plan your next party. Describe the party size (number of people), dietary preferences
          and restrictions, or any other details about the event. The bot will return a suggested menu and other ideas!
        </p>

        <div className="w-full grid grid-flow-row grid-cols-2 grid-rows-auto gap-10">
          <form onSubmit={ onSubmit }>
            <label htmlFor="text" className="block text-sm font-medium leading-6 text-gray-900">Tell us about your party and preferences</label>
            <input type="text" id="text" name="text"
              placeholder="We are a family of four. Include a salad."
              className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
            <div className="mt-6 flex items-left">
              <button type="submit" disabled={ clicked } className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
            </div>
          </form>

          <div>
            <label htmlFor="text" className="block text-sm font-medium leading-6 text-gray-900">Response</label>
            <textarea ref={ responseRef } id="response" name="response" rows="6"
              className="w-full h-40 disabled rounded-md border-0 block p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
          </div>
        </div>

      </div>
    </>
  )
}