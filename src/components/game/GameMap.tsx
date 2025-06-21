/**
 * GAME MAP - VERSION FINALE AVEC INTERFACE DOFUS
 * ✅ CORRIGÉ: Interface utilisateur complète comme Dofus
 * ✅ AJOUTÉ: Chat instantané, barres de vie/MP, barre de sorts
 * ✅ CORRIGÉ: Toutes les fonctionnalités existantes conservées
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
import { Pause, Heart, Package, Star } from 'lucide-react';

interface GameMapProps {
  character: Character;
  onBackToMenu: () => void;
}

const GameMap: React.FC<GameMapProps> = ({ character, onBackToMenu }) => {
  // Hook de mouvement
  const movement = useGameMovement();

  // États pour les panneaux latéraux (INCHANGÉ)
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [activeInventoryTab, setActiveInventoryTab] = useState<InventoryTab>('equipement');

  // États pour les stats du joueur (INCHANGÉ)
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

  // État pour la grille (INCHANGÉ)
  const [showGrid, setShowGrid] = useState(true);

  // ✅ NOUVEAUX ÉTATS POUR L'INTERFACE DOFUS
  const [currentHP, setCurrentHP] = useState(450);
  const [currentMP, setCurrentMP] = useState(180);

  // Stats HP/MP calculées (AMÉLIORÉ)
  const maxHP = 500 + (playerStats.vitality * 5);
  const maxMP = 300 + (playerStats.wisdom * 3);

  const isGamePaused = showLeftSidebar || showRightSidebar;

  // Fonctions de gestion des stats (INCHANGÉES)
  const handleImproveStat = (statName: keyof PlayerStats, pointsToAdd?: number) => {
    const points = pointsToAdd || statInputs[statName];
    if (availablePoints < points || points <= 0) return;
    setAvailablePoints(prev => prev - points);
    setPlayerStats(prev => ({ ...prev, [statName]: prev[statName] + points }));
  };

  const handleUpdateStatInput = (statName: keyof PlayerStats, value: number) => {
    setStatInputs(prev => ({ ...prev, [statName]: Math.max(1, value) }));
  };

  // ✅ NOUVELLE FONCTION pour gérer les clics sur les sorts
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

    // Ici vous pourrez ajouter la logique des sorts plus tard
    // Par exemple: appliquer des effets, animations, etc.
  }, [currentMP]);

  // ✅ FONCTION pour recevoir et transmettre les données de praticabilité
  const handleMapDataLoaded = useCallback((isWalkable: (x: number, y: number) => boolean) => {
    console.log('📡 GameMap: Réception des données de praticabilité depuis TiledMapRenderer');
    console.log('📤 GameMap: Transmission des données au hook de mouvement');
    
    // Transmettre les données de praticabilité au hook de mouvement
    movement.setWalkableFunction(isWalkable);
  }, [movement]);

  // ✅ FONCTION de clic simplifiée (la validation se fait maintenant dans le hook)
  const handleTileClick = useCallback((col: number, row: number) => {
    if (isGamePaused) {
      console.log('🚫 Jeu en pause, clic ignoré');
      return;
    }
    
    console.log(`🎯 GameMap: Transmission du clic (${col}, ${row}) au hook de mouvement`);
    // Le hook va maintenant gérer toute la validation avec les vraies données Tiled
    movement.handleTileClick(col, row);
  }, [isGamePaused, movement]);

  // Chemin vers votre map Tiled
  const mapPath = '/assets/maps/IsometricMap.tmj';

  return (
    <div className="h-screen w-screen overflow-hidden relative flex">
      
      {/* PANNEAU GAUCHE - VIE ET SORTS (INCHANGÉ) */}
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

      {/* ZONE DE JEU CENTRALE - AVEC COMMUNICATION COMPLÈTE */}
      <div className="flex-1 relative">
        
        {/* Messages de pause (INCHANGÉS) */}
        {isGamePaused && showRightSidebar && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-orange-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-orange-500/30">
              <div className="text-center text-white">
                <Pause size={48} className="mx-auto mb-4 text-orange-400 animate-pulse" />
                <p className="text-2xl font-bold mb-2 text-orange-400">Jeu en Pause</p>
                <p className="text-gray-300">Fermez l'inventaire pour continuer</p>
                <div className="mt-4 flex justify-center space-x-4">
                  <Star className="text-yellow-400 animate-spin" size={20} />
                  <Star className="text-yellow-400 animate-spin" size={16} style={{ animationDelay: '0.5s' }} />
                  <Star className="text-yellow-400 animate-spin" size={20} style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {isGamePaused && showLeftSidebar && !showRightSidebar && (
          <div className="absolute right-1/2 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-orange-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-orange-500/30">
              <div className="text-center text-white">
                <Pause size={48} className="mx-auto mb-4 text-orange-400 animate-pulse" />
                <p className="text-2xl font-bold mb-2 text-orange-400">Jeu en Pause</p>
                <p className="text-gray-300">Fermez le panneau pour continuer</p>
                <div className="mt-4 flex justify-center space-x-4">
                  <Star className="text-yellow-400 animate-spin" size={20} />
                  <Star className="text-yellow-400 animate-spin" size={16} style={{ animationDelay: '0.5s' }} />
                  <Star className="text-yellow-400 animate-spin" size={20} style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPOSANT TILED AVEC COMMUNICATION COMPLÈTE (INCHANGÉ) */}
        <TiledMapRenderer
          mapPath={mapPath}
          playerPosition={movement.playerPosition}
          isMoving={movement.isMoving}
          targetPosition={movement.targetPosition}
          onTileClick={handleTileClick}
          showGrid={showGrid && !showRightSidebar}
          isGamePaused={isGamePaused}
          onMapDataLoaded={handleMapDataLoaded}
        />

        {/* BOUTONS DE NAVIGATION (INCHANGÉS) */}
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

        {/* Menu paramètres (INCHANGÉ) */}
        <SettingsMenu 
          showGrid={showGrid}
          onToggleGrid={setShowGrid}
        />

        {/* ✅ NOUVELLE INTERFACE UTILISATEUR DOFUS */}
        <GameUI
          currentHP={currentHP}
          maxHP={maxHP}
          currentMP={currentMP}
          maxMP={maxMP}
          spells={DEFAULT_SPELLS}
          onSpellClick={handleSpellClick}
        />
      </div>

      {/* PANNEAU DROIT - INVENTAIRE (INCHANGÉ) */}
      <div className={`transition-all duration-300 flex-shrink-0 relative z-50 ${showRightSidebar ? 'w-2/3 opacity-100' : 'w-0 opacity-0'}`}>
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