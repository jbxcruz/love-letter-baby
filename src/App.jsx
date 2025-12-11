import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/home/HomePage';
import MonthsaryPage from './components/monthsary/MonthsaryPage';
import PumpkinpiePage from './components/pumpkinpie/PumpkinpiePage';
import HoneybunchPage from './components/honeybunch/HoneybunchPage';
import ILoveYouPage from './components/iloveyou/ILoveYouPage';
import { useEffect, useState } from 'react';

// InstallButton Component
function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); // Prevent default Chrome prompt
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      console.log("User choice:", choice.outcome);
      setDeferredPrompt(null);
    });
  };

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "10px 20px",
        background: "#ff8fb1",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      Install App
    </button>
  );
}

// Animated Routes
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/monthsary" element={<MonthsaryPage />} />
        <Route path="/pumpkinpie" element={<PumpkinpiePage />} />
        <Route path="/honeybunch" element={<HoneybunchPage />} />
        <Route path="/iloveyou" element={<ILoveYouPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <InstallButton /> {/* Add the install button here */}
    </BrowserRouter>
  );
}

export default App;
