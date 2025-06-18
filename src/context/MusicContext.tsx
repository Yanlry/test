import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

type MusicContextType = {
  isPlaying: boolean;
  toggleMusic: () => void;
};

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(true); // MODIFIÉ : true par défaut
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Fonction pour initialiser l'audio
  const initializeAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/background.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
  };

  // Fonction pour démarrer la musique automatiquement après interaction
  const startAutoPlay = () => {
    if (!hasInteracted && isPlaying) {
      initializeAudio();
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.log('Auto-play en attente d\'interaction utilisateur:', error);
        });
      }
      setHasInteracted(true);
    }
  };

  // Écouteur pour la première interaction utilisateur
  useEffect(() => {
    const handleFirstInteraction = () => {
      startAutoPlay();
      // Supprime les écouteurs après la première interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isPlaying, hasInteracted]);

  const toggleMusic = () => {
    initializeAudio();

    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        console.log('Erreur lecture:', error);
      });
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
};