import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/summa-tokens.css'
import './styles/summa-presets.css'
import './index.css'

document.documentElement.dataset.platform = window.desktop?.platform ?? 'web'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
