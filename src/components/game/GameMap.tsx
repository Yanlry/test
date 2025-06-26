/**
 * GAME MAP - VERSION COMPLÈTE AVEC SYSTÈME DE CIBLAGE
 * ✅ Déplacement en combat fonctionne
 * ✅ Système de sorts avec sélection et ciblage comme Dofus
 * ✅ Affichage de la portée des sorts
 * ✅ Possibilité de désélectionner un sort
 */

import React, { useState, useCallback, useEffect } from 'react';

// Import du composant Tiled
import TiledMapRenderer from './TiledMapRenderer';

// Import des composants UI
import GameUI from '../GameUI';
import PlayerPanel from './PlayerPanel';
import InventoryPanel from './InventoryPanel';

import { useGameMovement } from '../../hooks/useGameMovement';
import { useCombatDofus } from '../../hooks/useCombat'; // Hook modifié

import { 
  MAP_WIDTH, 
  MAP_HEIGHT, 
  DEFAULT_PLAYER_STATS,
  DEFAULT_AVAILABLE_POINTS,
  DEFAULT_SPELLS
} from '../../utils/gameConstants';

import { Character, PlayerStats, InventoryTab, Position } from '../../types/game';
import { Monster } from '../../types/combat';
import { Pause, Star, X, Settings, Volume2, Grid3X3, Eye, Trophy, Skull, CheckCircle } from 'lucide-react';

interface GameMapProps {
  character: Character;
  onBackToMenu: () => void;
}

const GameMap: React.FC<GameMapProps> = ({ character, onBackToMenu }) => {
  // Hook de mouvement
  const movement = useGameMovement();
  
  // Hook de combat style Dofus
  const combat = useCombatDofus();

  // État pour les monstres d'exploration
  const [explorationMonsters, setExplorationMonsters] = useState<Monster[]>([]);

  // États pour les panneaux plein écran
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

  // États pour les paramètres
  const [showGrid, setShowGrid] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // États pour l'interface
  const [currentHP, setCurrentHP] = useState(450);
  const [currentMP, setCurrentMP] = useState(180);

  // Stats HP/MP calculées
  const maxHP = 500 + (playerStats.vitality * 5);
  const maxMP = 300 + (playerStats.wisdom * 3);

  // isGamePaused ne bloque plus le combat
  const isGamePaused = showFullscreenCharacter || showFullscreenInventory;

  // Fonction de génération de monstre STABLE
  const generateExplorationMonster = useCallback((playerPos?: Position): Monster => {
    const monsterTypes = [
      { name: 'Gobelin Éclaireur', icon: '👹', color: '#8B4513', health: 80, level: 1, attack: 15, defense: 5 },
      { name: 'Orc Guerrier', icon: '🧌', color: '#228B22', health: 120, level: 2, attack: 25, defense: 10 },
      { name: 'Squelette Archer', icon: '💀', color: '#696969', health: 60, level: 1, attack: 20, defense: 3 },
      { name: 'Loup Affamé', icon: '🐺', color: '#483D8B', health: 90, level: 2, attack: 18, defense: 8 },
      { name: 'Araignée Géante', icon: '🕷️', color: '#800080', health: 100, level: 3, attack: 22, defense: 12 },
      { name: 'Zombie Soldat', icon: '🧟', color: '#556B2F', health: 110, level: 3, attack: 20, defense: 15 },
    ];

    const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    
    let x, y;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * (MAP_WIDTH - 4)) + 2;
      y = Math.floor(Math.random() * (MAP_HEIGHT - 4)) + 2;
      attempts++;
    } while (
      playerPos && 
      (x === playerPos.x && y === playerPos.y) &&
      attempts < 20
    );

    return {
      id: `exploration-monster-${Date.now()}-${Math.random()}`,
      name: type.name,
      position: { x, y },
      health: type.health,
      maxHealth: type.health,
      mana: 50,
      maxMana: 50,
      level: type.level,
      icon: type.icon,
      color: type.color,
      isAlive: true,
      attack: type.attack,
      defense: type.defense,
      speed: 3,
      movementPattern: 'random',
      lastMoveTime: Date.now(),
      moveInterval: 3000 + Math.random() * 4000
    };
  }, []);

  // Initialiser les monstres UNE SEULE FOIS au chargement
  useEffect(() => {
    const initialMonsters = Array.from({ length: 3 + Math.floor(Math.random() * 2) }, () => 
      generateExplorationMonster(movement.playerPosition)
    );
    setExplorationMonsters(initialMonsters);
    console.log('🐲 Monstres d\'exploration générés UNE FOIS:', initialMonsters);
  }, []);

  // Gestion du mouvement des monstres d'exploration
  const handleMonsterMove = useCallback((monsterId: string, newPosition: Position) => {
    console.log(`🐕 Demande de mouvement du monstre ${monsterId} vers (${newPosition.x}, ${newPosition.y})`);
    
    setExplorationMonsters(prev => {
      return prev.map(monster => 
        monster.id === monsterId 
          ? { ...monster, position: newPosition }
          : monster
      );
    });
  }, []);

  // Gestion du clic sur un monstre -> Démarre le combat directement sur la map
  const handleMonsterClick = useCallback((monster: Monster) => {
    console.log(`⚔️ DÉCLENCHEMENT DU COMBAT DOFUS avec ${monster.name} !`);
    
    // Démarrer le combat avec le système Dofus modifié
    combat.startCombat(monster, movement.playerPosition);
    
    // Supprimer le monstre de la liste d'exploration
    setExplorationMonsters(prev => prev.filter(m => m.id !== monster.id));
    
  }, [combat, movement.playerPosition]);

  // Gestion du raccourci clavier D pour le debug
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'D' || event.key === 'd') {
        setShowDebugOverlay(prev => {
          const newValue = !prev;
          console.log(`🔍 Debug overlay: ${newValue ? 'ON' : 'OFF'} (raccourci D)`);
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  // CALLBACKS pour GameUI
  const handleCharacterClick = useCallback(() => {
    console.log('👤 Ouverture du panneau personnage plein écran depuis GameUI');
    setShowFullscreenCharacter(true);
  }, []);

  const handleInventoryClick = useCallback(() => {
    console.log('🎒 Ouverture de l\'inventaire plein écran depuis GameUI');
    setShowFullscreenInventory(true);
  }, []);

  // ✅ NOUVEAU: Fonction pour gérer les clics sur les sorts (avec sélection)
  const handleSpellClick = useCallback((spellId: number) => {
    console.log(`🔮 === CLIC SUR SORT ===`);
    console.log(`📜 Sort ID: ${spellId}`);
    console.log(`🎮 Phase: ${combat.combatState.phase}`);
    
    // SI EN COMBAT DOFUS: Utiliser le système de sélection de sorts
    if (combat.combatState.phase === 'fighting') {
      console.log(`⚔️ Sélection de sort en combat: ${spellId}`);
      const result = combat.selectSpell('player', spellId);
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.log(`❌ ${result.message}`);
      }
      return;
    }

    // SI EN EXPLORATION: Logique normale (pas de sorts utilisables)
    console.log(`❌ Les sorts ne sont utilisables qu'en combat`);
  }, [combat]);

  // Fonction pour recevoir et transmettre les données de praticabilité
  const handleMapDataLoaded = useCallback((isWalkable: (x: number, y: number) => boolean) => {
    console.log('📡 GameMap: Réception des données de praticabilité depuis TiledMapRenderer');
    movement.setWalkableFunction(isWalkable);
  }, [movement]);

  // ✅ MODIFIÉ: Fonction de clic pour gérer exploration vs combat vs ciblage de sorts
  const handleTileClick = useCallback((col: number, row: number) => {
    console.log(`🎯 === CLIC DÉTECTÉ ===`);
    console.log(`📍 Position cliquée: (${col}, ${row})`);
    console.log(`🎮 Phase actuelle: ${combat.combatState.phase}`);
    console.log(`🔮 Sort sélectionné: ${combat.combatState.selectedSpell ? combat.combatState.selectedSpell.spell.name : 'Aucun'}`);
    console.log(`⏸️ Jeu en pause: ${isGamePaused}`);

    // Bloquer seulement si les panneaux sont ouverts ET qu'on est en exploration
    if (isGamePaused && combat.combatState.phase === 'exploring') {
      console.log('🚫 Jeu en pause avec panneau ouvert en exploration, clic ignoré');
      return;
    }

    // ✅ SI EN PLACEMENT: Permettre de cliquer sur les cases bleues
    if (combat.combatState.phase === 'placement') {
      console.log(`🎯 Clic de placement sur (${col}, ${row})`);
      
      // Vérifier si c'est une case bleue (zone joueur)
      const playerZone = combat.combatState.placementZones.find(z => z.team === 'player');
      const isPlayerZone = playerZone?.positions.some(p => p.x === col && p.y === row);
      
      if (isPlayerZone) {
        // Placer le joueur sur cette case
        combat.placeCombatant('player', { x: col, y: row });
        console.log(`✅ Joueur placé en (${col}, ${row})`);
      } else {
        console.log(`❌ Vous ne pouvez vous placer que sur les cases bleues`);
      }
      return;
    }

    // ✅ SI EN COMBAT DOFUS:
    if (combat.combatState.phase === 'fighting') {
      
      // ✅ PRIORITÉ 1: Si un sort est sélectionné, tenter de le lancer
      if (combat.combatState.selectedSpell) {
        console.log(`✨ LANCEMENT DE SORT: ${combat.combatState.selectedSpell.spell.name} vers (${col}, ${row})`);
        
        const result = combat.castSpellOnTarget({ x: col, y: row });
        
        if (result.success) {
          console.log(`✅ SORT LANCÉ: ${result.message}`);
        } else {
          console.log(`❌ SORT ÉCHOUÉ: ${result.message}`);
        }
        return;
      }
      
      // ✅ PRIORITÉ 2: Sinon, tenter un déplacement
      else {
        console.log(`🎯 === CLIC DE DÉPLACEMENT ===`);
        console.log(`📍 Tentative de déplacement vers (${col}, ${row})`);
        
        const result = combat.moveCombatant('player', { x: col, y: row });
        
        if (result && result.success) {
          console.log(`✅ DÉPLACEMENT RÉUSSI: ${result.message}`);
        } else if (result) {
          console.log(`❌ DÉPLACEMENT ÉCHOUÉ: ${result.message}`);
        } else {
          console.log(`❌ Aucun résultat retourné par moveCombatant`);
        }
        return;
      }
    }
    
    // ✅ SI EN EXPLORATION: Logique normale de déplacement
    if (combat.combatState.phase === 'exploring') {
      console.log(`🎯 GameMap: Déplacement d'exploration vers (${col}, ${row})`);
      movement.handleTileClick(col, row);
    }
  }, [isGamePaused, movement, combat]);

  const handleCancelCombat = useCallback(() => {
    console.log('❌ Combat annulé - Retour en exploration');
    // Remettre le monstre en exploration
    if (combat.combatState.originalMonster) {
      setExplorationMonsters(prev => [...prev, combat.combatState.originalMonster!]);
    }
    combat.exitCombat();
  }, [combat]);

  // Gestion de la sortie de combat
  useEffect(() => {
    if (combat.combatState.phase === 'victory') {
      console.log('🏆 VICTOIRE ! Retour en exploration dans 3 secondes...');
      setTimeout(() => {
        combat.exitCombat();
        setExplorationMonsters(prev => [...prev, generateExplorationMonster()]);
      }, 3000);
    } else if (combat.combatState.phase === 'defeat') {
      console.log('💀 DÉFAITE ! Retour en exploration dans 3 secondes...');
      setTimeout(() => {
        combat.exitCombat();
        if (combat.combatState.originalMonster) {
          setExplorationMonsters(prev => [...prev, combat.combatState.originalMonster!]);
        }
      }, 3000);
    }
  }, [combat.combatState.phase, combat, generateExplorationMonster]);

  // Chemin vers votre map Tiled
  const mapPath = '/assets/maps/IsometricMap.tmj';

  return (
    <div className="h-screen w-screen overflow-hidden relative flex">
      
      {/* ZONE DE JEU CENTRALE */}
      <div className="flex-1 relative">
        
        {/* Messages de victoire/défaite */}
        {combat.combatState.phase === 'victory' && (
          <div className="absolute inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 border-2 border-green-500 rounded-2xl p-12 text-center shadow-2xl">
              <Trophy size={80} className="mx-auto mb-6 text-yellow-400 animate-bounce" />
              <h1 className="text-5xl font-bold text-green-400 mb-4">VICTOIRE !</h1>
              <p className="text-2xl text-green-300 mb-4">Vous avez vaincu {combat.combatState.originalMonster?.name} !</p>
              <p className="text-green-200">Retour à l'exploration...</p>
              <div className="mt-6 flex justify-center space-x-4">
                <Star className="text-yellow-400 animate-spin" size={24} />
                <Star className="text-yellow-400 animate-spin" size={20} style={{ animationDelay: '0.3s' }} />
                <Star className="text-yellow-400 animate-spin" size={24} style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>
        )}

        {combat.combatState.phase === 'defeat' && (
          <div className="absolute inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-2 border-red-500 rounded-2xl p-12 text-center shadow-2xl">
              <Skull size={80} className="mx-auto mb-6 text-red-400 animate-pulse" />
              <h1 className="text-5xl font-bold text-red-400 mb-4">DÉFAITE...</h1>
              <p className="text-2xl text-red-300 mb-4">{combat.combatState.originalMonster?.name} vous a vaincu !</p>
              <p className="text-red-200">Retour à l'exploration...</p>
            </div>
          </div>
        )}

        {/* Messages de pause pour les panneaux plein écran */}
        {isGamePaused && showFullscreenCharacter && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-blue-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-blue-500/30">
              <div className="text-center text-white">
                <Pause size={48} className="mx-auto mb-4 text-blue-400 animate-pulse" />
                <p className="text-2xl font-bold mb-2 text-blue-400">Panneau Personnage Ouvert</p>
                <p className="text-gray-300">Fermez le panneau pour continuer à jouer</p>
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
              </div>
            </div>
          </div>
        )}

        {/* Message de placement directement sur la map */}
        {combat.combatState.phase === 'placement' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[5000] pointer-events-none">
            <div className="bg-blue-900/95 border-2 border-blue-500 rounded-xl p-4 backdrop-blur-sm shadow-2xl text-center">
              <div className="text-blue-400 font-bold text-xl mb-1">🎯 PHASE DE PLACEMENT</div>
              <div className="text-white text-sm">
                {combat.combatState.originalMonster?.name} est en position. Choisissez votre case bleue !
              </div>
            </div>
          </div>
        )}

        {/* ✅ NOUVEAU: Message indiquant le sort sélectionné */}
        {combat.combatState.phase === 'fighting' && combat.combatState.selectedSpell && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[5000] pointer-events-none">
            <div className="bg-purple-900/95 border-2 border-purple-500 rounded-xl p-4 backdrop-blur-sm shadow-2xl text-center">
              <div className="text-purple-400 font-bold text-xl mb-1">🔮 SORT SÉLECTIONNÉ</div>
              <div className="text-white text-sm">
                {combat.combatState.selectedSpell.spell.name} (Portée: {combat.combatState.selectedSpell.spell.range})
              </div>
              <div className="text-purple-200 text-xs mt-1">
                Cliquez sur une cible ou recliquez sur le sort pour annuler
              </div>
            </div>
          </div>
        )}

        {/* Message de combat en cours */}
        {combat.combatState.phase === 'fighting' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[5000] pointer-events-none">
            <div className="bg-red-900/95 border-2 border-red-500 rounded-xl p-4 backdrop-blur-sm shadow-2xl text-center">
              <div className="text-red-400 font-bold text-xl mb-1">⚔️ COMBAT DOFUS ⚔️</div>
              <div className="text-white text-sm">
                Tour {combat.combatState.turnNumber} - {
                  combat.combatState.combatants.find(c => c.id === combat.combatState.currentTurnCombatantId)?.name || 'En cours...'
                }
              </div>
              {combat.combatState.currentTurnCombatantId === 'player' && (
                <div className="text-green-400 text-xs mt-1">
                  Votre tour ! PA: {combat.combatState.combatants.find(c => c.id === 'player')?.pa}/
                  {combat.combatState.combatants.find(c => c.id === 'player')?.maxPA} | 
                  PM: {combat.combatState.combatants.find(c => c.id === 'player')?.pm}/
                  {combat.combatState.combatants.find(c => c.id === 'player')?.maxPM}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MENU PARAMÈTRES */}
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

          {showSettings && (
            <div className="absolute top-14 right-0 bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-xl p-4 min-w-[200px]">
              <h3 className="text-white font-medium mb-3">Paramètres</h3>
              
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

              <div className="flex items-center justify-between mb-3">
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye size={16} className="text-gray-400" />
                  <span className="text-gray-300 text-sm">Debug</span>
                </div>
                <button
                  onClick={() => setShowDebugOverlay(!showDebugOverlay)}
                  className={`
                    w-12 h-6 rounded-full transition-all duration-300 relative
                    ${showDebugOverlay ? 'bg-red-600' : 'bg-gray-600'}
                  `}
                >
                  <div className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300
                    ${showDebugOverlay ? 'left-7' : 'left-1'}
                  `} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COMPOSANT TILED AVEC SYSTÈME DOFUS */}
        <TiledMapRenderer
          mapPath={mapPath}
          playerPosition={movement.playerPosition}
          isMoving={movement.isMoving}
          targetPosition={movement.targetPosition}
          onTileClick={handleTileClick}
          showGrid={showGrid && !isGamePaused}
          isGamePaused={isGamePaused}
          showDebugOverlay={showDebugOverlay}
          onMapDataLoaded={handleMapDataLoaded}
          explorationMonsters={explorationMonsters}
          onMonsterMove={handleMonsterMove}
          onMonsterClick={handleMonsterClick}
          combatState={combat.combatState}
        />

        {/* INTERFACE UTILISATEUR AVEC GESTION DU COMBAT DOFUS */}
        <GameUI
          currentHP={currentHP}
          maxHP={maxHP}
          currentMP={currentMP}
          maxMP={maxMP}
          currentPA={
            combat.combatState.phase === 'fighting' 
              ? combat.combatState.combatants.find(c => c.id === 'player')?.pa || 0
              : 10
          }
          maxPA={
            combat.combatState.phase === 'fighting'
              ? combat.combatState.combatants.find(c => c.id === 'player')?.maxPA || 6
              : 10
          }
          currentPM={
            combat.combatState.phase === 'fighting'
              ? combat.combatState.combatants.find(c => c.id === 'player')?.pm || 0  
              : 5
          }
          maxPM={
            combat.combatState.phase === 'fighting'
              ? combat.combatState.combatants.find(c => c.id === 'player')?.maxPM || 3
              : 5
          }
          spells={DEFAULT_SPELLS}
          onSpellClick={handleSpellClick}
          onInventoryClick={handleInventoryClick}
          onCharacterClick={handleCharacterClick}
        />

        {/* Bouton "Annuler Combat" pendant le placement */}
        {combat.combatState.phase === 'placement' && (
          <div className="absolute bottom-4 left-4 z-50">
            <button
              onClick={handleCancelCombat}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors shadow-xl border-2 border-gray-500"
            >
              Annuler Combat
            </button>
          </div>
        )}

        {/* Bouton "Passer le tour" pendant le combat */}
        {combat.combatState.phase === 'fighting' && 
         combat.combatState.currentTurnCombatantId === 'player' && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => combat.nextTurn()}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-colors shadow-xl border-2 border-orange-500"
            >
              Passer le Tour
            </button>
          </div>
        )}
      </div>

      {/* PANNEAUX PLEIN ÉCRAN */}
      {showFullscreenCharacter && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-4 bg-gray-900 rounded-lg border-2 border-gray-600 shadow-2xl overflow-hidden">
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

      {showFullscreenInventory && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-4 bg-gray-900 rounded-lg border-2 border-gray-600 shadow-2xl overflow-hidden">
            <div className="bg-gray-800 border-b border-gray-600 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-orange-400">Inventaire</h2>
              <button
                onClick={() => setShowFullscreenInventory(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
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