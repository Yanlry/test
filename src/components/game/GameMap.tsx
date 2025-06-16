import React, { useState } from 'react';
import worldMapImage from '../../assets/world-map.jpg';
import newMapImage from '../../assets/1.jpg';

import PlayerPanel from './PlayerPanel';
import InventoryPanel from './InventoryPanel';
import MusicToggle from '../MusicToggle';

import { useGameMovement } from '../../hooks/useGameMovement';
import { 
  MAP_WIDTH, 
  MAP_HEIGHT, 
  TOTAL_TILES, 
  isInWaterZone,
  DEFAULT_PLAYER_STATS,
  DEFAULT_AVAILABLE_POINTS
} from '../../utils/gameConstants';

import { Character, PlayerStats, InventoryTab } from '../../types/game';
import { Pause, Heart, Package, Star } from 'lucide-react';

interface GameMapProps {
  character: Character;
  onBackToMenu: () => void;
}

const GameMap: React.FC<GameMapProps> = ({ character, onBackToMenu }) => {
  const movement = useGameMovement();

  // États pour les panneaux latéraux
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [activeInventoryTab, setActiveInventoryTab] = useState<InventoryTab>('equipement');

  // États pour les stats du joueur
  const [playerStats, setPlayerStats] = useState<PlayerStats>(DEFAULT_PLAYER_STATS);
  const [availablePoints, setAvailablePoints] = useState(DEFAULT_AVAILABLE_POINTS);
  const [statInputs, setStatInputs] = useState<Record<keyof PlayerStats, number>>({
    vitality: 1,
    wisdom: 1,
    strength: 1,
    agility: 1,
    chance: 1,
    intelligence: 1,
  });

  // État pour la grille (AJOUTÉ)
  const [showGrid, setShowGrid] = useState(true);

  const currentHP = 450;
  const maxHP = 500 + (playerStats.vitality * 5);
  const currentMP = 180;
  const maxMP = 300 + (playerStats.wisdom * 3);

  const isGamePaused = showLeftSidebar || showRightSidebar;

  const handleImproveStat = (statName: keyof PlayerStats, pointsToAdd?: number) => {
    const points = pointsToAdd || statInputs[statName];
    if (availablePoints < points || points <= 0) return;
    setAvailablePoints(prev => prev - points);
    setPlayerStats(prev => ({ ...prev, [statName]: prev[statName] + points }));
  };

  const handleUpdateStatInput = (statName: keyof PlayerStats, value: number) => {
    setStatInputs(prev => ({ ...prev, [statName]: Math.max(1, value) }));
  };

  const getCurrentMapImage = () => movement.currentMap === 'world' ? worldMapImage : newMapImage;

  const handleTileClick = (col: number, row: number) => {
    if (isGamePaused) return;
    movement.handleTileClick(col, row);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative flex">
      {/* Overlay de pause */}
      {isGamePaused && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center text-white">
            <Pause size={48} className="mx-auto mb-4 text-orange-400 animate-pulse" />
            <p className="text-2xl font-bold mb-2">Jeu en Pause</p>
            <p className="text-gray-300">Fermez les panneaux pour continuer à jouer</p>
            <div className="mt-4 flex justify-center space-x-4">
              <Star className="text-yellow-400 animate-spin" size={20} />
              <Star className="text-yellow-400 animate-spin" size={16} style={{ animationDelay: '0.5s' }} />
              <Star className="text-yellow-400 animate-spin" size={20} style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU GAUCHE - VIE ET SORTS */}
      <div className={`transition-all duration-300 flex-shrink-0 relative z-50 ${showLeftSidebar ? 'w-80 opacity-100' : 'w-0 opacity-0'}`}>
        {showLeftSidebar && (
          <PlayerPanel
            character={character}
            playerPosition={movement.playerPosition}
            currentMapName={movement.getCurrentMapInfo().name}
            playerStats={playerStats}
            availablePoints={availablePoints}
            statInputs={statInputs}
            currentHP={currentHP}
            maxHP={maxHP}
            currentMP={currentMP}
            maxMP={maxMP}
            onImproveStat={handleImproveStat}
            onUpdateStatInput={handleUpdateStatInput}
            onBackToMenu={onBackToMenu}
            onClose={() => setShowLeftSidebar(false)}
          />
        )}
      </div>

      {/* ZONE DE JEU CENTRALE */}
      <div className="flex-1 relative">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${getCurrentMapImage()})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#1a1a1a'
          }}
        />

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 relative">
            {/* GRILLE DE JEU avec option masquable */}
            <div 
              className="absolute inset-0 grid gap-0"
              style={{
                gridTemplateColumns: `repeat(${MAP_WIDTH}, 1fr)`,
                gridTemplateRows: `repeat(${MAP_HEIGHT}, 1fr)`,
                opacity: isGamePaused ? 0.5 : 1
              }}
            >
              {Array.from({ length: TOTAL_TILES }).map((_, i) => {
                const row = Math.floor(i / MAP_WIDTH);
                const col = i % MAP_WIDTH;
                const isPlayer = row === movement.playerPosition.y && col === movement.playerPosition.x;
                const isTarget = movement.targetPosition && row === movement.targetPosition.y && col === movement.targetPosition.x;
                const isTeleportTile = movement.isTeleportPosition(col, row);
                const isWaterTile = isInWaterZone(col, row);

                return (
                  <div
                    key={i}
                    onClick={() => handleTileClick(col, row)}
                    className={`
                      relative transition-all duration-200 flex items-center justify-center
                      ${showGrid ? 'border border-gray-700/50' : 'border border-transparent'}
                      ${!isGamePaused && !isWaterTile ? 'cursor-pointer hover:border-yellow-400/50 hover:bg-yellow-400/10' : 'cursor-not-allowed'}
                      ${isPlayer ? 'bg-blue-500/30 border-blue-400' : ''}
                      ${isTarget && movement.isMoving ? 'bg-green-500/30 border-green-400 animate-pulse' : ''}
                      ${isTeleportTile ? 'bg-purple-500/50 border-purple-300 animate-pulse' : ''}
                      ${isWaterTile ? 'cursor-not-allowed' : ''}`}
                    title={`Tuile (${col}, ${row})${isTeleportTile ? ' - PORTAIL' : ''}${isWaterTile ? ' - EAU (bloqué)' : ''}${isGamePaused ? ' - JEU EN PAUSE' : ''}`}
                  >
                    {isTeleportTile && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-purple-300 text-2xl animate-spin">🌀</span>
                      </div>
                    )}
                    {isPlayer && (
                      <div className="relative">
                        <div 
                          className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full blur-sm opacity-70 animate-pulse"
                          style={{ backgroundColor: character.class.color }}
                        />
                        <div 
                          className={`relative text-xl drop-shadow-lg z-10 transition-transform duration-200 ${movement.isMoving ? 'scale-110' : 'scale-100'}`}
                          style={{ color: character.class.color, filter: `drop-shadow(0 0 6px ${character.class.color})` }}
                        >
                          {character.class.avatar}
                        </div>
                      </div>
                    )}
                    {isTarget && movement.isMoving && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-green-400 rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* BOUTON POUR OUVRIR PANNEAU GAUCHE (VIE/SORTS) - AJOUTÉ */}
            <div className="absolute top-4 left-4 z-50">
              <button 
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                className={`
                  px-4 py-3 rounded-lg border-2 flex items-center space-x-2 transition-all duration-300 font-medium shadow-lg
                  ${showLeftSidebar 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-orange-500/30' 
                    : 'bg-gray-900/90 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 backdrop-blur-sm'
                  }
                `}
                title={showLeftSidebar ? "Fermer le panneau personnage" : "Ouvrir le panneau personnage"}
              >
                <Heart size={18} />
                <span>Personnage</span>
              </button>
            </div>

            {/* BOUTON POUR OUVRIR PANNEAU DROIT (INVENTAIRE) - AJOUTÉ */}
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className={`
                  px-4 py-3 rounded-lg border-2 flex items-center space-x-2 transition-all duration-300 font-medium shadow-lg
                  ${showRightSidebar 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-orange-500/30' 
                    : 'bg-gray-900/90 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 backdrop-blur-sm'
                  }
                `}
                title={showRightSidebar ? "Fermer l'inventaire" : "Ouvrir l'inventaire"}
              >
                <Package size={18} />
                <span>Inventaire</span>
              </button>
            </div>

            {/* CONTRÔLES EN BAS */}
            <div className="absolute bottom-4 left-4 z-40" style={{ transform: 'scale(0.8)' }}>
              <MusicToggle />
            </div>

            {/* BOUTON POUR MASQUER/AFFICHER LA GRILLE - AJOUTÉ */}
            <div className="absolute bottom-4 left-28 z-40">
              <button
                onClick={() => setShowGrid(prev => !prev)}
                className="px-3 py-2 text-sm rounded-lg bg-gray-900/90 text-white border border-gray-600 hover:bg-gray-800 hover:border-gray-500 backdrop-blur-sm shadow-lg transition"
              >
                {showGrid ? 'Masquer Grille' : 'Afficher Grille'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PANNEAU DROIT - INVENTAIRE */}
      <div className={`transition-all duration-300 flex-shrink-0 relative z-50 ${showRightSidebar ? 'w-96 opacity-100' : 'w-0 opacity-0'}`}>
        {showRightSidebar && (
          <InventoryPanel
            character={character}
            activeInventoryTab={activeInventoryTab}
            onTabChange={setActiveInventoryTab}
            onClose={() => setShowRightSidebar(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GameMap;

