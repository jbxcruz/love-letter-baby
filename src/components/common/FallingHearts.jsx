import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

// Pop particle - small heart that flies out when main heart is clicked
function PopParticle({ position, velocity, color, onComplete }) {
  const meshRef = useRef();
  const startTime = useRef(Date.now());
  const lifetime = 800; // ms
  
  const heartShape = useMemo(() => createHeartShape(), []);
  
  const extrudeSettings = {
    steps: 1,
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.08,
    bevelSegments: 4,
  };
  
  useFrame(() => {
    if (meshRef.current) {
      const elapsed = Date.now() - startTime.current;
      const progress = elapsed / lifetime;
      
      if (progress >= 1) {
        onComplete();
        return;
      }
      
      // Move outward
      meshRef.current.position.x += velocity[0] * 0.03;
      meshRef.current.position.y += velocity[1] * 0.03 - progress * 0.02; // Add gravity
      meshRef.current.position.z += velocity[2] * 0.02;
      
      // Shrink and fade
      const scale = 0.08 * (1 - progress * 0.8);
      meshRef.current.scale.setScalar(scale);
      meshRef.current.material.opacity = 1 - progress;
      
      // Spin
      meshRef.current.rotation.z += 0.1;
      meshRef.current.rotation.y += 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} scale={0.08}>
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial
        color={color}
        metalness={0.1}
        roughness={0.5}
        emissive={color}
        emissiveIntensity={0.4}
        transparent={true}
        opacity={1}
      />
    </mesh>
  );
}

// Individual heart mesh with heartbeat
function Heart({ id, position, scale, speed, delay, color, startY, isHovered, onClick }) {
  const meshRef = useRef();
  const initialX = position[0];
  const initialZ = position[2];
  const baseScale = scale;
  const [isPopped, setIsPopped] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current && !isPopped) {
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
      
      // Heartbeat effect - pulse scale (bigger when hovered)
      const heartbeat = Math.sin(time * 6) * 0.5 + 0.5;
      const hoverBoost = isHovered ? 1.4 : 1;
      const pulse = 1 + heartbeat * 0.15;
      meshRef.current.scale.setScalar(baseScale * pulse * hoverBoost);
      
      // Gentle rotation
      meshRef.current.rotation.z = Math.sin(time * 0.4) * 0.15;
      meshRef.current.rotation.y = Math.sin(time * 0.25) * 0.1;
    }
  });
  
  const heartShape = useMemo(() => createHeartShape(), []);
  
  const extrudeSettings = {
    steps: 2,
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.25,
    bevelSize: 0.2,
    bevelOffset: 0,
    bevelSegments: 12,
  };
  
  const handlePop = () => {
    if (!isPopped && meshRef.current) {
      const pos = meshRef.current.position.clone();
      setIsPopped(true);
      onClick(id, [pos.x, pos.y, pos.z], color);
    }
  };
  
  // Expose click handler and ref for raycasting
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData = { id, onClick: handlePop };
    }
  });
  
  if (isPopped) return null;
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      scale={scale}
    >
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial
        color={isHovered ? '#FF4466' : color}
        metalness={0.1}
        roughness={0.5}
        emissive={isHovered ? '#FF4466' : color}
        emissiveIntensity={isHovered ? 0.5 : 0.2}
        transparent={true}
        opacity={1}
      />
    </mesh>
  );
}

// Click handler component that uses raycasting
function ClickHandler({ heartsRef, onHeartClick, onHoverChange }) {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      for (const intersect of intersects) {
        if (intersect.object.userData && intersect.object.userData.onClick) {
          intersect.object.userData.onClick();
          break;
        }
      }
    };
    
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      let hoveredId = null;
      for (const intersect of intersects) {
        if (intersect.object.userData && intersect.object.userData.id !== undefined) {
          hoveredId = intersect.object.userData.id;
          break;
        }
      }
      onHoverChange(hoveredId);
    };
    
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleClick({ clientX: touch.clientX, clientY: touch.clientY });
      }
    });
    
    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera, gl, scene, raycaster, mouse, onHoverChange]);
  
  return null;
}

// Pop sound manager
function usePopSound() {
  const [sounds, setSounds] = useState([]);
  
  useEffect(() => {
    const soundFiles = [
      '/audio/pop1.mp3',
      '/audio/pop2.mp3',
      '/audio/pop3.mp3',
    ];
    
    const audioElements = soundFiles.map(file => {
      const audio = new Audio(file);
      audio.volume = 0.3;
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
  
  const playPop = useCallback(() => {
    if (sounds.length > 0) {
      const randomIndex = Math.floor(Math.random() * sounds.length);
      const sound = sounds[randomIndex];
      const clone = sound.cloneNode();
      clone.volume = 0.2 + Math.random() * 0.15;
      clone.playbackRate = 0.9 + Math.random() * 0.3;
      clone.play().catch(() => {});
    }
  }, [sounds]);
  
  return playPop;
}

// Hearts scene
function HeartsScene({ count = 25, colors, playPopSound }) {
  const [hearts, setHearts] = useState([]);
  const [particles, setParticles] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const particleIdRef = useRef(0);
  const heartsRef = useRef([]);
  
  // Initialize hearts
  useEffect(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const startY = 12 + Math.random() * 18;
      items.push({
        id: i,
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
    setHearts(items);
  }, [count, colors]);
  
  const handlePop = useCallback((id, position, color) => {
    // Play sound
    playPopSound();
    
    // Create particles
    const newParticles = [];
    const particleCount = 6 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 0.5 + Math.random() * 0.5;
      newParticles.push({
        id: particleIdRef.current++,
        position: [...position],
        velocity: [
          Math.cos(angle) * speed,
          Math.sin(angle) * speed + 0.3,
          (Math.random() - 0.5) * 0.5,
        ],
        color: color,
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Respawn heart after delay
    setTimeout(() => {
      const startY = 12 + Math.random() * 18;
      setHearts(prev => prev.map(h => 
        h.id === id 
          ? {
              ...h,
              position: [
                (Math.random() - 0.5) * 20,
                startY,
                (Math.random() - 0.5) * 5,
              ],
              startY: startY,
              delay: Math.random() * 5,
            }
          : h
      ));
    }, 2000);
  }, [playPopSound]);
  
  const removeParticle = useCallback((particleId) => {
    setParticles(prev => prev.filter(p => p.id !== particleId));
  }, []);
  
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#FF6B6B" />
      <pointLight position={[0, 0, 8]} intensity={0.3} color="#FF4444" />
      
      <ClickHandler 
        heartsRef={heartsRef} 
        onHeartClick={handlePop}
        onHoverChange={setHoveredId}
      />
      
      {hearts.map((heart) => (
        <Heart 
          key={heart.id} 
          {...heart} 
          isHovered={hoveredId === heart.id}
          onClick={handlePop} 
        />
      ))}
      
      {particles.map((particle) => (
        <PopParticle 
          key={particle.id} 
          {...particle} 
          onComplete={() => removeParticle(particle.id)}
        />
      ))}
    </>
  );
}

// Wrapper to pass sound function into Canvas
function HeartsSceneWrapper({ count, colors }) {
  const playPopSound = usePopSound();
  
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent', cursor: 'pointer' }}
    >
      <HeartsScene count={count} colors={colors} playPopSound={playPopSound} />
    </Canvas>
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
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'auto',
      }}
    >
      <HeartsSceneWrapper count={count} colors={colors} />
    </div>
  );
}