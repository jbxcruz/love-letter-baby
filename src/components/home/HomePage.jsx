import { motion } from 'framer-motion';
import PageTransition from '../common/PageTransition';
import FloatingParticles from '../common/FloatingParticles';
import FallingHearts from '../common/FallingHearts';
import DateText3D from './DateText3D';
import LockableButton from './LockableButton';
import AudioManager from '../common/AudioManager';

const menuItems = [
  { section: 'monthsary', label: '6th Monthsary', path: '/monthsary' },
  { section: 'pumpkinpie', label: 'To My Pumpkinpie', path: '/pumpkinpie' },
  { section: 'honeybunch', label: 'My Honeybunch', path: '/honeybunch' },
  { section: 'iloveyou', label: 'ILOVEYOU', path: '/iloveyou' },
];

export default function HomePage() {
  return (
    <PageTransition className="bg-romantic-gradient">
      <AudioManager track="home" volume={0.3} />
      
      {/* Falling hearts background */}
      <FallingHearts count={25} />
      
      {/* Floating particles background */}
      <FloatingParticles count={30} />
      
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
          padding: '24px 16px',
          overflow: 'hidden',
        }}
      >
        <div 
          style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          
          {/* 3D Date Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', marginBottom: '8px' }}
          >
            <DateText3D />
          </motion.div>
          
          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            <h1 
              style={{
                fontFamily: 'Great Vibes, cursive',
                fontSize: 'clamp(32px, 8vw, 48px)',
                color: '#C76B6B',
                marginBottom: '4px',
              }}
            >
              Happy 6th Monthsary
            </h1>
            <p 
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '18px',
                color: '#8B5A5A',
                opacity: 0.8,
                fontStyle: 'italic',
              }}
            >
              ~ my love ~
            </p>
          </motion.div>
          
          {/* Menu Buttons */}
          <div 
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {menuItems.map((item, index) => (
              <LockableButton
                key={item.section}
                section={item.section}
                label={item.label}
                path={item.path}
                index={index}
              />
            ))}
          </div>
          
          {/* Footer decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{ marginTop: '32px', textAlign: 'center' }}
          >
            <p 
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '12px',
                color: '#8B5A5A',
                opacity: 0.5,
              }}
            >
              Made with love for Bea Lorraine
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}