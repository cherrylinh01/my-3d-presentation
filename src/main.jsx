import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { insertCoin } from 'playroomkit'
import './index.css'

// Bỏ qua gameId, chỉ giữ lại giới hạn 8 người chơi
insertCoin({
  maxPlayersPerRoom: 8,
}).then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})