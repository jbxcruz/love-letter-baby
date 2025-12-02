import { useRef, useState, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import PageTransition from '../common/PageTransition';
import MenuButton from '../common/MenuButton';
import useStore from '../../store/useStore';

// Firework sound manager with multiple random sounds
function useFireworkSound() {
  const [sounds, setSounds] = useState([]);
  
  useEffect(() => {
    // Create multiple audio elements for different pop sounds
    const soundFiles = [
      '/audio/firework-pop1.mp3',
      '/audio/firework-pop2.mp3',
      '/audio/firework-pop3.mp3',
    ];
    
    const audioElements = soundFiles.map(file => {
      const audio = new Audio(file);
      audio.volume = 0.25;
      return audio;
    });
    
    setSounds(audioElements);
    
    return () => {
      audioElements.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);
  
  const playPop = () => {
    if (sounds.length > 0) {
      // Pick a random sound
      const randomIndex = Math.floor(Math.random() * sounds.length);
      const sound = sounds[randomIndex];
      
      // Clone the audio to allow overlapping sounds
      const clone = sound.cloneNode();
      clone.volume = 0.15 + Math.random() * 0.15; // Random volume 0.15-0.3
      clone.playbackRate = 0.85 + Math.random() * 0.3; // Slight pitch variation
      clone.play().catch(() => {}); // Ignore autoplay errors
    }
  };
  
  return playPop;
}

// Birthday music player - plays once only
function BirthdayMusic() {
  const audioRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const hasStartedRef = useRef(false);
  
  // Initialize audio on mount
  useEffect(() => {
    const audio = new Audio('/audio/birthday.mp3');
    audio.volume = 0.5;
    audio.loop = false;
    audio.preload = 'auto';
    
    audio.addEventListener('canplaythrough', () => {
      setIsReady(true);
    });
    
    audio.addEventListener('error', (e) => {
      console.log('Audio error:', e);
    });
    
    audioRef.current = audio;
    
    // Try to load the audio
    audio.load();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Handle playing audio
  useEffect(() => {
    if (!isReady || !audioRef.current || hasStartedRef.current) return;
    
    const tryPlay = () => {
      if (hasStartedRef.current) return;
      
      audioRef.current.play()
        .then(() => {
          hasStartedRef.current = true;
          console.log('Birthday music started playing');
        })
        .catch((error) => {
          console.log('Autoplay blocked, will play on interaction');
        });
    };
    
    // Try to play immediately
    tryPlay();
    
    // Also try on user interaction if autoplay blocked
    const handleInteraction = () => {
      if (!hasStartedRef.current && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            hasStartedRef.current = true;
            console.log('Birthday music started on interaction');
            // Remove listeners once played
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
          })
          .catch(() => {});
      }
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [isReady]);
  
  return null;
}

// Firework trail particle
function FireworkTrail({ position, visible }) {
  const trailRef = useRef();
  const trailCount = 8;
  
  const [positions] = useState(() => new Float32Array(trailCount * 3));
  
  useFrame(() => {
    if (trailRef.current && visible) {
      // Trail follows behind the main firework
      for (let i = trailCount - 1; i > 0; i--) {
        positions[i * 3] = positions[(i - 1) * 3];
        positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
        positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
      }
      positions[0] = position[0];
      positions[1] = position[1];
      positions[2] = position[2];
      
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  if (!visible) return null;
  
  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={trailCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#FF3333"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Heart-shaped firework explosion
function HeartFirework({ startPosition, color, delay, playSound }) {
  const particlesRef = useRef();
  const particleCount = 50;
  const [phase, setPhase] = useState('waiting'); // waiting, rising, exploding, fading
  const [currentPos, setCurrentPos] = useState([...startPosition]);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  
  // Create heart shape directions for explosion
  const heartDirections = useMemo(() => {
    const dirs = [];
    for (let i = 0; i < particleCount; i++) {
      // Parametric heart shape
      const t = (i / particleCount) * Math.PI * 2;
      
      // Heart curve formula
      const heartX = 16 * Math.pow(Math.sin(t), 3);
      const heartY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      // Normalize and add some randomness
      const scale = 0.04;
      const randomness = 0.15;
      dirs.push({
        x: heartX * scale + (Math.random() - 0.5) * randomness,
        y: heartY * scale + (Math.random() - 0.5) * randomness,
        z: (Math.random() - 0.5) * 0.3,
        speed: 0.8 + Math.random() * 0.4,
      });
    }
    return dirs;
  }, []);
  
  const [positions] = useState(() => new Float32Array(particleCount * 3));
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const adjustedTime = time - delay;
    
    if (adjustedTime < 0) {
      setPhase('waiting');
      setHasPlayedSound(false);
      return;
    }
    
    // Cycle time for repeating fireworks (5 second cycle)
    const cycleTime = adjustedTime % 5;
    
    // Reset sound flag at start of new cycle
    if (cycleTime < 0.1) {
      setHasPlayedSound(false);
    }
    
    if (cycleTime < 1.2) {
      // Rising phase
      setPhase('rising');
      const riseProgress = cycleTime / 1.2;
      const easeOut = 1 - Math.pow(1 - riseProgress, 3);
      const y = startPosition[1] + easeOut * 5;
      const wobble = Math.sin(cycleTime * 20) * 0.02;
      
      setCurrentPos([startPosition[0] + wobble, y, startPosition[2]]);
      
      // All particles at same position during rise
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = startPosition[0] + wobble;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = startPosition[2];
      }
    } else if (cycleTime < 3.5) {
      // Heart explosion phase
      if (!hasPlayedSound && playSound) {
        playSound();
        setHasPlayedSound(true);
      }
      setPhase('exploding');
      const explodeProgress = (cycleTime - 1.2) / 2.3;
      const explosionY = startPosition[1] + 5;
      const gravity = explodeProgress * explodeProgress * 0.8;
      const expandScale = Math.min(explodeProgress * 1.5, 1);
      
      for (let i = 0; i < particleCount; i++) {
        const dir = heartDirections[i];
        positions[i * 3] = startPosition[0] + dir.x * dir.speed * expandScale * 2;
        positions[i * 3 + 1] = explosionY + dir.y * dir.speed * expandScale * 2 - gravity;
        positions[i * 3 + 2] = startPosition[2] + dir.z * expandScale;
      }
    } else {
      // Fade out phase
      setPhase('fading');
    }
    
    if (particlesRef.current) {
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  const opacity = phase === 'fading' ? 0.3 : phase === 'exploding' ? 0.9 : 0;
  const size = phase === 'exploding' ? 0.12 : 0.05;
  
  return (
    <group>
      {/* Trail during rising */}
      <FireworkTrail position={currentPos} visible={phase === 'rising'} />
      
      {/* Rising spark */}
      {phase === 'rising' && (
        <mesh position={currentPos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#FF6666" transparent opacity={0.9} />
          <pointLight color="#FF3333" intensity={0.5} distance={2} />
        </mesh>
      )}
      
      {/* Heart explosion particles */}
      {(phase === 'exploding' || phase === 'fading') && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={size}
            color={color}
            transparent
            opacity={opacity}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Glow light during explosion */}
      {phase === 'exploding' && (
        <pointLight 
          position={[startPosition[0], startPosition[1] + 5, startPosition[2]]} 
          color={color} 
          intensity={1} 
          distance={5} 
        />
      )}
    </group>
  );
}

// Fireworks display - multiple heart fireworks
function Fireworks() {
  const playPop = useFireworkSound();
  
  const fireworksConfig = [
    { position: [-3.5, -3, -4], color: '#FF69B4', delay: 0 },      // Hot Pink
    { position: [3.5, -3, -5], color: '#FF1493', delay: 1.2 },     // Deep Pink
    { position: [-1.5, -3, -6], color: '#FFB6C1', delay: 2.4 },    // Light Pink
    { position: [2, -3, -4], color: '#FF6B6B', delay: 0.6 },       // Coral Red
    { position: [0, -3, -7], color: '#FF69B4', delay: 1.8 },       // Hot Pink
    { position: [-2.5, -3, -5], color: '#FF1493', delay: 3 },      // Deep Pink
    { position: [1, -3, -6], color: '#FF85A2', delay: 3.6 },       // Rose Pink
  ];
  
  return (
    <group>
      {fireworksConfig.map((fw, i) => (
        <HeartFirework
          key={i}
          startPosition={fw.position}
          color={fw.color}
          delay={fw.delay}
          playSound={playPop}
        />
      ))}
    </group>
  );
}

// Candle flame component - fixed positioning
function CandleFlame({ position }) {
  const flameRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (flameRef.current) {
      const time = state.clock.elapsedTime;
      // Flicker effect
      flameRef.current.scale.x = 1 + Math.sin(time * 15) * 0.15;
      flameRef.current.scale.y = 1 + Math.sin(time * 12) * 0.2;
      flameRef.current.position.x = Math.sin(time * 10) * 0.01;
    }
  });
  
  return (
    <group position={position}>
      {/* Candle stick */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.3, 12]} />
        <meshStandardMaterial color="#FFF8DC" emissive="#FFF8DC" emissiveIntensity={0.1} />
      </mesh>
      
      {/* Wick */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      
      {/* Flame - positioned at top of wick */}
      <group position={[0, 0.38, 0]}>
        {/* Inner flame (bright) */}
        <mesh ref={flameRef}>
          <coneGeometry args={[0.025, 0.1, 12]} />
          <meshBasicMaterial color="#FFFF80" transparent opacity={0.95} />
        </mesh>
        
        {/* Outer flame (orange) */}
        <mesh scale={[1.3, 1.2, 1.3]}>
          <coneGeometry args={[0.025, 0.1, 12]} />
          <meshBasicMaterial color="#FF6600" transparent opacity={0.7} />
        </mesh>
        
        {/* Flame glow light - at flame position */}
        <pointLight color="#FF9933" intensity={0.5} distance={2} decay={2} />
      </group>
    </group>
  );
}

// Cake tier component - adjusted for proper stacking
function CakeTier({ position, radiusTop, radiusBottom, height, color, frostingColor }) {
  return (
    <group position={position}>
      {/* Main cake body */}
      <mesh>
        <cylinderGeometry args={[radiusTop, radiusBottom, height, 48]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>
      
      {/* Frosting on top */}
      <mesh position={[0, height / 2 + 0.02, 0]}>
        <cylinderGeometry args={[radiusTop + 0.02, radiusTop + 0.02, 0.05, 48]} />
        <meshStandardMaterial color={frostingColor} roughness={0.4} />
      </mesh>
      
      {/* Frosting drips around edge */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * radiusTop;
        const z = Math.sin(angle) * radiusTop;
        const dripHeight = 0.1 + Math.random() * 0.15;
        return (
          <mesh key={i} position={[x, height / 2 - dripHeight / 2, z]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={frostingColor} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}




// Full birthday cake - properly centered and stacked
function BirthdayCake() {
  const groupRef = useRef();
  
  // Purple palette colors
  const purpleDark = '#8e09d6';
  const purpleMedium = '#792da1';
  const purpleLight = '#c46df2';
  const frostingPink = '#E8B4CB';
  const frostingLavender = '#b12dcf';
  
  // Cake dimensions
  const tier1Height = 0.6;
  const tier2Height = 0.5;
  const tier3Height = 0.45;

  const tier1Y = tier1Height / 2;
  const tier2Y = tier1Height + tier2Height / 2;
  const tier3Y = tier1Height + tier2Height + tier3Height / 2;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      
      {/* Cake stand */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[1.5, 1.3, 0.12, 48]} />
        <meshStandardMaterial color="#C9A86C" metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.15, 24]} />
        <meshStandardMaterial color="#C9A86C" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Bottom tier */}
      <CakeTier 
        position={[0, tier1Y, 0]} 
        radiusTop={1.1}
        radiusBottom={1.15}
        height={tier1Height} 
        color={purpleDark}
        frostingColor={frostingPink}
      />

      {/* Middle tier */}
      <CakeTier 
        position={[0, tier2Y, 0]} 
        radiusTop={0.8}
        radiusBottom={0.85}
        height={tier2Height} 
        color={purpleMedium}
        frostingColor={frostingLavender}
      />

      {/* Top tier */}
      <CakeTier 
        position={[0, tier3Y, 0]} 
        radiusTop={0.55}
        radiusBottom={0.6}
        height={tier3Height} 
        color={purpleLight}
        frostingColor={frostingPink}
      />

      {/* Candles */}
      <CandleFlame position={[0, tier3Y + tier3Height / 2, 0]} />
      <CandleFlame position={[-0.2, tier3Y + tier3Height / 2, 0.12]} />
      <CandleFlame position={[0.2, tier3Y + tier3Height / 2, 0.12]} />
      <CandleFlame position={[-0.12, tier3Y + tier3Height / 2, -0.18]} />
      <CandleFlame position={[0.12, tier3Y + tier3Height / 2, -0.18]} />
      <CandleFlame position={[0, tier3Y + tier3Height / 2, 0.25]} />


    </group>
  );
}


// Sparkle particles
function Sparkles() {
  const particlesRef = useRef();
  const count = 60;
  
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.random() * 3 - 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  });
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FFD700"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function CakeScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.7} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#E8B4CB" />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#FFD700" />
      
      <Suspense fallback={null}>
        <BirthdayCake />
        <Sparkles />
        <Fireworks />
      </Suspense>
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.3}
        autoRotate
        autoRotateSpeed={0.8}
        target={[0, 0.8, 0]}
      />
    </>
  );
}

export default function HoneybunchPage() {
  const unlockSection = useStore((state) => state.unlockSection);
  
  const handleMenuClick = () => {
    unlockSection('iloveyou');
  };
  
  return (
    <PageTransition className="bg-romantic-gradient">
      {/* Birthday music - plays once */}
      <BirthdayMusic />
      
      {/* Full screen 3D Canvas - behind everything */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <Canvas
          camera={{ position: [0, 2, 7], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <CakeScene />
        </Canvas>
      </div>
      
      {/* UI Overlay - on top of 3D */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
        }}
      >
        {/* Title - top */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <h1 
            style={{
              fontFamily: 'Great Vibes, cursive',
              fontSize: 'clamp(32px, 8vw, 56px)',
              color: '#6B4C9A',
              marginBottom: '4px',
              textShadow: '0 2px 10px rgba(255,255,255,0.5)',
            }}
          >
            Happy 20th Birthday
          </h1>
          <p 
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(18px, 4vw, 28px)',
              color: '#8B5A5A',
              textShadow: '0 2px 10px rgba(255,255,255,0.5)',
            }}
          >
            To My Honeybunch Sugarplum!
          </p>
        </motion.div>
        
        {/* Spacer */}
        <div style={{ flex: 1 }} />
        
        {/* Bottom section */}
        <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
          {/* Instructions */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              color: 'rgba(139, 90, 90, 0.7)',
              fontSize: '14px',
              marginBottom: '12px',
            }}
          >
            Drag to rotate | Scroll to zoom
          </motion.p>
          
          {/* Menu button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MenuButton onClick={handleMenuClick} />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}