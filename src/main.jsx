import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PozaKI from './Website.jsx'
import Partner from './Partner.jsx'
import { Impressum, Datenschutz, AGB } from './Legal.jsx'
import CookieBanner from './CookieBanner.jsx'

function App() {
  React.useEffect(() => {
    // Load ElevenLabs Convai Widget
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PozaKI />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/agb" element={<AGB />} />
      </Routes>
      <CookieBanner />
      <elevenlabs-convai agent-id="agent_2901khgzf48peeashk2ype2d33r7"></elevenlabs-convai>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
