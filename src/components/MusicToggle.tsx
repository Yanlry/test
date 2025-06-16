import React from 'react';
import { useMusic } from '../context/MusicContext';

const MusicToggle = () => {
  const { isPlaying, toggleMusic } = useMusic();

  return (
    <button
      onClick={toggleMusic}
      aria-label={isPlaying ? 'Désactiver la musique' : 'Activer la musique'}
      className="
        flex items-center gap-2
        px-4 py-2
        bg-gradient-to-r from-purple-600 to-indigo-600
        text-white font-semibold rounded-lg shadow-md
        hover:from-purple-700 hover:to-indigo-700
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        transition
        select-none
      "
      type="button"
    >
      {isPlaying ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-4.553a.75.75 0 10-1.06-1.06L14 8.94M9 14l-4.553 4.553a.75.75 0 101.06 1.06L10 15.06M9 5v14l6-7-6-7z"
            />
          </svg>
          Musique activée
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5v14l6-7-6-7z"
            />
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
          Activer la musique
        </>
      )}
    </button>
  );
};

export default MusicToggle;
