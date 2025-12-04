import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../common/PageTransition';
import MenuButton from '../common/MenuButton';
import { useGlobalMusic } from '../home/HomePage';
import useStore from '../../store/useStore';
import loveLetterText from '../../data/loveLetterText';

// Credits-style scrolling text (like movie credits from bottom to top)
function CreditsScroll({ onComplete }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Total duration for the scroll animation (in ms)
  const scrollDuration = 35000; // 35 seconds
  
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / scrollDuration, 1);
      
      setScrollProgress(progress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onComplete]);
  
  // Calculate translateY based on progress
  const translateY = 50 - (scrollProgress * 130);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        style={{
          transform: `translateY(${translateY}%)`,
        }}
        className="w-full px-6 md:px-12"
      >
        {/* Greeting */}
        <h2
          className="font-script text-4xl md:text-5xl text-center mb-16"
          style={{ color: '#C76B6B' }}
        >
          {loveLetterText.greeting}
        </h2>
        
        {/* Paragraphs */}
        <div className="space-y-10 max-w-2xl mx-auto">
          {loveLetterText.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="font-body text-lg md:text-xl text-center leading-relaxed"
              style={{ color: '#8B5A5A' }}
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Closing and signature */}
        <div className="mt-20 pt-10 text-center">
          <p
            className="font-body text-xl italic mb-8"
            style={{ color: '#8B5A5A' }}
          >
            {loveLetterText.closing}
          </p>
          
          <p
            className="font-script text-4xl md:text-5xl"
            style={{ color: '#C76B6B' }}
          >
            {loveLetterText.signature}
          </p>
        </div>
        
        {/* Extra space */}
        <div className="h-[50vh]" />
      </div>
    </div>
  );
}

// Final message that stays centered
function FinalMessage({ onMenuShow }) {
  useEffect(() => {
    // Show menu button immediately after final message renders
    const timer = setTimeout(() => {
      onMenuShow();
    }, 500);
    return () => clearTimeout(timer);
  }, [onMenuShow]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center px-6"
    >
      <p
        className="font-body text-xl italic mb-8"
        style={{ color: '#8B5A5A' }}
      >
        {loveLetterText.closing}
      </p>
      
      <p
        className="font-script text-5xl md:text-6xl"
        style={{ color: '#C76B6B' }}
      >
        {loveLetterText.signature}
      </p>
      
      <div className="mt-6">
        <span className="text-3xl">💕</span>
      </div>
    </motion.div>
  );
}

// Click to start screen
function ClickToStart({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: 'linear-gradient(180deg, rgba(255,245,245,0.98) 0%, rgba(255,228,232,0.98) 50%, rgba(255,209,220,0.98) 100%)',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl mb-8"
      >
        💌
      </motion.div>
      
      <h2 
        className="font-script text-4xl md:text-5xl mb-6 text-center px-4"
        style={{ color: '#C76B6B' }}
      >
        To My Pumpkinpie
      </h2>
      
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="font-body text-lg"
        style={{ color: '#8B5A5A' }}
      >
        Click anywhere to start
      </motion.p>
      
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="mt-8"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#C76B6B" 
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default function PumpkinpiePage() {
  const [stage, setStage] = useState('start'); // 'start' | 'scrolling' | 'final'
  const [showMenu, setShowMenu] = useState(false);
  const unlockSection = useStore((state) => state.unlockSection);
  
  const handleStart = () => {
    setStage('scrolling');
  };
  
  const handleScrollComplete = () => {
    setStage('final');
  };
  
  const handleMenuShow = () => {
    setShowMenu(true);
  };
  
  const handleMenuClick = () => {
    unlockSection('honeybunch');
  };
  
  // Use same music as home page (continues playing)
  useGlobalMusic('home', 0.3);
  
  return (
    <PageTransition className="bg-romantic-gradient">
      
      {/* Stage 1: Click to start */}
      <AnimatePresence>
        {stage === 'start' && (
          <ClickToStart onClick={handleStart} />
        )}
      </AnimatePresence>
      
      {/* Stage 2: Scrolling credits */}
      {stage === 'scrolling' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <CreditsScroll onComplete={handleScrollComplete} />
        </div>
      )}
      
      {/* Stage 3: Final message */}
      {stage === 'final' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <FinalMessage onMenuShow={handleMenuShow} />
          
          {/* Menu button */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MenuButton 
                    onClick={handleMenuClick}
                    visible={showMenu}
                    delay={0}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </PageTransition>
  );
}