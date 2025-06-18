import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Grid3X3, Eye, EyeOff } from 'lucide-react';
import { useMusic } from '../../context/MusicContext'; // Chemin corrigé

interface SettingsMenuProps {
  showGrid: boolean;
  onToggleGrid: (show: boolean) => void;
}

/**
 * Menu paramètres centralisé et sobre
 * Regroupe tous les contrôles de l'interface (musique, grille, etc.)
 */
const SettingsMenu: React.FC<SettingsMenuProps> = ({ showGrid, onToggleGrid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isPlaying, toggleMusic } = useMusic();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="absolute bottom-4 left-4 z-50">
      {/* Bouton principal pour ouvrir/fermer le menu */}
      <div className="relative">
        <button
          onClick={toggleMenu}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full
            bg-gray-900/90 border-2 border-gray-600
            text-gray-300 hover:text-white
            hover:bg-gray-800 hover:border-gray-500
            backdrop-blur-sm shadow-lg transition-all duration-300
            ${isOpen ? 'bg-gray-800 border-gray-500 text-white' : ''}
          `}
          title="Paramètres"
        >
          <Settings 
            size={20} 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} 
          />
        </button>

        {/* Menu déroulant */}
        {isOpen && (
          <div className="absolute bottom-16 left-0 mb-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-xl">
            <div className="p-4 space-y-3">
              {/* Titre du menu */}
              <h3 className="text-white font-semibold text-sm border-b border-gray-700 pb-2">
                Paramètres du jeu
              </h3>

              {/* Contrôle de la musique */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isPlaying ? (
                    <Volume2 size={16} className="text-green-400" />
                  ) : (
                    <VolumeX size={16} className="text-red-400" />
                  )}
                  <span className="text-gray-300 text-sm">Musique</span>
                </div>
                <button
                  onClick={toggleMusic}
                  className={`
                    px-3 py-1 rounded text-xs font-medium transition-all duration-200
                    ${isPlaying 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                    }
                  `}
                >
                  {isPlaying ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Contrôle de la grille */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {showGrid ? (
                    <Grid3X3 size={16} className="text-blue-400" />
                  ) : (
                    <Eye size={16} className="text-gray-500" />
                  )}
                  <span className="text-gray-300 text-sm">Grille</span>
                </div>
                <button
                  onClick={() => onToggleGrid(!showGrid)}
                  className={`
                    px-3 py-1 rounded text-xs font-medium transition-all duration-200
                    ${showGrid 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  {showGrid ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-700 pt-2">
                <p className="text-gray-500 text-xs text-center">
                  Cliquez sur l'engrenage pour fermer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overlay pour fermer le menu en cliquant ailleurs */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsMenu;