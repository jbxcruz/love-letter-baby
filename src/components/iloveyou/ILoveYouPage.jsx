import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import PageTransition from '../common/PageTransition';
import MenuButton from '../common/MenuButton';
import { useGlobalMusic } from '../home/HomePage';
import useStore from '../../store/useStore';

// ============ QUIZ QUESTIONS ============
const allQuestions = [
  {
    question: "Asa ta first nag kita hehehehe?",
    options: ["SM", "Plaza", "7/11", "Robinsons"],
    correct: 2,
  },
  {
    question: "When man akoa birthday hehehe",
    options: ["January 18", "January 15", "January 16", "January 08"],
    correct: 0,
  },
  {
    question: "What is my favorite food?",
    options: ["Pizza", "Sushi", "Pasta", "Bealat nimo hehehe"],
    correct: 3,
  },
  {
    question: "My favorite movie genre?",
    options: ["Drama", "Comedy", "Action", "Horror"],
    correct: 3,
  },
  {
    question: "What is my middle name?",
    options: ["Marcos", "Perales", "Cerdena", "Cruz"],
    correct: 1,
  },
  {
    question: "Favorite Color nako heheheh",
    options: ["Blue", "Red", "White", "Gray"],
    correct: 2,
  },
  {
    question: "What do I like to do if free ko?heheheeh",
    options: ["Sleep", "Go out", "Watch movies", "Spend time with you"],
    correct: 3,
  },
  {
    question: "unsa akoa ganahan nga perme gunitan nako saimo hehehe?",
    options: ["Ears", "Tummy", "Feet", "Armpits"],
    correct: 1,
  },
  {
    question: "What is my zodiac sign?",
    options: ["Aries", "Taurus", "Gemini", "Capricorn"],
    correct: 3,
  },
  {
    question: "kani bi hehehe asa ta first nag date?",
    options: ["Movie Date", "Dinner Date", "Laag", "Lodge HAHAHA"],
    correct: 0,
  },
  {
    question: "asa mn ko perme mo gunit saimo kada laag nato hehehe",
    options: ["Braso", "Kamot", "Waist", "Boobies hehehe"],
    correct: 0,
  },
  {
    question: "What is my favorite flower?",
    options: ["Rose", "Tulip", "Sunflower", "Lily"],
    correct: 0,
  },
  {
    question: "What is my dream vacation?",
    options: ["Paris with you", "Japan with you", "Maldives with you", "Korea with you"],
    correct: 1,
  },
  {
    question: "What makes me happy hehehe?",
    options: ["You", "Food", "Sleep", "Shopping"],
    correct: 0,
  },
  {
    question: "What is my love language?",
    options: ["Quality Time", "Words", "Gifts", "Touch"],
    correct: 0,
  },
  {
    question: "What is my favorite dessert?",
    options: ["Ice cream", "Cake", "Bealalats nimo hehehe", "Cookies"],
    correct: 2,
  },
  {
    question: "What do I value most?",
    options: ["Honesty", "Loyalty", "Humor", "Intelligence"],
    correct: 0,
  },
  {
    question: "What is my favorite time of day?",
    options: ["Morning", "Afternoon", "Evening", "Night"],
    correct: 0,
  },
  {
    question: "What song reminds you of us?",
    options: ["Our Song", "Your Song", "Love Song", "Any Song"],
    correct: 0,
  },
  {
    question: "How many kids do I want HAHAHAHAH?",
    options: ["2", "3", "1", "4"],
    correct: 0,
  },
];

// ============ HEART DISPLAY ============
function Hearts({ lives, shake }) {
  return (
    <motion.div 
      className="flex gap-2"
      animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 1 }}
          animate={{ 
            scale: i < lives ? 1 : 0.8,
            opacity: i < lives ? 1 : 0.3,
          }}
          className="text-2xl"
        >
          {i < lives ? '❤️' : '🖤'}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ============ 3D HEART FIREWORK (Honeybunch style, no trail) ============
function HeartFirework3D({ trigger }) {
  const particlesRef = useRef();
  const particleCount = 50;
  const startTimeRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  
  // Create heart shape directions
  const heartDirections = useMemo(() => {
    const dirs = [];
    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2;
      const heartX = 16 * Math.pow(Math.sin(t), 3);
      const heartY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const scale = 0.06;
      const randomness = 0.2;
      dirs.push({
        x: heartX * scale + (Math.random() - 0.5) * randomness,
        y: heartY * scale + (Math.random() - 0.5) * randomness,
        z: (Math.random() - 0.5) * 0.5,
        speed: 0.8 + Math.random() * 0.4,
      });
    }
    return dirs;
  }, []);
  
  const [positions] = useState(() => new Float32Array(particleCount * 3));
  const [sizes] = useState(() => {
    const s = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      s[i] = 0.1 + Math.random() * 0.1;
    }
    return s;
  });
  
  // Watch for trigger changes
  useState(() => {
    if (trigger > 0) {
      setIsActive(true);
      startTimeRef.current = null;
    }
  });
  
  useFrame((state) => {
    if (!isActive || !particlesRef.current) return;
    
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }
    
    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    
    if (elapsed > 2) {
      setIsActive(false);
      // Reset positions
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      return;
    }
    
    const expandScale = Math.min(elapsed * 2, 1);
    const gravity = elapsed * elapsed * 0.3;
    const fade = Math.max(0, 1 - elapsed / 2);
    
    for (let i = 0; i < particleCount; i++) {
      const dir = heartDirections[i];
      positions[i * 3] = dir.x * dir.speed * expandScale * 3;
      positions[i * 3 + 1] = dir.y * dir.speed * expandScale * 3 - gravity;
      positions[i * 3 + 2] = dir.z * expandScale;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.material.opacity = fade;
  });
  
  // Reset when trigger changes
  useMemo(() => {
    if (trigger > 0) {
      setIsActive(true);
      startTimeRef.current = null;
    }
  }, [trigger]);
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#FF4D6D"
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FireworkScene({ trigger }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <HeartFirework3D trigger={trigger} />
    </>
  );
}

// ============ QUESTION CARD ============
function QuestionCard({ question, options, onAnswer, questionNumber, totalQuestions, correctIndex }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleClick = (index) => {
    if (showResult) return;
    
    setSelectedIndex(index);
    setShowResult(true);
    
    const isCorrect = index === correctIndex;
    
    // Notify parent after delay
    setTimeout(() => {
      onAnswer(index, isCorrect);
    }, 800);
  };

  const getButtonStyle = (index) => {
    if (!showResult) {
      return {
        background: 'rgba(255,255,255,0.9)',
        color: '#C76B6B',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      };
    }
    
    // Only highlight the selected button
    if (index === selectedIndex) {
      const isCorrect = selectedIndex === correctIndex;
      if (isCorrect) {
        return {
          background: '#48BB78',
          color: 'white',
          boxShadow: '0 4px 20px rgba(72, 187, 120, 0.5)',
        };
      } else {
        return {
          background: '#F56565',
          color: 'white',
          boxShadow: '0 4px 20px rgba(245, 101, 101, 0.5)',
        };
      }
    }
    
    // Other buttons stay normal
    return {
      background: 'rgba(255,255,255,0.9)',
      color: '#C76B6B',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Question number */}
      <div className="text-center mb-4">
        <span className="text-white/70 text-sm">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question */}
      <div 
        className="p-6 rounded-2xl mb-6"
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <h2 className="font-body text-xl md:text-2xl text-white text-center">
          {question}
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={!showResult ? { scale: 1.03 } : {}}
            whileTap={!showResult ? { scale: 0.97 } : {}}
            onClick={() => handleClick(index)}
            disabled={showResult}
            className="p-4 rounded-xl font-body text-lg transition-all"
            style={getButtonStyle(index)}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ============ FINAL QUESTION ============
function FinalQuestion({ onYes }) {
  const [noScale, setNoScale] = useState(1);
  const [noClicks, setNoClicks] = useState(0);

  const handleNoClick = () => {
    setNoClicks(prev => prev + 1);
    setNoScale(prev => Math.max(prev * 0.7, 0.1));
  };

  const noVisible = noScale > 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <div 
        className="p-8 rounded-2xl mb-8"
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <h2 className="font-script text-4xl md:text-5xl text-white">
          Do you love me?
        </h2>
      </div>

      <div className="flex justify-center items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onYes}
          className="px-10 py-4 rounded-2xl font-body text-2xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #FF6B8A, #FF8E9E)',
            color: 'white',
            boxShadow: '0 6px 25px rgba(255, 107, 138, 0.4)',
          }}
        >
          YES
        </motion.button>

        {noVisible && (
          <motion.button
            animate={{ scale: noScale }}
            whileHover={{ scale: noScale * 1.05 }}
            whileTap={{ scale: noScale * 0.95 }}
            onClick={handleNoClick}
            className="px-8 py-3 rounded-xl font-body text-lg"
            style={{
              background: 'rgba(150,150,150,0.5)',
              color: 'white',
              transformOrigin: 'center',
            }}
          >
            No
          </motion.button>
        )}
      </div>

      {noClicks > 0 && noVisible && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-white/60 text-sm"
        >
          {noClicks === 1 && "Are you sure?"}
          {noClicks === 2 && "Please think again..."}
          {noClicks === 3 && "The button is getting smaller..."}
          {noClicks >= 4 && "Just click YES already!"}
        </motion.p>
      )}

      {!noVisible && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-white/80 text-lg"
        >
          Looks like YES is the only option now!
        </motion.p>
      )}
    </motion.div>
  );
}

// ============ RESULT SCREENS ============
function WinScreen({ onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <h2 
        className="font-script text-5xl md:text-6xl mb-4"
        style={{ color: '#FFE4E9' }}
      >
        I Love You More, Baby!
      </h2>
      
      <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
        Thank you for saying yes! You make my heart so happy!
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <MenuButton onClick={onComplete} visible={true} delay={0} />
      </motion.div>
    </motion.div>
  );
}

function GameOverScreen({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <h2 
        className="font-script text-4xl md:text-5xl mb-4"
        style={{ color: '#FFE4E9' }}
      >
        Game Over
      </h2>
      
      <p className="text-white/80 text-lg mb-8">
        You ran out of hearts! Do you really know me?
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="px-8 py-3 rounded-xl font-body text-lg"
        style={{
          background: 'linear-gradient(135deg, #FF6B8A, #FF8E9E)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(255, 107, 138, 0.3)',
        }}
      >
        Try Again
      </motion.button>
    </motion.div>
  );
}

// ============ MAIN PAGE ============
export default function ILoveYouPage() {
  const [gameState, setGameState] = useState('playing');
  const [lives, setLives] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shakeHearts, setShakeHearts] = useState(false);
  const [fireworkTrigger, setFireworkTrigger] = useState(0);
  const [questionKey, setQuestionKey] = useState(0); // Key to force re-render question
  const unlockAll = useStore((state) => state.unlockAll);

  // Randomly select 15 questions
  const questions = useMemo(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15);
  }, []);

  // Function to shuffle options for current question
  const getShuffledQuestion = (questionData) => {
    const correctAnswer = questionData.options[questionData.correct];
    const shuffledOptions = [...questionData.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    return {
      ...questionData,
      options: shuffledOptions,
      correct: newCorrectIndex,
    };
  };

  const [currentShuffledQuestion, setCurrentShuffledQuestion] = useState(() => 
    getShuffledQuestion(questions[0])
  );

  useGlobalMusic('iloveyou', 0.3);

  const totalQuestions = 15;

  const handleAnswer = (selectedIndex, isCorrect) => {
    if (isCorrect) {
      // Trigger heart firework
      setFireworkTrigger(prev => prev + 1);
      
      // Move to next question after delay
      setTimeout(() => {
        if (currentQuestionIndex >= totalQuestions - 1) {
          setGameState('final');
        } else {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setCurrentShuffledQuestion(getShuffledQuestion(questions[nextIndex]));
          setQuestionKey(prev => prev + 1);
        }
      }, 1000);
    } else {
      // Wrong answer - lose life
      const newLives = lives - 1;
      setLives(newLives);
      
      // Shake hearts
      setShakeHearts(true);
      setTimeout(() => setShakeHearts(false), 500);

      if (newLives <= 0) {
        setTimeout(() => {
          setGameState('gameover');
        }, 800);
        return;
      }

      // Stay on same question but reshuffle options
      setTimeout(() => {
        setCurrentShuffledQuestion(getShuffledQuestion(questions[currentQuestionIndex]));
        setQuestionKey(prev => prev + 1);
      }, 800);
    }
  };

  const handleFinalYes = () => {
    setGameState('win');
  };

  const handleRetry = () => {
    setLives(3);
    setCurrentQuestionIndex(0);
    setCurrentShuffledQuestion(getShuffledQuestion(questions[0]));
    setQuestionKey(prev => prev + 1);
    setGameState('playing');
  };

  const handleComplete = () => {
    unlockAll();
  };

  return (
    <PageTransition>
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
      />

      {/* 3D Heart Firework Canvas */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ pointerEvents: 'none' }}>
          <FireworkScene trigger={fireworkTrigger} />
        </Canvas>
      </div>

      {/* Hearts at top-left corner */}
      {(gameState === 'playing' || gameState === 'final') && (
        <div className="absolute top-6 left-6 z-20">
          <Hearts lives={lives} shake={shakeHearts} />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 py-8">
        
        {/* Game content */}
        <AnimatePresence mode="wait">
          {gameState === 'playing' && currentShuffledQuestion && (
            <QuestionCard
              key={questionKey}
              question={currentShuffledQuestion.question}
              options={currentShuffledQuestion.options}
              onAnswer={handleAnswer}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              correctIndex={currentShuffledQuestion.correct}
            />
          )}

          {gameState === 'final' && (
            <FinalQuestion onYes={handleFinalYes} />
          )}

          {gameState === 'win' && (
            <WinScreen onComplete={handleComplete} />
          )}

          {gameState === 'gameover' && (
            <GameOverScreen onRetry={handleRetry} />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}