import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import PageTransition from '../common/PageTransition';
import MenuButton from '../common/MenuButton';
import { useGlobalMusic } from '../home/HomePage';
import useStore from '../../store/useStore';

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
      <Cloud position={[20, 20, -30]} />
      <Cloud position={[-25, 18, -20]} />
      <Cloud position={[0, 22, -40]} />
      <Cloud position={[35, 19, 10]} />
      <Cloud position={[-30, 21, 20]} />
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

// ============ CAMPFIRE WITH LOGS ============
function Campfire({ position = [-8, 0, -8] }) {
  const fireRef = useRef();
  const [flames, setFlames] = useState([]);
  
  // Create flame particles
  useEffect(() => {
    const initialFlames = [];
    for (let i = 0; i < 12; i++) {
      initialFlames.push({
        id: i,
        x: (Math.random() - 0.5) * 0.4,
        y: Math.random() * 0.5,
        z: (Math.random() - 0.5) * 0.4,
        scale: 0.1 + Math.random() * 0.15,
        speed: 0.5 + Math.random() * 0.5,
      });
    }
    setFlames(initialFlames);
  }, []);
  
  useFrame((state, delta) => {
    // Animate flames
    setFlames(prev => prev.map(f => ({
      ...f,
      y: (f.y + f.speed * delta) % 0.8,
      x: f.x + Math.sin(state.clock.elapsedTime * 3 + f.id) * 0.01,
    })));
    
    // Flicker light
    if (fireRef.current) {
      fireRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
    }
  });
  
  return (
    <group position={position}>
      {/* Fire pit stones */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.6, 0.1, Math.sin(angle) * 0.6]}>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshStandardMaterial color="#555555" roughness={0.9} />
          </mesh>
        );
      })}
      
      {/* Logs */}
      <mesh position={[-0.3, 0.15, 0]} rotation={[0, 0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 6]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.15, 0]} rotation={[0, -0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 6]} />
        <meshStandardMaterial color="#3d2d1f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.15, 0.3]} rotation={[Math.PI / 2, 0, 0.5]}>
        <cylinderGeometry args={[0.07, 0.09, 0.7, 6]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} />
      </mesh>
      
      {/* Fire flames */}
      {flames.map((f) => (
        <mesh key={f.id} position={[f.x, 0.2 + f.y, f.z]} scale={f.scale * (1 - f.y)}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial 
            color={f.y < 0.3 ? '#FF4500' : f.y < 0.5 ? '#FF6600' : '#FFAA00'} 
            transparent 
            opacity={0.8 - f.y * 0.5} 
          />
        </mesh>
      ))}
      
      {/* Fire light */}
      <pointLight ref={fireRef} position={[0, 0.5, 0]} color="#FF6600" intensity={1.5} distance={8} />
      
      {/* Sitting logs around campfire */}
      <mesh position={[-1.2, 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.5, 8]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
      </mesh>
      <mesh position={[1.2, 0.2, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.5, 8]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 1.2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 8]} />
        <meshStandardMaterial color="#5a4530" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ============ SMALL HUT ============
function Hut({ position = [12, 0, 8] }) {
  return (
    <group position={position}>
      {/* Floor/Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      
      {/* Walls - wooden posts */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        // Leave gap for door at i === 0
        if (i === 0) return null;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2, 1.2, Math.sin(angle) * 2]}>
            <cylinderGeometry args={[0.1, 0.1, 2.4, 6]} />
            <meshStandardMaterial color="#6B4423" roughness={0.8} />
          </mesh>
        );
      })}
      
      {/* Wall fill (bamboo/straw look) */}
      {[1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = ((i + 0.5) / 8) * Math.PI * 2;
        return (
          <mesh key={`wall-${i}`} position={[Math.cos(angle) * 2, 1.2, Math.sin(angle) * 2]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[1.5, 2, 0.1]} />
            <meshStandardMaterial color="#D2B48C" roughness={0.9} />
          </mesh>
        );
      })}
      
      {/* Roof - conical thatched */}
      <mesh position={[0, 3, 0]} castShadow>
        <coneGeometry args={[3.2, 2.5, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={1} />
      </mesh>
      
      {/* Roof detail layer */}
      <mesh position={[0, 2.8, 0]}>
        <coneGeometry args={[3.4, 0.5, 12]} />
        <meshStandardMaterial color="#A08060" roughness={1} />
      </mesh>
      
      {/* Door frame */}
      <mesh position={[2, 0.9, 0]}>
        <boxGeometry args={[0.15, 1.8, 0.8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>
      
      {/* Inside - cozy mat */}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 16]} />
        <meshStandardMaterial color="#CD853F" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ============ GARDEN ============
function Garden({ position = [-12, 0, 10] }) {
  const gardenFlowers = useMemo(() => {
    const items = [];
    // Create garden grid
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.random() > 0.3) {
          items.push({
            pos: [x * 0.6 + (Math.random() - 0.5) * 0.2, 0, z * 0.6 + (Math.random() - 0.5) * 0.2],
            color: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#DB7093', '#FF6B6B', '#9370DB', '#8B5CF6'][Math.floor(Math.random() * 8)],
            height: 0.2 + Math.random() * 0.3,
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
    // Randomly spawn shooting stars
    if (Math.random() < 0.003) { // ~0.3% chance per frame
      const newStar = {
        id: Date.now(),
        x: (Math.random() - 0.5) * 60 + 30,
        y: 25 + Math.random() * 15,
        z: -40 - Math.random() * 20,
        vx: -15 - Math.random() * 10,
        vy: -8 - Math.random() * 5,
        life: 2,
        tail: [],
      };
      setStars(prev => [...prev, newStar]);
    }
    
    // Update stars
    setStars(prev => prev
      .map(s => {
        // Add current position to tail
        const newTail = [...s.tail, { x: s.x, y: s.y, z: s.z }].slice(-15);
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
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Star glow */}
          <mesh position={[star.x, star.y, star.z]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#FFFFCC" transparent opacity={0.4} />
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
function JBCharacter({ position, isNearby, isTalking, playerPos, isVisible, resetKey }) {
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
      s.moveTimer = 0;
      jbCurrentPosition.x = position[0];
      jbCurrentPosition.y = position[1];
      jbCurrentPosition.z = position[2];
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
    
    // Don't run AI if not visible (player is controlling this character)
    if (!isVisible) return;
    
    const s = stateRef.current;
    
    // Check if we should run to player (whistle ability)
    if (jbRunToPlayer && playerPos) {
      s.isRunningToPlayer = true;
      s.targetPos.set(playerPos[0], 0, playerPos[2]);
      s.isMoving = true;
      jbRunToPlayer = false; // Reset the flag
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
        const speed = 6; // Fast running!
        s.currentPos.x += direction.x * speed * delta;
        s.currentPos.z += direction.z * speed * delta;
        s.facing = Math.atan2(direction.x, direction.z);
        s.walkCycle += delta * 15; // Faster animation
        s.isMoving = true;
      } else {
        s.isRunningToPlayer = false;
        s.isMoving = false;
        s.walkCycle = 0;
        // Wave when arrived!
        s.isWaving = true;
        s.waveTimer = 2;
      }
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
    
    // === RANDOM ACTIONS (wave and jump) ===
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
    
    // Wave animation timer
    if (s.isWaving) {
      s.waveTimer -= delta;
      if (s.waveTimer <= 0) {
        s.isWaving = false;
      }
    }
    
    // === APPLY TRANSFORMS ===
    let yPosition = s.currentPos.y;
    
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
    
    // === LEG ANIMATIONS (walking and jumping) ===
    if (leftLegRef.current && rightLegRef.current) {
      if (s.isJumping) {
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
      if (isNearby || s.isWaving) {
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
      if (s.isMoving) {
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
      
      {/* === CHAT INDICATOR (when talking) === */}
      {isTalking && (
        <group position={[0.4, 1.6, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.08, -0.08, 0]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.12, -0.14, 0]}>
            <sphereGeometry args={[0.03, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============ BEA POSITION REF (shared for distance checking) ============
const beaCurrentPosition = { x: 5, y: 0, z: 0 };

// Global flag for Bea's happy mode
let beaHappyMode = false;
let beaHappyTimer = 0;

// ============ BEA CHARACTER (Purple girl) ============
function BeaCharacter({ position, isNearby, isTalking, playerPos, isVisible, resetKey }) {
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
    isHappy: false,
    happyHopCycle: 0,
    waveTimer: 0,
    verticalVelocity: 0,
    walkCycle: 0,
    randomActionTimer: Math.random() * 3 + 2,
    facing: 0,
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
      s.isHappy = false;
      s.moveTimer = 0;
      beaCurrentPosition.x = position[0];
      beaCurrentPosition.y = position[1];
      beaCurrentPosition.z = position[2];
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
    
    // Don't run AI if not visible
    if (!isVisible) return;
    
    const s = stateRef.current;
    
    // Check for happy mode trigger
    if (beaHappyMode) {
      s.isHappy = true;
      s.happyHopCycle = 0;
      beaHappyTimer = 5; // 5 seconds of hopping
      beaHappyMode = false;
    }
    
    // Happy hopping animation
    if (s.isHappy && beaHappyTimer > 0) {
      beaHappyTimer -= delta;
      s.happyHopCycle += delta * 10;
      // Mini hops
      s.currentPos.y = Math.abs(Math.sin(s.happyHopCycle)) * 0.3;
      s.isMoving = false;
      
      // Face player
      if (playerPos) {
        const dx = playerPos[0] - s.currentPos.x;
        const dz = playerPos[2] - s.currentPos.z;
        s.facing = Math.atan2(dx, dz);
      }
      
      if (beaHappyTimer <= 0) {
        s.isHappy = false;
        s.currentPos.y = 0;
      }
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
    
    if (s.isMoving && !isNearby && !s.isHappy) {
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
    } else if (isNearby && !s.isHappy) {
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
    
    if (s.isWaving) {
      s.waveTimer -= delta;
      if (s.waveTimer <= 0) s.isWaving = false;
    }
    
    let yPosition = s.currentPos.y;
    if (!s.isJumping) {
      if (s.isMoving) {
        yPosition += Math.abs(Math.sin(Date.now() * 0.005)) * 0.05;
      } else {
        yPosition += Math.sin(state.clock.elapsedTime * 2) * 0.02;
      }
    }
    
    groupRef.current.position.set(s.currentPos.x, yPosition, s.currentPos.z);
    groupRef.current.rotation.y = s.facing;
    
    // Leg animations
    if (leftLegRef.current && rightLegRef.current) {
      if (s.isJumping) {
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
      if (isNearby || s.isWaving) {
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
      if (s.isMoving) {
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
      
      {/* CHAT INDICATOR */}
      {isTalking && (
        <group position={[0.4, 1.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.08, -0.08, 0]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.12, -0.14, 0]}>
            <sphereGeometry args={[0.03, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============ PLAYER CONTROLLER WITH MOUSE LOOK AND JUMPING ============
function PlayerController({ setPlayerPos, setIsNearOther, keys, mouseMovement, isPointerLocked, currentCharacter, setPlayerYaw, resetKey }) {
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
  const jumpForce = 8;
  const gravity = 20;
  
  const interactionDistance = 4;
  
  useFrame((state, delta) => {
    // Check if we need to reset position (character switched)
    if (resetKey !== lastResetKey.current) {
      lastResetKey.current = resetKey;
      playerPos.current.copy(startPositions[currentCharacter]);
      yaw.current = 0;
      pitch.current = 0;
      verticalVelocity.current = 0;
      isGrounded.current = true;
    }
    
    // Movement direction
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
    
    // Mouse look (when pointer is locked)
    if (isPointerLocked.current && mouseMovement.current) {
      const sensitivity = 0.002;
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
    setIsNearOther(distanceToOther < interactionDistance);
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
  resetKey
}) {
  return (
    <>
      <ambientLight intensity={0.4} color="#FFF5E6" />
      <directionalLight position={[10, 20, 10]} intensity={0.8} color="#FFA07A" castShadow />
      <hemisphereLight args={['#87CEEB', '#4a7c3f', 0.3]} />
      <fog attach="fog" args={['#FFB366', 40, 100]} />
      
      <Ground />
      <GrassPatches />
      <Flowers />
      <Trees />
      <Mountains />
      <Sun />
      <Clouds />
      <HeartFireworks />
      
      {/* New furniture elements */}
      <Campfire position={[-8, 0, -8]} />
      <Hut position={[12, 0, 8]} />
      <Garden position={[-12, 0, 10]} />
      <ShootingStars />
      
      {/* JB - visible only when Bea is playing */}
      <JBCharacter 
        position={[0, 0, -5]} 
        isNearby={isNearOther} 
        isTalking={isTalking} 
        playerPos={playerPos}
        isVisible={currentCharacter === 'bea'}
        resetKey={resetKey}
      />
      
      {/* Bea - visible only when JB is playing */}
      <BeaCharacter 
        position={[5, 0, 0]} 
        isNearby={isNearOther} 
        isTalking={isTalking} 
        playerPos={playerPos}
        isVisible={currentCharacter === 'jb'}
        resetKey={resetKey}
      />
      
      <PlayerController 
        setPlayerPos={setPlayerPos}
        setIsNearOther={setIsNearOther}
        keys={keys}
        mouseMovement={mouseMovement}
        isPointerLocked={isPointerLocked}
        currentCharacter={currentCharacter}
        setPlayerYaw={setPlayerYaw}
        resetKey={resetKey}
      />
    </>
  );
}

// ============ CHAT BOX ============
function ChatBox({ isOpen, messages, onSendMessage, onClose }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const quickReplies = [
    { label: "Say Hi!", category: "greetings" },
    { label: "Tell me something funny", category: "funny" },
    { label: "Compliment me", category: "compliments" },
    { label: "Say I love you", category: "love" },
  ];
  
  if (!isOpen) return null;
  
  // Get the other character name from last message
  const lastOtherMsg = messages.filter(m => m.sender === 'jb' || m.sender === 'bea').pop();
  const chatPartner = lastOtherMsg?.sender === 'jb' ? 'JB' : 'Bea';
  const chatPartnerColor = lastOtherMsg?.sender === 'jb' ? '#2D8B2D' : '#8B5CF6';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 pointer-events-auto"
      style={{ zIndex: 100 }}
    >
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: chatPartnerColor }} />
            <span className="text-white font-bold">{chatPartner}</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        
        <div className="h-48 overflow-y-auto p-3 space-y-2">
          {messages.map((msg, i) => {
            const isJB = msg.sender === 'jb';
            const isBea = msg.sender === 'bea';
            const isPlayer = !isJB && !isBea;
            
            return (
              <div key={i} className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className="max-w-[80%] px-3 py-2 rounded-xl text-sm text-white"
                  style={{ 
                    backgroundColor: isJB ? 'rgba(45,139,45,0.6)' : isBea ? 'rgba(139,92,246,0.6)' : 'rgba(99,102,241,0.8)'
                  }}
                >
                  {!isPlayer && <span className="text-xs opacity-70 block mb-1">{isJB ? 'JB' : 'Bea'}</span>}
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-2 border-t border-white/10 flex gap-2 overflow-x-auto">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(reply.label, reply.category)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs whitespace-nowrap"
            >
              {reply.label}
            </button>
          ))}
        </div>
        
        <div className="p-3 border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none"
          />
          <button onClick={handleSend} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-sm">
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============ MOBILE CONTROLS ============
function MobileControls({ keys, onJump }) {
  const handleTouchStart = (key) => { keys.current[key] = true; };
  const handleTouchEnd = (key) => { keys.current[key] = false; };
  
  const buttonStyle = {
    width: '50px',
    height: '50px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    userSelect: 'none',
    touchAction: 'none',
  };
  
  const jumpButtonStyle = {
    ...buttonStyle,
    width: '60px',
    height: '60px',
    background: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
    fontWeight: 'bold',
  };
  
  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-auto md:hidden" style={{ zIndex: 50 }}>
      <div className="flex flex-col items-center gap-1">
        <button style={buttonStyle} onTouchStart={() => handleTouchStart('forward')} onTouchEnd={() => handleTouchEnd('forward')}>▲</button>
        <div className="flex gap-1">
          <button style={buttonStyle} onTouchStart={() => handleTouchStart('left')} onTouchEnd={() => handleTouchEnd('left')}>◀</button>
          <button style={buttonStyle} onTouchStart={() => handleTouchStart('backward')} onTouchEnd={() => handleTouchEnd('backward')}>▼</button>
          <button style={buttonStyle} onTouchStart={() => handleTouchStart('right')} onTouchEnd={() => handleTouchEnd('right')}>▶</button>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <button 
          style={jumpButtonStyle} 
          onTouchStart={() => { handleTouchStart('jump'); if (onJump) onJump(); }} 
          onTouchEnd={() => handleTouchEnd('jump')}
        >
          JUMP
        </button>
        <div className="flex gap-2">
          <button style={buttonStyle} onTouchStart={() => handleTouchStart('lookLeft')} onTouchEnd={() => handleTouchEnd('lookLeft')}>↺</button>
          <button style={buttonStyle} onTouchStart={() => handleTouchStart('lookRight')} onTouchEnd={() => handleTouchEnd('lookRight')}>↻</button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function ILoveYouPage() {
  const [playerPos, setPlayerPos] = useState([0, 1.6, 5]);
  const [playerYaw, setPlayerYaw] = useState(0);
  const [isNearOther, setIsNearOther] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // Character switching
  const [currentCharacter, setCurrentCharacter] = useState('bea'); // Start as Bea
  const [switchCooldown, setSwitchCooldown] = useState(0);
  const [canSwitch, setCanSwitch] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Used to trigger position reset
  
  // Special abilities
  const [abilityCooldown, setAbilityCooldown] = useState(0);
  const [canUseAbility, setCanUseAbility] = useState(true);
  
  const [messages, setMessages] = useState([
    { sender: 'jb', text: "Hey Bea! Come closer and press E or tap me to chat! 👋" }
  ]);
  
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
  
  // Sound effects refs
  const walkSoundRef = useRef(null);
  const isWalkingRef = useRef(false);
  const waveSoundRef = useRef(null);
  const interactSoundRef = useRef(null);
  const jumpSoundRef = useRef(null);
  const switchSoundRef = useRef(null);
  const whistleSoundRef = useRef(null);
  const happySoundRef = useRef(null);
  
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
    
    // Start transition
    setIsTransitioning(true);
    setCanSwitch(false);
    
    // Play switch sound
    if (switchSoundRef.current) switchSoundRef.current();
    
    // After fade out (1.5s), switch character
    setTimeout(() => {
      const newChar = currentCharacter === 'bea' ? 'jb' : 'bea';
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
        setSwitchCooldown(10);
      }, 1500);
    }, 1500);
  };
  
  // Initialize sound effects
  useEffect(() => {
    // Create audio context for generating sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Walking sound - footstep loop
    const createWalkSound = () => {
      const audio = new Audio();
      // Create oscillator-based footstep sound
      const playFootstep = () => {
        if (!isWalkingRef.current) return;
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(80, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.1);
        
        if (isWalkingRef.current) {
          setTimeout(playFootstep, 350);
        }
      };
      return playFootstep;
    };
    
    walkSoundRef.current = createWalkSound();
    
    // Wave sound - friendly chime
    const createWaveSound = () => {
      return () => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        osc.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
        
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.4);
      };
    };
    
    waveSoundRef.current = createWaveSound();
    
    // Interaction sound - pop/click
    const createInteractSound = () => {
      return () => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.25, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.15);
      };
    };
    
    interactSoundRef.current = createInteractSound();
    
    // Jump sound
    const createJumpSound = () => {
      return () => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        // Upward sweep for jump
        osc.frequency.setValueAtTime(200, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.2);
      };
    };
    
    jumpSoundRef.current = createJumpSound();
    
    // Switch character sound
    const createSwitchSound = () => {
      return () => {
        const osc = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        osc2.type = 'sine';
        
        // Magical switch sound - two tones
        osc.frequency.setValueAtTime(400, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
        
        osc2.frequency.setValueAtTime(600, audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        osc.start(audioContext.currentTime);
        osc2.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.3);
        osc2.stop(audioContext.currentTime + 0.3);
      };
    };
    
    switchSoundRef.current = createSwitchSound();
    
    // Whistle sound (for Bea calling JB)
    const createWhistleSound = () => {
      return () => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        // Two-tone whistle
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.setValueAtTime(1200, audioContext.currentTime + 0.15);
        osc.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
        osc.frequency.setValueAtTime(1000, audioContext.currentTime + 0.45);
        
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.6);
      };
    };
    
    whistleSoundRef.current = createWhistleSound();
    
    // Happy sound (for JB making Bea happy)
    const createHappySound = () => {
      return () => {
        // Play ascending arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
          
          gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
          
          osc.start(audioContext.currentTime + i * 0.1);
          osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
        });
      };
    };
    
    happySoundRef.current = createHappySound();
    
    return () => {
      audioContext.close();
    };
  }, []);
  
  // Walking sound effect - triggered by movement
  useEffect(() => {
    const checkWalking = setInterval(() => {
      const isMoving = keys.current.forward || keys.current.backward || 
                       keys.current.left || keys.current.right;
      
      if (isMoving && !isWalkingRef.current && !isChatOpen) {
        isWalkingRef.current = true;
        if (walkSoundRef.current) walkSoundRef.current();
      } else if (!isMoving) {
        isWalkingRef.current = false;
      }
    }, 100);
    
    return () => clearInterval(checkWalking);
  }, [isChatOpen]);
  
  // Wave sound when near other character
  const prevNearOtherRef = useRef(false);
  useEffect(() => {
    if (isNearOther && !prevNearOtherRef.current && waveSoundRef.current) {
      waveSoundRef.current();
    }
    prevNearOtherRef.current = isNearOther;
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
        case 'KeyE':
          if (isNearOther && !isChatOpen) {
            document.exitPointerLock();
            setIsChatOpen(true);
            setIsTalking(true);
            // Play interaction sound
            if (interactSoundRef.current) interactSoundRef.current();
          }
          break;
        case 'Escape':
          if (isChatOpen) {
            setIsChatOpen(false);
            setIsTalking(false);
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
  }, [isNearOther, isChatOpen, canSwitch]);
  
  const handleSendMessage = (text, category = null) => {
    // Determine who's sending and who's responding
    const playerChar = currentCharacter;
    const otherChar = currentCharacter === 'bea' ? 'jb' : 'bea';
    
    setMessages(prev => [...prev, { sender: playerChar, text }]);
    
    setTimeout(() => {
      let responseCategory = category;
      
      if (!responseCategory) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey')) {
          responseCategory = 'greetings';
        } else if (lowerText.includes('love') || lowerText.includes('heart')) {
          responseCategory = 'love';
        } else if (lowerText.includes('funny') || lowerText.includes('joke') || lowerText.includes('laugh')) {
          responseCategory = 'funny';
        } else if (lowerText.includes('beautiful') || lowerText.includes('pretty') || lowerText.includes('compliment')) {
          responseCategory = 'compliments';
        } else if (lowerText.includes('bye') || lowerText.includes('leave') || lowerText.includes('go')) {
          responseCategory = 'goodbye';
        } else {
          responseCategory = 'random';
        }
      }
      
      const response = getRandomResponse(otherChar, responseCategory);
      setMessages(prev => [...prev, { sender: otherChar, text: response }]);
    }, 500);
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setIsTalking(false);
  };
  
  const handleMenuClick = () => {
    unlockAll();
  };
  
  // Get character name for display
  const otherCharacterName = currentCharacter === 'bea' ? 'JB' : 'Bea';
  
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
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Character Switch Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'black' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl mb-4">✨</div>
              <p className="text-white text-xl font-bold">
                Switching to {currentCharacter === 'bea' ? '💚 JB' : '💜 Bea'}...
              </p>
            </motion.div>
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
        
        {/* Current character indicator & buttons */}
        {!isTransitioning && (
        <div className="absolute top-4 left-4 text-white text-sm bg-black/40 px-3 py-2 rounded-lg pointer-events-auto">
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
          <p className="hidden md:block text-xs text-white/70">
            {isLocked 
              ? currentCharacter === 'bea'
                ? 'WASD - Move | Space - Jump | Q - Switch | V - Whistle | E - Talk'
                : 'WASD - Move | Space - Jump | Q - Switch | E - Talk'
              : 'Click to enable mouse look'}
          </p>
          <p className="md:hidden text-xs text-white/70">Use controls below</p>
        </div>
        )}
        
        {/* Interaction prompt - just shows name with punctuation */}
        <AnimatePresence>
          {isNearOther && !isChatOpen && !isTransitioning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16"
            >
              <div className="bg-black/50 px-4 py-2 rounded-lg text-white text-center">
                <p className="text-lg font-bold" style={{ color: currentCharacter === 'bea' ? '#2D8B2D' : '#8B5CF6' }}>
                  {otherCharacterName}
                </p>
                <p className="text-sm">Press E or tap to talk</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile switch button */}
        {!isTransitioning && (
        <div className="absolute top-20 left-4 pointer-events-auto md:hidden flex flex-col gap-2">
          <button
            onClick={handleCharacterSwitch}
            disabled={!canSwitch || isChatOpen}
            className={`px-3 py-2 rounded-lg text-white text-sm font-bold ${
              canSwitch && !isChatOpen
                ? 'bg-purple-600'
                : 'bg-gray-600 opacity-50'
            }`}
          >
            {canSwitch ? '🔄 Switch' : `⏱️ ${switchCooldown}s`}
          </button>
          {currentCharacter === 'bea' && (
          <button
            onClick={handleSpecialAbility}
            disabled={!canUseAbility || isChatOpen}
            className={`px-3 py-2 rounded-lg text-white text-sm font-bold ${
              canUseAbility && !isChatOpen
                ? 'bg-purple-500'
                : 'bg-gray-600 opacity-50'
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