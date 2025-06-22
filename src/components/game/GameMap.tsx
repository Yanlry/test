/**
 * GAME MAP - VERSION FINALE SANS BOUTONS PERSONNAGE/INVENTAIRE
 * ✅ SUPPRIMÉ: Boutons Personnage et Inventaire (maintenant dans GameUI)
 * ✅ GARDÉ: Menu Settings et panneaux plein écran
 * ✅ AJOUTÉ: Callbacks pour GameUI
 */

import React, { useState, useCallback } from 'react';

// Import du composant Tiled
import TiledMapRenderer from './TiledMapRenderer';

// Import du nouveau composant UI Dofus
import GameUI from '../GameUI';

import PlayerPanel from './PlayerPanel';
import InventoryPanel from './InventoryPanel';
import SettingsMenu from './SettingsMenu';

import { useGameMovement } from '../../hooks/useGameMovement';
import { 
  MAP_WIDTH, 
  MAP_HEIGHT, 
  TOTAL_TILES, 
  isInWaterZone,
  DEFAULT_PLAYER_STATS,
  DEFAULT_AVAILABLE_POINTS,
  DEFAULT_SPELLS
} from '../../utils/gameConstants';

import { Character, PlayerStats, InventoryTab } from '../../types/game';
import { Pause, Star, X, Settings, Volume2, Grid3X3 } from 'lucide-react';

interface GameMapProps {
  character: Character;
  onBackToMenu: () => void;
}

const GameMap: React.FC<GameMapProps> = ({ character, onBackToMenu }) => {
  // Hook de mouvement
  const movement = useGameMovement();

  // ✅ États pour les panneaux plein écran (GARDÉS)
  const [showFullscreenCharacter, setShowFullscreenCharacter] = useState(false);
  const [showFullscreenInventory, setShowFullscreenInventory] = useState(false);
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

  // ✅ États pour les paramètres (GARDÉS)
  const [showGrid, setShowGrid] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // États pour l'interface Dofus
  const [currentHP, setCurrentHP] = useState(450);
  const [currentMP, setCurrentMP] = useState(180);

  // Stats HP/MP calculées
  const maxHP = 500 + (playerStats.vitality * 5);
  const maxMP = 300 + (playerStats.wisdom * 3);

  // ✅ isGamePaused basé sur les panneaux plein écran
  const isGamePaused = showFullscreenCharacter || showFullscreenInventory;

  // Fonctions de gestion des stats
  const handleImproveStat = (statName: keyof PlayerStats, pointsToAdd?: number) => {
    const points = pointsToAdd || statInputs[statName];
    if (availablePoints < points || points <= 0) return;
    setAvailablePoints(prev => prev - points);
    setPlayerStats(prev => ({ ...prev, [statName]: prev[statName] + points }));
  };

  const handleUpdateStatInput = (statName: keyof PlayerStats, value: number) => {
    setStatInputs(prev => ({ ...prev, [statName]: Math.max(1, value) }));
  };

  // ✅ CALLBACKS pour GameUI (NOUVEAUX)
  const handleCharacterClick = useCallback(() => {
    console.log('👤 Ouverture du panneau personnage plein écran depuis GameUI');
    setShowFullscreenCharacter(true);
  }, []);

  const handleInventoryClick = useCallback(() => {
    console.log('🎒 Ouverture de l\'inventaire plein écran depuis GameUI');
    setShowFullscreenInventory(true);
  }, []);

  // Fonction pour gérer les clics sur les sorts
  const handleSpellClick = useCallback((spellId: number) => {
    const spell = DEFAULT_SPELLS.find(s => s.id === spellId);
    if (!spell) return;

    // Vérifier si on a assez de mana
    if (currentMP < spell.manaCost) {
      console.log(`❌ Pas assez de mana pour ${spell.name} (${spell.manaCost} MP requis)`);
      return;
    }

    // Utiliser le sort
    console.log(`✨ Utilisation du sort: ${spell.name}`);
    setCurrentMP(prev => Math.max(0, prev - spell.manaCost));
  }, [currentMP]);

  // Fonction pour recevoir et transmettre les données de praticabilité
  const handleMapDataLoaded = useCallback((isWalkable: (x: number, y: number) => boolean) => {
    console.log('📡 GameMap: Réception des données de praticabilité depuis TiledMapRenderer');
    console.log('📤 GameMap: Transmission des données au hook de mouvement');
    
    movement.setWalkableFunction(isWalkable);
  }, [movement]);

  // Fonction de clic simplifiée
  const handleTileClick = useCallback((col: number, row: number) => {
    if (isGamePaused) {
      console.log('🚫 Jeu en pause, clic ignoré');
      return;
    }
    
    console.log(`🎯 GameMap: Transmission du clic (${col}, ${row}) au hook de mouvement`);
    movement.handleTileClick(col, row);
  }, [isGamePaused, movement]);

  // Chemin vers votre map Tiled
  const mapPath = '/assets/maps/IsometricMap.tmj';

  return (
    <div className="h-screen w-screen overflow-hidden relative flex">
      
      {/* ZONE DE JEU CENTRALE */}
      <div className="flex-1 relative">
        
        {/* ✅ Messages de pause pour les panneaux plein écran */}
        {isGamePaused && showFullscreenCharacter && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-blue-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-blue-500/30">
              <div className="text-center text-white">
                <Pause size={48} className="mx-auto mb-4 text-blue-400 animate-pulse" />
                <p className="text-2xl font-bold mb-2 text-blue-400">Panneau Personnage Ouvert</p>
                <p className="text-gray-300">Fermez le panneau pour continuer à jouer</p>
                <div className="mt-4 flex justify-center space-x-4">
                  <Star className="text-yellow-400 animate-spin" size={20} />
                  <Star className="text-yellow-400 animate-spin" size={16} style={{ animationDelay: '0.5s' }} />
                  <Star className="text-yellow-400 animate-spin" size={20} style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {isGamePaused && showFullscreenInventory && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-orange-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-orange-500/30">
              <div className="text-center text-white">
                <Pause size={48} className="mx-auto mb-4 text-orange-400 animate-pulse" />
                <p className="text-2xl font-bold mb-2 text-orange-400">Inventaire Ouvert</p>
                <p className="text-gray-300">Fermez l'inventaire pour continuer à jouer</p>
                <div className="mt-4 flex justify-center space-x-4">
                  <Star className="text-yellow-400 animate-spin" size={20} />
                  <Star className="text-yellow-400 animate-spin" size={16} style={{ animationDelay: '0.5s' }} />
                  <Star className="text-yellow-400 animate-spin" size={20} style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPOSANT TILED AVEC COMMUNICATION COMPLÈTE */}
        <TiledMapRenderer
          mapPath={mapPath}
          playerPosition={movement.playerPosition}
          isMoving={movement.isMoving}
          targetPosition={movement.targetPosition}
          onTileClick={handleTileClick}
          showGrid={showGrid && !isGamePaused}
          isGamePaused={isGamePaused}
          onMapDataLoaded={handleMapDataLoaded}
        />

        {/* ✅ SUPPRIMÉ: Les boutons Personnage et Inventaire (maintenant dans GameUI) */}

        {/* ✅ MENU PARAMÈTRES EN HAUT À DROITE (GARDÉ) */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-300 shadow-lg
              ${showSettings 
                ? 'bg-gray-600 border-gray-500 text-white' 
                : 'bg-gray-900/90 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 backdrop-blur-sm'
              }
            `}
            title="Paramètres"
          >
            <Settings size={18} />
          </button>

          {/* Menu déroulant des paramètres */}
          {showSettings && (
            <div className="absolute top-14 right-0 bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-xl p-4 min-w-[200px]">
              <h3 className="text-white font-medium mb-3">Paramètres</h3>
              
              {/* Contrôle de la grille */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Grid3X3 size={16} className="text-gray-400" />
                  <span className="text-gray-300 text-sm">Grille</span>
                </div>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`
                    w-12 h-6 rounded-full transition-all duration-300 relative
                    ${showGrid ? 'bg-green-600' : 'bg-gray-600'}
                  `}
                >
                  <div className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300
                    ${showGrid ? 'left-7' : 'left-1'}
                  `} />
                </button>
              </div>

              {/* Contrôle du son */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 size={16} className="text-gray-400" />
                  <span className="text-gray-300 text-sm">Son</span>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`
                    w-12 h-6 rounded-full transition-all duration-300 relative
                    ${soundEnabled ? 'bg-green-600' : 'bg-gray-600'}
                  `}
                >
                  <div className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300
                    ${soundEnabled ? 'left-7' : 'left-1'}
                  `} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ✅ INTERFACE UTILISATEUR DOFUS AVEC NOUVEAUX CALLBACKS */}
        <GameUI
          currentHP={currentHP}
          maxHP={maxHP}
          currentMP={currentMP}
          maxMP={maxMP}
          spells={DEFAULT_SPELLS}
          onSpellClick={handleSpellClick}
          onInventoryClick={handleInventoryClick}        // ✅ NOUVEAU: Callback pour inventaire
          onCharacterClick={handleCharacterClick}        // ✅ NOUVEAU: Callback pour personnage
        />
      </div>

      {/* ✅ PANNEAU PERSONNAGE PLEIN ÉCRAN (GARDÉ) */}
      {showFullscreenCharacter && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-4 bg-gray-900 rounded-lg border-2 border-gray-600 shadow-2xl overflow-hidden">
            


            {/* Contenu du panneau personnage plein écran */}
            <div className="h-full">
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
                onClose={() => setShowFullscreenCharacter(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ✅ INVENTAIRE PLEIN ÉCRAN (GARDÉ) */}
      {showFullscreenInventory && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-4 bg-gray-900 rounded-lg border-2 border-gray-600 shadow-2xl overflow-hidden">
            
            {/* En-tête de l'inventaire plein écran */}
            <div className="bg-gray-800 border-b border-gray-600 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-orange-400">Inventaire</h2>
              <button
                onClick={() => setShowFullscreenInventory(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Fermer l'inventaire (Échap)"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu de l'inventaire plein écran */}
            <div className="h-full">
              <InventoryPanel
                character={character}
                activeInventoryTab={activeInventoryTab}
                onTabChange={setActiveInventoryTab}
                onClose={() => setShowFullscreenInventory(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMap;