import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Buffer } from 'buffer'
import { startActivityTracking } from './services/activity'

// Add Buffer polyfill to global scope for @react-pdf/renderer
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

// Start activity tracking to keep Supabase database active
startActivityTracking()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
