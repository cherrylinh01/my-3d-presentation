import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { insertCoin } from 'playroomkit'

// THÊM DÒNG NÀY ĐỂ KÍCH HOẠT CSS
import './index.css'

insertCoin({
  maxPlayersPerRoom: 8,
}).then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})