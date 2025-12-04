import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../common/PageTransition';
import FallingHeartsBackground from '../common/FallingHeartsBackground';
import useStore from '../../store/useStore';

// ============ GLOBAL AUDIO MANAGER ============

let globalAudio = null;
let currentTrack = null;

function useGlobalMusic(track, volume = 0.3) {
  useEffect(() => {
    if (currentTrack === track && globalAudio && !globalAudio.paused) {
      globalAudio.volume = volume;
      return;
    }
    
    if (globalAudio) {
      globalAudio.pause();
      globalAudio = null;
    }
    
    globalAudio = new Audio(`/audio/${track}.mp3`);
    globalAudio.loop = true;
    globalAudio.volume = volume;
    currentTrack = track;
    
    globalAudio.play().catch(() => {});
  }, [track, volume]);
}

export { useGlobalMusic };

function startGlobalMusic(track, volume = 0.3) {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio = null;
  }
  
  globalAudio = new Audio(`/audio/${track}.mp3`);
  globalAudio.loop = true;
  globalAudio.volume = volume;
  currentTrack = track;
  globalAudio.play().catch(() => {});
}

export { startGlobalMusic };

// ============ HEART SHAPE FOR LOADING ============

function createHeartShape() {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x, y - 1.2);
  shape.bezierCurveTo(x + 0.8, y - 0.8, x + 1.4, y + 0.2, x + 1.2, y + 0.7);
  shape.bezierCurveTo(x + 1.0, y + 1.1, x + 0.4, y + 1.2, x, y + 0.8);
  shape.bezierCurveTo(x - 0.4, y + 1.2, x - 1.0, y + 1.1, x - 1.2, y + 0.7);
  shape.bezierCurveTo(x - 1.4, y + 0.2, x - 0.8, y - 0.8, x, y - 1.2);
  return shape;
}

// ============ 3D SPINNING HEART FOR LOADING ============

function SpinningHeart3D() {
  const meshRef = useRef();
  const heartShape = useMemo(() => createHeartShape(), []);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.y = time * 0.8;
    const pulse = 1 + Math.sin(time * 2.5) * 0.08;
    meshRef.current.scale.setScalar(pulse);
  });
  
  return (
    <mesh ref={meshRef}>
      <extrudeGeometry args={[heartShape, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.15, bevelSegments: 12 }]} />
      <meshStandardMaterial color="#ff0000" emissive="#C76B6B" emissiveIntensity={0.3} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

function LoadingHeartScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, 5]} intensity={0.4} color="#FFB6C1"/>
      <SpinningHeart3D />
    </Canvas>
  );
}

// ============ WELCOME/LOADING SCREEN ============

function WelcomeScreen({ onComplete }) {
  const [loadingText, setLoadingText] = useState('Preparing something special');
  
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setLoadingText(prev => prev.endsWith('...') ? 'Preparing something special' : prev + '.');
    }, 500);
    
    const musicTimer = setTimeout(() => startGlobalMusic('home', 0.3), 3000);
    const transitionTimer = setTimeout(() => onComplete(), 5000);
    
    return () => {
      clearInterval(dotInterval);
      clearTimeout(musicTimer);
      clearTimeout(transitionTimer);
    };
  }, [onComplete]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(180deg, #FFF5F5 0%, #FFE4E8 50%, #FFD1DC 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div style={{ width: '200px', height: '200px' }}>
        <LoadingHeartScene />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#8B5A5A', marginTop: '20px', minWidth: '250px', textAlign: 'center' }}
      >
        {loadingText}
      </motion.p>
    </motion.div>
  );
}

// ============ MENU BUTTON ============

function MenuButton({ label, path, section, index, isUnlocked }) {
  const navigate = useNavigate();
  const [isShaking, setIsShaking] = useState(false);
  
  const handleClick = () => {
    if (isUnlocked) navigate(path);
    else { setIsShaking(true); setTimeout(() => setIsShaking(false), 500); }
  };
  
  return (
    <motion.button
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: isShaking ? [0, -8, 8, -8, 8, 0] : 0 }}
      transition={{ duration: 0.5, delay: 2.2 + index * 0.15, type: 'spring', stiffness: 100, x: isShaking ? { duration: 0.4 } : undefined }}
      whileHover={isUnlocked ? { scale: 1.02, x: 5 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      onClick={handleClick}
      style={{
        width: '100%', padding: '14px 24px', borderRadius: '12px', border: 'none',
        cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'Playfair Display, serif',
        fontSize: '16px', fontWeight: 500, letterSpacing: '0.5px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        background: isUnlocked 
          ? 'linear-gradient(135deg, rgba(232,160,160,0.9) 0%, rgba(199,107,107,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(200,200,200,0.9) 0%, rgba(170,170,170,0.9) 100%)',
        color: isUnlocked ? 'white' : '#999',
        boxShadow: isUnlocked ? '0 4px 15px rgba(199,107,107,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!isUnlocked && (
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ opacity: 0.6 }}>
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        )}
        {label}
      </span>
      {isUnlocked && (
        <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ fontSize: '18px' }}>→</motion.span>
      )}
    </motion.button>
  );
}

// ============ MAIN HOMEPAGE ============

const menuItems = [
  { section: 'monthsary', label: '6th Monthsary', path: '/monthsary' },
  { section: 'pumpkinpie', label: 'To My Pumpkinpie', path: '/pumpkinpie' },
  { section: 'honeybunch', label: 'My Honeybunch', path: '/honeybunch' },
  { section: 'iloveyou', label: 'ILOVEYOU', path: '/iloveyou' },
];

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [entranceStage, setEntranceStage] = useState(0);
  const isSectionUnlocked = useStore((state) => state.isSectionUnlocked);
  
  const handleWelcomeComplete = useCallback(() => setShowWelcome(false), []);
  
  useEffect(() => {
    if (showWelcome) return;
    const timers = [
      setTimeout(() => setEntranceStage(1), 300),
      setTimeout(() => setEntranceStage(2), 1000),
      setTimeout(() => setEntranceStage(3), 1600),
      setTimeout(() => setEntranceStage(4), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showWelcome]);
  
  return (
    <PageTransition className="bg-romantic-gradient">
      <AnimatePresence mode="wait">
        {showWelcome && <WelcomeScreen key="welcome" onComplete={handleWelcomeComplete} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {!showWelcome && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            style={{ width: '100%', height: '100%' }}>
            
            {/* Falling Hearts Background */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
              <FallingHeartsBackground heartCount={25} />
            </motion.div>
            
            {/* Main Content */}
            <div style={{
              position: 'relative', zIndex: 10, width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '20px', pointerEvents: 'none',
            }}>
              <AnimatePresence>
                {entranceStage >= 1 && (
                  <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                    style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
                      style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: '#8B5A5A', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
                      December 15, 2025
                    </motion.p>
                    <motion.h1 initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200 }}
                      style={{ fontFamily: 'Great Vibes, cursive', fontSize: 'clamp(36px, 10vw, 56px)', color: '#C76B6B', lineHeight: 1.2, textShadow: '0 2px 10px rgba(199,107,107,0.2)' }}>
                      Happy 6th Monthsary
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}
                      style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#8B5A5A', fontStyle: 'italic', marginTop: '8px' }}>
                      My Dearest Bea
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {entranceStage >= 2 && (
                  <motion.div initial={{ opacity: 0, y: 100, rotateX: -30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                    style={{
                      width: '100%', maxWidth: '380px', background: 'rgba(255, 252, 250, 0.85)',
                      backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '24px',
                      boxShadow: '0 10px 40px rgba(199, 107, 107, 0.15), 0 0 0 1px rgba(255,255,255,0.5)', pointerEvents: 'auto',
                    }}>
                    <AnimatePresence>
                      {entranceStage >= 3 && (
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
                          style={{
                            width: '50px', height: '50px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #E8A0A0 0%, #C76B6B 100%)',
                            margin: '-45px auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(199,107,107,0.4)',
                          }}>
                          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                            style={{ color: 'white', fontSize: '24px' }}>♥</motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                      {entranceStage >= 4 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {menuItems.map((item, index) => (
                            <MenuButton key={item.section} label={item.label} path={item.path}
                              section={item.section} index={index} isUnlocked={isSectionUnlocked(item.section)} />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {entranceStage >= 4 && (
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.6, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{ marginTop: '30px', fontFamily: 'Cormorant Garamond, serif', fontSize: '13px', color: '#8B5A5A' }}>
                    Made with ♥ for you
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}