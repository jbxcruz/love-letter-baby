import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a rose petal shape
function createPetalShape() {
  const shape = new THREE.Shape();
  
  // Petal shape - like an elongated teardrop
  shape.moveTo(0, -0.5);
  shape.bezierCurveTo(0.3, -0.3, 0.4, 0.2, 0.2, 0.5);
  shape.bezierCurveTo(0.1, 0.6, -0.1, 0.6, -0.2, 0.5);
  shape.bezierCurveTo(-0.4, 0.2, -0.3, -0.3, 0, -0.5);
  
  return shape;
}

// Individual falling petal
function FallingPetal({ startX, startDelay, scale, speed, swaySpeed, swayAmount, rotationSpeed, color }) {
  const meshRef = useRef();
  const petalShape = useMemo(() => createPetalShape(), []);
  const spawnTime = useRef(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Wait for delay before spawning
    if (time < startDelay) {
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
    const y = 8 - (timeSinceSpawn * speed);
    
    // Reset when petal goes below screen
    if (y < -8) {
      spawnTime.current = time;
      return;
    }
    
    // Sway left and right while falling (more gentle than hearts)
    const x = startX + Math.sin(time * swaySpeed) * swayAmount;
    
    // Gentle z movement for depth
    const z = Math.sin(time * swaySpeed * 0.5) * 0.5 - 2;
    
    meshRef.current.position.set(x, y, z);
    
    // Tumbling rotation - petals spin and flutter
    meshRef.current.rotation.x = time * rotationSpeed * 0.7;
    meshRef.current.rotation.y = time * rotationSpeed * 0.5;
    meshRef.current.rotation.z = Math.sin(time * swaySpeed) * 0.5;
    
    // Subtle scale pulse
    const pulse = 1 + Math.sin(time * 3) * 0.05;
    meshRef.current.scale.setScalar(scale * pulse);
  });
  
  return (
    <mesh ref={meshRef} position={[startX, 8, -2]} scale={scale}>
      <extrudeGeometry 
        args={[
          petalShape, 
          { 
            depth: 0.02, 
            bevelEnabled: true, 
            bevelThickness: 0.01, 
            bevelSize: 0.01, 
            bevelSegments: 2,
            curveSegments: 12,
          }
        ]} 
      />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.1}
        transparent 
        opacity={0.85}
        metalness={0.1}
        roughness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Scene with all petals
function PetalsScene({ petalCount = 30 }) {
  // Rose petal colors - various shades of pink and red
  const colors = [
    '#E8A0A0', // Light pink
    '#D88888', // Medium pink
    '#C76B6B', // Rose
    '#E07070', // Coral pink
    '#F5B0B0', // Pale pink
    '#CC6666', // Dusty rose
    '#D4726E', // Salmon pink
  ];
  
  const petals = useMemo(() => {
    const items = [];
    for (let i = 0; i < petalCount; i++) {
      items.push({
        id: i,
        startX: (Math.random() - 0.5) * 14,
        startDelay: i * 0.3, // Staggered spawn
        scale: 0.15 + Math.random() * 0.15, // Varied sizes
        speed: 0.8 + Math.random() * 0.6, // Slower than hearts
        swaySpeed: 0.8 + Math.random() * 0.6,
        swayAmount: 0.5 + Math.random() * 0.8,
        rotationSpeed: 0.5 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return items;
  }, [petalCount]);
  
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <pointLight position={[0, 0, 5]} intensity={0.2} color="#FFB6C1" />
      {petals.map((petal) => (
        <FallingPetal key={petal.id} {...petal} />
      ))}
    </>
  );
}

// Main component
export default function FallingRosePetals({ petalCount = 30 }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      pointerEvents: 'none', // Petals are purely decorative, no interaction
    }}>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }} 
        style={{ background: 'transparent' }}
      >
        <PetalsScene petalCount={petalCount} />
      </Canvas>
    </div>
  );
}