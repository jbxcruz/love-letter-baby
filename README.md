# Love Letter Website for Bea Lorraine

A beautiful, interactive love letter website with 3D elements, animations, and a mini-game.

## Features

- **Home Page**: 3D date text display with floating particles
- **6th Monthsary**: Photo slideshow with 3D falling hearts
- **To My Pumpkinpie**: Cinematic credits-style love letter with falling photos
- **My Honeybunch**: Interactive 3D birthday cake
- **ILOVEYOU**: Mini-game where you walk around and plant tulips

## Setup Instructions

### 1. Add Your Photos

Place your photos in the following directories:

```
public/images/
├── slideshow/      # Photos for the 6th Monthsary slideshow
│   ├── 1.jpg       # Name them 1.jpg, 2.jpg, etc.
│   ├── 2.jpg
│   └── ...
│
├── falling/        # Photos that fall in the love letter page
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...
│
├── cake/           # Photos for the birthday cake tiers
│   ├── tier1.jpg
│   ├── tier2.jpg
│   └── tier3.jpg
│
└── character/      # Face photo for the game character
    └── bea-face.png
```

### 2. Add Your Audio

Place your audio files in:

```
public/audio/
├── home.mp3        # (Optional) Background music for menu
├── monthsary.mp3   # Romantic music for slideshow
├── letter.mp3      # Soft music for love letter
├── birthday.mp3    # Happy Birthday instrumental
└── game.mp3        # Peaceful music for the mini-game
```

**Free Music Sources:**
- [Pixabay Music](https://pixabay.com/music/)
- [Free Music Archive](https://freemusicarchive.org/)
- [Uppbeat](https://uppbeat.io/)

### 3. Customize Content

Edit the following files to personalize the content:

**Slideshow captions:** `src/data/slideshowData.js`
```javascript
const slideshowData = [
  { id: 1, image: '/images/slideshow/1.jpg', caption: 'Your caption here...' },
  // Add more slides...
];
```

**Love letter:** `src/data/loveLetterText.js`
```javascript
const loveLetterText = {
  greeting: 'My Dearest Bea,',
  paragraphs: [
    'Your first paragraph...',
    'Your second paragraph...',
    // Add more...
  ],
  closing: 'Forever and Always Yours,',
  signature: 'John Bert Cruz',
};
```

### 4. Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Deploy!

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

## Progressive Unlock System

The website features a progressive unlock system:

1. Start at **Home** - only "6th Monthsary" is available
2. After viewing all slideshow photos and clicking Menu, **"To My Pumpkinpie"** unlocks
3. After the love letter scroll ends, **"My Honeybunch"** unlocks
4. After viewing the birthday cake, **"ILOVEYOU"** unlocks
5. After playing the mini-game, **all sections become accessible**

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Three.js / React Three Fiber** - 3D graphics
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Howler.js** - Audio playback

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Soft Rose | #E8A0A0 | Primary buttons, accents |
| Blush Pink | #F5D0D0 | Backgrounds |
| Deep Rose | #C76B6B | Hover states, highlights |
| Cream | #FFF8F0 | Cards, panels |
| Dark Rose | #8B5A5A | Text |
| Purple Tulip | #9B59B6 | Game tulips |
| Sunset Gold | #FFB366 | Accent lighting |

## Customization

### Change the Date
Edit `src/components/home/DateText3D.jsx` and find the text "12/15/25"

### Change Names
- Edit `src/components/honeybunch/HoneybunchPage.jsx` for birthday name
- Edit `src/data/loveLetterText.js` for love letter signature
- Edit `src/components/home/HomePage.jsx` for footer text

## License

Made with love. Free to use and modify.
