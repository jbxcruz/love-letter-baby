import { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============ HEART SHAPE HELPER ============

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

// ============ POP PARTICLE ============

function PopParticle({ position, velocity, color, onComplete }) {
  const meshRef = useRef();
  const startTime = useRef(Date.now());
  const heartShape = useMemo(() => createHeartShape(), []);
  
  useFrame(() => {
    if (!meshRef.current) return;
    const elapsed = Date.now() - startTime.current;
    const progress = elapsed / 600;
    if (progress >= 1) { onComplete(); return; }
    meshRef.current.position.x += velocity[0] * 0.04;
    meshRef.current.position.y += velocity[1] * 0.04 - progress * 0.03;
    meshRef.current.position.z += velocity[2] * 0.02;
    meshRef.current.scale.setScalar(0.06 * (1 - progress));
    meshRef.current.material.opacity = 1 - progress;
    meshRef.current.rotation.z += 0.15;
  });
  
  return (
    <mesh ref={meshRef} position={position} scale={0.06}>
      <extrudeGeometry args={[heartShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 3 }]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={1} />
    </mesh>
  );
}

// ============ FALLING HEART ============

function FallingHeart({ id, startX, scale, speed, delay, swaySpeed, swayAmount, color, onPop }) {
  const meshRef = useRef();
  const heartShape = useMemo(() => createHeartShape(), []);
  const [isPopped, setIsPopped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const spawnTime = useRef(null);
  
  useFrame((state) => {
    if (!meshRef.current || isPopped) return;
    const time = state.clock.elapsedTime;
    
    // Wait for delay before spawning
    if (time < delay) {
      meshRef.current.visible = false;
      return;
    }
    
    // Set spawn time on first frame after delay
    if (spawnTime.current === null) {
      spawnTime.current = time;
    }
    
    meshRef.current.visible = true;
    
    // Calculate fall progress since spawn
    const timeSinceSpawn = time - spawnTime.current;
    const y = 10 - (timeSinceSpawn * speed);
    
    // Reset when heart goes below screen
    if (y < -10) {
      spawnTime.current = time;
      return;
    }
    
    // Sway left and right while falling
    const x = startX + Math.sin(time * swaySpeed) * swayAmount;
    
    meshRef.current.position.set(x, y, -2);
    
    // Gentle rotation while falling
    meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.3;
    meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.2;
    
    // Scale with hover and subtle pulse
    const hoverScale = isHovered ? 1.4 : 1;
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    meshRef.current.scale.setScalar(scale * pulse * hoverScale);
  });
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (!isPopped && meshRef.current && meshRef.current.visible) {
      setIsPopped(true);
      onPop(id, meshRef.current.position.toArray(), color);
      // Reset spawn time so it respawns from top
      setTimeout(() => {
        setIsPopped(false);
        spawnTime.current = null;
      }, 500);
    }
  };
  
  if (isPopped) return null;
  
  return (
    <mesh ref={meshRef} position={[startX, 10, -2]} scale={scale} onClick={handleClick}
      onPointerOver={() => setIsHovered(true)} onPointerOut={() => setIsHovered(false)}>
      <extrudeGeometry args={[heartShape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.12, bevelSegments: 8 }]} />
      <meshStandardMaterial color={isHovered ? '#FF6B8A' : color} emissive={isHovered ? '#FF6B8A' : color}
        emissiveIntensity={isHovered ? 0.4 : 0.15} transparent opacity={isHovered ? 0.9 : 0.7} metalness={0.1} roughness={0.6} />
    </mesh>
  );
}

// ============ HEARTS SCENE ============

function HeartsScene({ onPop, particles, removeParticle, heartCount = 30 }) {
  const colors = ['#C47BE4', '#BF092F', '#DC0000',];
  const hearts = useMemo(() => {
    const items = [];
    for (let i = 0; i < heartCount; i++) {
      items.push({
        id: i,
        startX: (Math.random() - 0.5) * 16,
        scale: 0.10 + Math.random() * 0.20,
        speed: 0.5 + Math.random() * 0.5,
        swaySpeed: 0.5 + Math.random() * 0.5,
        swayAmount: 0.3 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return items;
  }, [heartCount]);
  
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#FFB6C1" />
      {hearts.map((h) => <FallingHeart key={h.id} {...h} onPop={onPop} />)}
      {particles.map((p) => <PopParticle key={p.id} {...p} onComplete={() => removeParticle(p.id)} />)}
    </>
  );
}

// ============ MAIN COMPONENT ============

const POP_VARIANTS = ['pop1', 'pop2'];

function playRandomPop(volume = 0.3) {
  const name = POP_VARIANTS[Math.floor(Math.random() * POP_VARIANTS.length)];
  const audio = new Audio(`/audio/${name}.mp3`);
  audio.volume = volume * (0.9 + Math.random() * 0.2); // slight volume variation
  audio.playbackRate = 0.9 + Math.random() * 0.3; // slight pitch variation
  audio.play().catch(() => {});
}

export default function FallingHeartsBackground({ heartCount = 25 }) {
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);
  
  const handlePop = useCallback((id, position, color) => {
    // Play randomized pop sound
    playRandomPop(0.3);
    
    // Create particles
    const newParticles = [];
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.4 + Math.random() * 0.4;
      newParticles.push({
        id: particleIdRef.current++,
        position: [...position],
        velocity: [Math.cos(angle) * speed, Math.sin(angle) * speed + 0.2, (Math.random() - 0.5) * 0.3],
        color,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);
  
  const removeParticle = useCallback((id) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);
  
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1,
      pointerEvents: 'auto',
    }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ background: 'transparent' }}>
        <HeartsScene onPop={handlePop} particles={particles} removeParticle={removeParticle} heartCount={heartCount} />
      </Canvas>
    </div>
  );
}