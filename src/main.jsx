// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { insertCoin } from 'playroomkit'

// Khởi tạo Playroom chờ người chơi vào phòng
insertCoin().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
})