import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../common/PageTransition';
import FallingRosePetals from '../common/FallingRosePetals';
import MenuButton from '../common/MenuButton';
import { useGlobalMusic } from '../home/HomePage';
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
  const isFirstSlide = currentIndex === 0;
  
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
      if (diff > 0) goToNext();
      else goToPrev();
    }
    
    setTouchStart(null);
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };
  
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -500 : 500,
      opacity: 0,
      scale: 0.9,
    }),
  };
  
  const currentSlide = slideshowData[currentIndex];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ 
        width: '100%', 
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Main slideshow frame */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(139, 90, 90, 0.25), 0 8px 25px rgba(0, 0, 0, 0.1)',
          border: '4px solid rgba(255, 255, 255, 0.8)',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image container */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ 
              position: 'absolute', 
              inset: 0,
            }}
          >
            {imageErrors[currentIndex] ? (
              <PlaceholderImage index={currentIndex} />
            ) : (
              <img
                src={currentSlide.image}
                alt={`Slide ${currentIndex + 1}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                }}
                onError={() => handleImageError(currentIndex)}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Left click zone - Previous */}
        <div
          onClick={goToPrev}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '40%',
            height: '100%',
            cursor: isFirstSlide ? 'default' : 'pointer',
            zIndex: 10,
          }}
        >
          {/* Left indicator - shows on hover */}
          {!isFirstSlide && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C76B6B" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </motion.div>
          )}
        </div>
        
        {/* Right click zone - Next */}
        <div
          onClick={goToNext}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '40%',
            height: '100%',
            cursor: isLastSlide ? 'default' : 'pointer',
            zIndex: 10,
          }}
        >
          {/* Right indicator - shows on hover */}
          {!isLastSlide && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C76B6B" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          )}
        </div>
        
        {/* Gradient overlay at bottom for caption */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
          pointerEvents: 'none',
        }} />
        
        {/* Caption overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '24px',
              right: '24px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <p style={{ 
              fontFamily: 'Cormorant Garamond, serif', 
              fontSize: 'clamp(16px, 4vw, 22px)', 
              color: 'white',
              fontStyle: 'italic',
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              lineHeight: 1.4,
            }}>
              "{currentSlide.caption}"
            </p>
          </motion.div>
        </AnimatePresence>
        
        {/* Slide counter */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '8px 14px',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '14px',
            fontWeight: 600,
            color: '#C76B6B',
          }}>
            {currentIndex + 1} / {slideshowData.length}
          </span>
        </div>
      </div>
      
      {/* Dot indicators below frame */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        marginTop: '24px',
      }}>
        {slideshowData.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: index === currentIndex ? '32px' : '12px',
              height: '12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: index === currentIndex ? '#C76B6B' : 'rgba(199, 107, 107, 0.4)',
              transition: 'all 0.3s ease',
              boxShadow: index === currentIndex ? '0 2px 8px rgba(199, 107, 107, 0.4)' : 'none',
            }}
          />
        ))}
      </div>
    </motion.div>
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
  
  // Use same music as home page (continues playing)
  useGlobalMusic('home', 0.3);
  
  return (
    <PageTransition className="bg-romantic-gradient">
      
      {/* Falling rose petals background */}
      <FallingRosePetals petalCount={30} />
      
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
          padding: '24px',
        }}
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'Great Vibes, cursive',
            fontSize: 'clamp(32px, 8vw, 52px)',
            color: '#C76B6B',
            marginBottom: '24px',
            textAlign: 'center',
            textShadow: '0 2px 15px rgba(199, 107, 107, 0.3)',
          }}
        >
          Our Journey Together
        </motion.h1>
        
        {/* Slideshow */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Slideshow onLastSlide={handleLastSlide} />
        </div>
        
        {/* Menu button - only appears at last slide */}
        <div style={{ marginTop: '24px', minHeight: '50px' }}>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
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
    </PageTransition>
  );
}