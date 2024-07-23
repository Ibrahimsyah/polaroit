import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ReactTagManager } from 'react-gtm-ts'

ReactTagManager.init({
  code: 'G-K74Z09FSJK',
  debug: true
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
