/**
 * HOOK DE COMBAT AVEC IA ENNEMIE ET TIMER - VERSION CORRIGÉE
 * ✅ CORRIGÉ: Erreurs TypeScript résolues
 * ✅ NOUVEAU: IA pour les ennemis (attaque, fuite, sorts)
 * ✅ NOUVEAU: Timer de 45 secondes par tour
 * ✅ NOUVEAU: Tours automatiques si temps écoulé
 * ✅ SIMPLE: L'ennemi attaque intelligemment le joueur
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Position } from '../types/game';
import { 
  Monster, 
  CombatState, 
  CombatPhase, 
  Combatant, 
  PlacementZone, 
  CombatLogEntry, 
  ActionResult 
} from '../types/combat';

// Configuration du combat style Dofus
const DOFUS_COMBAT_CONFIG = {
  PLAYER_MAX_PA: 6,      // 6 PA par tour comme Dofus
  PLAYER_MAX_PM: 3,      // 3 PM par tour comme Dofus
  MOVE_COST: 1,          // 1 PM par case
  BASIC_ATTACK_COST: 3,  // 3 PA pour une attaque de base
  PLACEMENT_TIME: 30,    // 30 secondes pour se placer
  TURN_TIME: 45,         // ✅ 45 secondes par tour
};

// ✅ Définition des sorts disponibles (joueur ET ennemis)
const AVAILABLE_SPELLS = {
  1: { 
    id: 1,
    name: 'Coup de Dague', 
    paCost: 3, 
    type: 'damage',
    minDamage: 15,
    maxDamage: 25,
    range: 1,
    description: 'Attaque rapide',
    targetType: 'enemy'
  },
  2: { 
    id: 2,
    name: 'Attaque Puissante', 
    paCost: 4, 
    type: 'damage',
    minDamage: 25,
    maxDamage: 35,
    range: 1,
    description: 'Attaque forte',
    targetType: 'enemy'
  },
  3: { 
    id: 3,
    name: 'Poison', 
    paCost: 2, 
    type: 'damage',
    minDamage: 10,
    maxDamage: 15,
    range: 2,
    description: 'Empoisonne l\'ennemi',
    targetType: 'enemy'
  },
  4: { 
    id: 4,
    name: 'Soin Mineur', 
    paCost: 3, 
    type: 'heal',
    minHeal: 20,
    maxHeal: 30,
    range: 3,
    description: 'Soigne les blessures',
    targetType: 'ally'
  },
  5: { 
    id: 5,
    name: 'Fireball', 
    paCost: 4, 
    type: 'damage',
    minDamage: 30,
    maxDamage: 40,
    range: 4,
    description: 'Boule de feu',
    targetType: 'enemy'
  },
  6: { 
    id: 6,
    name: 'Soin Majeur', 
    paCost: 5, 
    type: 'heal',
    minHeal: 40,
    maxHeal: 50,
    range: 2,
    description: 'Soigne beaucoup',
    targetType: 'ally'
  },
  7: { 
    id: 7,
    name: 'Éclair', 
    paCost: 5, 
    type: 'damage',
    minDamage: 35,
    maxDamage: 45,
    range: 5,
    description: 'Attaque électrique',
    targetType: 'enemy'
  },
  8: { 
    id: 8,
    name: 'Gel', 
    paCost: 3, 
    type: 'damage',
    minDamage: 20,
    maxDamage: 25,
    range: 3,
    description: 'Gèle l\'ennemi',
    targetType: 'enemy'
  },
  // ✅ Sorts spéciaux pour les ennemis
  9: { 
    id: 9,
    name: 'Griffe Sauvage', 
    paCost: 3, 
    type: 'damage',
    minDamage: 18,
    maxDamage: 28,
    range: 1,
    description: 'Attaque bestiale',
    targetType: 'enemy'
  },
  10: { 
    id: 10,
    name: 'Rugissement', 
    paCost: 2, 
    type: 'damage',
    minDamage: 12,
    maxDamage: 20,
    range: 2,
    description: 'Cri intimidant',
    targetType: 'enemy'
  }
} as const;

export const useCombatDofus = () => {
  // ✅ État principal du combat
  const [combatState, setCombatState] = useState<CombatState>({
    phase: 'exploring',
    combatants: [],
    currentTurnCombatantId: null,
    placementZones: [],
    selectedCombatantId: null,
    turnNumber: 1,
    combatLog: [],
    originalMonster: null,
    selectedSpell: null
  });

  // ✅ État pour le timer
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(DOFUS_COMBAT_CONFIG.TURN_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * ✅ Fonction utilitaire pour calculer la distance
   */
  const calculateDistance = useCallback((pos1: Position, pos2: Position): number => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }, []);

  /**
   * ✅ Fonction pour démarrer le timer d'un tour
   */
  const startTurnTimer = useCallback(() => {
    // Nettoyer l'ancien timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Remettre le temps à 45 secondes
    setTurnTimeLeft(DOFUS_COMBAT_CONFIG.TURN_TIME);

    // Démarrer le nouveau timer
    timerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          // Temps écoulé ! Passer le tour automatiquement
          console.log('⏰ Temps écoulé ! Passage automatique au tour suivant');
          nextTurn();
          return DOFUS_COMBAT_CONFIG.TURN_TIME;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * ✅ Arrêter le timer
   */
  const stopTurnTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * ✅ CORRIGÉ: Intelligence Artificielle pour les ennemis (types fixés)
   */
  const executeEnemyAI = useCallback((enemy: Combatant) => {
    console.log(`🤖 === IA DE ${enemy.name.toUpperCase()} ===`);
    
    setCombatState(prev => {
      const player = prev.combatants.find(c => c.team === 'player');
      if (!player) return prev;

      const distance = calculateDistance(enemy.position, player.position);
      console.log(`📏 Distance jusqu'au joueur: ${distance}`);

      // ✅ STRATÉGIE 1: Si très peu de vie, essayer de fuir
      const healthPercent = (enemy.health / enemy.maxHealth) * 100;
      if (healthPercent < 25 && enemy.pm > 0) {
        console.log(`🏃 ${enemy.name} essaie de fuir (${healthPercent.toFixed(1)}% PV)`);
        
        // Chercher une position plus loin du joueur
        const possibleMoves = [
          { x: enemy.position.x + 1, y: enemy.position.y },
          { x: enemy.position.x - 1, y: enemy.position.y },
          { x: enemy.position.x, y: enemy.position.y + 1 },
          { x: enemy.position.x, y: enemy.position.y - 1 }
        ];

        // ✅ CORRIGÉ: Type explicite pour bestMove
        let bestMove: Position | null = null;
        let bestDistance = distance;

        for (const move of possibleMoves) {
          const moveDistance = calculateDistance(move, player.position);
          const isOccupied = prev.combatants.some(c => 
            c.id !== enemy.id && c.position.x === move.x && c.position.y === move.y
          );
          
          if (!isOccupied && moveDistance > bestDistance) {
            bestMove = move;
            bestDistance = moveDistance;
          }
        }

        if (bestMove) {
          console.log(`✅ ${enemy.name} fuit vers (${bestMove.x}, ${bestMove.y})`);
          
          const updatedCombatants = prev.combatants.map(c => 
            c.id === enemy.id 
              ? { ...c, position: bestMove!, pm: c.pm - 1 }
              : c
          );

          const newLog: CombatLogEntry = {
            id: `ai-flee-${Date.now()}`,
            turn: prev.turnNumber,
            actor: enemy.name,
            action: 'move',
            description: `${enemy.name} bat en retraite !`,
            timestamp: new Date()
          };

          return {
            ...prev,
            combatants: updatedCombatants,
            combatLog: [...prev.combatLog, newLog]
          };
        }
      }

      // ✅ STRATÉGIE 2: Si à portée d'attaque, attaquer !
      if (distance <= 1 && enemy.pa >= 3) {
        console.log(`⚔️ ${enemy.name} attaque le joueur !`);
        
        // Attaque basique
        const damage = Math.floor(Math.random() * 15) + 10; // 10-25 dégâts
        
        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === enemy.id) {
            return { ...c, pa: c.pa - 3 }; // Coûte 3 PA
          }
          if (c.id === player.id) {
            const newHealth = Math.max(0, c.health - damage);
            return { ...c, health: newHealth, isAlive: newHealth > 0 };
          }
          return c;
        });

        const newLog: CombatLogEntry = {
          id: `ai-attack-${Date.now()}`,
          turn: prev.turnNumber,
          actor: enemy.name,
          action: 'attack',
          description: `${enemy.name} attaque et inflige ${damage} dégâts !`,
          timestamp: new Date()
        };

        return {
          ...prev,
          combatants: updatedCombatants,
          combatLog: [...prev.combatLog, newLog]
        };
      }

      // ✅ STRATÉGIE 3: Si pas à portée, se rapprocher
      if (distance > 1 && enemy.pm > 0) {
        console.log(`🏃 ${enemy.name} se rapproche du joueur`);
        
        // Chercher la position qui nous rapproche le plus
        const possibleMoves = [
          { x: enemy.position.x + 1, y: enemy.position.y },
          { x: enemy.position.x - 1, y: enemy.position.y },
          { x: enemy.position.x, y: enemy.position.y + 1 },
          { x: enemy.position.x, y: enemy.position.y - 1 }
        ];

        // ✅ CORRIGÉ: Type explicite pour bestMove
        let bestMove: Position | null = null;
        let bestDistance = distance;

        for (const move of possibleMoves) {
          const moveDistance = calculateDistance(move, player.position);
          const isOccupied = prev.combatants.some(c => 
            c.id !== enemy.id && c.position.x === move.x && c.position.y === move.y
          );
          
          if (!isOccupied && moveDistance < bestDistance) {
            bestMove = move;
            bestDistance = moveDistance;
          }
        }

        if (bestMove) {
          console.log(`✅ ${enemy.name} se déplace vers (${bestMove.x}, ${bestMove.y})`);
          
          const updatedCombatants = prev.combatants.map(c => 
            c.id === enemy.id 
              ? { ...c, position: bestMove!, pm: c.pm - 1 }
              : c
          );

          const newLog: CombatLogEntry = {
            id: `ai-move-${Date.now()}`,
            turn: prev.turnNumber,
            actor: enemy.name,
            action: 'move',
            description: `${enemy.name} se rapproche !`,
            timestamp: new Date()
          };

          return {
            ...prev,
            combatants: updatedCombatants,
            combatLog: [...prev.combatLog, newLog]
          };
        }
      }

      // ✅ STRATÉGIE 4: Si rien d'autre, attendre
      console.log(`💤 ${enemy.name} attend...`);
      
      const newLog: CombatLogEntry = {
        id: `ai-wait-${Date.now()}`,
        turn: prev.turnNumber,
        actor: enemy.name,
        action: 'wait',
        description: `${enemy.name} observe la situation...`,
        timestamp: new Date()
      };

      return {
        ...prev,
        combatLog: [...prev.combatLog, newLog]
      };
    });
  }, [calculateDistance]);

  /**
   * ✅ DÉCLENCHER LE COMBAT avec placement automatique de l'ennemi
   */
  const startCombat = useCallback((monster: Monster, playerPosition: Position) => {
    console.log(`⚔️ DÉBUT DU COMBAT STYLE DOFUS avec ${monster.name} !`);
    
    // Créer les zones de placement (4 cases par équipe)
    const playerZone: PlacementZone = {
      team: 'player',
      color: '#3B82F6',
      name: 'Zone Joueur',
      positions: [
        { x: 6, y: 7 },
        { x: 7, y: 7 },
        { x: 6, y: 8 },
        { x: 7, y: 8 }
      ]
    };

    const enemyZone: PlacementZone = {
      team: 'enemy',
      color: '#EF4444',
      name: 'Zone Ennemie', 
      positions: [
        { x: 9, y: 7 },
        { x: 10, y: 7 },
        { x: 9, y: 8 },
        { x: 10, y: 8 }
      ]
    };

    // Choisir automatiquement une position pour l'ennemi
    const randomEnemyPosition = enemyZone.positions[Math.floor(Math.random() * enemyZone.positions.length)];

    // Créer le combattant joueur
    const playerCombatant: Combatant = {
      id: 'player',
      name: 'Héros',
      team: 'player',
      position: playerPosition,
      health: 450,
      maxHealth: 500,
      mana: 180,
      maxMana: 300,
      level: 1,
      icon: '🧙‍♂️',
      color: '#3B82F6',
      isAlive: true,
      isReady: false,
      pa: DOFUS_COMBAT_CONFIG.PLAYER_MAX_PA,
      maxPA: DOFUS_COMBAT_CONFIG.PLAYER_MAX_PA,
      pm: DOFUS_COMBAT_CONFIG.PLAYER_MAX_PM,
      maxPM: DOFUS_COMBAT_CONFIG.PLAYER_MAX_PM,
      attack: 25,
      defense: 15,
      speed: 10
    };

    // ✅ Combattant monstre avec IA
    const monsterCombatant: Combatant = {
      id: monster.id,
      name: monster.name,
      team: 'enemy',
      position: randomEnemyPosition,
      startPosition: randomEnemyPosition,
      health: monster.health,
      maxHealth: monster.maxHealth,
      mana: monster.mana,
      maxMana: monster.maxMana,
      level: monster.level,
      icon: monster.icon,
      color: monster.color,
      isAlive: true,
      isReady: true,
      pa: 4,
      maxPA: 4,
      pm: 2,
      maxPM: 2,
      attack: monster.attack,
      defense: monster.defense,
      speed: monster.speed + Math.floor(Math.random() * 3) // Vitesse aléatoire pour l'ordre des tours
    };

    const startLog: CombatLogEntry = {
      id: `combat-start-${Date.now()}`,
      turn: 1,
      actor: 'Système',
      action: 'combat-start',
      description: `Combat commencé ! ${monster.name} est en position. Choisissez votre case bleue.`,
      timestamp: new Date()
    };

    setCombatState({
      phase: 'placement',
      combatants: [playerCombatant, monsterCombatant],
      currentTurnCombatantId: null,
      placementZones: [playerZone, enemyZone],
      selectedCombatantId: 'player',
      turnNumber: 1,
      combatLog: [startLog],
      originalMonster: monster,
      selectedSpell: null
    });

    console.log(`🎯 ${monster.name} placé automatiquement en (${randomEnemyPosition.x}, ${randomEnemyPosition.y})`);
  }, []);

  /**
   * ✅ PLACER UN COMBATTANT sur une case de placement
   */
  const placeCombatant = useCallback((combatantId: string, newPosition: Position) => {
    setCombatState(prev => {
      const combatant = prev.combatants.find(c => c.id === combatantId);
      if (!combatant) return prev;

      const zone = prev.placementZones.find(z => z.team === combatant.team);
      if (!zone) return prev;

      const isValidPosition = zone.positions.some(p => p.x === newPosition.x && p.y === newPosition.y);
      if (!isValidPosition) return prev;

      const isOccupied = prev.combatants.some(c => 
        c.id !== combatantId && 
        c.startPosition?.x === newPosition.x && 
        c.startPosition?.y === newPosition.y
      );
      
      if (isOccupied) return prev;

      const updatedCombatants = prev.combatants.map(c => 
        c.id === combatantId 
          ? { 
              ...c, 
              startPosition: newPosition, 
              position: newPosition, 
              isReady: true
            }
          : c
      );

      return {
        ...prev,
        combatants: updatedCombatants,
        combatLog: [...prev.combatLog, {
          id: `placement-${Date.now()}`,
          turn: 1,
          actor: combatant.name,
          action: 'placement',
          description: `${combatant.name} se place en (${newPosition.x}, ${newPosition.y}) et est prêt !`,
          timestamp: new Date()
        }]
      };
    });
  }, []);

  /**
   * ✅ VÉRIFIER SI TOUS LES COMBATTANTS SONT PRÊTS
   */
  const checkStartFighting = useCallback(() => {
    setCombatState(prev => {
      const allReady = prev.combatants.every(c => c.isReady);
      
      if (allReady && prev.phase === 'placement') {
        console.log('🚀 TOUS LES COMBATTANTS SONT PRÊTS - DÉBUT DU COMBAT !');
        
        const sortedCombatants = [...prev.combatants].sort((a, b) => b.speed - a.speed);
        const firstCombatant = sortedCombatants[0];

        // ✅ Démarrer le timer pour le premier tour
        startTurnTimer();

        return {
          ...prev,
          phase: 'fighting',
          currentTurnCombatantId: firstCombatant.id,
          selectedSpell: null,
          combatLog: [...prev.combatLog, {
            id: `start-fighting-${Date.now()}`,
            turn: 1,
            actor: 'Système',
            action: 'start-fighting',
            description: `Le combat commence ! C'est au tour de ${firstCombatant.name}.`,
            timestamp: new Date()
          }]
        };
      }

      return prev;
    });
  }, [startTurnTimer]);

  /**
   * ✅ DÉPLACER UN COMBATTANT (SIMPLIFIÉ)
   */
  const moveCombatant = useCallback((combatantId: string, newPosition: Position): ActionResult => {
    console.log(`🏃 Déplacement de ${combatantId} vers (${newPosition.x}, ${newPosition.y})`);

    let result: ActionResult = { success: false, message: "Erreur", paCost: 0 };

    setCombatState(prev => {
      const combatant = prev.combatants.find(c => c.id === combatantId);
      
      if (!combatant) {
        result = { success: false, message: "Combattant introuvable", paCost: 0 };
        return prev;
      }

      if (prev.currentTurnCombatantId !== combatantId) {
        result = { success: false, message: "Ce n'est pas votre tour", paCost: 0 };
        return prev;
      }

      const distance = Math.abs(newPosition.x - combatant.position.x) + 
                      Math.abs(newPosition.y - combatant.position.y);
      const pmCost = distance * DOFUS_COMBAT_CONFIG.MOVE_COST;

      if (pmCost > combatant.pm) {
        result = { success: false, message: `Pas assez de PM`, paCost: 0 };
        return prev;
      }

      const isOccupied = prev.combatants.some(c => 
        c.id !== combatantId && 
        c.position.x === newPosition.x && 
        c.position.y === newPosition.y
      );
      
      if (isOccupied) {
        result = { success: false, message: "Case occupée", paCost: 0 };
        return prev;
      }

      const updatedCombatants = prev.combatants.map(c => 
        c.id === combatantId 
          ? { ...c, position: newPosition, pm: c.pm - pmCost }
          : c
      );

      result = { success: true, message: `Déplacement réussi`, paCost: 0, pmCost: pmCost };

      return {
        ...prev,
        combatants: updatedCombatants,
        selectedSpell: null,
        combatLog: [...prev.combatLog, {
          id: `move-${Date.now()}`,
          turn: prev.turnNumber,
          actor: combatant.name,
          action: 'move',
          description: `${combatant.name} se déplace vers (${newPosition.x}, ${newPosition.y})`,
          timestamp: new Date()
        }]
      };
    });

    return result;
  }, []);

  /**
   * ✅ SÉLECTIONNER UN SORT (SIMPLIFIÉ)
   */
  const selectSpell = useCallback((combatantId: string, spellId: number): ActionResult => {
    console.log(`📜 Sélection de sort: ${spellId}`);

    let result: ActionResult = { success: false, message: "Erreur", paCost: 0 };

    setCombatState(prev => {
      // Désélection spéciale
      if (spellId === -1) {
        result = { success: true, message: "Sort désélectionné", paCost: 0 };
        return { ...prev, selectedSpell: null };
      }

      const combatant = prev.combatants.find(c => c.id === combatantId);
      
      if (!combatant) {
        result = { success: false, message: "Combattant introuvable", paCost: 0 };
        return prev;
      }

      if (prev.currentTurnCombatantId !== combatantId) {
        result = { success: false, message: "Ce n'est pas votre tour", paCost: 0 };
        return prev;
      }

      // Désélection normale
      if (prev.selectedSpell && prev.selectedSpell.spellId === spellId) {
        result = { success: true, message: "Sort désélectionné", paCost: 0 };
        return { ...prev, selectedSpell: null };
      }

      const spell = AVAILABLE_SPELLS[spellId as keyof typeof AVAILABLE_SPELLS];
      if (!spell) {
        result = { success: false, message: "Sort inconnu", paCost: 0 };
        return prev;
      }

      if (spell.paCost > combatant.pa) {
        result = { success: false, message: `Pas assez de PA`, paCost: 0 };
        return prev;
      }

      result = { success: true, message: `Sort ${spell.name} sélectionné`, paCost: 0 };

      return {
        ...prev,
        selectedSpell: {
          spellId: spellId,
          spell: spell,
          caster: combatantId
        }
      };
    });

    return result;
  }, []);

  /**
   * ✅ NOUVELLE FONCTION SIMPLIFIÉE: Lancer un sort directement sur un combattant
   */
  const castSpellOnCombatant = useCallback((targetCombatant: Combatant): ActionResult => {
    console.log(`✨ === LANCEMENT DE SORT DIRECT SUR COMBATTANT ===`);
    console.log(`🎯 Cible: ${targetCombatant.name} (${targetCombatant.team})`);

    let result: ActionResult = { success: false, message: "Erreur", paCost: 0 };

    setCombatState(prev => {
      // Vérifier qu'un sort est sélectionné
      if (!prev.selectedSpell) {
        result = { success: false, message: "Aucun sort sélectionné", paCost: 0 };
        return prev;
      }

      const { spell, caster } = prev.selectedSpell;
      const combatant = prev.combatants.find(c => c.id === caster);
      
      if (!combatant) {
        result = { success: false, message: "Lanceur introuvable", paCost: 0 };
        return prev;
      }

      // Vérifier que c'est le tour du joueur
      if (prev.currentTurnCombatantId !== 'player') {
        result = { success: false, message: "Ce n'est pas votre tour", paCost: 0 };
        return prev;
      }

      // Vérifier la portée
      const distance = Math.abs(targetCombatant.position.x - combatant.position.x) + 
                      Math.abs(targetCombatant.position.y - combatant.position.y);
      
      if (distance > spell.range) {
        result = { success: false, message: `Cible trop loin (Distance: ${distance}, Portée: ${spell.range})`, paCost: 0 };
        return prev;
      }

      // ✅ VÉRIFICATION SIMPLIFIÉE DES CIBLES
      if (spell.type === 'damage') {
        // Sort d'attaque - peut cibler seulement les ennemis
        if (targetCombatant.team === combatant.team) {
          result = { success: false, message: "Ne peut pas attaquer un allié", paCost: 0 };
          return prev;
        }
      } else if (spell.type === 'heal') {
        // Sort de soin - peut cibler seulement les alliés
        if (targetCombatant.team !== combatant.team) {
          result = { success: false, message: "Ne peut pas soigner un ennemi", paCost: 0 };
          return prev;
        }
      }

      // ✅ APPLIQUER LES EFFETS DU SORT
      if (spell.type === 'damage') {
        const damage = Math.floor(Math.random() * (spell.maxDamage - spell.minDamage + 1)) + spell.minDamage;
        
        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === caster) {
            // Décompter les PA du lanceur
            return { ...c, pa: c.pa - spell.paCost };
          }
          if (c.id === targetCombatant.id) {
            // Appliquer les dégâts à la cible
            const newHealth = Math.max(0, c.health - damage);
            const stillAlive = newHealth > 0;
            return { ...c, health: newHealth, isAlive: stillAlive };
          }
          return c;
        });

        result = {
          success: true,
          message: `${spell.name} inflige ${damage} dégâts à ${targetCombatant.name} !`,
          damage: damage,
          heal: 0,
          paCost: spell.paCost
        };

        return {
          ...prev,
          combatants: updatedCombatants,
          selectedSpell: null, // Désélectionner après utilisation
          combatLog: [...prev.combatLog, {
            id: `spell-${Date.now()}`,
            turn: prev.turnNumber,
            actor: combatant.name,
            action: 'spell',
            description: `${combatant.name} lance ${spell.name} sur ${targetCombatant.name} ! ${damage} dégâts`,
            timestamp: new Date()
          }]
        };

      } else if (spell.type === 'heal') {
        const healAmount = Math.floor(Math.random() * (spell.maxHeal - spell.minHeal + 1)) + spell.minHeal;

        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === caster) {
            // Décompter les PA du lanceur
            return { ...c, pa: c.pa - spell.paCost };
          }
          if (c.id === targetCombatant.id) {
            // Appliquer les soins à la cible
            const newHealth = Math.min(c.maxHealth, c.health + healAmount);
            return { ...c, health: newHealth };
          }
          return c;
        });

        result = {
          success: true,
          message: `${spell.name} soigne ${targetCombatant.name} de ${healAmount} PV !`,
          damage: 0,
          heal: healAmount,
          paCost: spell.paCost
        };

        return {
          ...prev,
          combatants: updatedCombatants,
          selectedSpell: null,
          combatLog: [...prev.combatLog, {
            id: `spell-${Date.now()}`,
            turn: prev.turnNumber,
            actor: combatant.name,
            action: 'spell',
            description: `${combatant.name} lance ${spell.name} et soigne ${targetCombatant.name} de ${healAmount} PV`,
            timestamp: new Date()
          }]
        };
      }

      result = { success: false, message: "Type de sort non géré", paCost: 0 };
      return prev;
    });

    console.log(`🔮 Résultat: ${result.success ? 'SUCCÈS' : 'ÉCHEC'} - ${result.message}`);
    return result;
  }, []);

  /**
   * ✅ ANCIENNE FONCTION (gardée pour compatibilité)
   */
  const castSpellOnTarget = useCallback((targetPosition: Position): ActionResult => {
    // Trouver le combattant à cette position
    const targetCombatant = combatState.combatants.find(c => 
      c.position.x === targetPosition.x && c.position.y === targetPosition.y && c.isAlive
    );

    if (targetCombatant) {
      return castSpellOnCombatant(targetCombatant);
    } else {
      return { success: false, message: "Aucune cible à cette position", paCost: 0 };
    }
  }, [combatState.combatants, castSpellOnCombatant]);

  /**
   * ✅ Passer au combattant suivant avec IA et timer
   */
  const nextTurn = useCallback(() => {
    setCombatState(prev => {
      if (prev.phase !== 'fighting') return prev;

      const aliveCombatants = prev.combatants.filter(c => c.isAlive);
      const currentIndex = aliveCombatants.findIndex(c => c.id === prev.currentTurnCombatantId);
      const nextIndex = (currentIndex + 1) % aliveCombatants.length;
      const nextCombatant = aliveCombatants[nextIndex];

      const newTurnNumber = nextIndex === 0 ? prev.turnNumber + 1 : prev.turnNumber;

      const updatedCombatants = prev.combatants.map(c => {
        if (!c.isAlive) return c;
        
        if (nextIndex === 0) {
          return { ...c, pa: c.maxPA, pm: c.maxPM };
        }
        return c;
      });

      // ✅ Redémarrer le timer pour le nouveau tour
      startTurnTimer();

      // ✅ Si c'est le tour d'un ennemi, déclencher l'IA après un délai
      if (nextCombatant.team === 'enemy') {
        console.log(`🤖 C'est le tour de ${nextCombatant.name} - IA activée dans 2 secondes`);
        
        // Nettoyer l'ancien timeout d'IA
        if (aiTimeoutRef.current) {
          clearTimeout(aiTimeoutRef.current);
        }
        
        // Programmer l'action de l'IA
        aiTimeoutRef.current = setTimeout(() => {
          console.log(`🎮 Exécution de l'IA pour ${nextCombatant.name}`);
          executeEnemyAI(nextCombatant);
          
          // Après l'action de l'IA, attendre 2 secondes puis passer au tour suivant
          setTimeout(() => {
            console.log(`⏭️ Tour de ${nextCombatant.name} terminé, passage au suivant`);
            nextTurn();
          }, 2000);
          
        }, 2000); // L'IA agit après 2 secondes
      }

      return {
        ...prev,
        currentTurnCombatantId: nextCombatant.id,
        turnNumber: newTurnNumber,
        combatants: updatedCombatants,
        selectedSpell: null,
        combatLog: [...prev.combatLog, {
          id: `next-turn-${Date.now()}`,
          turn: newTurnNumber,
          actor: 'Système',
          action: 'next-turn',
          description: `C'est au tour de ${nextCombatant.name}`,
          timestamp: new Date()
        }]
      };
    });
  }, [startTurnTimer, executeEnemyAI]);

  /**
   * ✅ TERMINER LE COMBAT
   */
  const endCombat = useCallback((reason: 'victory' | 'defeat' | 'flee') => {
    // ✅ Arrêter tous les timers
    stopTurnTimer();
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }

    setCombatState(prev => ({
      ...prev,
      phase: reason === 'victory' ? 'victory' : reason === 'defeat' ? 'defeat' : 'exploring',
      selectedSpell: null
    }));
  }, [stopTurnTimer]);

  /**
   * ✅ RETOURNER EN MODE EXPLORATION
   */
  const exitCombat = useCallback(() => {
    // ✅ Arrêter tous les timers
    stopTurnTimer();
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }

    setCombatState({
      phase: 'exploring',
      combatants: [],
      currentTurnCombatantId: null,
      placementZones: [],
      selectedCombatantId: null,
      turnNumber: 1,
      combatLog: [],
      originalMonster: null,
      selectedSpell: null
    });

    setTurnTimeLeft(DOFUS_COMBAT_CONFIG.TURN_TIME);
  }, [stopTurnTimer]);

  /**
   * ✅ VÉRIFIER AUTOMATIQUEMENT les conditions de victoire/défaite
   */
  useEffect(() => {
    if (combatState.phase !== 'fighting') return;

    const playerAlive = combatState.combatants.some(c => c.team === 'player' && c.isAlive);
    const enemyAlive = combatState.combatants.some(c => c.team === 'enemy' && c.isAlive);

    if (!playerAlive) {
      setTimeout(() => endCombat('defeat'), 1000);
    } else if (!enemyAlive) {
      setTimeout(() => endCombat('victory'), 1000);
    }
  }, [combatState.combatants, combatState.phase, endCombat]);

  /**
   * ✅ VÉRIFIER AUTOMATIQUEMENT si on peut commencer le combat
   */
  useEffect(() => {
    if (combatState.phase === 'placement') {
      checkStartFighting();
    }
  }, [combatState.combatants, combatState.phase, checkStartFighting]);

  // ✅ Nettoyer les timers au démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  // Fonction de compatibilité
  const setCombatantReady = useCallback((combatantId: string) => {
    // Cette fonction n'est plus nécessaire car le placement rend automatiquement prêt
  }, []);

  const castSpell = useCallback((combatantId: string, spellId: number): ActionResult => {
    return selectSpell(combatantId, spellId);
  }, [selectSpell]);

  return {
    // État du combat
    combatState,
    
    // ✅ État du timer
    turnTimeLeft,
    
    // Actions principales
    startCombat,
    exitCombat,
    endCombat,
    
    // Phase de placement
    placeCombatant,
    setCombatantReady,
    
    // Phase de combat
    moveCombatant,
    castSpell,
    selectSpell,
    castSpellOnTarget, // Ancienne fonction
    castSpellOnCombatant, // Nouvelle fonction simplifiée
    nextTurn,
    
    // ✅ Fonctions du timer
    startTurnTimer,
    stopTurnTimer,
    
    // Configuration
    DOFUS_COMBAT_CONFIG,
    AVAILABLE_SPELLS
  };
};