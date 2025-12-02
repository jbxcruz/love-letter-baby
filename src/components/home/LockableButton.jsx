import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function LockableButton({ 
  section, 
  label, 
  path, 
  index = 0 
}) {
  const navigate = useNavigate();
  const [isShaking, setIsShaking] = useState(false);
  const isSectionUnlocked = useStore((state) => state.isSectionUnlocked);
  
  const isUnlocked = isSectionUnlocked(section);
  
  const handleClick = () => {
    if (isUnlocked) {
      navigate(path);
    } else {
      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  };
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: isShaking ? [-5, 5, -5, 5, 0] : 0,
      }}
      transition={{ 
        duration: 0.5, 
        delay: 0.3 + index * 0.1,
        x: { duration: 0.4, ease: 'easeInOut' }
      }}
      onClick={handleClick}
      style={{
        width: '100%',
        maxWidth: '280px',
        padding: '14px 24px',
        borderRadius: '50px',
        fontSize: '16px',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        border: 'none',
        cursor: isUnlocked ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s ease',
        background: isUnlocked 
          ? 'linear-gradient(135deg, #E8A0A0 0%, #C76B6B 100%)'
          : 'linear-gradient(135deg, #D3D3D3 0%, #BEBEBE 100%)',
        color: isUnlocked ? 'white' : '#A0A0A0',
        boxShadow: isUnlocked 
          ? '0 4px 15px rgba(199, 107, 107, 0.3)'
          : 'none',
      }}
      whileHover={isUnlocked ? { scale: 1.03, boxShadow: '0 6px 20px rgba(199, 107, 107, 0.4)' } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
    >
      {!isUnlocked && (
        <svg 
          width="16" 
          height="16" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          style={{ opacity: 0.6, flexShrink: 0 }}
        >
          <path 
            fillRule="evenodd" 
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
      <span>{label}</span>
    </motion.button>
  );
}