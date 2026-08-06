import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const APP_ENV = import.meta.env.VITE_APP_ENV ?? "local";
const USE_MOCKS = APP_ENV !== "production";

const root = (USE_MOCKS) ? 'root' : 'campaigns-root';
createRoot(document.getElementById(root)!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
