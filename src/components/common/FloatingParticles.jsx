import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 50 }) {
  const meshRef = useRef();
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random() * 0.5 + 0.1;
      speeds[i] = Math.random() * 0.5 + 0.2;
    }
    
    return { positions, scales, speeds };
  }, [count]);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Gentle floating motion
        positions[i3 + 1] += Math.sin(time * particles.speeds[i] + i) * 0.003;
        positions[i3] += Math.cos(time * particles.speeds[i] * 0.5 + i) * 0.002;
        
        // Wrap around
        if (positions[i3 + 1] > 10) positions[i3 + 1] = -10;
        if (positions[i3 + 1] < -10) positions[i3 + 1] = 10;
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#E8A0A0"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function ParticlesScene({ count }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Particles count={count} />
    </>
  );
}

export default function FloatingParticles({ count = 50, className = '' }) {
  return (
    <div className={`canvas-container ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ParticlesScene count={count} />
      </Canvas>
    </div>
  );
}
