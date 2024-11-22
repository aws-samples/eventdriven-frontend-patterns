// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState } from "react";
import { post, del } from "aws-amplify/api";

export default function LoadDataControls() {
  const [ loadDataClicked, setLoadDataClicked ] = useState(false);
  const [ resetSimClicked, setResetSimClicked ] = useState(false);

  async function handleLoadData() {
    setLoadDataClicked(true);

    await post({ apiName: "shared", path: "/flights" }).response;
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  async function handleReset() {
    await del({ apiName: "shared", path: "/flights" }).response;
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  return (
    <>
      <div className="pb-4 px-4">
        <div className="w-full align-middle text-slate-300 text-bolded">
            <span className="flex justify-end space-x-2">
              <button onClick={ handleLoadData } disabled={ loadDataClicked } className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Load Data
              </button>
              <button onClick={ handleReset } disabled={ resetSimClicked } className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Reset
              </button>
            </span>
        </div>
      </div>
    </>
  )
}
