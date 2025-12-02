import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import PageTransition from '../common/PageTransition';
import MenuButton from '../common/MenuButton';
import AudioManager from '../common/AudioManager';
import useStore from '../../store/useStore';
import gameConfig from '../../data/gameConfig';

// 3D Tulip component
function Tulip({ position }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle swaying
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      
      {/* Tulip petals */}
      <group position={[0, 0.35, 0]}>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh 
              key={i} 
              position={[Math.cos(angle) * 0.05, 0, Math.sin(angle) * 0.05]}
              rotation={[0.3, angle, 0]}
            >
              <sphereGeometry args={[0.08, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#9B59B6" />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// 3D Flower (decorative)
function Flower({ position, color }) {
  return (
    <group position={position}>
      {/* Center */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Petals */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh 
            key={i} 
            position={[Math.cos(angle) * 0.08, 0.1, Math.sin(angle) * 0.08]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

// Character component
function Character({ position, isMoving }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Bouncy animation when moving
      if (isMoving) {
        groupRef.current.position.y = position.y + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1;
      } else {
        groupRef.current.position.y = position.y;
      }
    }
  });
  
  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#F5D0D0" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* Simple face features */}
      <mesh position={[-0.07, 0.58, 0.17]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#4A4A4A" />
      </mesh>
      <mesh position={[0.07, 0.58, 0.17]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#4A4A4A" />
      </mesh>
      
      {/* Smile */}
      <mesh position={[0, 0.5, 0.18]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#C76B6B" />
      </mesh>
      
      {/* Little feet */}
      <mesh position={[-0.1, -0.05, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#E8A0A0" />
      </mesh>
      <mesh position={[0.1, -0.05, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#E8A0A0" />
      </mesh>
    </group>
  );
}

// Trail particle
function TrailParticle({ position, opacity }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#D5A6E6" transparent opacity={opacity} />
    </mesh>
  );
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#7CB889" />
    </mesh>
  );
}

// Sun
function Sun() {
  return (
    <group position={[8, 6, -5]}>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#FFB366" />
      </mesh>
      <pointLight color="#FFB366" intensity={1} distance={50} />
    </group>
  );
}

// Main game scene
function GameScene({ characterPos, setCharacterPos, tulips, setTulips, trail, setTrail, isMovingRef }) {
  const { camera, gl } = useThree();
  const targetPos = useRef(null);
  
  // Decorative flowers
  const flowers = useRef([]);
  if (flowers.current.length === 0) {
    for (let i = 0; i < 30; i++) {
      flowers.current.push({
        position: [
          (Math.random() - 0.5) * 15,
          0,
          (Math.random() - 0.5) * 15,
        ],
        color: gameConfig.environment.flowerColors[
          Math.floor(Math.random() * gameConfig.environment.flowerColors.length)
        ],
      });
    }
  }
  
  // Handle click to move
  const handleClick = useCallback((event) => {
    // Get click position in normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    
    // Create a ground plane for intersection
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    
    raycaster.ray.intersectPlane(groundPlane, intersectPoint);
    
    if (intersectPoint) {
      // Clamp to bounds
      const clampedX = Math.max(-7, Math.min(7, intersectPoint.x));
      const clampedZ = Math.max(-7, Math.min(7, intersectPoint.z));
      
      targetPos.current = { x: clampedX, z: clampedZ };
      isMovingRef.current = true;
    }
  }, [camera, gl, isMovingRef]);
  
  useEffect(() => {
    const handleTouchEnd = (e) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        handleClick({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };
    
    gl.domElement.addEventListener('click', handleClick);
    gl.domElement.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      gl.domElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gl, handleClick]);
  
  useFrame((state, delta) => {
    if (targetPos.current && isMovingRef.current) {
      const dx = targetPos.current.x - characterPos.x;
      const dz = targetPos.current.z - characterPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 0.1) {
        const speed = 3;
        const moveX = (dx / distance) * speed * delta;
        const moveZ = (dz / distance) * speed * delta;
        
        const newPos = {
          x: characterPos.x + moveX,
          y: 0,
          z: characterPos.z + moveZ,
        };
        
        setCharacterPos(newPos);
        
        // Add trail
        if (Math.random() < 0.3) {
          setTrail(prev => [...prev.slice(-20), { 
            position: [newPos.x, 0.05, newPos.z],
            time: state.clock.elapsedTime,
          }]);
          
          // Maybe spawn tulip
          if (Math.random() < gameConfig.trail.tulipSpawnRate) {
            setTulips(prev => {
              const newTulips = [...prev, {
                position: [
                  newPos.x + (Math.random() - 0.5) * 0.3,
                  0,
                  newPos.z + (Math.random() - 0.5) * 0.3,
                ],
              }];
              // Limit tulips
              if (newTulips.length > gameConfig.tulip.maxTulips) {
                return newTulips.slice(-gameConfig.tulip.maxTulips);
              }
              return newTulips;
            });
          }
        }
      } else {
        isMovingRef.current = false;
        targetPos.current = null;
      }
    }
    
    // Fade old trail particles
    setTrail(prev => prev.filter(t => state.clock.elapsedTime - t.time < 2));
  });
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      
      {/* Sun */}
      <Sun />
      
      {/* Ground */}
      <Ground />
      
      {/* Decorative flowers */}
      {flowers.current.map((flower, i) => (
        <Flower key={`flower-${i}`} position={flower.position} color={flower.color} />
      ))}
      
      {/* Trail */}
      {trail.map((t, i) => (
        <TrailParticle 
          key={`trail-${i}`} 
          position={t.position}
          opacity={0.5}
        />
      ))}
      
      {/* Tulips */}
      {tulips.map((tulip, i) => (
        <Tulip key={`tulip-${i}`} position={tulip.position} />
      ))}
      
      {/* Character */}
      <Character 
        position={characterPos} 
        isMoving={isMovingRef.current}
      />
    </>
  );
}

export default function ILoveYouPage() {
  const unlockAll = useStore((state) => state.unlockAll);
  
  const [characterPos, setCharacterPos] = useState({ x: 0, y: 0, z: 0 });
  const [tulips, setTulips] = useState([]);
  const [trail, setTrail] = useState([]);
  const isMovingRef = useRef(false);
  
  const handleMenuClick = () => {
    unlockAll();
  };
  
  return (
    <PageTransition>
      <AudioManager track="game" volume={0.4} />
      
      {/* Sky gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, 
            ${gameConfig.environment.skyGradient.top} 0%, 
            ${gameConfig.environment.skyGradient.middle} 50%, 
            ${gameConfig.environment.skyGradient.bottom} 100%
          )`,
        }}
      />
      
      {/* 3D Game Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 8, 10], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          shadows
        >
          <Suspense fallback={null}>
            <GameScene 
              characterPos={characterPos}
              setCharacterPos={setCharacterPos}
              tulips={tulips}
              setTulips={setTulips}
              trail={trail}
              setTrail={setTrail}
              isMovingRef={isMovingRef}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-4 left-0 right-0 text-center"
        >
          <h1 className="font-script text-3xl md:text-4xl text-white drop-shadow-lg">
            I Love You, Bea
          </h1>
        </motion.div>
        
        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-16 left-0 right-0 text-center text-white/80 text-sm"
        >
          Tap anywhere to walk and plant tulips
        </motion.p>
        
        {/* Menu button */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto">
          <MenuButton 
            onClick={handleMenuClick}
            label="Back Menu"
          />
        </div>
      </div>
    </PageTransition>
  );
}
