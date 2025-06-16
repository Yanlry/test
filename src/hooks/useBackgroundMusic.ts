import { useEffect, useRef } from 'react';

export const useBackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/background.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    audioRef.current.play().catch((err) => {
      console.warn('Lecture automatique bloquée par le navigateur.', err);
    });

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);
};
