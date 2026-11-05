import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { PortalProvider } from './state/PortalContext'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/manrope'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PortalProvider>
        <App />
      </PortalProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
