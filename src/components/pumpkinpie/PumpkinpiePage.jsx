import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../common/PageTransition';
import FallingHearts from '../common/FallingHearts';
import MenuButton from '../common/MenuButton';
import AudioManager from '../common/AudioManager';
import useStore from '../../store/useStore';
import loveLetterText from '../../data/loveLetterText';
import fallingPhotosData from '../../data/fallingPhotosData';

// Falling photo component
function FallingPhoto({ src, delay, duration, startX }) {
  return (
    <motion.div
      initial={{ 
        y: -150, 
        x: startX, 
        rotate: Math.random() * 30 - 15,
        opacity: 0 
      }}
      animate={{ 
        y: '110vh', 
        rotate: Math.random() * 60 - 30,
        opacity: [0, 0.7, 0.7, 0] 
      }}
      transition={{ 
        duration, 
        delay, 
        repeat: Infinity,
        ease: 'linear'
      }}
      className="absolute w-20 h-20 md:w-28 md:h-28 rounded-lg overflow-hidden shadow-lg pointer-events-none"
      style={{ left: `${startX}%` }}
    >
      <img 
        src={src} 
        alt="" 
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23F5D0D0" width="100" height="100"/><text x="50%" y="50%" fill="%23C76B6B" text-anchor="middle" dy=".3em" font-size="12">Photo</text></svg>';
        }}
      />
    </motion.div>
  );
}

// Falling photos layer
function FallingPhotos() {
  const photos = [];
  
  fallingPhotosData.forEach((src, index) => {
    // Create multiple instances of each photo
    for (let i = 0; i < 2; i++) {
      photos.push({
        src,
        delay: (index * 3) + (i * 8),
        duration: 15 + Math.random() * 5,
        startX: Math.random() * 80 + 10,
      });
    }
  });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {photos.map((photo, index) => (
        <FallingPhoto key={index} {...photo} />
      ))}
    </div>
  );
}

// Credits-style scrolling text
function CreditsScroll({ onScrollEnd }) {
  const containerRef = useRef(null);
  const [scrollComplete, setScrollComplete] = useState(false);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const scrollDuration = 60000; // 60 seconds for full scroll
    const startTime = Date.now();
    const scrollHeight = container.scrollHeight - container.clientHeight;
    
    let animationId;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / scrollDuration, 1);
      
      // Easing function for smooth scroll
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      
      container.scrollTop = scrollHeight * easeProgress;
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setScrollComplete(true);
        onScrollEnd();
      }
    };
    
    // Start animation after a short delay
    const timeout = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 1000);
    
    return () => {
      clearTimeout(timeout);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onScrollEnd]);
  
  return (
    <div 
      ref={containerRef}
      className="w-full max-w-2xl mx-auto h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-hide"
      style={{ scrollBehavior: 'auto' }}
    >
      <div className="py-[30vh]">
        {/* Greeting */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="font-script text-4xl md:text-5xl text-deep-rose text-center mb-12"
        >
          {loveLetterText.greeting}
        </motion.h2>
        
        {/* Paragraphs */}
        <div className="space-y-8 px-4">
          {loveLetterText.paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + index * 0.3, duration: 0.8 }}
              className="font-body text-lg md:text-xl text-dark-rose text-center leading-relaxed"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
        
        {/* Closing and signature */}
        <div className="mt-16 pt-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="font-body text-xl text-dark-rose italic mb-6"
          >
            {loveLetterText.closing}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="font-script text-4xl md:text-5xl text-deep-rose"
          >
            {loveLetterText.signature}
          </motion.p>
        </div>
        
        {/* Extra space at bottom for scroll to complete */}
        <div className="h-[30vh]" />
      </div>
    </div>
  );
}

export default function PumpkinpiePage() {
  const [showMenu, setShowMenu] = useState(false);
  const unlockSection = useStore((state) => state.unlockSection);
  
  const handleScrollEnd = () => {
    setTimeout(() => {
      setShowMenu(true);
    }, 1500);
  };
  
  const handleMenuClick = () => {
    unlockSection('honeybunch');
  };
  
  return (
    <PageTransition className="bg-romantic-gradient">
      <AudioManager track="letter" volume={0.4} />
      
      {/* Falling hearts background */}
      <FallingHearts count={15} />
      
      {/* Falling photos */}
      <FallingPhotos />
      
      {/* Glass overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/30 to-transparent pointer-events-none z-10" />
      
      {/* Main content */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4 py-8">
        {/* Scroll container with letter */}
        <div className="glass rounded-2xl p-6 md:p-8 max-w-3xl w-full mx-auto shadow-xl">
          <CreditsScroll onScrollEnd={handleScrollEnd} />
        </div>
        
        {/* Menu button - fades in after scroll */}
        <div className="mt-8">
          <AnimatePresence>
            {showMenu && (
              <MenuButton 
                onClick={handleMenuClick}
                visible={showMenu}
                delay={0}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
