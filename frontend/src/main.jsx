import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { setupCustomAlerts } from './utils/dialogs.jsx'

setupCustomAlerts();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
