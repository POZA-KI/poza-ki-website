import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PozaKI from './Website.jsx'
import Partner from './Partner.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PozaKI />} />
        <Route path="/partner" element={<Partner />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
