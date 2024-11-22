import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { ServiceWorker } from "aws-amplify/utils";

const worker = new ServiceWorker();
worker.register("/service-worker.js", "/")

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
