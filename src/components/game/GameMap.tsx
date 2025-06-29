/**
 * GAME MAP - VERSION FINALE AVEC INTÉGRATION COMPLÈTE DES PANNEAUX
 * ✅ Toutes les fonctionnalités originales conservées
 * ✅ Timeline séparée au-dessus des sorts en bas à droite
 * ✅ Boutons combat dans le module central du GameUI
 * ✅ PA/PM identiques entre exploration et combat
 * ✅ NOUVEAU: Intégration des panneaux PlayerPanel et SpellsPanel
 * ✅ Interface clean et fonctionnelle complète
 */

import React, { useState, useCallback, useEffect } from "react";

// Import du composant Tiled
import TiledMapRenderer from "./TiledMapRenderer";

// Import des composants UI
import GameUI from "../GameUI";

import PlayerPanel from "./PlayerPanel";
import SpellsPanel from "./SpellPanel";
import InventoryPanel from "./InventoryPanel";
import CombatTimer from "./CombatTimer";
// ✅ Timeline séparée
import CombatTimeline from "./CombatTimeline";

import { useGameMovement } from "../../hooks/useGameMovement";
import { useCombatDofus } from "../../hooks/useCombat";

import {
  MAP_WIDTH,
  MAP_HEIGHT,
  DEFAULT_PLAYER_STATS,
  DEFAULT_AVAILABLE_POINTS,
  DEFAULT_SPELLS,
} from "../../utils/gameConstants";

import {
  Character,
  PlayerStats,
  InventoryTab,
  Position,
} from "../../types/game";
import { Monster, Combatant } from "../../types/combat";
import {
  Pause,
  Star,
  X,
  Settings,
  Volume2,
  Grid3X3,
  Eye,
  Trophy,
  Skull,
} from "lucide-react";

// ✅ NOUVEAU: Constantes pour les stats de base du joueur
const PLAYER_BASE_STATS = {
  PA_BASE: 6, // ← Tes vraies stats de base
  PA_MAX: 6,
  PM_BASE: 3, // ← Tes vraies stats de base
  PM_MAX: 3,
};

// ✅ Liste de sorts complète (identique au hook)
const TOUS_LES_SORTS = [
  {
    id: 1,
    name: "Coup de Dague",
    icon: "🗡️",
    paCost: 3,
    description: "Attaque rapide (15-25 dégâts)",
    type: "damage",
    targetType: "enemy",
    minDamage: 15,
    maxDamage: 25,
    range: 1,
  },
  {
    id: 2,
    name: "Attaque Puissante",
    icon: "⚔️",
    paCost: 4,
    description: "Attaque forte (25-35 dégâts)",
    type: "damage",
    targetType: "enemy",
    minDamage: 25,
    maxDamage: 35,
    range: 1,
  },
  {
    id: 3,
    name: "Poison",
    icon: "☠️",
    paCost: 2,
    description: "Empoisonne (10-15 dégâts)",
    type: "damage",
    targetType: "enemy",
    minDamage: 10,
    maxDamage: 15,
    range: 2,
  },
  {
    id: 4,
    name: "Soin Mineur",
    icon: "💚",
    paCost: 3,
    description: "Soigne 20-30 PV",
    type: "heal",
    targetType: "ally",
    minHeal: 20,
    maxHeal: 30,
    range: 3,
  },
  {
    id: 5,
    name: "Fireball",
    icon: "🔥",
    paCost: 4,
    description: "Boule de feu (30-40 dégâts)",
    type: "damage",
    targetType: "enemy",
    minDamage: 30,
    maxDamage: 40,
    range: 4,
  },
  {
    id: 6,
    name: "Soin Majeur",
    icon: "✨",
    paCost: 5,
    description: "Soigne 40-50 PV",
    type: "heal",
    targetType: "ally",
    minHeal: 40,
    maxHeal: 50,
    range: 2,
  },
  {
    id: 7,
    name: "Éclair",
    icon: "⚡",
    paCost: 5,
    description: "Attaque électrique (35-45 dégâts)",
    type: "damage",
    targetType: "enemy",
    minDamage: 35,
    maxDamage: 45,
    range: 5,
  },
  {
    id: 8,
    name: "Gel",
    icon: "❄️",
    paCost: 3,
    description: "Gèle l'ennemi (20-25 dégâts)",
    type: "damage",
    targetType: "enemy",
    minDamage: 20,
    maxDamage: 25,
    range: 3,
  },
];

interface GameMapProps {
  character: Character;
  onBackToMenu: () => void;
}

const GameMap: React.FC<GameMapProps> = ({ character, onBackToMenu }) => {
  // Hook de mouvement
  const movement = useGameMovement();

  // Hook de combat avec IA et timer
  const combat = useCombatDofus();

  // État pour les monstres d'exploration
  const [explorationMonsters, setExplorationMonsters] = useState<Monster[]>([]);

  // États pour les panneaux plein écran
  const [showFullscreenCharacter, setShowFullscreenCharacter] = useState(false);
  const [showFullscreenInventory, setShowFullscreenInventory] = useState(false);
  const [activeInventoryTab, setActiveInventoryTab] = useState<InventoryTab>("equipement");

  // ✅ NOUVEAU: États pour les nouveaux panneaux
  const [showPlayerPanel, setShowPlayerPanel] = useState(false);
  const [showSpellsPanel, setShowSpellsPanel] = useState(false);

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
  const currentHP = 450;
  const currentMP = 180;

  // Stats HP/MP calculées
  const maxHP = 500 + playerStats.vitality * 5;
  const maxMP = 300 + playerStats.wisdom * 3;

  // isGamePaused ne bloque plus le combat
  const isGamePaused = showFullscreenCharacter || showFullscreenInventory || showPlayerPanel || showSpellsPanel;

  // ✅ NOUVEAU: Fonctions pour obtenir les stats PA/PM cohérentes
  const getCurrentPA = (): number => {
    if (combat.combatState.phase === "fighting") {
      // En combat : utilise les PA du combattant
      const playerCombatant = combat.combatState.combatants.find(
        (c) => c.id === "player"
      );
      return playerCombatant?.pa || PLAYER_BASE_STATS.PA_BASE;
    } else {
      // En exploration : utilise les stats de base
      return PLAYER_BASE_STATS.PA_BASE;
    }
  };

  const getMaxPA = (): number => {
    if (combat.combatState.phase === "fighting") {
      // En combat : utilise les PA max du combattant
      const playerCombatant = combat.combatState.combatants.find(
        (c) => c.id === "player"
      );
      return playerCombatant?.maxPA || PLAYER_BASE_STATS.PA_MAX;
    } else {
      // En exploration : utilise les stats de base
      return PLAYER_BASE_STATS.PA_MAX;
    }
  };

  const getCurrentPM = (): number => {
    if (combat.combatState.phase === "fighting") {
      // En combat : utilise les PM du combattant
      const playerCombatant = combat.combatState.combatants.find(
        (c) => c.id === "player"
      );
      return playerCombatant?.pm || PLAYER_BASE_STATS.PM_BASE;
    } else {
      // En exploration : utilise les stats de base
      return PLAYER_BASE_STATS.PM_BASE;
    }
  };

  const getMaxPM = (): number => {
    if (combat.combatState.phase === "fighting") {
      // En combat : utilise les PM max du combattant
      const playerCombatant = combat.combatState.combatants.find(
        (c) => c.id === "player"
      );
      return playerCombatant?.maxPM || PLAYER_BASE_STATS.PM_MAX;
    } else {
      // En exploration : utilise les stats de base
      return PLAYER_BASE_STATS.PM_MAX;
    }
  };

  // ===== FONCTIONS DE GÉNÉRATION DE MONSTRES =====

  const generateExplorationMonster = useCallback(
    (playerPos?: Position): Monster => {
      const monsterTypes = [
        {
          name: "Gobelin Éclaireur",
          icon: "👹",
          color: "#8B4513",
          health: 80,
          level: 1,
          attack: 15,
          defense: 5,
        },
        {
          name: "Orc Guerrier",
          icon: "🧌",
          color: "#228B22",
          health: 120,
          level: 2,
          attack: 25,
          defense: 10,
        },
        {
          name: "Squelette Archer",
          icon: "💀",
          color: "#696969",
          health: 60,
          level: 1,
          attack: 20,
          defense: 3,
        },
        {
          name: "Loup Affamé",
          icon: "🐺",
          color: "#483D8B",
          health: 90,
          level: 2,
          attack: 18,
          defense: 8,
        },
        {
          name: "Araignée Géante",
          icon: "🕷️",
          color: "#800080",
          health: 100,
          level: 3,
          attack: 22,
          defense: 12,
        },
        {
          name: "Zombie Soldat",
          icon: "🧟",
          color: "#556B2F",
          health: 110,
          level: 3,
          attack: 20,
          defense: 15,
        },
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
        x === playerPos.x &&
        y === playerPos.y &&
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
        movementPattern: "random",
        lastMoveTime: Date.now(),
        moveInterval: 3000 + Math.random() * 4000,
      };
    },
    []
  );

  // Initialiser les monstres UNE SEULE FOIS au chargement
  useEffect(() => {
    const initialMonsters = Array.from(
      { length: 3 + Math.floor(Math.random() * 2) },
      () => generateExplorationMonster(movement.playerPosition)
    );
    setExplorationMonsters(initialMonsters);
    console.log("🐲 Monstres d'exploration générés:", initialMonsters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== GESTION DES MONSTRES D'EXPLORATION =====

  const handleMonsterMove = useCallback(
    (monsterId: string, newPosition: Position) => {
      console.log(
        `🐕 Mouvement monstre ${monsterId} vers (${newPosition.x}, ${newPosition.y})`
      );

      setExplorationMonsters((prev) => {
        return prev.map((monster) =>
          monster.id === monsterId
            ? { ...monster, position: newPosition }
            : monster
        );
      });
    },
    []
  );

  const handleMonsterClick = useCallback(
    (monster: Monster) => {
      console.log(`⚔️ COMBAT DÉCLENCHÉ avec ${monster.name} !`);

      // Démarrer le combat
      combat.startCombat(monster, movement.playerPosition);

      // Supprimer le monstre de la liste d'exploration
      setExplorationMonsters((prev) => prev.filter((m) => m.id !== monster.id));
    },
    [combat, movement.playerPosition]
  );

  // ===== GESTION DES RACCOURCIS CLAVIER =====

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "D" || event.key === "d") {
        setShowDebugOverlay((prev) => {
          const newValue = !prev;
          console.log(`🔍 Debug overlay: ${newValue ? "ON" : "OFF"}`);
          return newValue;
        });
      }
      // ✅ NOUVEAU: Raccourcis pour les panneaux
      if (event.key === "Escape") {
        setShowPlayerPanel(false);
        setShowSpellsPanel(false);
        setShowFullscreenCharacter(false);
        setShowFullscreenInventory(false);
      }
      if (event.key === "c" || event.key === "C") {
        if (!isGamePaused) {
          setShowPlayerPanel(true);
        }
      }
      if (event.key === "s" || event.key === "S") {
        if (!isGamePaused) {
          setShowSpellsPanel(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isGamePaused]);

  // ===== GESTION DES STATS JOUEUR =====

  const handleImproveStat = (
    statName: keyof PlayerStats,
    pointsToAdd?: number
  ) => {
    const points = pointsToAdd || statInputs[statName];
    if (availablePoints < points || points <= 0) return;
    setAvailablePoints((prev) => prev - points);
    setPlayerStats((prev) => ({
      ...prev,
      [statName]: prev[statName] + points,
    }));
  };

  const handleUpdateStatInput = (
    statName: keyof PlayerStats,
    value: number
  ) => {
    setStatInputs((prev) => ({ ...prev, [statName]: Math.max(1, value) }));
  };

  // ===== CALLBACKS POUR L'INTERFACE =====

  const handleCharacterClick = useCallback(() => {
    console.log("👤 Ouverture panneau personnage");
    setShowFullscreenCharacter(true);
  }, []);

  const handleInventoryClick = useCallback(() => {
    console.log("🎒 Ouverture inventaire");
    setShowFullscreenInventory(true);
  }, []);

  // ✅ NOUVEAU: Callbacks pour les nouveaux panneaux
  const handleStatsClick = useCallback(() => {
    console.log("📊 Ouverture panneau statistiques");
    setShowPlayerPanel(true);
  }, []);

  const handleSpellsClick = useCallback(() => {
    console.log("🔮 Ouverture panneau sorts");
    setShowSpellsPanel(true);
  }, []);

  const handleFriendsClick = useCallback(() => {
    console.log("👥 Ouverture panneau amis");
    // TODO: Implémenter le panneau des amis
  }, []);

  const handleGuildClick = useCallback(() => {
    console.log("🛡️ Ouverture panneau guilde");
    // TODO: Implémenter le panneau de guilde
  }, []);

  const handleMountClick = useCallback(() => {
    console.log("🐎 Ouverture panneau montures");
    // TODO: Implémenter le panneau des montures
  }, []);

  const handleMapClick = useCallback(() => {
    console.log("🗺️ Ouverture panneau carte");
    // TODO: Implémenter le panneau de carte
  }, []);

  const handleQuestsClick = useCallback(() => {
    console.log("📜 Ouverture panneau quêtes");
    // TODO: Implémenter le panneau des quêtes
  }, []);

  // ===== GESTION DES SORTS =====

  const handleSpellClick = useCallback(
    (spellId: number) => {
      console.log(`🔮 === CLIC SUR SORT ===`);
      console.log(`📜 Sort ID: ${spellId}`);
      console.log(`🎮 Phase: ${combat.combatState.phase}`);

      // Trouver le sort dans notre liste
      const spellData = TOUS_LES_SORTS.find((s) => s.id === spellId);
      if (!spellData) {
        console.log(`❌ Sort ${spellId} non trouvé !`);
        return;
      }

      // SI PAS EN COMBAT: Ignore
      if (combat.combatState.phase !== "fighting") {
        console.log(`❌ Les sorts ne sont utilisables qu'en combat`);
        return;
      }

      // Vérifier si c'est le tour du joueur
      if (combat.combatState.currentTurnCombatantId !== "player") {
        console.log(`⏳ Ce n'est pas votre tour !`);
        return;
      }

      // LOGIQUE DE DÉSÉLECTION
      const currentSelectedSpell = combat.combatState.selectedSpell;
      if (currentSelectedSpell && currentSelectedSpell.spellId === spellId) {
        console.log(`🔄 DÉSÉLECTION du sort ${spellData.name}`);
        const result = combat.selectSpell("player", -1);
        if (result.success) {
          console.log(`✅ Sort désélectionné`);
        }
        return;
      }

      // SÉLECTION D'UN NOUVEAU SORT
      console.log(`⚔️ SÉLECTION du sort ${spellData.name}`);
      const result = combat.selectSpell("player", spellId);

      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.log(`❌ ${result.message}`);
      }
    },
    [combat]
  );

  // ===== GESTION DU COMBAT =====

  const handleCombatantClick = useCallback(
    (targetCombatant: Combatant) => {
      console.log(`🎯 === CLIC SUR COMBATTANT ===`);
      console.log(
        `🎯 Cible: ${targetCombatant.name} (${targetCombatant.team})`
      );
      console.log(
        `🔮 Sort sélectionné: ${
          combat.combatState.selectedSpell
            ? combat.combatState.selectedSpell.spell.name
            : "Aucun"
        }`
      );

      // Si aucun sort sélectionné
      if (!combat.combatState.selectedSpell) {
        console.log(`ℹ️ Aucun sort sélectionné. Sélectionnez d'abord un sort.`);
        return;
      }

      // LANCER LE SORT SUR LE COMBATTANT
      console.log(`✨ Lancement du sort sur ${targetCombatant.name}`);

      const result = combat.castSpellOnCombatant(targetCombatant);

      if (result.success) {
        console.log(`✅ SORT LANCÉ: ${result.message}`);
        if (result.damage) console.log(`💥 Dégâts: ${result.damage}`);
        if (result.heal) console.log(`💚 Soins: ${result.heal}`);
      } else {
        console.log(`❌ SORT ÉCHOUÉ: ${result.message}`);
      }
    },
    [combat]
  );

  // ✅ FONCTION pour gérer les clics depuis la timeline séparée
  const handleTargetSelectFromTimeline = useCallback(
    (target: Combatant) => {
      console.log(`🎯 Clic depuis la timeline séparée sur ${target.name}`);

      // Utilise la même logique que handleCombatantClick
      if (!combat.combatState.selectedSpell) {
        console.log(`ℹ️ Aucun sort sélectionné.`);
        return;
      }

      const result = combat.castSpellOnCombatant(target);

      if (result.success) {
        console.log(`✅ SORT LANCÉ DEPUIS TIMELINE: ${result.message}`);
        if (result.damage) console.log(`💥 Dégâts: ${result.damage}`);
        if (result.heal) console.log(`💚 Soins: ${result.heal}`);
      } else {
        console.log(`❌ SORT ÉCHOUÉ DEPUIS TIMELINE: ${result.message}`);
      }
    },
    [combat]
  );

  const handleEndTurn = useCallback(() => {
    console.log("⏭️ === BOUTON FIN DE TOUR ===");

    if (combat.combatState.phase !== "fighting") {
      console.log("❌ Pas en combat");
      return;
    }

    if (combat.combatState.currentTurnCombatantId !== "player") {
      console.log("❌ Ce n'est pas votre tour !");
      return;
    }

    console.log("✅ Fin de tour du joueur");
    combat.nextTurn();
  }, [combat]);

  const handleAbandonCombat = useCallback(() => {
    console.log("🏃‍♂️ === ABANDON DU COMBAT ===");

    if (
      combat.combatState.phase !== "fighting" &&
      combat.combatState.phase !== "placement"
    ) {
      console.log("❌ Pas en combat");
      return;
    }

    console.log("❌ Abandon - Retour en exploration");

    // Remettre le monstre en exploration si possible
    if (combat.combatState.originalMonster) {
      setExplorationMonsters((prev) => [
        ...prev,
        combat.combatState.originalMonster!,
      ]);
      console.log(
        `🐲 ${combat.combatState.originalMonster.name} remis en exploration`
      );
    }

    // Sortir du combat
    combat.exitCombat();
  }, [combat]);

  // ===== GESTION DES CLICS SUR LA MAP =====

  const handleMapDataLoaded = useCallback(
    (isWalkable: (x: number, y: number) => boolean) => {
      console.log("📡 Réception des données de praticabilité");
      movement.setWalkableFunction(isWalkable);
    },
    [movement]
  );

  const handleTileClick = useCallback(
    (col: number, row: number) => {
      console.log(`🎯 === CLIC DÉTECTÉ ===`);
      console.log(`📍 Position: (${col}, ${row})`);
      console.log(`🎮 Phase: ${combat.combatState.phase}`);

      // Bloquer si panneau ouvert en exploration
      if (isGamePaused && combat.combatState.phase === "exploring") {
        console.log("🚫 Jeu en pause");
        return;
      }

      // SI EN PLACEMENT: Cases bleues
      if (combat.combatState.phase === "placement") {
        console.log(`🎯 Clic de placement sur (${col}, ${row})`);

        const playerZone = combat.combatState.placementZones.find(
          (z) => z.team === "player"
        );
        const isPlayerZone = playerZone?.positions.some(
          (p) => p.x === col && p.y === row
        );

        if (isPlayerZone) {
          combat.placeCombatant("player", { x: col, y: row });
          console.log(`✅ Joueur placé en (${col}, ${row})`);
        } else {
          console.log(`❌ Vous ne pouvez vous placer que sur les cases bleues`);
        }
        return;
      }

      // SI EN COMBAT: Vérifier combattant à cette position
      if (combat.combatState.phase === "fighting") {
        const combatantAtPosition = combat.combatState.combatants.find(
          (c) => c.position.x === col && c.position.y === row && c.isAlive
        );

        if (combatantAtPosition && combat.combatState.selectedSpell) {
          console.log(`🎯 Combattant trouvé: ${combatantAtPosition.name}`);
          handleCombatantClick(combatantAtPosition);
          return;
        }

        if (combat.combatState.selectedSpell && !combatantAtPosition) {
          console.log(
            `ℹ️ Sort sélectionné mais aucun combattant ici - utilisez la timeline !`
          );
          return;
        }

        // Déplacement
        if (!combat.combatState.selectedSpell) {
          console.log(`🎯 === DÉPLACEMENT ===`);
          console.log(`📍 Vers (${col}, ${row})`);

          const result = combat.moveCombatant("player", { x: col, y: row });

          if (result.success) {
            console.log(`✅ DÉPLACEMENT RÉUSSI: ${result.message}`);
          } else {
            console.log(`❌ DÉPLACEMENT ÉCHOUÉ: ${result.message}`);
          }
        }
        return;
      }

      // SI EN EXPLORATION: Déplacement normal
      if (combat.combatState.phase === "exploring") {
        console.log(`🎯 Déplacement d'exploration vers (${col}, ${row})`);
        movement.handleTileClick(col, row);
      }
    },
    [isGamePaused, movement, combat, handleCombatantClick]
  );

  // ===== ANNULATION DE COMBAT =====

  const handleCancelCombat = useCallback(() => {
    console.log("❌ Combat annulé");
    if (combat.combatState.originalMonster) {
      setExplorationMonsters((prev) => [
        ...prev,
        combat.combatState.originalMonster!,
      ]);
    }
    combat.exitCombat();
  }, [combat]);

  // ===== GESTION DE LA SORTIE DE COMBAT =====

  useEffect(() => {
    if (combat.combatState.phase === "victory") {
      console.log("🏆 VICTOIRE ! Retour en exploration dans 3s...");
      setTimeout(() => {
        combat.exitCombat();
        setExplorationMonsters((prev) => [
          ...prev,
          generateExplorationMonster(),
        ]);
      }, 3000);
    } else if (combat.combatState.phase === "defeat") {
      console.log("💀 DÉFAITE ! Retour en exploration dans 3s...");
      setTimeout(() => {
        combat.exitCombat();
        if (combat.combatState.originalMonster) {
          setExplorationMonsters((prev) => [
            ...prev,
            combat.combatState.originalMonster!,
          ]);
        }
      }, 3000);
    }
  }, [combat.combatState.phase, combat, generateExplorationMonster]);

  // ===== FONCTION POUR LE TIMER =====

  const getCurrentPlayerName = useCallback(() => {
    const currentCombatant = combat.combatState.combatants.find(
      (c) => c.id === combat.combatState.currentTurnCombatantId
    );
    return currentCombatant ? currentCombatant.name : "Joueur";
  }, [
    combat.combatState.combatants,
    combat.combatState.currentTurnCombatantId,
  ]);

  // Chemin vers la map Tiled
  const mapPath = "/assets/maps/IsometricMap.tmj";

  return (
    <div className="h-screen w-screen overflow-hidden relative flex">
      {/* ===== ZONE DE JEU CENTRALE ===== */}
      <div className="flex-1 relative">
        {/* ===== MESSAGES DE VICTOIRE/DÉFAITE ===== */}
        {combat.combatState.phase === "victory" && (
          <div className="absolute inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 border-2 border-green-500 rounded-2xl p-12 text-center shadow-2xl">
              <Trophy
                size={80}
                className="mx-auto mb-6 text-yellow-400 animate-bounce"
              />
              <h1 className="text-5xl font-bold text-green-400 mb-4">
                VICTOIRE !
              </h1>
              <p className="text-2xl text-green-300 mb-4">
                Vous avez vaincu {combat.combatState.originalMonster?.name} !
              </p>
              <p className="text-green-200">Retour à l'exploration...</p>
              <div className="mt-6 flex justify-center space-x-4">
                <Star className="text-yellow-400 animate-spin" size={24} />
                <Star
                  className="text-yellow-400 animate-spin"
                  size={20}
                  style={{ animationDelay: "0.3s" }}
                />
                <Star
                  className="text-yellow-400 animate-spin"
                  size={24}
                  style={{ animationDelay: "0.6s" }}
                />
              </div>
            </div>
          </div>
        )}

        {combat.combatState.phase === "defeat" && (
          <div className="absolute inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-2 border-red-500 rounded-2xl p-12 text-center shadow-2xl">
              <Skull
                size={80}
                className="mx-auto mb-6 text-red-400 animate-pulse"
              />
              <h1 className="text-5xl font-bold text-red-400 mb-4">
                DÉFAITE...
              </h1>
              <p className="text-2xl text-red-300 mb-4">
                {combat.combatState.originalMonster?.name} vous a vaincu !
              </p>
              <p className="text-red-200">Retour à l'exploration...</p>
            </div>
          </div>
        )}

        {/* ===== MESSAGES DE PAUSE ===== */}
        {isGamePaused && showFullscreenCharacter && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-blue-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-blue-500/30">
              <div className="text-center text-white">
                <Pause
                  size={48}
                  className="mx-auto mb-4 text-blue-400 animate-pulse"
                />
                <p className="text-2xl font-bold mb-2 text-blue-400">
                  Panneau Personnage Ouvert
                </p>
                <p className="text-gray-300">
                  Fermez le panneau pour continuer à jouer
                </p>
              </div>
            </div>
          </div>
        )}

        {isGamePaused && showFullscreenInventory && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-orange-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-orange-500/30">
              <div className="text-center text-white">
                <Pause
                  size={48}
                  className="mx-auto mb-4 text-orange-400 animate-pulse"
                />
                <p className="text-2xl font-bold mb-2 text-orange-400">
                  Inventaire Ouvert
                </p>
                <p className="text-gray-300">
                  Fermez l'inventaire pour continuer à jouer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NOUVEAU: Messages de pause pour les nouveaux panneaux */}
        {isGamePaused && showPlayerPanel && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-green-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-green-500/30">
              <div className="text-center text-white">
                <Pause
                  size={48}
                  className="mx-auto mb-4 text-green-400 animate-pulse"
                />
                <p className="text-2xl font-bold mb-2 text-green-400">
                  Panneau Statistiques Ouvert
                </p>
                <p className="text-gray-300">
                  Fermez le panneau pour continuer à jouer
                </p>
              </div>
            </div>
          </div>
        )}

        {isGamePaused && showSpellsPanel && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <div className="bg-gray-900/95 border-2 border-purple-500 rounded-xl p-6 backdrop-blur-sm shadow-2xl shadow-purple-500/30">
              <div className="text-center text-white">
                <Pause
                  size={48}
                  className="mx-auto mb-4 text-purple-400 animate-pulse"
                />
                <p className="text-2xl font-bold mb-2 text-purple-400">
                  Grimoire de Sorts Ouvert
                </p>
                <p className="text-gray-300">
                  Fermez le panneau pour continuer à jouer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== MESSAGE DE PLACEMENT ===== */}
        {combat.combatState.phase === "placement" && (
          <div className="absolute top-4 left-1/4 transform -translate-x-1/2 z-[5000] pointer-events-none">
            <div className="bg-blue-900/95 border-2 border-blue-500 rounded-xl p-4 backdrop-blur-sm shadow-2xl text-center">
              <div className="text-blue-400 font-bold text-xl mb-1">
                🎯 PHASE DE PLACEMENT
              </div>
              <div className="text-white text-sm">
                {combat.combatState.originalMonster?.name} est en position.
                Choisissez votre case bleue !
              </div>
            </div>
          </div>
        )}

        {/* ===== MENU PARAMÈTRES ===== */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-300 shadow-lg
              ${
                showSettings
                  ? "bg-gray-600 border-gray-500 text-white"
                  : "bg-gray-900/90 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 backdrop-blur-sm"
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
                    ${showGrid ? "bg-green-600" : "bg-gray-600"}
                  `}
                >
                  <div
                    className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300
                    ${showGrid ? "left-7" : "left-1"}
                  `}
                  />
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
                    ${soundEnabled ? "bg-green-600" : "bg-gray-600"}
                  `}
                >
                  <div
                    className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300
                    ${soundEnabled ? "left-7" : "left-1"}
                  `}
                  />
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
                    ${showDebugOverlay ? "bg-red-600" : "bg-gray-600"}
                  `}
                >
                  <div
                    className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300
                    ${showDebugOverlay ? "left-7" : "left-1"}
                  `}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ✅ TIMELINE SÉPARÉE EN BAS À DROITE AVEC TIMER INTÉGRÉ */}
        <CombatTimeline
          combatState={combat.combatState}
          onTargetSelect={handleTargetSelectFromTimeline}
          timeLeft={combat.turnTimeLeft}
          maxTime={combat.DOFUS_COMBAT_CONFIG.TURN_TIME}
          isTimerActive={combat.combatState.phase === "fighting"}
        />

        {/* ===== COMPOSANT TILED ===== */}
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
          onCombatantClick={handleCombatantClick}
        />

        {/* ✅ INTERFACE UTILISATEUR AVEC STATS COHÉRENTES ET NOUVEAUX CALLBACKS */}
        <GameUI
          currentHP={currentHP}
          maxHP={maxHP}
          currentMP={currentMP}
          maxMP={maxMP}
          // ✅ CORRIGÉ: Utilise les nouvelles fonctions pour des stats cohérentes
          currentPA={getCurrentPA()}
          maxPA={getMaxPA()}
          currentPM={getCurrentPM()}
          maxPM={getMaxPM()}
          spells={DEFAULT_SPELLS}
          onSpellClick={handleSpellClick}
          onInventoryClick={handleInventoryClick}
          onCharacterClick={handleCharacterClick}
          // ✅ NOUVEAU: Callbacks pour la barre de menu
          onStatsClick={handleStatsClick}
          onSpellsClick={handleSpellsClick}
          onFriendsClick={handleFriendsClick}
          onGuildClick={handleGuildClick}
          onMountClick={handleMountClick}
          onMapClick={handleMapClick}
          onQuestsClick={handleQuestsClick}
          selectedSpellId={combat.combatState.selectedSpell?.spellId || null}
          isInCombat={combat.combatState.phase === "fighting"}
          onEndTurn={handleEndTurn}
          onAbandonCombat={handleAbandonCombat}
        />

        {/* ===== BOUTON ANNULER COMBAT (PLACEMENT) ===== */}
        {combat.combatState.phase === "placement" && (
          <div className="absolute bottom-4 left-4 z-50">
            <button
              onClick={handleCancelCombat}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors shadow-xl border-2 border-gray-500"
            >
              Annuler Combat
            </button>
          </div>
        )}
      </div>

      {/* ===== PANNEAUX PLEIN ÉCRAN ===== */}
      
      {/* Panneau personnage original */}
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

      {/* ✅ NOUVEAU: Panneau statistiques */}
      {showPlayerPanel && (
        <div className="fixed inset-0 z-[10000] bg-gray-900/95 backdrop-blur-sm">
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
            onClose={() => setShowPlayerPanel(false)}
          />
        </div>
      )}

      {/* ✅ NOUVEAU: Panneau sorts */}
      {showSpellsPanel && (
        <div className="fixed inset-0 z-[10000] bg-gray-900/95 backdrop-blur-sm">
          <SpellsPanel
            character={character}
            selectedSpellId={combat.combatState.selectedSpell?.spellId || null}
            onSpellSelect={handleSpellClick}
            onClose={() => setShowSpellsPanel(false)}
          />
        </div>
      )}

      {/* Panneau inventaire */}
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