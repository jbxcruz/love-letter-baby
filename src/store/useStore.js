import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Unlock states for each section
      unlockedSections: {
        monthsary: true,      // Always unlocked by default
        pumpkinpie: false,    // Unlocks after monthsary
        honeybunch: false,    // Unlocks after pumpkinpie
        iloveyou: false,      // Unlocks after honeybunch
      },

      // Track if all sections are accessible (after completing iloveyou)
      allUnlocked: false,

      // Audio state
      audioEnabled: true,
      currentTrack: null,

      // Actions
      unlockSection: (section) => {
        set((state) => ({
          unlockedSections: {
            ...state.unlockedSections,
            [section]: true,
          },
        }));
      },

      unlockAll: () => {
        set({
          allUnlocked: true,
          unlockedSections: {
            monthsary: true,
            pumpkinpie: true,
            honeybunch: true,
            iloveyou: true,
          },
        });
      },

      // Check if a section is accessible
      isSectionUnlocked: (section) => {
        const state = get();
        if (state.allUnlocked) return true;
        return state.unlockedSections[section];
      },

      // Audio controls
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
      setCurrentTrack: (track) => set({ currentTrack: track }),

      // Reset progress (for testing)
      resetProgress: () => {
        set({
          unlockedSections: {
            monthsary: true,
            pumpkinpie: false,
            honeybunch: false,
            iloveyou: false,
          },
          allUnlocked: false,
        });
      },
    }),
    {
      name: 'love-letter-storage',
      partialize: (state) => ({
        unlockedSections: state.unlockedSections,
        allUnlocked: state.allUnlocked,
      }),
    }
  )
);

export default useStore;
