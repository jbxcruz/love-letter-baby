import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function MenuButton({ 
  onClick, 
  visible = true, 
  label = 'Menu',
  className = '',
  delay = 0 
}) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate('/');
  };
  
  if (!visible) return null;
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.4, 0, 0.2, 1] 
      }}
      onClick={handleClick}
      className={`btn-romantic text-lg px-8 py-3 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="font-display">{label}</span>
    </motion.button>
  );
}
