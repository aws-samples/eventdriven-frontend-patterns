// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import PropTypes from "prop-types";

export default function StatusIndicator({ isConnected = false }) {
  const statusClass = isConnected ? "bg-green-300 ring-green-800/20" : "bg-red-300 ring-red-800/20"

  return (
    <>
      <span className={ `w-6 h-6 mt-2 mr-4 align-top ring-1 ring-inset rounded ${statusClass}` } />
    </>
  )
}

StatusIndicator.propTypes = {
  isConnected: PropTypes.bool
}
