import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import PageTransition from '../common/PageTransition';
import MenuButton from '../common/MenuButton';
import { useGlobalMusic } from '../home/HomePage';
import useStore from '../../store/useStore';

// ============ SPINNING CUBE FOR TRANSITIONS ============
function SpinningCube3D() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 2;
      meshRef.current.rotation.y += delta * 3;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial 
        color="#8B5CF6" 
        emissive="#4c1d95" 
        emissiveIntensity={0.5}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

// ============ JB CHARACTER RESPONSES ============
const jbResponses = {
  greetings: [
    "Hey there, beautiful! Welcome to our little paradise! 🌅",
    "Oh wow, you actually came! I've been waiting forever... okay, maybe just 5 minutes. 😄",
    "Welcome to JB's Paradise! Population: us two lovebirds! 💕",
  ],
  love: [
    "You know what's funny? My heart beats faster every time I see you. Even in a simulation! 💓",
    "I love you more than pizza. And you KNOW how much I love pizza. That's serious. 🍕❤️",
    "If loving you was a job, I'd be the most dedicated employee ever. No breaks needed! 😘",
    "You're the reason I smile like an idiot for no reason. Thanks for that! 😊",
  ],
  funny: [
    "Why did I bring you to a sunset paradise? Because you deserve nothing but the best views... and me! 😎",
    "Fun fact: I practiced this romantic moment 47 times. Nailed it on the 48th! 💪",
    "If you were a vegetable, you'd be a cute-cumber! ...I'll see myself out. 🥒",
    "Are you a parking ticket? Because you've got FINE written all over you! 🚗",
    "I'm not saying I'm perfect, but I AM standing in a paradise I created just for you. So... pretty close! ✨",
  ],
  compliments: [
    "Has anyone told you that you look absolutely stunning today? No? Well, you do! 😍",
    "Your smile could literally power this entire paradise. It's THAT bright! ☀️",
    "I must be dreaming because someone as amazing as you is actually here with me! 💫",
    "You know what's more beautiful than this sunset? ...It's you. Obviously. 🌅💕",
  ],
  random: [
    "So... nice weather we're having in this simulation, huh? I coded it myself! ☁️",
    "Did you know that I spent hours making this grass green enough? The things I do for love! 🌿",
    "Plot twist: This entire paradise exists just because I wanted to impress you. Is it working? 👀",
    "I put a lot of love into this place. Like, a LOT. My keyboard is tired. ⌨️💕",
  ],
  goodbye: [
    "Leaving already? But we were having so much fun! Come back soon, okay? 🥺",
    "See you later, alligator! ...In a while, crocodile! ...I love you! 🐊💕",
    "Don't forget: I'll always be here waiting for you in our paradise! 💕",
  ],
};

// ============ BEA CHARACTER RESPONSES ============
const beaResponses = {
  greetings: [
    "Hi JB! Finally you're here! I was getting bored jumping around alone~ 💜",
    "There you are! I've been exploring this beautiful place you made! ✨",
    "Hey love! Isn't this sunset just gorgeous? Almost as gorgeous as you! 💕",
  ],
  love: [
    "You know, every time I see you, my heart does that little flutter thing~ 💜",
    "I love you so much it's actually ridiculous. Like, scientifically impossible levels! 💓",
    "Being here with you... this is literally my happy place. You're my happy place! 🥰",
    "If I could pause time, I'd pause it right here, with you. Forever~ 💜✨",
  ],
  funny: [
    "You know what's funny? I tried to catch a cloud earlier. Didn't work. 😂☁️",
    "I've been practicing my jumps! Watch— *jumps* —pretty impressive right?! 💪",
    "Plot twist: I'm actually a professional tree-admirer now. Look at them! So round! 🌳",
    "Did you put extra love in those flowers? Because they're almost as pretty as me! 💜🌸",
    "I tried talking to that sun but it just kept glowing at me. Rude! ☀️😤",
  ],
  compliments: [
    "Have I told you lately that you're the most amazing person ever? Because you are! 💜",
    "You literally made a whole paradise for us. That's the sweetest thing ever! 🥺💕",
    "Your smile makes everything brighter— even brighter than that big orange sun! ☀️",
    "I'm so lucky to have you. Like, lottery-winning levels of lucky! 🍀💜",
  ],
  random: [
    "I wonder if we could climb those mountains... probably not, but imagine the view! 🏔️",
    "The grass here is SO green! Did you pick this color? Good choice! 🌿💜",
    "Sometimes I just like to stand here and watch the clouds. It's peaceful~ ☁️",
    "Do you think the flowers here talk to each other? I hope they're saying nice things! 🌸",
  ],
  goodbye: [
    "Aww, switching already? Okay okay, but come back to me soon! 💜",
    "See you in a bit! Don't have TOO much fun without me~ 😘",
    "Bye for now! Remember, I'll be right here waiting! 💜✨",
  ],
};

function getRandomResponse(character, category) {
  const responses = character === 'jb' 
    ? (jbResponses[category] || jbResponses.random)
    : (beaResponses[category] || beaResponses.random);
  return responses[Math.floor(Math.random() * responses.length)];
}

// ============ GROUND ============
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshStandardMaterial color="#5a8a4a" roughness={0.8} />
    </mesh>
  );
}

// ============ GRASS PATCHES ============
function GrassPatches() {
  const patches = useMemo(() => {
    const items = [];
    for (let i = 0; i < 600; i++) {
      items.push({
        position: [(Math.random() - 0.5) * 70, 0.1, (Math.random() - 0.5) * 70],
        scale: 0.5 + Math.random() * 1,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    return items;
  }, []);

  return (
    <>
      {patches.map((patch, i) => (
        <mesh key={i} position={patch.position} rotation={[0, patch.rotation, 0]} scale={patch.scale}>
          <coneGeometry args={[0.1, 0.4, 4]} />
          <meshStandardMaterial color="#4a7a3a" />
        </mesh>
      ))}
    </>
  );
}

// ============ FLOWERS ============
function Flowers() {
  const flowers = useMemo(() => {
    const items = [];
    const colors = ['#FF6B8A', '#FFD93D', '#FF8E53', '#A855F7', '#EC4899'];
    for (let i = 0; i < 100; i++) {
      items.push({
        position: [(Math.random() - 0.5) * 60, 0.3, (Math.random() - 0.5) * 60],
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.3 + Math.random() * 0.3,
      });
    }
    return items;
  }, []);

  return (
    <>
      {flowers.map((flower, i) => (
        <group key={i} position={flower.position} scale={flower.scale}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {[0, 1, 2, 3, 4].map((j) => (
            <mesh key={j} position={[Math.cos(j * 1.26) * 0.1, 0.4, Math.sin(j * 1.26) * 0.1]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={flower.color} />
            </mesh>
          ))}
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ============ TREES ============
function Tree({ position }) {
  return (
    <group position={position}>
      {/* Trunk - taller */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Round leaf clusters */}
      <mesh position={[0, 3.8, 0]}>
        <sphereGeometry args={[1.4, 12, 10]} />
        <meshStandardMaterial color="#2E8B2E" />
      </mesh>
      <mesh position={[0.6, 3.2, 0.4]}>
        <sphereGeometry args={[0.9, 10, 8]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>
      <mesh position={[-0.5, 3.4, -0.3]}>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.7, 10, 8]} />
        <meshStandardMaterial color="#3CB371" />
      </mesh>
    </group>
  );
}

function Trees() {
  const trees = useMemo(() => {
    const items = [];
    for (let i = 0; i < 80; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      // Keep trees away from center
      if (Math.abs(x) > 6 || Math.abs(z) > 6) {
        items.push([x, 0, z]);
      }
    }
    return items;
  }, []);

  return (
    <>
      {trees.map((pos, i) => <Tree key={i} position={pos} />)}
    </>
  );
}

// ============ SUN ============
function Sun() {
  const sunRef = useRef();
  
  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={sunRef} position={[30, 15, -40]}>
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color="#FFA500" />
      </mesh>
      <pointLight color="#FFA500" intensity={1} distance={100} />
    </group>
  );
}

// ============ CLOUDS ============
function Cloud({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#FFE4C4" transparent opacity={0.8} />
      </mesh>
      <mesh position={[2, -0.3, 0]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color="#FFDAB9" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-1.8, -0.2, 0.5]}>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshBasicMaterial color="#FFE4C4" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Clouds() {
  const cloudsRef = useRef();
  
  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <group ref={cloudsRef}>
      {/* Original clouds */}
      <Cloud position={[20, 20, -30]} />
      <Cloud position={[-25, 18, -20]} />
      <Cloud position={[0, 22, -40]} />
      <Cloud position={[35, 19, 10]} />
      <Cloud position={[-30, 21, 20]} />
      {/* Additional clouds for fuller sky */}
      <Cloud position={[15, 24, 25]} />
      <Cloud position={[-15, 19, 35]} />
      <Cloud position={[40, 22, -15]} />
      <Cloud position={[-40, 20, -10]} />
      <Cloud position={[10, 26, -20]} />
      <Cloud position={[-20, 23, -35]} />
      <Cloud position={[30, 18, 30]} />
      <Cloud position={[-35, 25, 15]} />
      <Cloud position={[25, 21, 40]} />
      <Cloud position={[-10, 20, -45]} />
      <Cloud position={[45, 24, 0]} />
      <Cloud position={[-45, 22, 5]} />
      <Cloud position={[5, 27, 15]} />
      <Cloud position={[-5, 19, -25]} />
      <Cloud position={[50, 20, 20]} />
    </group>
  );
}

// ============ MOUNTAINS (surrounding the area) ============
function Mountain({ position, scale = 1, color = '#5a6b4d' }) {
  return (
    <group position={position}>
      {/* Main peak */}
      <mesh position={[0, scale * 8, 0]} castShadow>
        <coneGeometry args={[scale * 12, scale * 16, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Snow cap */}
      <mesh position={[0, scale * 14, 0]}>
        <coneGeometry args={[scale * 4, scale * 5, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      {/* Secondary peak */}
      <mesh position={[scale * 8, scale * 5, scale * 2]} castShadow>
        <coneGeometry args={[scale * 7, scale * 10, 5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Mountains() {
  const mountains = useMemo(() => {
    const items = [];
    const radius = 55; // Distance from center
    const count = 16; // Number of mountains around
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.8 + Math.random() * 0.6;
      const colorVariant = Math.random() > 0.5 ? '#5a6b4d' : '#4d5a42';
      items.push({ position: [x, 0, z], scale, color: colorVariant });
    }
    return items;
  }, []);

  return (
    <>
      {mountains.map((m, i) => (
        <Mountain key={i} position={m.position} scale={m.scale} color={m.color} />
      ))}
    </>
  );
}

// ============ BOULDER RING (encircling the area) ============
function BoulderRing() {
  const boulders = useMemo(() => {
    const items = [];
    const radius = 36; // Inside the mountain ring
    const boulderCount = 40; // Number of boulders
    
    for (let i = 0; i < boulderCount; i++) {
      const angle = (i / boulderCount) * Math.PI * 2;
      // Add some randomness to position
      const r = radius + (Math.random() - 0.5) * 4;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      // Random size and shape
      const scaleX = 1.2 + Math.random() * 1.5;
      const scaleY = 0.8 + Math.random() * 1.2;
      const scaleZ = 1.2 + Math.random() * 1.5;
      
      // Random rotation
      const rotY = Math.random() * Math.PI * 2;
      const rotX = (Math.random() - 0.5) * 0.3;
      const rotZ = (Math.random() - 0.5) * 0.3;
      
      // Random gray color
      const grayValue = 0.35 + Math.random() * 0.25;
      const color = `rgb(${Math.floor(grayValue * 255)}, ${Math.floor(grayValue * 240)}, ${Math.floor(grayValue * 230)})`;
      
      items.push({
        position: [x, scaleY * 0.4, z],
        scale: [scaleX, scaleY, scaleZ],
        rotation: [rotX, rotY, rotZ],
        color,
      });
      
      // Add smaller rocks nearby for natural look
      if (Math.random() > 0.5) {
        const smallAngle = angle + (Math.random() - 0.5) * 0.15;
        const smallR = r + (Math.random() - 0.5) * 3;
        const smallScale = 0.4 + Math.random() * 0.5;
        items.push({
          position: [Math.cos(smallAngle) * smallR, smallScale * 0.3, Math.sin(smallAngle) * smallR],
          scale: [smallScale, smallScale * 0.7, smallScale],
          rotation: [Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5],
          color: `rgb(${Math.floor((0.3 + Math.random() * 0.3) * 255)}, ${Math.floor((0.3 + Math.random() * 0.25) * 240)}, ${Math.floor((0.3 + Math.random() * 0.25) * 230)})`,
        });
      }
    }
    return items;
  }, []);
  
  return (
    <group>
      {boulders.map((boulder, i) => (
        <mesh 
          key={i} 
          position={boulder.position} 
          scale={boulder.scale}
          rotation={boulder.rotation}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={boulder.color} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// ============ CAMPFIRE WITH LOGS ============
function Campfire({ position = [-6, 0, 2] }) {
  const fireRef = useRef();
  const groupRef = useRef();
  const [flames, setFlames] = useState([]);
  const [smoke, setSmoke] = useState([]);
  
  // Initialize flames
  useEffect(() => {
    const initialFlames = [];
    for (let i = 0; i < 15; i++) {
      initialFlames.push({
        id: i,
        x: (Math.random() - 0.5) * 0.4,
        y: Math.random() * 0.8,
        z: (Math.random() - 0.5) * 0.4,
        scale: 0.12 + Math.random() * 0.18,
        speed: 1.2 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
      });
    }
    setFlames(initialFlames);
  }, []);
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Animate flames - rising and flickering
    setFlames(prev => prev.map(f => {
      let newY = f.y + f.speed * delta;
      if (newY > 1) {
        newY = 0;
        return {
          ...f,
          y: newY,
          x: (Math.random() - 0.5) * 0.4,
          z: (Math.random() - 0.5) * 0.4,
        };
      }
      return {
        ...f,
        y: newY,
        x: f.x + Math.sin(time * 5 + f.offset) * 0.02,
        z: f.z + Math.cos(time * 4 + f.offset) * 0.02,
      };
    }));
    
    // Spawn smoke particles
    if (Math.random() < 0.15) {
      setSmoke(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: (Math.random() - 0.5) * 0.3,
        y: 1.2,
        z: (Math.random() - 0.5) * 0.3,
        scale: 0.1 + Math.random() * 0.1,
        life: 3,
        vx: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
      }]);
    }
    
    // Update smoke
    setSmoke(prev => prev
      .map(s => ({
        ...s,
        y: s.y + delta * 0.8,
        x: s.x + s.vx * delta,
        z: s.z + s.vz * delta,
        scale: s.scale + delta * 0.15,
        life: s.life - delta,
      }))
      .filter(s => s.life > 0)
    );
    
    // Flicker light
    if (fireRef.current) {
      fireRef.current.intensity = 2.5 + Math.sin(time * 12) * 0.5 + Math.sin(time * 7) * 0.3;
    }
  });
  
  return (
    <group position={position} ref={groupRef}>
      {/* Fire pit stones */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.8, 0.12, Math.sin(angle) * 0.8]}>
            <sphereGeometry args={[0.2, 6, 6]} />
            <meshStandardMaterial color="#555555" roughness={0.9} />
          </mesh>
        );
      })}
      
      {/* Logs in fire */}
      <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.15, 1, 6]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.2, 0]} rotation={[0, -0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.15, 1, 6]} />
        <meshStandardMaterial color="#3d2d1f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.2, 0.4]} rotation={[Math.PI / 2, 0, 0.5]}>
        <cylinderGeometry args={[0.1, 0.12, 0.9, 6]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} />
      </mesh>
      
      {/* Animated fire flames */}
      {flames.map((f) => {
        const heightRatio = f.y;
        const flameColor = heightRatio < 0.3 ? '#FF4500' : heightRatio < 0.5 ? '#FF6600' : heightRatio < 0.7 ? '#FFAA00' : '#FFCC00';
        const flameScale = f.scale * (1 - heightRatio * 0.6);
        return (
          <mesh key={f.id} position={[f.x, 0.25 + f.y * 0.9, f.z]} scale={flameScale}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial 
              color={flameColor} 
              transparent 
              opacity={0.9 - heightRatio * 0.5} 
            />
          </mesh>
        );
      })}
      
      {/* Smoke particles */}
      {smoke.map((s) => (
        <mesh key={s.id} position={[s.x, s.y, s.z]} scale={s.scale}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial 
            color="#888888" 
            transparent 
            opacity={Math.min(0.4, s.life * 0.15)} 
          />
        </mesh>
      ))}
      
      {/* Fire light */}
      <pointLight ref={fireRef} position={[0, 0.8, 0]} color="#FF6600" intensity={2.5} distance={15} />
    </group>
  );
}

// Floating green diamond indicator for player's log
function PlayerLogIndicator({ position, isVisible }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isVisible) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  if (!isVisible) return null;
  
  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial 
        color="#33ff33" 
        emissive="#00ff00" 
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Simple sitting logs - each character has assigned seat
// Player = log3 (back), JB = log1 (left), Bea = log2 (right)
function SittingLogs({ campfirePos, isNearCampfire, isPlayerSitting, onPlayerSit }) {
  const [hoveredLog, setHoveredLog] = useState(null);
  
  const logs = [
    { id: 'log1', localPos: [-1.5, 0.3, 0], rotation: [0, Math.PI / 4, 0], color: '#5a4a3a' },      // JB's log
    { id: 'log2', localPos: [1.5, 0.3, 0], rotation: [0, -Math.PI / 4, 0], color: '#4a3a2a' },      // Bea's log
    { id: 'log3', localPos: [0, 0.3, 1.5], rotation: [0, 0, 0], color: '#5a4530', isPlayerLog: true }, // Player's log
  ];
  
  // Show green diamond above player's log (log3) when near and not sitting
  const showPlayerIndicator = isNearCampfire && !isPlayerSitting;
  
  const handleLogClick = (log) => {
    if (log.isPlayerLog && isNearCampfire && !isPlayerSitting && onPlayerSit) {
      onPlayerSit();
    }
  };
  
  return (
    <group position={campfirePos}>
      {logs.map((log) => (
        <mesh 
          key={log.id}
          position={log.localPos} 
          rotation={log.rotation}
          onClick={(e) => {
            e.stopPropagation();
            handleLogClick(log);
          }}
          onPointerOver={() => {
            if (log.isPlayerLog && isNearCampfire && !isPlayerSitting) {
              setHoveredLog(log.id);
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={() => {
            setHoveredLog(null);
            document.body.style.cursor = 'default';
          }}
        >
          <cylinderGeometry args={[0.3, 0.35, 0.6, 8]} />
          <meshStandardMaterial 
            color={hoveredLog === log.id ? '#7a6a5a' : log.color} 
            roughness={0.8}
            emissive={hoveredLog === log.id ? '#332211' : '#000000'}
          />
        </mesh>
      ))}
      
      {/* Green diamond indicator above player's log (log3) */}
      <PlayerLogIndicator 
        position={[0, 1.5, 1.5]}
        isVisible={showPlayerIndicator}
      />
    </group>
  );
}

// Campfire log positions (world coordinates when campfire is at [-6, 0, 2])
// Player sits on log3 (back), JB on log1 (left), Bea on log2 (right)
const campfireLogPositions = {
  player: { x: -6, z: 3.5, facing: Math.PI },           // Back log - player's seat
  jb: { x: -7.5, z: 2, facing: Math.PI / 2 },           // Left log - JB's seat
  bea: { x: -4.5, z: 2, facing: -Math.PI / 2 },         // Right log - Bea's seat
};

// Special campfire conversation lines
const campfireConversations = {
  jb: [
    "The fire's so warm... I could stay here forever with you. 🔥",
    "Look at those stars, Bea. They remind me of your eyes. ✨",
    "Remember when we first met? I knew you were special. 💚",
    "This is perfect. Just us, the fire, and the stars. 💕",
    "I love these quiet moments together.",
    "You know what makes this fire warm? Having you next to me. 🥰",
    "I've been thinking... I'm so lucky to have you.",
    "Choco seems happy too. We're like a little family. 🐱",
    "The crackling fire sounds like music, doesn't it? 🎵",
    "I wish we could freeze this moment forever.",
    "Hey... I love you, you know that? 💚",
    "Being here with you... it's my favorite thing.",
    "The sunset is beautiful, but not as beautiful as you. 🌅",
    "I could sit here with you all night long.",
    "You're my favorite person in the whole world. 💕",
    "This fire isn't as warm as my heart feels right now.",
    "Thank you for being here with me, Bea. 🥺",
    "Can we do this every night? Just us two? 💚",
  ],
  bea: [
    "JB... this is so romantic. Thank you for bringing me here. 💜",
    "The fire reminds me of how you warm my heart. 🔥",
    "I feel so safe sitting here with you. 💕",
    "Look how beautiful the sky is tonight! ✨",
    "I could listen to the fire crackle all night.",
    "You always know how to make me feel special. 🥰",
    "This is my favorite place in the whole world.",
    "The warmth of the fire... or is that your love I'm feeling? 💜",
    "I'm so grateful for moments like these.",
    "Promise me we'll do this forever? 💕",
    "I love you so much, JB. 💜",
    "This is perfect... just us and the stars. ✨",
    "I never want this moment to end.",
    "You make me the happiest girl in the world. 🥺",
    "The fire is so pretty... but you're prettier! 😊",
    "Can we stay here a little longer? Please? 💜",
    "I feel like the luckiest person alive right now.",
    "Being with you feels like home. 💕",
  ],
  choco: [
    "*purrs contentedly by the warm fire* 🔥",
    "*stretches and yawns happily* 😸",
    "*curls up closer to the warmth*",
    "*looks at you both with sleepy eyes* 😻",
    "*meows softly in contentment* 🐱",
    "*happy cat noises* Purrrr~ 💕",
    "*kneads paws on the log* Mrrrow~",
    "*tail swishes happily*",
    "*slow blinks at both of you* 😸💕",
  ],
};

// ============ NIGHT SKY STARS ============
function NightStars() {
  const stars = useMemo(() => {
    const items = [];
    for (let i = 0; i < 200; i++) {
      // Spread stars across the sky dome
      const theta = Math.random() * Math.PI * 2; // Around
      const phi = Math.random() * Math.PI * 0.4; // Above horizon (not too low)
      const radius = 80 + Math.random() * 20;
      
      items.push({
        x: Math.sin(phi) * Math.cos(theta) * radius,
        y: Math.cos(phi) * radius * 0.5 + 15, // Keep above horizon
        z: Math.sin(phi) * Math.sin(theta) * radius,
        scale: 0.05 + Math.random() * 0.15,
        twinkleSpeed: 2 + Math.random() * 4,
        twinkleOffset: Math.random() * Math.PI * 2,
        brightness: 0.5 + Math.random() * 0.5,
      });
    }
    return items;
  }, []);
  
  const groupRef = useRef();
  
  useFrame((state) => {
    // Stars twinkle handled by individual mesh opacity updates
  });
  
  return (
    <group ref={groupRef}>
      {stars.map((star, i) => (
        <mesh key={i} position={[star.x, star.y, star.z]}>
          <sphereGeometry args={[star.scale, 6, 6]} />
          <meshBasicMaterial 
            color="#FFFFFF" 
            transparent 
            opacity={star.brightness}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============ WISHING WELL ============
const wishingWellPosition = { x: 8, y: 0, z: -8 };

function WishingWell({ position = [8, 0, -8], isNearby, onMakeWish }) {
  const roofRef = useRef();
  const [sparkles, setSparkles] = useState([]);
  const [wishMessage, setWishMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  
  const wishes = [
    "May your love grow stronger every day 💕",
    "Wishing you endless happiness together 🌟",
    "May all your dreams come true ✨",
    "Forever and always, you two 💖",
    "Love conquers all 💗",
    "Here's to a lifetime of adventures 🌈",
    "May your hearts always beat as one 💞",
    "Wishing you infinite hugs and kisses 😘",
    "Your love story is beautiful 📖💕",
    "Together is the best place to be 🏠❤️",
  ];
  
  useFrame((state) => {
    // Gentle roof sway
    if (roofRef.current) {
      roofRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
    
    // Animate sparkles
    setSparkles(prev => prev
      .map(s => ({
        ...s,
        y: s.y + s.speed * 0.016,
        opacity: s.opacity - 0.01,
        scale: s.scale * 0.99,
      }))
      .filter(s => s.opacity > 0)
    );
  });
  
  const handleWish = () => {
    // Create sparkles
    const newSparkles = [];
    for (let i = 0; i < 20; i++) {
      newSparkles.push({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 1.5,
        y: 0.5,
        z: (Math.random() - 0.5) * 1.5,
        speed: 0.5 + Math.random() * 1,
        opacity: 1,
        scale: 0.1 + Math.random() * 0.1,
        color: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'][Math.floor(Math.random() * 5)],
      });
    }
    setSparkles(prev => [...prev, ...newSparkles]);
    
    // Show random wish message
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    setWishMessage(randomWish);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
    
    if (onMakeWish) onMakeWish(randomWish);
  };
  
  const stoneColor = '#6B7280';
  const roofColor = '#8B4513';
  
  return (
    <group position={position}>
      {/* Stone base - circular wall */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.9, 1, 0.8, 16]} />
        <meshStandardMaterial color={stoneColor} roughness={0.9} />
      </mesh>
      
      {/* Inner dark (water) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.3, 16]} />
        <meshStandardMaterial color="#1a3a5c" roughness={0.3} metalness={0.5} />
      </mesh>
      
      {/* Stone rim */}
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[0.85, 0.12, 8, 16]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.8} />
      </mesh>
      
      {/* Support posts */}
      {[0, Math.PI].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.7, 1.2, Math.sin(angle) * 0.7]}>
          <cylinderGeometry args={[0.08, 0.08, 1.6, 6]} />
          <meshStandardMaterial color={roofColor} roughness={0.8} />
        </mesh>
      ))}
      
      {/* Crossbar */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 1.6, 6]} />
        <meshStandardMaterial color={roofColor} roughness={0.8} />
      </mesh>
      
      {/* Roof */}
      <group ref={roofRef} position={[0, 2.3, 0]}>
        <mesh>
          <coneGeometry args={[1.2, 0.8, 6]} />
          <meshStandardMaterial color={roofColor} roughness={0.7} />
        </mesh>
      </group>
      
      {/* Bucket */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>
      
      {/* Rope */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      
      {/* Sparkles */}
      {sparkles.map(s => (
        <mesh key={s.id} position={[s.x, s.y, s.z]} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={s.color} transparent opacity={s.opacity} />
        </mesh>
      ))}
      
      {/* Interaction indicator */}
      {isNearby && (
        <group position={[0, 2.8, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============ BUTTERFLIES ============
function Butterflies() {
  const [butterflies, setButterflies] = useState([]);
  
  // Specific colors: pink, yellow, sky blue, purple, mint, lavender
  const butterflyColors = ['#FF69B4', '#FFD700', '#87CEEB', '#9370DB', '#98FB98', '#E6E6FA'];
  
  // Initialize butterflies
  useEffect(() => {
    const initial = [];
    for (let i = 0; i < 6; i++) {
      initial.push({
        id: i,
        x: (Math.random() - 0.5) * 40,
        y: 1 + Math.random() * 3,
        z: (Math.random() - 0.5) * 40,
        targetX: (Math.random() - 0.5) * 40,
        targetY: 1 + Math.random() * 3,
        targetZ: (Math.random() - 0.5) * 40,
        speed: 0.5 + Math.random() * 1,
        wingPhase: Math.random() * Math.PI * 2,
        color: butterflyColors[i],
        scale: 0.15 + Math.random() * 0.1,
        moveTimer: Math.random() * 3,
      });
    }
    setButterflies(initial);
  }, []);
  
  useFrame((state, delta) => {
    setButterflies(prev => prev.map(b => {
      let { x, y, z, targetX, targetY, targetZ, moveTimer, wingPhase, speed } = b;
      
      // Update wing animation
      wingPhase += delta * 15;
      
      // Move toward target
      const dx = targetX - x;
      const dy = targetY - y;
      const dz = targetZ - z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (dist > 0.5) {
        x += (dx / dist) * speed * delta;
        y += (dy / dist) * speed * delta;
        z += (dz / dist) * speed * delta;
        // Add bobbing motion
        y += Math.sin(state.clock.elapsedTime * 3 + b.id) * 0.01;
      }
      
      // Pick new target periodically
      moveTimer -= delta;
      if (moveTimer <= 0 || dist < 0.5) {
        targetX = (Math.random() - 0.5) * 40;
        targetY = 1 + Math.random() * 3;
        targetZ = (Math.random() - 0.5) * 40;
        moveTimer = 3 + Math.random() * 5;
      }
      
      return { ...b, x, y, z, targetX, targetY, targetZ, moveTimer, wingPhase };
    }));
  });
  
  return (
    <group>
      {butterflies.map(b => {
        const wingAngle = Math.sin(b.wingPhase) * 0.8;
        const facing = Math.atan2(b.targetX - b.x, b.targetZ - b.z);
        
        return (
          <group key={b.id} position={[b.x, b.y, b.z]} rotation={[0, facing, 0]} scale={b.scale}>
            {/* Body */}
            <mesh>
              <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
              <meshStandardMaterial color="#333" />
            </mesh>
            
            {/* Left wing */}
            <group position={[0.15, 0, 0]} rotation={[0, 0, wingAngle]}>
              <mesh position={[0.25, 0, 0]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <meshStandardMaterial color={b.color} transparent opacity={0.8} side={2} />
              </mesh>
              <mesh position={[0.15, -0.2, 0]} scale={0.7}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial color={b.color} transparent opacity={0.8} side={2} />
              </mesh>
            </group>
            
            {/* Right wing */}
            <group position={[-0.15, 0, 0]} rotation={[0, 0, -wingAngle]}>
              <mesh position={[-0.25, 0, 0]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <meshStandardMaterial color={b.color} transparent opacity={0.8} side={2} />
              </mesh>
              <mesh position={[-0.15, -0.2, 0]} scale={0.7}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial color={b.color} transparent opacity={0.8} side={2} />
              </mesh>
            </group>
            
            {/* Antennae */}
            <mesh position={[0.05, 0.25, 0.1]} rotation={[0.5, 0, 0.3]}>
              <cylinderGeometry args={[0.02, 0.01, 0.2, 4]} />
              <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[-0.05, 0.25, 0.1]} rotation={[0.5, 0, -0.3]}>
              <cylinderGeometry args={[0.02, 0.01, 0.2, 4]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============ FIREFLIES ============
function Fireflies() {
  const [fireflies, setFireflies] = useState([]);
  
  // Initialize fireflies
  useEffect(() => {
    const initial = [];
    for (let i = 0; i < 40; i++) {
      initial.push({
        id: i,
        x: (Math.random() - 0.5) * 60,
        y: 0.5 + Math.random() * 4,
        z: (Math.random() - 0.5) * 60,
        baseY: 0.5 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.5,
        glowPhase: Math.random() * Math.PI * 2,
        glowSpeed: 1 + Math.random() * 2,
        scale: 0.05 + Math.random() * 0.03,
        changeTimer: Math.random() * 2,
      });
    }
    setFireflies(initial);
  }, []);
  
  useFrame((state, delta) => {
    setFireflies(prev => prev.map(f => {
      let { x, y, z, baseY, vx, vy, vz, glowPhase, glowSpeed, changeTimer } = f;
      
      // Update glow animation
      glowPhase += delta * glowSpeed;
      
      // Move
      x += vx * delta;
      y += vy * delta;
      z += vz * delta;
      
      // Gentle floating motion
      y = baseY + Math.sin(state.clock.elapsedTime * 0.8 + f.id * 0.5) * 0.5;
      
      // Boundary check - keep within area
      if (Math.abs(x) > 30) vx *= -1;
      if (Math.abs(z) > 30) vz *= -1;
      
      // Random direction change
      changeTimer -= delta;
      if (changeTimer <= 0) {
        vx = (Math.random() - 0.5) * 0.8;
        vz = (Math.random() - 0.5) * 0.8;
        changeTimer = 2 + Math.random() * 3;
      }
      
      return { ...f, x, y, z, vx, vy, vz, glowPhase, changeTimer };
    }));
  });
  
  return (
    <group>
      {fireflies.map(f => {
        // Pulsing glow effect
        const glow = 0.4 + Math.sin(f.glowPhase) * 0.6;
        const isGlowing = glow > 0.5;
        
        return (
          <group key={f.id} position={[f.x, f.y, f.z]}>
            {/* Firefly body */}
            <mesh scale={f.scale}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial 
                color={isGlowing ? '#FFFF88' : '#888844'} 
                transparent 
                opacity={0.9}
              />
            </mesh>
            
            {/* Glow effect */}
            {isGlowing && (
              <mesh scale={f.scale * 3}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial 
                  color="#FFFF44" 
                  transparent 
                  opacity={glow * 0.4}
                />
              </mesh>
            )}
            
            {/* Point light for actual glow */}
            {isGlowing && (
              <pointLight 
                color="#FFFF66" 
                intensity={glow * 0.3} 
                distance={3}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

// ============ CHOCO THE BLACK CAT ============
const chocoCurrentPosition = { x: -4, y: 0, z: -3 };

function ChocoCat({ position = [-4, 0, -3], isNearby, playerPos, bothSittingAtCampfire = false, currentCharacter = 'bea' }) {
  const groupRef = useRef();
  const tailRef = useRef();
  const frontLeftLegRef = useRef();
  const frontRightLegRef = useRef();
  const backLeftLegRef = useRef();
  const backRightLegRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  
  // Cat state
  const stateRef = useRef({
    currentPos: new THREE.Vector3(position[0], position[1], position[2]),
    targetPos: new THREE.Vector3(position[0], position[1], position[2]),
    moveTimer: Math.random() * 3,
    isMoving: false,
    isSitting: false,
    isSittingOnLog: false,
    facing: 0,
    walkCycle: 0,
    sitTimer: 0,
    isWalkingToLog: false,
  });
  
  const catColor = '#1a1a1a'; // Black
  const eyeColor = '#FFD700'; // Golden eyes
  
  // Choco sits on the log of the character NOT being played
  // If playing as Bea, JB is on left log, so Choco sits on Bea's log (right)
  // If playing as JB, Bea is on right log, so Choco sits on JB's log (left)
  // Log positions: campfire at [-6, 0, 2], logs have Y=0.3, log height ~0.6
  // So top of log is around Y=0.6
  const chocoLogPos = currentCharacter === 'bea' 
    ? { x: -4.5, y: 0.6, z: 2, facing: -Math.PI / 2 }   // Bea's log (right) - when playing as Bea
    : { x: -7.5, y: 0.6, z: 2, facing: Math.PI / 2 };   // JB's log (left) - when playing as JB
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const s = stateRef.current;
    const time = state.clock.elapsedTime;
    
    // Check if should go sit on log at campfire (when both player and character sitting)
    if (bothSittingAtCampfire && !s.isSittingOnLog && !s.isWalkingToLog && Math.random() < 0.01) {
      // 1% chance per frame to decide to go sit when conditions are met
      s.isWalkingToLog = true;
      s.targetPos.set(chocoLogPos.x, 0, chocoLogPos.z);
      s.isMoving = true;
      s.isSitting = false;
    }
    
    // Walking to log
    if (s.isWalkingToLog) {
      const direction = new THREE.Vector3(
        chocoLogPos.x - s.currentPos.x,
        0,
        chocoLogPos.z - s.currentPos.z
      );
      const distance = direction.length();
      
      if (distance > 0.3) {
        direction.normalize();
        s.currentPos.x += direction.x * 1.5 * delta;
        s.currentPos.z += direction.z * 1.5 * delta;
        s.facing = Math.atan2(direction.x, direction.z);
        s.walkCycle += delta * 12;
        s.isMoving = true;
      } else {
        // Arrived at log, sit on it
        s.isWalkingToLog = false;
        s.isSittingOnLog = true;
        s.isMoving = false;
        s.isSitting = true;
        s.currentPos.set(chocoLogPos.x, chocoLogPos.y, chocoLogPos.z); // Sit ON TOP of log
        s.facing = chocoLogPos.facing; // Face the fire
      }
    }
    
    // Sitting on log at campfire
    if (s.isSittingOnLog) {
      if (!bothSittingAtCampfire) {
        // Someone stood up, Choco jumps off and goes back to normal
        s.isSittingOnLog = false;
        s.isSitting = false;
        s.currentPos.y = 0;
        s.moveTimer = 1;
      } else {
        // Stay on log
        s.currentPos.set(chocoLogPos.x, chocoLogPos.y, chocoLogPos.z);
        s.facing = chocoLogPos.facing;
      }
    }
    
    // Tail wagging animation
    if (tailRef.current) {
      const tailSpeed = s.isSittingOnLog ? 1 : (s.isMoving ? 6 : (s.isSitting ? 1.5 : 3));
      const tailAmount = s.isSittingOnLog ? 0.1 : (s.isSitting ? 0.15 : 0.3);
      tailRef.current.rotation.z = Math.sin(time * tailSpeed) * tailAmount;
    }
    
    // Random movement/sitting behavior (only if not on log)
    if (!s.isSittingOnLog && !s.isWalkingToLog) {
      s.moveTimer -= delta;
      if (s.moveTimer <= 0) {
        const rand = Math.random();
        
        if (rand < 0.35) {
          // Sit down for a while (35% chance)
          s.isMoving = false;
          s.isSitting = true;
          s.moveTimer = 4 + Math.random() * 6; // Sit for 4-10 seconds
        } else if (rand < 0.7) {
          // Move to new spot (35% chance)
          s.targetPos.set(
            position[0] + (Math.random() - 0.5) * 8,
            0,
            position[2] + (Math.random() - 0.5) * 8
          );
          s.isMoving = true;
          s.isSitting = false;
          s.moveTimer = 2 + Math.random() * 3;
        } else {
          // Stand idle (30% chance)
          s.isMoving = false;
          s.isSitting = false;
          s.moveTimer = 2 + Math.random() * 3;
        }
      }
    }
    
    // Walking animation
    if (s.isMoving) {
      s.walkCycle += delta * 12;
      const legSwing = Math.sin(s.walkCycle) * 0.4;
      
      // Animate legs - opposite pairs move together
      if (frontLeftLegRef.current) frontLeftLegRef.current.rotation.x = legSwing;
      if (backRightLegRef.current) backRightLegRef.current.rotation.x = legSwing;
      if (frontRightLegRef.current) frontRightLegRef.current.rotation.x = -legSwing;
      if (backLeftLegRef.current) backLeftLegRef.current.rotation.x = -legSwing;
      
      // Slight body bob while walking
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.25 + Math.abs(Math.sin(s.walkCycle * 2)) * 0.02;
      }
      if (headRef.current) {
        headRef.current.position.y = 0.35 + Math.abs(Math.sin(s.walkCycle * 2)) * 0.02;
      }
    } else {
      // Reset leg positions when not walking
      if (frontLeftLegRef.current) frontLeftLegRef.current.rotation.x = 0;
      if (frontRightLegRef.current) frontRightLegRef.current.rotation.x = 0;
      if (backLeftLegRef.current) backLeftLegRef.current.rotation.x = 0;
      if (backRightLegRef.current) backRightLegRef.current.rotation.x = 0;
    }
    
    // Sitting/Napping pose - lower body and tuck legs
    if (s.isSitting || s.isNapping) {
      if (bodyRef.current) bodyRef.current.position.y = s.isNapping ? 0.1 : 0.15;
      if (headRef.current) headRef.current.position.y = s.isNapping ? 0.18 : 0.28;
      // Tuck back legs
      if (backLeftLegRef.current) {
        backLeftLegRef.current.rotation.x = -0.8;
        backLeftLegRef.current.position.y = 0.08;
      }
      if (backRightLegRef.current) {
        backRightLegRef.current.rotation.x = -0.8;
        backRightLegRef.current.position.y = 0.08;
      }
      // Front legs stay straight but lower
      if (frontLeftLegRef.current) frontLeftLegRef.current.position.y = 0.05;
      if (frontRightLegRef.current) frontRightLegRef.current.position.y = 0.05;
    } else if (!s.isMoving) {
      // Standing idle
      if (bodyRef.current) bodyRef.current.position.y = 0.25;
      if (headRef.current) headRef.current.position.y = 0.35;
      if (backLeftLegRef.current) backLeftLegRef.current.position.y = 0.1;
      if (backRightLegRef.current) backRightLegRef.current.position.y = 0.1;
      if (frontLeftLegRef.current) frontLeftLegRef.current.position.y = 0.1;
      if (frontRightLegRef.current) frontRightLegRef.current.position.y = 0.1;
    }
    
    // Movement
    if (s.isMoving) {
      const dir = new THREE.Vector3().subVectors(s.targetPos, s.currentPos);
      const dist = dir.length();
      
      if (dist > 0.1) {
        dir.normalize();
        s.facing = Math.atan2(dir.x, dir.z);
        const speed = 1.5;
        s.currentPos.x += dir.x * speed * delta;
        s.currentPos.z += dir.z * speed * delta;
      } else {
        s.isMoving = false;
        // 50% chance to sit when arriving at destination
        if (Math.random() > 0.5) {
          s.isSitting = true;
          s.moveTimer = 3 + Math.random() * 5;
        }
      }
    }
    
    // Update position
    chocoCurrentPosition.x = s.currentPos.x;
    chocoCurrentPosition.y = s.currentPos.y;
    chocoCurrentPosition.z = s.currentPos.z;
    
    groupRef.current.position.copy(s.currentPos);
    groupRef.current.rotation.y = s.facing;
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color={catColor} />
      </mesh>
      
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.35, 0.25]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color={catColor} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.1, 0.5, 0.25]} rotation={[0.3, 0, -0.3]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color={catColor} />
      </mesh>
      <mesh position={[0.1, 0.5, 0.25]} rotation={[0.3, 0, 0.3]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color={catColor} />
      </mesh>
      
      {/* Inner ears (pink) */}
      <mesh position={[-0.1, 0.48, 0.27]} rotation={[0.3, 0, -0.3]} scale={0.6}>
        <coneGeometry args={[0.06, 0.1, 4]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>
      <mesh position={[0.1, 0.48, 0.27]} rotation={[0.3, 0, 0.3]} scale={0.6}>
        <coneGeometry args={[0.06, 0.1, 4]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.06, 0.38, 0.4]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[0.06, 0.38, 0.4]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      
      {/* Eye pupils */}
      <mesh position={[-0.06, 0.38, 0.43]}>
        <sphereGeometry args={[0.02, 4, 4]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.06, 0.38, 0.43]}>
        <sphereGeometry args={[0.02, 4, 4]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 0.32, 0.42]}>
        <sphereGeometry args={[0.025, 4, 4]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>
      
      {/* Front Left Leg */}
      <group ref={frontLeftLegRef} position={[-0.12, 0.1, 0.1]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
          <meshStandardMaterial color={catColor} />
        </mesh>
      </group>
      
      {/* Front Right Leg */}
      <group ref={frontRightLegRef} position={[0.12, 0.1, 0.1]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
          <meshStandardMaterial color={catColor} />
        </mesh>
      </group>
      
      {/* Back Left Leg */}
      <group ref={backLeftLegRef} position={[-0.12, 0.1, -0.1]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
          <meshStandardMaterial color={catColor} />
        </mesh>
      </group>
      
      {/* Back Right Leg */}
      <group ref={backRightLegRef} position={[0.12, 0.1, -0.1]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
          <meshStandardMaterial color={catColor} />
        </mesh>
      </group>
      
      {/* Tail */}
      <group ref={tailRef} position={[0, 0.3, -0.25]}>
        <mesh rotation={[0.8, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.4, 6]} />
          <meshStandardMaterial color={catColor} />
        </mesh>
      </group>
      
      {/* Name label when nearby */}
      {isNearby && (
        <group position={[0, 0.7, 0]}>
          {/* Exclamation line */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          {/* Exclamation dot */}
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============ GARDEN ============
function Garden({ position = [10, 0, 6] }) {
  const gardenFlowers = useMemo(() => {
    const items = [];
    // Create garden grid
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.random() > 0.3) {
          items.push({
            pos: [x * 0.6 + (Math.random() - 0.5) * 0.2, 0, z * 0.6 + (Math.random() - 0.5) * 0.2],
            color: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#DB7093', '#FF6B6B', '#9370DB', '#8B5CF6'][Math.floor(Math.random() * 8)],
            height: 0.3 + Math.random() * 0.4,
            type: Math.floor(Math.random() * 3),
          });
        }
      }
    }
    return items;
  }, []);
  
  return (
    <group position={position}>
      {/* Garden fence */}
      {/* Front and back */}
      {[-2.5, 2.5].map((z) => (
        <group key={`fence-fb-${z}`}>
          <mesh position={[0, 0.25, z]}>
            <boxGeometry args={[5.5, 0.5, 0.08]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Fence posts */}
          {[-2.5, -1.25, 0, 1.25, 2.5].map((x) => (
            <mesh key={`post-${x}-${z}`} position={[x, 0.35, z]}>
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial color="#654321" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Sides */}
      {[-2.5, 2.5].map((x) => (
        <group key={`fence-side-${x}`}>
          <mesh position={[x, 0.25, 0]}>
            <boxGeometry args={[0.08, 0.5, 5]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* Garden soil */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.05, 4.8]} />
        <meshStandardMaterial color="#3d2817" roughness={1} />
      </mesh>
      
      {/* Flowers */}
      {gardenFlowers.map((f, i) => (
        <group key={i} position={f.pos}>
          {/* Stem */}
          <mesh position={[0, f.height / 2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, f.height, 4]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {/* Flower head */}
          {f.type === 0 ? (
            // Round flower
            <mesh position={[0, f.height + 0.05, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={f.color} />
            </mesh>
          ) : f.type === 1 ? (
            // Tulip-like
            <mesh position={[0, f.height + 0.05, 0]}>
              <coneGeometry args={[0.06, 0.12, 6]} />
              <meshStandardMaterial color={f.color} />
            </mesh>
          ) : (
            // Multi-petal
            <group position={[0, f.height + 0.05, 0]}>
              {[0, 1, 2, 3, 4].map((p) => (
                <mesh key={p} position={[Math.cos(p * 1.26) * 0.04, 0, Math.sin(p * 1.26) * 0.04]}>
                  <sphereGeometry args={[0.04, 6, 6]} />
                  <meshStandardMaterial color={f.color} />
                </mesh>
              ))}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial color="#FFD700" />
              </mesh>
            </group>
          )}
        </group>
      ))}
      
      {/* Garden sign */}
      <group position={[0, 0, -2.8]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.08, 0.8, 0.08]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.7, 0.05]}>
          <boxGeometry args={[0.8, 0.3, 0.05]} />
          <meshStandardMaterial color="#DEB887" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// ============ SHOOTING STARS ============
function ShootingStars() {
  const [stars, setStars] = useState([]);
  
  useFrame((state, delta) => {
    // Randomly spawn shooting stars - higher chance
    if (Math.random() < 0.008) { // ~0.8% chance per frame
      const newStar = {
        id: Date.now() + Math.random(),
        x: (Math.random() - 0.3) * 80 + 20,
        y: 20 + Math.random() * 20,
        z: -30 - Math.random() * 30,
        vx: -18 - Math.random() * 12,
        vy: -6 - Math.random() * 4,
        life: 2.5,
        tail: [],
      };
      setStars(prev => [...prev, newStar]);
    }
    
    // Update stars
    setStars(prev => prev
      .map(s => {
        // Add current position to tail
        const newTail = [...s.tail, { x: s.x, y: s.y, z: s.z }].slice(-20);
        return {
          ...s,
          x: s.x + s.vx * delta,
          y: s.y + s.vy * delta,
          life: s.life - delta,
          tail: newTail,
        };
      })
      .filter(s => s.life > 0 && s.y > 0)
    );
  });
  
  return (
    <group>
      {stars.map((star) => (
        <group key={star.id}>
          {/* Star head */}
          <mesh position={[star.x, star.y, star.z]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Star glow */}
          <mesh position={[star.x, star.y, star.z]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#FFFFAA" transparent opacity={0.5} />
          </mesh>
          {/* Tail */}
          {star.tail.map((t, i) => (
            <mesh key={i} position={[t.x, t.y, t.z]}>
              <sphereGeometry args={[0.08 * (i / star.tail.length), 4, 4]} />
              <meshBasicMaterial 
                color="#FFFFEE" 
                transparent 
                opacity={0.6 * (i / star.tail.length)} 
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ============ JB POSITION REF (shared for distance checking) ============
const jbCurrentPosition = { x: 0, y: 0, z: -5 };

// Global flag for special abilities
let jbRunToPlayer = false;

// ============ JB CHARACTER (Detailed humanoid style with random behaviors) ============
function JBCharacter({ position, isNearby, isTalking, playerPos, isVisible, resetKey, occupiedLogs, setOccupiedLogs, onSitStateChange }) {
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const lastResetKey = useRef(resetKey);
  
  // Movement and animation state
  const stateRef = useRef({
    currentPos: new THREE.Vector3(position[0], position[1], position[2]),
    targetPos: new THREE.Vector3(position[0], position[1], position[2]),
    moveTimer: 0,
    isMoving: false,
    isWaving: false,
    isJumping: false,
    isRunningToPlayer: false,
    waveTimer: 0,
    jumpTimer: 0,
    verticalVelocity: 0,
    walkCycle: 0,
    randomActionTimer: Math.random() * 3 + 2,
    facing: 0, // rotation Y
    isSitting: false,
    isWalkingToLog: false,
    targetLogId: null,
    sitTimer: Math.random() * 5 + 3, // Random time before first sit/stand
  });
  
  const shirtColor = '#2D8B2D';
  const pantsColor = '#2c3e50';
  const skinColor = '#ffdbac';
  const hairColor = '#8B4513';
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Check if we need to reset position (character switched)
    if (resetKey !== lastResetKey.current) {
      lastResetKey.current = resetKey;
      const s = stateRef.current;
      s.currentPos.set(position[0], position[1], position[2]);
      s.targetPos.set(position[0], position[1], position[2]);
      s.isMoving = false;
      s.isRunningToPlayer = false;
      s.isSitting = false;
      s.isWalkingToLog = false;
      s.targetLogId = null;
      s.moveTimer = 0;
      jbCurrentPosition.x = position[0];
      jbCurrentPosition.y = position[1];
      jbCurrentPosition.z = position[2];
      groupRef.current.position.set(position[0], position[1], position[2]);
      // Clear occupied log
      if (setOccupiedLogs) {
        setOccupiedLogs(prev => prev.filter(id => !id.startsWith('jb-')));
      }
    }
    
    // Don't run AI if not visible (player is controlling this character)
    if (!isVisible) return;
    
    const s = stateRef.current;
    
    // Sit/stand timer for campfire - JB always uses their assigned log
    s.sitTimer -= delta;
    if (s.sitTimer <= 0 && !s.isRunningToPlayer && !isNearby && !s.isWalkingToLog) {
      if (s.isSitting) {
        // Stand up - wait 15-20 seconds before sitting again
        s.isSitting = false;
        s.sitTimer = 15 + Math.random() * 5; // 15-20 seconds before sitting again
        if (onSitStateChange) onSitStateChange('jb', false);
      } else {
        // Walk to JB's assigned log (left log) - will sit for 15-35 seconds
        s.isWalkingToLog = true;
        const logPos = campfireLogPositions.jb;
        s.targetPos.set(logPos.x, 0, logPos.z);
        s.isMoving = true;
        s.sitTimer = 15 + Math.random() * 20; // 15-35 seconds sitting
      }
    }
    
    // Check if we should run to player (whistle ability)
    if (jbRunToPlayer && playerPos) {
      s.isRunningToPlayer = true;
      s.isSitting = false;
      s.isWalkingToLog = false;
      if (s.targetLogId && setOccupiedLogs) {
        setOccupiedLogs(prev => prev.filter(id => id !== 'jb-' + s.targetLogId));
      }
      s.targetLogId = null;
      s.targetPos.set(playerPos[0], 0, playerPos[2]);
      s.isMoving = true;
      jbRunToPlayer = false;
      if (onSitStateChange) onSitStateChange('jb', false);
    }
    
    // === RUNNING TO PLAYER (fast!) ===
    if (s.isRunningToPlayer && playerPos) {
      const direction = new THREE.Vector3().subVectors(
        new THREE.Vector3(playerPos[0], 0, playerPos[2]), 
        s.currentPos
      );
      const distance = direction.length();
      
      if (distance > 1.5) {
        direction.normalize();
        const speed = 6;
        s.currentPos.x += direction.x * speed * delta;
        s.currentPos.z += direction.z * speed * delta;
        s.facing = Math.atan2(direction.x, direction.z);
        s.walkCycle += delta * 15;
        s.isMoving = true;
      } else {
        s.isRunningToPlayer = false;
        s.isMoving = false;
        s.walkCycle = 0;
        s.isWaving = true;
        s.waveTimer = 2;
      }
    }
    // === WALKING TO LOG ===
    else if (s.isWalkingToLog) {
      const logPos = campfireLogPositions.jb;
      const direction = new THREE.Vector3(logPos.x - s.currentPos.x, 0, logPos.z - s.currentPos.z);
      const distance = direction.length();
      
      if (distance > 0.3) {
        direction.normalize();
        const speed = 2;
        s.currentPos.x += direction.x * speed * delta;
        s.currentPos.z += direction.z * speed * delta;
        s.facing = Math.atan2(direction.x, direction.z);
        s.walkCycle += delta * 8;
        s.isMoving = true;
      } else {
        // Arrived at log, sit down
        s.isWalkingToLog = false;
        s.isSitting = true;
        s.isMoving = false;
        s.currentPos.set(logPos.x, 0, logPos.z);
        s.facing = logPos.facing;
        if (onSitStateChange) onSitStateChange('jb', true);
      }
    }
    // === SITTING AT CAMPFIRE ===
    else if (s.isSitting) {
      const logPos = campfireLogPositions.jb;
      s.currentPos.set(logPos.x, 0, logPos.z);
      s.facing = logPos.facing;
      s.isMoving = false;
    }
    // === RANDOM MOVEMENT (AI mode) ===
    else {
      s.moveTimer -= delta;
      if (s.moveTimer <= 0 && !isNearby) {
        // Pick new random target position (within bounds around starting point)
        const baseX = position[0];
        const baseZ = position[2];
        s.targetPos.set(
          baseX + (Math.random() - 0.5) * 8,
          0,
          baseZ + (Math.random() - 0.5) * 8
        );
        s.moveTimer = 3 + Math.random() * 4; // Wait 3-7 seconds before next move
        s.isMoving = true;
      }
    }
    
    // Move towards target (normal speed)
    if (s.isMoving && !isNearby && !s.isRunningToPlayer) {
      const direction = new THREE.Vector3().subVectors(s.targetPos, s.currentPos);
      const distance = direction.length();
      
      if (distance > 0.1) {
        direction.normalize();
        const speed = 1.5;
        s.currentPos.x += direction.x * speed * delta;
        s.currentPos.z += direction.z * speed * delta;
        
        // Face movement direction
        s.facing = Math.atan2(direction.x, direction.z);
        
        // Walking animation
        s.walkCycle += delta * 8;
      } else {
        s.isMoving = false;
        s.walkCycle = 0;
      }
    } else if (isNearby) {
      // Face player when nearby
      if (playerPos) {
        const dx = playerPos[0] - s.currentPos.x;
        const dz = playerPos[2] - s.currentPos.z;
        s.facing = Math.atan2(dx, dz);
      }
      s.isMoving = false;
      s.walkCycle = 0;
    }
    
    // === JUMPING PHYSICS ===
    if (s.isJumping) {
      s.verticalVelocity -= 15 * delta; // gravity
      s.currentPos.y += s.verticalVelocity * delta;
      
      if (s.currentPos.y <= 0) {
        s.currentPos.y = 0;
        s.isJumping = false;
        s.verticalVelocity = 0;
      }
    }
    
    // Update global position for distance checking
    jbCurrentPosition.x = s.currentPos.x;
    jbCurrentPosition.y = s.currentPos.y;
    jbCurrentPosition.z = s.currentPos.z;
    
    // === RANDOM ACTIONS (wave and jump) - only when not sitting ===
    if (!s.isSitting) {
      s.randomActionTimer -= delta;
      if (s.randomActionTimer <= 0 && !s.isWaving && !s.isJumping && !isNearby) {
        const action = Math.random();
        if (action < 0.4) {
          // Start waving
          s.isWaving = true;
          s.waveTimer = 1.5 + Math.random();
        } else if (action < 0.6) {
          // Start jumping
          s.isJumping = true;
          s.verticalVelocity = 5; // Jump force
        }
        s.randomActionTimer = 3 + Math.random() * 5;
      }
    }
    
    // Wave animation timer
    if (s.isWaving) {
      s.waveTimer -= delta;
      if (s.waveTimer <= 0) {
        s.isWaving = false;
      }
    }
    
    // === APPLY TRANSFORMS ===
    let yPosition = s.currentPos.y;
    
    if (s.isSitting) {
      // Sitting position - lower the character to sit on log
      yPosition = -0.15;
      groupRef.current.position.set(s.currentPos.x, yPosition, s.currentPos.z);
      groupRef.current.rotation.y = s.facing;
    } else {
      if (!s.isJumping) {
        if (s.isMoving) {
          // Walking bob - smaller bounce while moving
          yPosition += Math.abs(Math.sin(Date.now() * 0.005)) * 0.05;
        } else {
          // Gentle idle breathing
          yPosition += Math.sin(state.clock.elapsedTime * 2) * 0.02;
        }
      }
      
      groupRef.current.position.set(
        s.currentPos.x,
        yPosition,
        s.currentPos.z
      );
      groupRef.current.rotation.y = s.facing;
    }
    
    // === LEG ANIMATIONS (walking, jumping, and sitting) ===
    if (leftLegRef.current && rightLegRef.current) {
      if (s.isSitting) {
        // Legs bent forward when sitting on log
        leftLegRef.current.rotation.x = -1.2;
        rightLegRef.current.rotation.x = -1.2;
      } else if (s.isJumping) {
        // Legs tucked during jump
        leftLegRef.current.rotation.x = -0.3;
        rightLegRef.current.rotation.x = -0.3;
      } else if (s.isMoving) {
        leftLegRef.current.rotation.x = Math.sin(s.walkCycle) * 0.5;
        rightLegRef.current.rotation.x = Math.sin(s.walkCycle + Math.PI) * 0.5;
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }
    
    // === ARM ANIMATIONS ===
    if (rightArmRef.current) {
      if (s.isSitting) {
        // Arms relaxed on knees when sitting
        rightArmRef.current.rotation.x = -0.8;
        rightArmRef.current.rotation.z = -0.3;
      } else if (isNearby || s.isWaving) {
        // Wave animation - arm goes UP and waves side to side
        rightArmRef.current.rotation.x = -Math.PI * 0.8; // Arm raised up
        rightArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.4; // Wave side to side
      } else if (s.isMoving) {
        // Walking arm swing
        rightArmRef.current.rotation.x = Math.sin(s.walkCycle + Math.PI) * 0.6;
        rightArmRef.current.rotation.z = -0.2;
      } else {
        // Idle position
        rightArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.z = -0.2;
      }
    }
    
    if (leftArmRef.current) {
      if (s.isSitting) {
        // Arms relaxed on knees when sitting
        leftArmRef.current.rotation.x = -0.8;
        leftArmRef.current.rotation.z = 0.3;
      } else if (s.isMoving) {
        // Walking arm swing
        leftArmRef.current.rotation.x = Math.sin(s.walkCycle) * 0.6;
        leftArmRef.current.rotation.z = 0.2;
      } else {
        // Idle - slight movement
        leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        leftArmRef.current.rotation.z = 0.2;
      }
    }
  });

  // Don't render if not visible (player is this character)
  if (!isVisible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* === TORSO (cylinder, tapered) === */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.8, 8]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      
      {/* === LEFT ARM === */}
      <group ref={leftArmRef} position={[-0.38, 0.9, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 6]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        {/* Left hand */}
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* === RIGHT ARM === */}
      <group ref={rightArmRef} position={[0.38, 0.9, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 6]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        {/* Right hand */}
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* === LEFT LEG === */}
      <group ref={leftLegRef} position={[-0.12, 0.2, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* Left foot */}
        <mesh position={[0, -0.55, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* === RIGHT LEG === */}
      <group ref={rightLegRef} position={[0.12, 0.2, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* Right foot */}
        <mesh position={[0, -0.55, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* === HEAD (sphere) === */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* === HAIR (flattened sphere on top) === */}
      <mesh position={[0, 1.35, 0]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.27, 8, 6]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      
      {/* === EYES (small black spheres) === */}
      <mesh position={[-0.08, 1.25, 0.22]}>
        <sphereGeometry args={[0.03, 4, 4]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.08, 1.25, 0.22]}>
        <sphereGeometry args={[0.03, 4, 4]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* === EXCLAMATION MARK (floating above when nearby) === */}
      {isNearby && (
        <group position={[0, 1.9, 0]}>
          {/* Exclamation line */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          {/* Exclamation dot */}
          <mesh position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============ BEA POSITION REF (shared for distance checking) ============
const beaCurrentPosition = { x: 5, y: 0, z: 0 };

// ============ BEA CHARACTER (Purple girl) ============
function BeaCharacter({ position, isNearby, isTalking, playerPos, isVisible, resetKey, occupiedLogs, setOccupiedLogs, onSitStateChange }) {
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const lastResetKey = useRef(resetKey);
  
  // Movement and animation state
  const stateRef = useRef({
    currentPos: new THREE.Vector3(position[0], position[1], position[2]),
    targetPos: new THREE.Vector3(position[0], position[1], position[2]),
    moveTimer: Math.random() * 2,
    isMoving: false,
    isWaving: false,
    isJumping: false,
    waveTimer: 0,
    verticalVelocity: 0,
    walkCycle: 0,
    randomActionTimer: Math.random() * 3 + 2,
    facing: 0,
    isSitting: false,
    isWalkingToLog: false,
    targetLogId: null,
    sitTimer: Math.random() * 5 + 3,
  });
  
  const shirtColor = '#8B5CF6'; // Purple shirt
  const pantsColor = '#4C1D95'; // Dark purple pants
  const skinColor = '#ffdbac';
  const hairColor = '#1a1a1a'; // Black hair
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Check if we need to reset position (character switched)
    if (resetKey !== lastResetKey.current) {
      lastResetKey.current = resetKey;
      const s = stateRef.current;
      s.currentPos.set(position[0], position[1], position[2]);
      s.targetPos.set(position[0], position[1], position[2]);
      s.isMoving = false;
      s.isSitting = false;
      s.isWalkingToLog = false;
      s.moveTimer = 0;
      beaCurrentPosition.x = position[0];
      beaCurrentPosition.y = position[1];
      beaCurrentPosition.z = position[2];
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
    
    // Don't run AI if not visible
    if (!isVisible) return;
    
    const s = stateRef.current;
    
    // Sit/stand timer for campfire - Bea always uses their assigned log
    s.sitTimer -= delta;
    if (s.sitTimer <= 0 && !isNearby && !s.isWalkingToLog) {
      if (s.isSitting) {
        // Stand up - wait 15-20 seconds before sitting again
        s.isSitting = false;
        s.sitTimer = 15 + Math.random() * 5; // 15-20 seconds before sitting again
        if (onSitStateChange) onSitStateChange('bea', false);
      } else {
        // Walk to Bea's assigned log (right log) - will sit for 15-35 seconds
        s.isWalkingToLog = true;
        const logPos = campfireLogPositions.bea;
        s.targetPos.set(logPos.x, 0, logPos.z);
        s.isMoving = true;
        s.sitTimer = 15 + Math.random() * 20; // 15-35 seconds sitting
      }
    }
    
    // === WALKING TO LOG ===
    if (s.isWalkingToLog) {
      const logPos = campfireLogPositions.bea;
      const direction = new THREE.Vector3(logPos.x - s.currentPos.x, 0, logPos.z - s.currentPos.z);
      const distance = direction.length();
      
      if (distance > 0.3) {
        direction.normalize();
        const speed = 2;
        s.currentPos.x += direction.x * speed * delta;
        s.currentPos.z += direction.z * speed * delta;
        s.facing = Math.atan2(direction.x, direction.z);
        s.walkCycle += delta * 8;
        s.isMoving = true;
      } else {
        // Arrived at log, sit down
        s.isWalkingToLog = false;
        s.isSitting = true;
        s.isMoving = false;
        s.currentPos.set(logPos.x, 0, logPos.z);
        s.facing = logPos.facing;
        if (onSitStateChange) onSitStateChange('bea', true);
      }
    }
    // === SITTING AT CAMPFIRE ===
    else if (s.isSitting) {
      const logPos = campfireLogPositions.bea;
      s.currentPos.set(logPos.x, 0, logPos.z);
      s.facing = logPos.facing;
      s.isMoving = false;
    }
    // === AI MOVEMENT ===
    else {
      s.moveTimer -= delta;
      if (s.moveTimer <= 0 && !isNearby) {
        const baseX = position[0];
        const baseZ = position[2];
        s.targetPos.set(
          baseX + (Math.random() - 0.5) * 8,
          0,
          baseZ + (Math.random() - 0.5) * 8
        );
        s.moveTimer = 3 + Math.random() * 4;
        s.isMoving = true;
      }
    }
    
    if (s.isMoving && !isNearby && !s.isWalkingToLog) {
      const direction = new THREE.Vector3().subVectors(s.targetPos, s.currentPos);
      const distance = direction.length();
      
      if (distance > 0.1) {
        direction.normalize();
        const speed = 1.5;
        s.currentPos.x += direction.x * speed * delta;
        s.currentPos.z += direction.z * speed * delta;
        s.facing = Math.atan2(direction.x, direction.z);
        s.walkCycle += delta * 8;
      } else {
        s.isMoving = false;
        s.walkCycle = 0;
      }
    } else if (isNearby) {
      if (playerPos) {
        const dx = playerPos[0] - s.currentPos.x;
        const dz = playerPos[2] - s.currentPos.z;
        s.facing = Math.atan2(dx, dz);
      }
      s.isMoving = false;
      s.walkCycle = 0;
    }
    
    // Jumping physics
    if (s.isJumping) {
      s.verticalVelocity -= 15 * delta;
      s.currentPos.y += s.verticalVelocity * delta;
      if (s.currentPos.y <= 0) {
        s.currentPos.y = 0;
        s.isJumping = false;
        s.verticalVelocity = 0;
      }
    }
    
    beaCurrentPosition.x = s.currentPos.x;
    beaCurrentPosition.y = s.currentPos.y;
    beaCurrentPosition.z = s.currentPos.z;
    
    // Random actions
    s.randomActionTimer -= delta;
    // Random actions - only when not sitting
    if (!s.isSitting) {
      if (s.randomActionTimer <= 0 && !s.isWaving && !s.isJumping && !isNearby) {
        const action = Math.random();
        if (action < 0.4) {
          s.isWaving = true;
          s.waveTimer = 1.5 + Math.random();
        } else if (action < 0.6) {
          s.isJumping = true;
          s.verticalVelocity = 5;
        }
        s.randomActionTimer = 3 + Math.random() * 5;
      }
    }
    
    if (s.isWaving) {
      s.waveTimer -= delta;
      if (s.waveTimer <= 0) s.isWaving = false;
    }
    
    let yPosition = s.currentPos.y;
    
    if (s.isSitting) {
      // Sitting position - lower the character to sit on log
      yPosition = -0.15;
      groupRef.current.position.set(s.currentPos.x, yPosition, s.currentPos.z);
      groupRef.current.rotation.y = s.facing;
    } else {
      if (!s.isJumping) {
        if (s.isMoving) {
          yPosition += Math.abs(Math.sin(Date.now() * 0.005)) * 0.05;
        } else {
          yPosition += Math.sin(state.clock.elapsedTime * 2) * 0.02;
        }
      }
      
      groupRef.current.position.set(s.currentPos.x, yPosition, s.currentPos.z);
      groupRef.current.rotation.y = s.facing;
    }
    
    // Leg animations
    if (leftLegRef.current && rightLegRef.current) {
      if (s.isSitting) {
        // Legs bent forward when sitting on log
        leftLegRef.current.rotation.x = -1.2;
        rightLegRef.current.rotation.x = -1.2;
      } else if (s.isJumping) {
        leftLegRef.current.rotation.x = -0.3;
        rightLegRef.current.rotation.x = -0.3;
      } else if (s.isMoving) {
        leftLegRef.current.rotation.x = Math.sin(s.walkCycle) * 0.5;
        rightLegRef.current.rotation.x = Math.sin(s.walkCycle + Math.PI) * 0.5;
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }
    
    // Arm animations
    if (rightArmRef.current) {
      if (s.isSitting) {
        // Arms relaxed on knees when sitting
        rightArmRef.current.rotation.x = -0.8;
        rightArmRef.current.rotation.z = -0.3;
      } else if (isNearby || s.isWaving) {
        rightArmRef.current.rotation.x = -Math.PI * 0.8;
        rightArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.4;
      } else if (s.isMoving) {
        rightArmRef.current.rotation.x = Math.sin(s.walkCycle + Math.PI) * 0.6;
        rightArmRef.current.rotation.z = -0.2;
      } else {
        rightArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.z = -0.2;
      }
    }
    
    if (leftArmRef.current) {
      if (s.isSitting) {
        // Arms relaxed on knees when sitting
        leftArmRef.current.rotation.x = -0.8;
        leftArmRef.current.rotation.z = 0.3;
      } else if (s.isMoving) {
        leftArmRef.current.rotation.x = Math.sin(s.walkCycle) * 0.6;
        leftArmRef.current.rotation.z = 0.2;
      } else {
        leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        leftArmRef.current.rotation.z = 0.2;
      }
    }
  });

  // Don't render if not visible (player is this character)
  if (!isVisible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* TORSO - lowered to connect with legs */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.7, 8]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      
      {/* HIPS - connects torso to legs */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.2, 8]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      
      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.35, 0.85, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.45, 6]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* RIGHT ARM */}
      <group ref={rightArmRef} position={[0.35, 0.85, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.45, 6]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* LEFT LEG - raised to connect with hips */}
      <group ref={leftLegRef} position={[-0.12, 0.15, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.5, 6]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.45, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* RIGHT LEG - raised to connect with hips */}
      <group ref={rightLegRef} position={[0.12, 0.15, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.5, 6]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.45, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* HEAD */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* HAIR - longer, black */}
      <mesh position={[0, 1.3, 0]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.27, 8, 6]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      {/* Hair sides (longer) */}
      <mesh position={[-0.2, 1.1, 0]} scale={[0.4, 1.2, 0.4]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      <mesh position={[0.2, 1.1, 0]} scale={[0.4, 1.2, 0.4]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      
      {/* EYES */}
      <mesh position={[-0.08, 1.2, 0.22]}>
        <sphereGeometry args={[0.03, 4, 4]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.08, 1.2, 0.22]}>
        <sphereGeometry args={[0.03, 4, 4]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* EXCLAMATION MARK (floating above when nearby) */}
      {isNearby && (
        <group position={[0, 1.8, 0]}>
          {/* Exclamation line */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          {/* Exclamation dot */}
          <mesh position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============ PLAYER CONTROLLER WITH MOUSE LOOK AND JUMPING ============
function PlayerController({ setPlayerPos, setIsNearOther, setIsNearBench, keys, mouseMovement, isPointerLocked, currentCharacter, setPlayerYaw, resetKey, isPlayerSitting, setIsPlayerSitting, playerSittingPos, setOccupiedLogs, playerSittingLogId, setPlayerSittingLogId, isMobile }) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const lastResetKey = useRef(resetKey);
  
  // Starting positions for each character
  const startPositions = {
    bea: new THREE.Vector3(0, 1.6, 5),
    jb: new THREE.Vector3(5, 1.6, 3)
  };
  
  const playerPos = useRef(startPositions[currentCharacter].clone());
  
  // Jumping physics
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);
  const groundHeight = 1.6; // Eye level when standing
  const sittingHeight = 1.0; // Lower eye level when sitting
  const jumpForce = 8;
  const gravity = 20;
  
  const interactionDistance = 2.5; // Reduced for tighter interaction radius
  
  useFrame((state, delta) => {
    // Check if we need to reset position (character switched)
    if (resetKey !== lastResetKey.current) {
      lastResetKey.current = resetKey;
      playerPos.current.copy(startPositions[currentCharacter]);
      yaw.current = 0;
      pitch.current = 0;
      verticalVelocity.current = 0;
      isGrounded.current = true;
      // Clear player's occupied log when switching
      if (setOccupiedLogs && playerSittingLogId) {
        setOccupiedLogs(prev => prev.filter(id => !id.startsWith('player-')));
      }
      if (setPlayerSittingLogId) setPlayerSittingLogId(null);
      if (setIsPlayerSitting) setIsPlayerSitting(false);
    }
    
    // Handle sitting - lock position, only allow looking around
    if (isPlayerSitting && playerSittingPos) {
      // Lock position to sitting spot
      playerPos.current.x = playerSittingPos.x;
      playerPos.current.y = sittingHeight;
      playerPos.current.z = playerSittingPos.z;
      
      // Stand up with Space key
      if (keys.current.jump && setIsPlayerSitting) {
        setIsPlayerSitting(false);
        playerPos.current.y = groundHeight;
        // Clear the occupied log
        if (setOccupiedLogs && playerSittingLogId) {
          setOccupiedLogs(prev => prev.filter(id => id !== 'player-' + playerSittingLogId));
        }
        if (setPlayerSittingLogId) setPlayerSittingLogId(null);
      }
      
      // Still allow mouse look
      if ((isPointerLocked.current || isMobile) && mouseMovement.current) {
        const sensitivity = isMobile ? 0.004 : 0.002;
        yaw.current -= mouseMovement.current.x * sensitivity;
        pitch.current -= mouseMovement.current.y * sensitivity;
        pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current));
        mouseMovement.current = { x: 0, y: 0 };
      }
      
      // Arrow keys for looking
      if (keys.current.lookLeft) yaw.current += 2 * delta;
      if (keys.current.lookRight) yaw.current -= 2 * delta;
      
      // Update camera position and rotation
      camera.position.copy(playerPos.current);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;
      
      setPlayerPos([playerPos.current.x, playerPos.current.y, playerPos.current.z, yaw.current]);
      if (setPlayerYaw) setPlayerYaw(yaw.current);
      
      return; // Skip normal movement
    }
    
    // Normal movement when not sitting
    direction.current.set(0, 0, 0);
    
    if (keys.current.forward) direction.current.z -= 1;
    if (keys.current.backward) direction.current.z += 1;
    if (keys.current.left) direction.current.x -= 1;
    if (keys.current.right) direction.current.x += 1;
    
    direction.current.normalize();
    
    // Apply yaw rotation to movement direction
    const rotatedDirection = direction.current.clone();
    rotatedDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    
    // Update velocity
    const speed = 5;
    velocity.current.x = rotatedDirection.x * speed;
    velocity.current.z = rotatedDirection.z * speed;
    
    // === JUMPING PHYSICS ===
    // Apply jump if grounded and space is pressed
    if (keys.current.jump && isGrounded.current) {
      verticalVelocity.current = jumpForce;
      isGrounded.current = false;
    }
    
    // Apply gravity
    if (!isGrounded.current) {
      verticalVelocity.current -= gravity * delta;
    }
    
    // Update Y position
    playerPos.current.y += verticalVelocity.current * delta;
    
    // Check if landed
    if (playerPos.current.y <= groundHeight) {
      playerPos.current.y = groundHeight;
      verticalVelocity.current = 0;
      isGrounded.current = true;
    }
    
    // Update X/Z position
    playerPos.current.x += velocity.current.x * delta;
    playerPos.current.z += velocity.current.z * delta;
    
    // Clamp position to bounds (inside the mountain ring)
    playerPos.current.x = Math.max(-35, Math.min(35, playerPos.current.x));
    playerPos.current.z = Math.max(-35, Math.min(35, playerPos.current.z));
    
    // Mouse look (when pointer is locked OR on mobile with touch)
    if ((isPointerLocked.current || isMobile) && mouseMovement.current) {
      const sensitivity = isMobile ? 0.004 : 0.002;
      yaw.current -= mouseMovement.current.x * sensitivity;
      pitch.current -= mouseMovement.current.y * sensitivity;
      
      // Clamp pitch to prevent flipping
      pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current));
      
      // Reset mouse movement after applying
      mouseMovement.current = { x: 0, y: 0 };
    }
    
    // Fallback: Arrow keys for looking (mobile/no pointer lock)
    if (keys.current.lookLeft) yaw.current += 2 * delta;
    if (keys.current.lookRight) yaw.current -= 2 * delta;
    
    // Update camera
    camera.position.copy(playerPos.current);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    
    // Update state for UI (include yaw for character facing)
    setPlayerPos([playerPos.current.x, playerPos.current.y, playerPos.current.z, yaw.current]);
    if (setPlayerYaw) setPlayerYaw(yaw.current);
    
    // Check distance to the OTHER character (the one we're not controlling)
    const otherPos = currentCharacter === 'bea' 
      ? new THREE.Vector3(jbCurrentPosition.x, jbCurrentPosition.y, jbCurrentPosition.z)
      : new THREE.Vector3(beaCurrentPosition.x, beaCurrentPosition.y, beaCurrentPosition.z);
    const distanceToOther = playerPos.current.distanceTo(otherPos);
    
    // Check distance to Choco
    const chocoPos = new THREE.Vector3(chocoCurrentPosition.x, chocoCurrentPosition.y, chocoCurrentPosition.z);
    const distanceToChoco = playerPos.current.distanceTo(chocoPos);
    
    // Check distance to campfire center (campfire at [-6, 0, 2])
    const campfireCenter = new THREE.Vector3(-6, 0, 2);
    const distanceToCampfire = playerPos.current.distanceTo(campfireCenter);
    if (setIsNearBench) {
      setIsNearBench(distanceToCampfire < 4); // Larger radius to reach all 3 logs
    }
    
    // Return which character is nearby (if any)
    if (distanceToOther < interactionDistance) {
      setIsNearOther({ isNear: true, target: currentCharacter === 'bea' ? 'jb' : 'bea' });
    } else if (distanceToChoco < interactionDistance) {
      setIsNearOther({ isNear: true, target: 'choco' });
    } else {
      setIsNearOther({ isNear: false, target: null });
    }
  });
  
  return null;
}

// ============ HEART FIREWORKS ============
// Global state for fireworks
let heartFireworksActive = false;
let heartFireworksPosition = { x: 0, y: 0, z: 0 };

function HeartFireworks() {
  const [particles, setParticles] = useState([]);
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (heartFireworksActive) {
      // Create 5 firework bursts
      const newParticles = [];
      for (let burst = 0; burst < 5; burst++) {
        const delay = burst * 0.3;
        const baseX = heartFireworksPosition.x + (Math.random() - 0.5) * 3;
        const baseZ = heartFireworksPosition.z + (Math.random() - 0.5) * 3;
        const baseY = 2 + Math.random() * 2;
        
        // Create hearts for each burst
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          newParticles.push({
            id: Date.now() + burst * 100 + i,
            x: baseX,
            y: baseY,
            z: baseZ,
            vx: Math.cos(angle) * 2,
            vy: 3 + Math.random() * 2,
            vz: Math.sin(angle) * 2,
            life: 3 + delay,
            delay: delay,
            scale: 0.15 + Math.random() * 0.1,
          });
        }
      }
      setParticles(newParticles);
      heartFireworksActive = false;
    }
    
    // Update particles
    if (particles.length > 0) {
      setParticles(prev => prev
        .map(p => {
          if (p.delay > 0) {
            return { ...p, delay: p.delay - delta };
          }
          return {
            ...p,
            x: p.x + p.vx * delta,
            y: p.y + p.vy * delta,
            z: p.z + p.vz * delta,
            vy: p.vy - 5 * delta, // gravity
            life: p.life - delta,
          };
        })
        .filter(p => p.life > 0)
      );
    }
  });
  
  return (
    <group ref={groupRef}>
      {particles.filter(p => p.delay <= 0).map(p => (
        <mesh key={p.id} position={[p.x, p.y, p.z]} scale={p.scale}>
          {/* Heart shape using spheres */}
          <group>
            <mesh position={[-0.3, 0, 0]}>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial color="#9333EA" transparent opacity={Math.min(1, p.life)} />
            </mesh>
            <mesh position={[0.3, 0, 0]}>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial color="#9333EA" transparent opacity={Math.min(1, p.life)} />
            </mesh>
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.7, 0.7, 0.5]} />
              <meshBasicMaterial color="#9333EA" transparent opacity={Math.min(1, p.life)} />
            </mesh>
          </group>
        </mesh>
      ))}
    </group>
  );
}

// ============ MAIN SCENE ============
function ParadiseScene({ 
  setPlayerPos, 
  setIsNearOther, 
  isNearOther, 
  isTalking, 
  keys, 
  mouseMovement, 
  isPointerLocked, 
  playerPos,
  currentCharacter,
  setPlayerYaw,
  resetKey,
  dialogueText,
  chatTarget,
  isPlayerSitting,
  setIsPlayerSitting,
  setIsNearBench,
  isNearBench,
  occupiedLogs,
  setOccupiedLogs,
  playerSittingLogId,
  setPlayerSittingLogId,
  onSitStateChange,
  jbIsSitting,
  beaIsSitting,
  isMobile
}) {
  // Player always sits on their assigned log (back log)
  const playerSittingPos = campfireLogPositions.player;
  
  // Check if both player and AI character are sitting at campfire
  const bothSittingAtCampfire = isPlayerSitting && (currentCharacter === 'bea' ? jbIsSitting : beaIsSitting);
  
  return (
    <>
      <ambientLight intensity={0.4} color="#FFF5E6" />
      <directionalLight position={[10, 20, 10]} intensity={0.8} color="#FFA07A" castShadow />
      <hemisphereLight args={['#87CEEB', '#4a7c3f', 0.3]} />
      <fog attach="fog" args={['#FFB366', 40, 100]} />
      
      <Ground />
      <Flowers />
      <Trees />
      <Mountains />
      <BoulderRing />
      <Sun />
      <Clouds />
      <HeartFireworks />
      <NightStars />
      
      {/* Furniture elements */}
      <Campfire position={[-6, 0, 2]} />
      <SittingLogs 
        campfirePos={[-6, 0, 2]}
        isNearCampfire={isNearBench}
        isPlayerSitting={isPlayerSitting}
        onPlayerSit={() => setIsPlayerSitting(true)}
      />
      <Garden position={[10, 0, 6]} />
      <ShootingStars />
      
      {/* JB - visible only when Bea is playing */}
      <JBCharacter 
        position={[-4, 0, 4]} 
        isNearby={isNearOther.isNear && isNearOther.target === 'jb'} 
        isTalking={isTalking && chatTarget === 'jb'} 
        playerPos={playerPos}
        isVisible={currentCharacter === 'bea'}
        resetKey={resetKey}
        occupiedLogs={occupiedLogs}
        setOccupiedLogs={setOccupiedLogs}
        onSitStateChange={onSitStateChange}
      />
      
      {/* Bea - visible only when JB is playing */}
      <BeaCharacter 
        position={[-8, 0, 4]} 
        isNearby={isNearOther.isNear && isNearOther.target === 'bea'} 
        isTalking={isTalking && chatTarget === 'bea'} 
        playerPos={playerPos}
        isVisible={currentCharacter === 'jb'}
        resetKey={resetKey}
        occupiedLogs={occupiedLogs}
        setOccupiedLogs={setOccupiedLogs}
        onSitStateChange={onSitStateChange}
      />
      
      {/* Choco the cat - always visible, near the campfire */}
      <ChocoCat 
        position={[-5, 0, 5]} 
        isNearby={isNearOther.isNear && isNearOther.target === 'choco'}
        playerPos={playerPos}
        bothSittingAtCampfire={bothSittingAtCampfire}
        currentCharacter={currentCharacter}
      />
      
      <PlayerController 
        setPlayerPos={setPlayerPos}
        setIsNearOther={setIsNearOther}
        setIsNearBench={setIsNearBench}
        keys={keys}
        mouseMovement={mouseMovement}
        isPointerLocked={isPointerLocked}
        currentCharacter={currentCharacter}
        setPlayerYaw={setPlayerYaw}
        resetKey={resetKey}
        isPlayerSitting={isPlayerSitting}
        setIsPlayerSitting={setIsPlayerSitting}
        playerSittingPos={playerSittingPos}
        setOccupiedLogs={setOccupiedLogs}
        playerSittingLogId={playerSittingLogId}
        setPlayerSittingLogId={setPlayerSittingLogId}
        isMobile={isMobile}
      />
    </>
  );
}

// ============ CHAT BOX ============
function ChatBox({ isOpen, messages, onSendMessage, onClose, chatPartnerName, chatPartnerColor }) {
  if (!isOpen) return null;
  
  // Get the last message from the partner
  const lastPartnerMsg = messages.filter(m => m.sender === 'jb' || m.sender === 'bea' || m.sender === 'choco').pop();
  
  const chatOptions = [
    { label: "👋 Say Hi!", category: "greetings" },
    { label: "😄 Something funny", category: "funny" },
    { label: "💕 Compliment", category: "compliments" },
    { label: "❤️ Say I love you", category: "love" },
  ];
  
  return (
    <>
      {/* Speech Bubble - appears near top of screen */}
      {lastPartnerMsg && (
        <motion.div
          key={lastPartnerMsg.text}
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-24 left-1/2 transform -translate-x-1/2 pointer-events-none"
          style={{ zIndex: 100 }}
        >
          <div 
            className="relative px-6 py-4 rounded-2xl max-w-sm"
            style={{ 
              backgroundColor: chatPartnerColor,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div className="text-white text-center">
              <span className="font-bold text-sm block mb-1">{chatPartnerName}</span>
              <span className="text-base">{lastPartnerMsg.text}</span>
            </div>
            {/* Speech bubble tail */}
            <div 
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: `12px solid ${chatPartnerColor}`,
              }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Chat Options - at bottom of screen */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 pointer-events-auto"
        style={{ zIndex: 100 }}
      >
        <div className="rounded-2xl p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="text-center text-white/70 text-sm mb-3">
            Talking to <span className="font-bold" style={{ color: chatPartnerColor }}>{chatPartnerName}</span>
          </div>
          
          {/* Option buttons in grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {chatOptions.map((option, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(option.label, option.category)}
                className="px-4 py-3 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 active:scale-95"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Goodbye button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: 'rgba(239,68,68,0.6)',
              border: '1px solid rgba(239,68,68,0.8)'
            }}
          >
            👋 Goodbye!
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ============ MOBILE CONTROLS ============
function MobileControls({ keys, onJump }) {
  const handleTouchStart = (key) => { keys.current[key] = true; };
  const handleTouchEnd = (key) => { keys.current[key] = false; };
  
  const buttonStyle = {
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    userSelect: 'none',
    touchAction: 'none',
  };
  
  const jumpButtonStyle = {
    ...buttonStyle,
    width: '50px',
    height: '50px',
    background: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    fontWeight: 'bold',
  };
  
  return (
    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end pointer-events-auto md:hidden" style={{ zIndex: 50 }}>
      {/* Movement D-pad */}
      <div className="flex flex-col items-center gap-1">
        <button style={buttonStyle} onTouchStart={() => handleTouchStart('forward')} onTouchEnd={() => handleTouchEnd('forward')}>▲</button>
        <div className="flex gap-1">
          <button style={buttonStyle} onTouchStart={() => handleTouchStart('left')} onTouchEnd={() => handleTouchEnd('left')}>◀</button>
          <button style={buttonStyle} onTouchStart={() => handleTouchStart('backward')} onTouchEnd={() => handleTouchEnd('backward')}>▼</button>
          <button style={buttonStyle} onTouchStart={() => handleTouchStart('right')} onTouchEnd={() => handleTouchEnd('right')}>▶</button>
        </div>
      </div>
      
      {/* Jump button only - look is handled by touch swipe */}
      <button 
        style={jumpButtonStyle} 
        onTouchStart={() => { handleTouchStart('jump'); if (onJump) onJump(); }} 
        onTouchEnd={() => handleTouchEnd('jump')}
      >
        JUMP
      </button>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function ILoveYouPage() {
  const [isLoading, setIsLoading] = useState(true); // Loading screen on page entry
  const [playerPos, setPlayerPos] = useState([0, 1.6, 5]);
  const [playerYaw, setPlayerYaw] = useState(0);
  const [isNearOther, setIsNearOther] = useState({ isNear: false, target: null });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // Mobile orientation
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  
  // Character switching
  const [currentCharacter, setCurrentCharacter] = useState('bea'); // Start as Bea
  const [switchCooldown, setSwitchCooldown] = useState(0);
  const [canSwitch, setCanSwitch] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [switchingTo, setSwitchingTo] = useState(null); // Track which character we're switching to
  const [resetKey, setResetKey] = useState(0); // Used to trigger position reset
  
  // Special abilities
  const [abilityCooldown, setAbilityCooldown] = useState(0);
  const [canUseAbility, setCanUseAbility] = useState(true);
  
  // Bench/Log sitting
  const [isNearBench, setIsNearBench] = useState(false);
  const [isPlayerSitting, setIsPlayerSitting] = useState(false);
  const [occupiedLogs, setOccupiedLogs] = useState([]);
  const [playerSittingLogId, setPlayerSittingLogId] = useState(null);
  const [jbIsSitting, setJbIsSitting] = useState(false);
  const [beaIsSitting, setBeaIsSitting] = useState(false);
  
  // Handle character sit state changes
  const handleSitStateChange = (character, isSitting) => {
    if (character === 'jb') setJbIsSitting(isSitting);
    if (character === 'bea') setBeaIsSitting(isSitting);
  };
  
  // Check if both player and AI character are sitting (for special campfire chat)
  const bothSittingAtCampfire = isPlayerSitting && (currentCharacter === 'bea' ? jbIsSitting : beaIsSitting);
  
  const [messages, setMessages] = useState([
    { sender: 'jb', text: "Hey Bea! Come closer and press E or tap me to chat! 👋" }
  ]);
  
  // Current dialogue text to show in speech bubble
  const [dialogueText, setDialogueText] = useState('');
  const [chatTarget, setChatTarget] = useState(null); // 'jb', 'bea', or 'choco'
  
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    lookLeft: false,
    lookRight: false,
    jump: false,
  });
  
  const mouseMovement = useRef({ x: 0, y: 0 });
  const isPointerLocked = useRef(false);
  const canvasRef = useRef(null);
  
  // Touch look refs
  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0 });
  
  // Sound effects refs - using MP3 files
  const walkSoundRef = useRef(null);
  const isWalkingRef = useRef(false);
  const walkIntervalRef = useRef(null);
  const waveSoundRef = useRef(null);
  const interactSoundRef = useRef(null);  // Chat response sound
  const jumpSoundRef = useRef(null);
  const switchSoundRef = useRef(null);
  const whistleSoundRef = useRef(null);
  const fireSoundRef = useRef(null);       // Campfire crackling (loop)
  const catSoundRef = useRef(null);        // Random cat noises
  const catSoundIntervalRef = useRef(null);
  
  const unlockAll = useStore((state) => state.unlockAll);
  
  useGlobalMusic('iloveyou', 0.3);
  
  // Cooldown timer for character switch
  useEffect(() => {
    if (switchCooldown > 0) {
      const timer = setTimeout(() => {
        setSwitchCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSwitch(true);
    }
  }, [switchCooldown]);
  
  // Cooldown timer for special ability
  useEffect(() => {
    if (abilityCooldown > 0) {
      const timer = setTimeout(() => {
        setAbilityCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanUseAbility(true);
    }
  }, [abilityCooldown]);
  
  // Handle special ability (V key) - Only Bea has whistle ability
  const handleSpecialAbility = () => {
    if (!canUseAbility || isChatOpen || isTransitioning) return;
    if (currentCharacter !== 'bea') return; // Only Bea has ability
    
    setCanUseAbility(false);
    setAbilityCooldown(10);
    
    // Bea's ability: Whistle to make JB run to her
    if (whistleSoundRef.current) whistleSoundRef.current();
    jbRunToPlayer = true;
  };
  
  // Handle character switch with transition
  const handleCharacterSwitch = () => {
    if (!canSwitch || isChatOpen || isTransitioning) return;
    
    // Determine which character we're switching TO
    const targetChar = currentCharacter === 'bea' ? 'jb' : 'bea';
    setSwitchingTo(targetChar);
    
    // Start transition
    setIsTransitioning(true);
    setCanSwitch(false);
    
    // Play switch sound
    if (switchSoundRef.current) switchSoundRef.current();
    
    // After fade out (1.5s), switch character
    setTimeout(() => {
      const newChar = targetChar;
      const otherChar = newChar === 'jb' ? 'Bea' : 'JB';
      
      setCurrentCharacter(newChar);
      setResetKey(prev => prev + 1); // Trigger position reset
      
      // Reset messages for new character
      setMessages([
        { sender: newChar === 'jb' ? 'bea' : 'jb', text: `Hey ${otherChar}! Come closer and press E to chat! 💕` }
      ]);
      
      // After another 1.5s, end transition
      setTimeout(() => {
        setIsTransitioning(false);
        setSwitchingTo(null);
        setSwitchCooldown(10);
      }, 1500);
    }, 1500);
  };
  
  // Loading screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 second loading screen
    return () => clearTimeout(timer);
  }, []);
  
  // Mobile and orientation detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    checkMobile();
    checkOrientation();
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  // Request fullscreen on mobile when loading finishes
  useEffect(() => {
    if (isMobile && !isLoading && !isPortrait) {
      const requestFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
      };
      
      // Request fullscreen on first user interaction
      const handleFirstTouch = () => {
        requestFullscreen();
        document.removeEventListener('touchstart', handleFirstTouch);
      };
      
      document.addEventListener('touchstart', handleFirstTouch, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', handleFirstTouch);
      };
    }
  }, [isMobile, isLoading, isPortrait]);
  
  // Touch controls for looking around (swipe to look)
  useEffect(() => {
    if (!isMobile) return;
    
    const handleTouchStart = (e) => {
      if (isChatOpen || isTransitioning || isLoading) return;
      // Only use touches not on control buttons
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };
    
    const handleTouchMove = (e) => {
      if (isChatOpen || isTransitioning || isLoading) return;
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchRef.current.x;
      const deltaY = touch.clientY - lastTouchRef.current.y;
      
      // Update mouse movement for camera (sensitivity adjusted for touch)
      mouseMovement.current.x += deltaX * 0.5;
      mouseMovement.current.y += deltaY * 0.3;
      
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };
    
    const handleTouchEnd = () => {
      touchStartRef.current = { x: 0, y: 0 };
      lastTouchRef.current = { x: 0, y: 0 };
    };
    
    // Add listeners to the canvas area
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isMobile, isChatOpen, isTransitioning, isLoading]);
  
  // Initialize sound effects
  useEffect(() => {
    // === MP3-BASED SOUND EFFECTS ===
    // All sounds use MP3 files from /public/audio/sfx/
    
    // Helper to create and play audio
    const createSoundPlayer = (src, volume = 0.5, loop = false) => {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.loop = loop;
      return {
        play: () => {
          audio.currentTime = 0;
          audio.play().catch(() => {}); // Ignore autoplay errors
        },
        stop: () => {
          audio.pause();
          audio.currentTime = 0;
        },
        audio
      };
    };
    
    // Walking sound - footsteps (plays in loop while walking)
    const walkSound = createSoundPlayer('/audio/sfx/walk.mp3', 0.4, true);
    walkSoundRef.current = {
      start: () => walkSound.play(),
      stop: () => walkSound.stop()
    };
    
    // Jump sound
    const jumpSound = createSoundPlayer('/audio/sfx/jump.mp3', 0.5);
    jumpSoundRef.current = () => jumpSound.play();
    
    // Whistle sound (Bea's ability)
    const whistleSound = createSoundPlayer('/audio/sfx/whistle.mp3', 0.6);
    whistleSoundRef.current = () => whistleSound.play();
    
    // Wave/greeting sound (when approaching character)
    const waveSound = createSoundPlayer('/audio/sfx/wave.mp3', 0.4);
    waveSoundRef.current = () => waveSound.play();
    
    // Chat/interact sound (when character responds)
    const chatSound = createSoundPlayer('/audio/sfx/chat.mp3', 0.4);
    interactSoundRef.current = () => chatSound.play();
    
    // Character switch sound
    const switchSound = createSoundPlayer('/audio/sfx/switch.mp3', 0.5);
    switchSoundRef.current = () => switchSound.play();
    
    // Campfire crackling (ambient loop)
    const fireSound = createSoundPlayer('/audio/sfx/fire.mp3', 0.3, true);
    fireSoundRef.current = fireSound;
    // Start fire sound immediately
    fireSound.play();
    
    // Cat sounds (Choco - random meows)
    const catSounds = [
      createSoundPlayer('/audio/sfx/cat1.mp3', 0.3),
      createSoundPlayer('/audio/sfx/cat2.mp3', 0.3),
      createSoundPlayer('/audio/sfx/cat3.mp3', 0.3),
    ];
    catSoundRef.current = () => {
      const randomCat = catSounds[Math.floor(Math.random() * catSounds.length)];
      randomCat.play();
    };
    
    // Random cat sounds every 15-45 seconds
    const playCatSound = () => {
      if (catSoundRef.current) catSoundRef.current();
      catSoundIntervalRef.current = setTimeout(playCatSound, 15000 + Math.random() * 30000);
    };
    catSoundIntervalRef.current = setTimeout(playCatSound, 10000 + Math.random() * 20000);
    
    return () => {
      // Cleanup
      walkSound.stop();
      fireSound.stop();
      if (catSoundIntervalRef.current) clearTimeout(catSoundIntervalRef.current);
    };
  }, []);
  
  // Walking sound effect - triggered by movement
  useEffect(() => {
    const checkWalking = setInterval(() => {
      const isMoving = keys.current.forward || keys.current.backward || 
                       keys.current.left || keys.current.right;
      
      if (isMoving && !isWalkingRef.current && !isChatOpen && !isPlayerSitting) {
        isWalkingRef.current = true;
        if (walkSoundRef.current) walkSoundRef.current.start();
      } else if (!isMoving || isChatOpen || isPlayerSitting) {
        if (isWalkingRef.current && walkSoundRef.current) {
          walkSoundRef.current.stop();
        }
        isWalkingRef.current = false;
      }
    }, 100);
    
    return () => clearInterval(checkWalking);
  }, [isChatOpen, isPlayerSitting]);
  
  // Wave sound when near other character
  const prevNearOtherRef = useRef(false);
  useEffect(() => {
    if (isNearOther.isNear && !prevNearOtherRef.current && waveSoundRef.current) {
      waveSoundRef.current();
    }
    prevNearOtherRef.current = isNearOther.isNear;
  }, [isNearOther]);
  
  // Pointer lock for mouse look
  useEffect(() => {
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
      setIsLocked(document.pointerLockElement !== null);
    };
    
    const handleMouseMove = (e) => {
      if (isPointerLocked.current) {
        mouseMovement.current = {
          x: e.movementX,
          y: e.movementY,
        };
      }
    };
    
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Click to lock pointer
  const handleCanvasClick = () => {
    if (!isChatOpen && canvasRef.current) {
      canvasRef.current.requestPointerLock();
    }
  };
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isChatOpen) return; // Don't move while chatting
      
      switch (e.code) {
        case 'KeyW': keys.current.forward = true; break;
        case 'KeyS': keys.current.backward = true; break;
        case 'KeyA': keys.current.left = true; break;
        case 'KeyD': keys.current.right = true; break;
        case 'ArrowLeft': keys.current.lookLeft = true; break;
        case 'ArrowRight': keys.current.lookRight = true; break;
        case 'Space':
          if (!keys.current.jump) {
            keys.current.jump = true;
            // Play jump sound
            if (jumpSoundRef.current) jumpSoundRef.current();
          }
          break;
        case 'KeyQ':
          // Switch character
          handleCharacterSwitch();
          break;
        case 'KeyV':
          // Special ability
          handleSpecialAbility();
          break;
        case 'KeyF':
          // Sit on player's assigned log when near campfire
          if (isNearBench && !isPlayerSitting) {
            setIsPlayerSitting(true);
          }
          break;
        case 'KeyE':
          // Open chat - either when near character OR when both sitting at campfire
          const canChatNormally = isNearOther.isNear && !isChatOpen;
          const canChatAtCampfire = isPlayerSitting && (jbIsSitting || beaIsSitting) && !isChatOpen;
          
          if (canChatNormally || canChatAtCampfire) {
            document.exitPointerLock();
            setIsChatOpen(true);
            setIsTalking(true);
            
            // Determine chat target
            let target;
            if (canChatAtCampfire && !canChatNormally) {
              // At campfire, chat with the AI character
              target = currentCharacter === 'bea' ? 'jb' : 'bea';
            } else {
              target = isNearOther.target;
            }
            
            setChatTarget(target);
            if (target === 'choco') {
              setChatPartner({ name: 'Choco', color: '#1a1a1a' });
              setMessages([{ sender: 'choco', text: 'Meow! 🐱' }]);
              setDialogueText('Meow! 🐱');
            } else if (target === 'jb') {
              setChatPartner({ name: 'JB', color: '#2D8B2D' });
              // Special campfire greeting
              const greeting = (isPlayerSitting && jbIsSitting) 
                ? campfireConversations.jb[Math.floor(Math.random() * campfireConversations.jb.length)]
                : 'Hey Bea! 💚';
              setMessages([{ sender: 'jb', text: greeting }]);
              setDialogueText(greeting);
            } else {
              setChatPartner({ name: 'Bea', color: '#8B5CF6' });
              // Special campfire greeting
              const greeting = (isPlayerSitting && beaIsSitting)
                ? campfireConversations.bea[Math.floor(Math.random() * campfireConversations.bea.length)]
                : 'Hey JB! 💜';
              setMessages([{ sender: 'bea', text: greeting }]);
              setDialogueText(greeting);
            }
            // Play interaction sound
            if (interactSoundRef.current) interactSoundRef.current();
          }
          break;
        case 'Escape':
          if (isChatOpen) {
            setIsChatOpen(false);
            setIsTalking(false);
            setDialogueText('');
            setChatTarget(null);
          }
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': keys.current.forward = false; break;
        case 'KeyS': keys.current.backward = false; break;
        case 'KeyA': keys.current.left = false; break;
        case 'KeyD': keys.current.right = false; break;
        case 'ArrowLeft': keys.current.lookLeft = false; break;
        case 'ArrowRight': keys.current.lookRight = false; break;
        case 'Space': keys.current.jump = false; break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isNearOther, isChatOpen, canSwitch, isNearBench, isPlayerSitting, occupiedLogs]);
  
  const handleSendMessage = (text, category = null) => {
    // Check who we're talking to
    const talkingToChoco = chatPartner.name === 'Choco';
    
    setTimeout(() => {
      let response;
      
      if (talkingToChoco) {
        // Choco's responses (cat sounds) - use campfire responses if at campfire
        const chocoResponses = bothSittingAtCampfire ? campfireConversations.choco : {
          greetings: ['Meow! 😺', 'Mrrrow~ 🐱', 'Purrrr 💕', '*rubs against your leg* Meow!'],
          funny: ['*chases own tail* Meow!', '*knocks something over* ...Meow? 😹', 'Mrow mrow mrow! 🐱', '*zooms around* Nyoom!'],
          compliments: ['*purrs loudly* 😻', 'Meow meow! *happy cat noises*', '*slow blinks at you* 💕', 'Prrrrrr~ 🐱'],
          love: ['*headbutts you lovingly* Meow! 💕', 'Purrrrrr~ 😻', '*kneads paws* Mrrrow~', '*curls up next to you* 🐱💕'],
        };
        
        if (bothSittingAtCampfire) {
          // Use campfire conversations for Choco
          response = chocoResponses[Math.floor(Math.random() * chocoResponses.length)];
        } else {
          const responses = chocoResponses[category] || chocoResponses.greetings;
          response = responses[Math.floor(Math.random() * responses.length)];
        }
        setMessages([{ sender: 'choco', text: response }]);
        setDialogueText(response);
      } else {
        // Regular character response - use campfire conversations when sitting together
        const otherChar = chatPartner.name.toLowerCase();
        
        if (bothSittingAtCampfire) {
          // Special campfire conversation
          const campfireLines = campfireConversations[otherChar] || campfireConversations.jb;
          response = campfireLines[Math.floor(Math.random() * campfireLines.length)];
        } else {
          // Normal conversation
          let responseCategory = category;
          if (!responseCategory) {
            responseCategory = 'greetings';
          }
          response = getRandomResponse(otherChar, responseCategory);
        }
        
        setMessages([{ sender: otherChar, text: response }]);
        setDialogueText(response);
      }
    }, 300);
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setIsTalking(false);
    setDialogueText('');
    setChatTarget(null);
  };
  
  const handleMenuClick = () => {
    unlockAll();
  };
  
  // Get character name and color for display
  const otherCharacterName = currentCharacter === 'bea' ? 'JB' : 'Bea';
  const otherCharacterColor = currentCharacter === 'bea' ? '#2D8B2D' : '#8B5CF6';
  
  // Chat partner (could be the other character or Choco)
  const [chatPartner, setChatPartner] = useState({ name: otherCharacterName, color: otherCharacterColor });
  
  return (
    <PageTransition>
      {/* Sunset gradient sky */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FF6B35 0%, #FF8E53 20%, #FFA07A 40%, #FFB366 60%, #87CEEB 100%)' }} />
      
      {/* 3D Canvas */}
      <div ref={canvasRef} className="absolute inset-0 cursor-crosshair" onClick={handleCanvasClick}>
        <Canvas shadows>
          <Suspense fallback={null}>
            <ParadiseScene 
              setPlayerPos={setPlayerPos}
              setIsNearOther={setIsNearOther}
              isNearOther={isNearOther}
              isTalking={isTalking}
              keys={keys}
              mouseMovement={mouseMovement}
              isPointerLocked={isPointerLocked}
              playerPos={playerPos}
              currentCharacter={currentCharacter}
              setPlayerYaw={setPlayerYaw}
              resetKey={resetKey}
              dialogueText={dialogueText}
              chatTarget={chatTarget}
              isPlayerSitting={isPlayerSitting}
              setIsPlayerSitting={setIsPlayerSitting}
              setIsNearBench={setIsNearBench}
              isNearBench={isNearBench}
              occupiedLogs={occupiedLogs}
              setOccupiedLogs={setOccupiedLogs}
              playerSittingLogId={playerSittingLogId}
              setPlayerSittingLogId={setPlayerSittingLogId}
              onSitStateChange={handleSitStateChange}
              jbIsSitting={jbIsSitting}
              beaIsSitting={beaIsSitting}
              isMobile={isMobile}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Character Switch Transition Overlay with Spinning Cube */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: 'black' }}
          >
            {/* Spinning Cube */}
            <div style={{ width: '200px', height: '200px' }}>
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
                <SpinningCube3D />
              </Canvas>
            </div>
            
            {/* Switching text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-xl font-bold mt-4"
            >
              Switching to {switchingTo === 'jb' ? '💚 JB' : '💜 Bea'}...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#1a0a2e' }}
          >
            {/* Spinning Cube for Loading */}
            <div style={{ width: '200px', height: '200px' }}>
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
                <SpinningCube3D />
              </Canvas>
            </div>
            
            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-4"
            >
              <p className="text-white text-2xl font-bold mb-2">💕 I Love You 💕</p>
              <p className="text-white/60 text-sm">Loading paradise...</p>
            </motion.div>
            
            {/* Loading bar */}
            <motion.div 
              className="w-48 h-1 bg-white/20 rounded-full mt-6 overflow-hidden"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Portrait Warning - Rotate to Landscape */}
      <AnimatePresence>
        {isMobile && isPortrait && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ backgroundColor: '#1a0a2e' }}
          >
            <motion.div
              animate={{ rotate: [0, -90, -90, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="text-6xl mb-6"
            >
              📱
            </motion.div>
            <p className="text-white text-xl font-bold text-center px-8">
              Please rotate your device to landscape mode
            </p>
            <p className="text-white/60 text-sm mt-2 text-center px-8">
              For the best experience in paradise 💕
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Crosshair */}
        {isLocked && !isChatOpen && !isTransitioning && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/50 rounded-full" />
          </div>
        )}
        
        {/* Current character indicator & buttons - Desktop only */}
        {!isTransitioning && (
        <div className="absolute top-4 left-4 text-white text-sm bg-black/40 px-3 py-2 rounded-lg pointer-events-auto hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold" style={{ color: currentCharacter === 'bea' ? '#8B5CF6' : '#2D8B2D' }}>
              Playing as: {currentCharacter === 'bea' ? '💜 Bea' : '💚 JB'}
            </span>
            <button
              onClick={handleCharacterSwitch}
              disabled={!canSwitch || isChatOpen}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                canSwitch && !isChatOpen
                  ? 'bg-white/20 hover:bg-white/30 cursor-pointer'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              {canSwitch ? `Switch (Q)` : `Wait ${switchCooldown}s`}
            </button>
          </div>
          {/* Special ability button - only for Bea */}
          {currentCharacter === 'bea' && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleSpecialAbility}
              disabled={!canUseAbility || isChatOpen}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                canUseAbility && !isChatOpen
                  ? 'bg-purple-500/50 hover:bg-purple-500/70 cursor-pointer'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              {canUseAbility ? '🎵 Whistle (V)' : `Wait ${abilityCooldown}s`}
            </button>
            <span className="text-xs text-white/50">JB comes to you!</span>
          </div>
          )}
          <p className="text-xs text-white/70">
            {isLocked 
              ? currentCharacter === 'bea'
                ? 'WASD - Move | Space - Jump | Q - Switch | V - Whistle | E - Talk'
                : 'WASD - Move | Space - Jump | Q - Switch | E - Talk'
              : 'Click to enable mouse look'}
          </p>
        </div>
        )}
        
        {/* Mobile character indicator - compact */}
        {!isTransitioning && (
        <div className="absolute top-2 left-2 md:hidden">
          <span className="text-xs font-bold px-2 py-1 rounded bg-black/40" style={{ color: currentCharacter === 'bea' ? '#8B5CF6' : '#2D8B2D' }}>
            {currentCharacter === 'bea' ? '💜 Bea' : '💚 JB'}
          </span>
        </div>
        )}
        
        {/* Interaction prompt - shows who is nearby */}
        <AnimatePresence>
          {isNearOther.isNear && !isChatOpen && !isTransitioning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16 pointer-events-auto"
            >
              <button 
                onClick={() => {
                  document.exitPointerLock();
                  setIsChatOpen(true);
                  setIsTalking(true);
                  const target = isNearOther.target;
                  setChatTarget(target);
                  if (target === 'choco') {
                    setChatPartner({ name: 'Choco', color: '#1a1a1a' });
                    setMessages([{ sender: 'choco', text: 'Meow! 🐱' }]);
                    setDialogueText('Meow! 🐱');
                  } else if (target === 'jb') {
                    setChatPartner({ name: 'JB', color: '#2D8B2D' });
                    setMessages([{ sender: 'jb', text: 'Hey Bea! 💚' }]);
                    setDialogueText('Hey Bea! 💚');
                  } else {
                    setChatPartner({ name: 'Bea', color: '#8B5CF6' });
                    setMessages([{ sender: 'bea', text: 'Hey JB! 💜' }]);
                    setDialogueText('Hey JB! 💜');
                  }
                  if (interactSoundRef.current) interactSoundRef.current();
                }}
                className="bg-black/60 hover:bg-black/80 px-6 py-3 rounded-xl text-white text-center transition-all hover:scale-105"
              >
                <p className="text-lg font-bold" style={{ 
                  color: isNearOther.target === 'choco' ? '#FFD700' : 
                         isNearOther.target === 'jb' ? '#2D8B2D' : '#8B5CF6' 
                }}>
                  {isNearOther.target === 'choco' ? '🐱 Choco' : 
                   isNearOther.target === 'jb' ? '💚 JB' : '💜 Bea'}
                </p>
                <p className="text-sm text-white/80">Press E or tap to talk</p>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Bench sitting prompt */}
        <AnimatePresence>
          {isNearBench && !isChatOpen && !isTransitioning && !isNearOther.isNear && !isPlayerSitting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16 pointer-events-none"
            >
              <div 
                className="bg-black/40 px-6 py-3 rounded-xl text-white text-center"
                style={{ backdropFilter: 'blur(5px)' }}
              >
                <p className="text-lg font-bold">🪵 {isMobile ? 'Tap the log to sit' : 'Press F to sit'}</p>
                <p className="text-sm text-white/80">Enjoy the campfire</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Standing up prompt when sitting */}
        <AnimatePresence>
          {isPlayerSitting && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 pointer-events-none"
            >
              <div 
                className="bg-white/20 px-6 py-3 rounded-xl text-white text-center"
                style={{ backdropFilter: 'blur(10px)' }}
              >
                {(jbIsSitting || beaIsSitting) ? (
                  <>
                    <p className="text-sm">{isMobile ? 'Tap' : 'Press'} <span className="font-bold">{isMobile ? 'character' : 'E'}</span> to chat with {currentCharacter === 'bea' ? 'JB' : 'Bea'} 💕</p>
                    {isMobile ? (
                      <button 
                        onClick={() => setIsPlayerSitting(false)}
                        className="mt-2 px-4 py-1 bg-white/30 rounded-lg text-sm font-bold pointer-events-auto"
                      >
                        Stand Up
                      </button>
                    ) : (
                      <p className="text-xs text-white/60 mt-1">Press <span className="font-bold">Space</span> to stand up</p>
                    )}
                  </>
                ) : (
                  isMobile ? (
                    <button 
                      onClick={() => setIsPlayerSitting(false)}
                      className="px-4 py-2 bg-white/30 rounded-lg text-sm font-bold pointer-events-auto"
                    >
                      Stand Up
                    </button>
                  ) : (
                    <p className="text-sm">Press <span className="font-bold">Space</span> to stand up</p>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile switch button */}
        {!isTransitioning && (
        <div className="absolute top-12 left-2 pointer-events-auto md:hidden flex flex-col gap-1">
          <button
            onClick={handleCharacterSwitch}
            disabled={!canSwitch || isChatOpen}
            className={`px-2 py-1 rounded text-white text-xs font-bold ${
              canSwitch && !isChatOpen
                ? 'bg-purple-600/80'
                : 'bg-gray-600/60'
            }`}
          >
            {canSwitch ? '🔄 Switch' : `⏱️ ${switchCooldown}s`}
          </button>
          {currentCharacter === 'bea' && (
          <button
            onClick={handleSpecialAbility}
            disabled={!canUseAbility || isChatOpen}
            className={`px-2 py-1 rounded text-white text-xs font-bold ${
              canUseAbility && !isChatOpen
                ? 'bg-purple-500/80'
                : 'bg-gray-600/60'
            }`}
          >
            {canUseAbility ? '🎵 Whistle' : `⏱️ ${abilityCooldown}s`}
          </button>
          )}
        </div>
        )}
        
        {/* Chat Box */}
        <AnimatePresence>
          {isChatOpen && (
            <ChatBox 
              isOpen={isChatOpen}
              messages={messages}
              onSendMessage={handleSendMessage}
              onClose={handleCloseChat}
              chatPartnerName={chatPartner.name}
              chatPartnerColor={chatPartner.color}
            />
          )}
        </AnimatePresence>
        
        {/* Mobile Controls */}
        <MobileControls keys={keys} onJump={() => { if (jumpSoundRef.current) jumpSoundRef.current(); }} />
        
        {/* Menu button */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <MenuButton onClick={handleMenuClick} visible={true} delay={0} />
        </div>
      </div>
    </PageTransition>
  );
}