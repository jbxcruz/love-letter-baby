import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import useStore from '../../store/useStore';

const audioTracks = {
  home: '/audio/home.mp3',
  monthsary: '/audio/monthsary.mp3',
  letter: '/audio/letter.mp3',
  birthday: '/audio/birthday.mp3',
  game: '/audio/game.mp3',
};

export default function AudioManager({ track, volume = 0.5 }) {
  const soundRef = useRef(null);
  const audioEnabled = useStore((state) => state.audioEnabled);
  
  useEffect(() => {
    // Clean up previous sound
    if (soundRef.current) {
      soundRef.current.fade(soundRef.current.volume(), 0, 500);
      setTimeout(() => {
        if (soundRef.current) {
          soundRef.current.unload();
          soundRef.current = null;
        }
      }, 500);
    }
    
    if (!track || !audioTracks[track]) return;
    
    // Create new sound
    soundRef.current = new Howl({
      src: [audioTracks[track]],
      loop: true,
      volume: 0,
      html5: true,
      onload: () => {
        if (soundRef.current && audioEnabled) {
          soundRef.current.play();
          soundRef.current.fade(0, volume, 1000);
        }
      },
      onloaderror: (id, error) => {
        console.log('Audio load error (this is normal if audio files are not yet added):', error);
      },
    });
    
    return () => {
      if (soundRef.current) {
        soundRef.current.fade(soundRef.current.volume(), 0, 300);
        setTimeout(() => {
          if (soundRef.current) {
            soundRef.current.unload();
            soundRef.current = null;
          }
        }, 300);
      }
    };
  }, [track, audioEnabled, volume]);
  
  // Handle audio enabled state changes
  useEffect(() => {
    if (soundRef.current) {
      if (audioEnabled) {
        soundRef.current.play();
        soundRef.current.fade(0, volume, 500);
      } else {
        soundRef.current.fade(soundRef.current.volume(), 0, 500);
        setTimeout(() => {
          if (soundRef.current) {
            soundRef.current.pause();
          }
        }, 500);
      }
    }
  }, [audioEnabled, volume]);
  
  return null;
}
