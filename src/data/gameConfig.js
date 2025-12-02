// Game configuration for ILOVEYOU page

const gameConfig = {
  // Character settings
  character: {
    faceImage: '/images/character/bea-face.png',
    speed: 3,
    size: 60, // pixels
    bodyColor: '#F5D0D0',
  },
  
  // Trail settings
  trail: {
    color: '#D5A6E6',
    tulipSpawnRate: 0.3, // probability of spawning tulip at each trail point
    fadeTime: 2000, // milliseconds
  },
  
  // Tulip settings
  tulip: {
    color: '#9B59B6',
    maxTulips: 100,
  },
  
  // Environment
  environment: {
    skyGradient: {
      top: '#87CEEB',
      middle: '#FFB6C1',
      bottom: '#FF8C69',
    },
    grassColor: '#7CB889',
    flowerColors: ['#FFB6C1', '#FFD700', '#FF69B4', '#FFF'],
  },
  
  // Boundaries (percentage of screen)
  bounds: {
    top: 0.2,    // 20% from top (sky area)
    bottom: 0.9, // 90% from top (leaving space for UI)
    left: 0.05,
    right: 0.95,
  },
};

export default gameConfig;
