import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import PageTransition from '../common/PageTransition';
import MenuButton from '../common/MenuButton';
import AudioManager from '../common/AudioManager';
import useStore from '../../store/useStore';

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
      <AudioManager track="birthday" volume={0.5} />
      
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
            Bea Lorraine Abenes
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