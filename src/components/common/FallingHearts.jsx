import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a plump, full 3D heart shape like the reference image
function createHeartShape() {
  const shape = new THREE.Shape();
  
  // Plump heart shape - wider and fuller
  const x = 0, y = 0;
  shape.moveTo(x, y - 1.2); // Bottom point
  
  // Right side curve (plump)
  shape.bezierCurveTo(
    x + 0.8, y - 0.8,   // control point 1
    x + 1.4, y + 0.2,   // control point 2
    x + 1.2, y + 0.7    // end point (right bump)
  );
  shape.bezierCurveTo(
    x + 1.0, y + 1.1,   // control point 1
    x + 0.4, y + 1.2,   // control point 2
    x, y + 0.8          // top center dip
  );
  
  // Left side curve (plump)
  shape.bezierCurveTo(
    x - 0.4, y + 1.2,   // control point 1
    x - 1.0, y + 1.1,   // control point 2
    x - 1.2, y + 0.7    // end point (left bump)
  );
  shape.bezierCurveTo(
    x - 1.4, y + 0.2,   // control point 1
    x - 0.8, y - 0.8,   // control point 2
    x, y - 1.2          // back to bottom point
  );
  
  return shape;
}

// Individual heart mesh with heartbeat
function Heart({ position, scale, speed, delay, color, startY }) {
  const meshRef = useRef();
  const initialX = position[0];
  const initialZ = position[2];
  const baseScale = scale;
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime + delay;
      
      // Falling motion
      const fallDistance = (time * speed) % 22;
      const currentY = startY - fallDistance;
      meshRef.current.position.y = currentY;
      
      // Fade out at bottom of screen
      const fadeStart = -6;
      const fadeEnd = -8;
      if (currentY < fadeStart) {
        const fadeProgress = (fadeStart - currentY) / (fadeStart - fadeEnd);
        meshRef.current.material.opacity = Math.max(0, 1 - fadeProgress);
      } else {
        meshRef.current.material.opacity = 1;
      }
      
      // Gentle horizontal swaying
      meshRef.current.position.x = initialX + Math.sin(time * 0.5 + delay) * 0.6;
      meshRef.current.position.z = initialZ + Math.cos(time * 0.3 + delay) * 0.2;
      
      // Heartbeat effect - pulse scale
      const heartbeat = Math.sin(time * 6) * 0.5 + 0.5; // 0 to 1
      const pulse = 1 + heartbeat * 0.15; // Scale between 1.0 and 1.15
      meshRef.current.scale.setScalar(baseScale * pulse);
      
      // Gentle rotation
      meshRef.current.rotation.z = Math.sin(time * 0.4) * 0.15;
      meshRef.current.rotation.y = Math.sin(time * 0.25) * 0.1;
    }
  });
  
  const heartShape = useMemo(() => createHeartShape(), []);
  
  // Thick extrusion for plump 3D look
  const extrudeSettings = {
    steps: 2,
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.25,
    bevelSize: 0.2,
    bevelOffset: 0,
    bevelSegments: 12,
  };
  
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial
        color={color}
        metalness={0.1}
        roughness={0.5}
        emissive={color}
        emissiveIntensity={0.2}
        transparent={true}
        opacity={1}
      />
    </mesh>
  );
}

// Hearts scene
function HeartsScene({ count = 25, colors }) {
  const hearts = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const startY = 12 + Math.random() * 18;
      items.push({
        position: [
          (Math.random() - 0.5) * 20,
          startY - Math.random() * 28,
          (Math.random() - 0.5) * 5,
        ],
        scale: 0.15 + Math.random() * 0.18,
        speed: 0.4 + Math.random() * 0.5,
        delay: Math.random() * 25,
        color: colors[Math.floor(Math.random() * colors.length)],
        startY: startY,
      });
    }
    return items;
  }, [count, colors]);
  
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#FF6B6B" />
      <pointLight position={[0, 0, 8]} intensity={0.3} color="#FF4444" />
      
      {hearts.map((heart, i) => (
        <Heart key={i} {...heart} />
      ))}
    </>
  );
}

// Main component
export default function FallingHearts({ count = 25, className = '' }) {
  // Red colors like the reference image
  const colors = useMemo(() => ['#E31B23', '#D41920', '#C41E22', '#B91C1C', '#DC2626'], []);
  
  return (
    <div 
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <HeartsScene count={count} colors={colors} />
      </Canvas>
    </div>
  );
}