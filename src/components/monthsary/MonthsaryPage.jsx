import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../common/PageTransition';
import FallingHearts from '../common/FallingHearts';
import MenuButton from '../common/MenuButton';
import AudioManager from '../common/AudioManager';
import useStore from '../../store/useStore';
import slideshowData from '../../data/slideshowData';

// Placeholder image component
function PlaceholderImage({ index }) {
  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #F5D0D0 0%, #E8A0A0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8B5A5A',
      }}
    >
      <svg 
        width="80" 
        height="80" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        style={{ opacity: 0.5, marginBottom: '16px' }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', opacity: 0.7 }}>
        Photo {index + 1}
      </p>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', opacity: 0.5, marginTop: '8px' }}>
        Add image to /images/slideshow/{index + 1}.jpg
      </p>
    </div>
  );
}

function Slideshow({ onLastSlide }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  
  const isLastSlide = currentIndex === slideshowData.length - 1;
  
  useEffect(() => {
    if (isLastSlide) {
      onLastSlide();
    }
  }, [isLastSlide, onLastSlide]);
  
  const goToNext = () => {
    if (currentIndex < slideshowData.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };
  
  // Handle touch/swipe for mobile
  const [touchStart, setTouchStart] = useState(null);
  
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    
    setTouchStart(null);
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };
  
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };
  
  const currentSlide = slideshowData[currentIndex];
  
  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      {/* Slideshow container */}
      <div 
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          backgroundColor: 'rgba(255, 248, 240, 0.5)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(139, 90, 90, 0.2)',
          marginBottom: '20px',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {imageErrors[currentIndex] ? (
              <PlaceholderImage index={currentIndex} />
            ) : (
              <img
                src={currentSlide.image}
                alt={`Slide ${currentIndex + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => handleImageError(currentIndex)}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation arrows */}
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 248, 240, 0.9)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C76B6B" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={goToNext}
          disabled={currentIndex === slideshowData.length - 1}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 248, 240, 0.9)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            cursor: currentIndex === slideshowData.length - 1 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === slideshowData.length - 1 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C76B6B" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        {slideshowData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: index === currentIndex ? '24px' : '10px',
              height: '10px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: index === currentIndex ? '#C76B6B' : 'rgba(232, 160, 160, 0.5)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
      
      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: 'rgba(255, 248, 240, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '16px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ 
            fontFamily: 'Cormorant Garamond, serif', 
            fontSize: '18px', 
            color: '#8B5A5A',
            fontStyle: 'italic',
            margin: 0,
          }}>
            "{currentSlide.caption}"
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function MonthsaryPage() {
  const [showMenu, setShowMenu] = useState(false);
  const unlockSection = useStore((state) => state.unlockSection);
  
  const handleLastSlide = () => {
    setShowMenu(true);
  };
  
  const handleMenuClick = () => {
    unlockSection('pumpkinpie');
  };
  
  return (
    <PageTransition className="bg-romantic-gradient">
      <AudioManager track="monthsary" volume={0.4} />
      
      {/* Falling hearts background */}
      <FallingHearts count={20} />
      
      {/* Main content */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 16px',
          overflow: 'hidden',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'Great Vibes, cursive',
            fontSize: 'clamp(28px, 7vw, 42px)',
            color: '#C76B6B',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Our Journey Together
        </motion.h1>
        
        <Slideshow onLastSlide={handleLastSlide} />
        
        {/* Menu button - only appears at last slide */}
        <div style={{ marginTop: '20px', minHeight: '50px' }}>
          <AnimatePresence>
            {showMenu && (
              <MenuButton 
                onClick={handleMenuClick}
                visible={showMenu}
                delay={0.3}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}