import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/home/HomePage';
import MonthsaryPage from './components/monthsary/MonthsaryPage';
import PumpkinpiePage from './components/pumpkinpie/PumpkinpiePage';
import HoneybunchPage from './components/honeybunch/HoneybunchPage';
import ILoveYouPage from './components/iloveyou/ILoveYouPage';

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
    </BrowserRouter>
  );
}

export default App;
