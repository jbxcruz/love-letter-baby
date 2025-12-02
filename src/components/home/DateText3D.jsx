import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function DateTextMesh() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });
  
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.15}
      floatIntensity={0.4}
    >
      <group ref={groupRef}>
        {/* Main text */}
        <Text
          font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXDTjYgEM86xQ.woff"
          fontSize={1.2}
          color="#C76B6B"
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0]}
        >
          12/15/25
          <meshStandardMaterial
            color="#E8A0A0"
            metalness={0.8}
            roughness={0.2}
            emissive="#C76B6B"
            emissiveIntensity={0.15}
          />
        </Text>
        
        {/* Shadow/depth layer */}
        <Text
          font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXDTjYgEM86xQ.woff"
          fontSize={1.2}
          color="#8B5A5A"
          anchorX="center"
          anchorY="middle"
          position={[0.03, -0.03, -0.1]}
        >
          12/15/25
          <meshBasicMaterial color="#8B5A5A" transparent opacity={0.3} />
        </Text>
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#FFB6C1" />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#E8A0A0" />
      <Suspense fallback={null}>
        <DateTextMesh />
      </Suspense>
    </>
  );
}

export default function DateText3D({ className = '' }) {
  return (
    <div className={`w-full h-48 md:h-64 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
