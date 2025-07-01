/**
 * HOOK DE COMBAT UNIFIÉ ET CORRIGÉ - VERSION FINALE AVEC ANIMATIONS DE DÉGÂTS
 * ✅ CORRIGÉ: Une seule définition des sorts (cohérente)
 * ✅ CORRIGÉ: Système de portée intelligent avec debug visuel
 * ✅ CORRIGÉ: Vérifications de cible simplifiées et claires
 * ✅ CORRIGÉ: Messages d'erreur détaillés pour debug
 * ✅ NOUVEAU: Système de combat plus prévisible et fiable
 * ✅ NOUVEAU: Animations de dégâts avec effets visuels "boom -124"
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
  PLAYER_MAX_PA: 6,
  PLAYER_MAX_PM: 3,
  MOVE_COST: 1,
  BASIC_ATTACK_COST: 3,
  PLACEMENT_TIME: 30,
  TURN_TIME: 45,
};

// ✅ NOUVEAU: Interface pour les animations de dégâts
interface DamageAnimation {
  id: string;
  targetId: string;
  position: Position;
  damage: number;
  type: 'damage' | 'heal';
  timestamp: number;
  duration: number; // en millisecondes
}

// ✅ DÉFINITION UNIQUE ET COHÉRENTE DES SORTS
const UNIFIED_SPELLS = {
  1: { 
    id: 1,
    name: 'Coup de Dague', 
    icon: '🗡️',
    paCost: 3, 
    type: 'damage' as const,
    minDamage: 15,
    maxDamage: 25,
    range: 1,
    description: 'Attaque rapide (15-25 dégâts)',
    targetType: 'enemy' as const,
    canTargetEmptyCell: false
  },
  2: { 
    id: 2,
    name: 'Attaque Puissante', 
    icon: '⚔️',
    paCost: 4, 
    type: 'damage' as const,
    minDamage: 25,
    maxDamage: 35,
    range: 1,
    description: 'Attaque forte (25-35 dégâts)',
    targetType: 'enemy' as const,
    canTargetEmptyCell: false
  },
  3: { 
    id: 3,
    name: 'Poison', 
    icon: '☠️',
    paCost: 2, 
    type: 'damage' as const,
    minDamage: 10,
    maxDamage: 15,
    range: 2,
    description: 'Empoisonne (10-15 dégâts)',
    targetType: 'enemy' as const,
    canTargetEmptyCell: false
  },
  4: { 
    id: 4,
    name: 'Soin Mineur', 
    icon: '💚',
    paCost: 3, 
    type: 'heal' as const,
    minHeal: 20,
    maxHeal: 30,
    range: 3,
    description: 'Soigne 20-30 PV',
    targetType: 'ally' as const,
    canTargetEmptyCell: false
  },
  5: { 
    id: 5,
    name: 'Fireball', 
    icon: '🔥',
    paCost: 4, 
    type: 'damage' as const,
    minDamage: 30,
    maxDamage: 40,
    range: 4,
    description: 'Boule de feu (30-40 dégâts)',
    targetType: 'enemy' as const,
    canTargetEmptyCell: false
  },
  6: { 
    id: 6,
    name: 'Soin Majeur', 
    icon: '✨',
    paCost: 5, 
    type: 'heal' as const,
    minHeal: 40,
    maxHeal: 50,
    range: 2,
    description: 'Soigne 40-50 PV',
    targetType: 'ally' as const,
    canTargetEmptyCell: false
  },
  7: { 
    id: 7,
    name: 'Éclair', 
    icon: '⚡',
    paCost: 5, 
    type: 'damage' as const,
    minDamage: 35,
    maxDamage: 45,
    range: 5,
    description: 'Attaque électrique (35-45 dégâts)',
    targetType: 'enemy' as const,
    canTargetEmptyCell: false
  },
  8: { 
    id: 8,
    name: 'Gel', 
    icon: '❄️',
    paCost: 3, 
    type: 'damage' as const,
    minDamage: 20,
    maxDamage: 25,
    range: 3,
    description: 'Gèle l\'ennemi (20-25 dégâts)',
    targetType: 'enemy' as const,
    canTargetEmptyCell: false
  },
  // Sorts pour les ennemis
  9: { 
    id: 9,
    name: 'Griffe Sauvage', 
    icon: '🐾',
    paCost: 3, 
    type: 'damage' as const,
    minDamage: 18,
    maxDamage: 28,
    range: 1,
    description: 'Attaque bestiale',
    targetType: 'enemy' as const,
    canTargetEmptyCell: false
  },
  10: { 
    id: 10,
    name: 'Rugissement', 
    icon: '📢',
    paCost: 2, 
    type: 'damage' as const,
    minDamage: 12,
    maxDamage: 20,
    range: 2,
    description: 'Cri intimidant',
    targetType: 'enemy' as const,
    canTargetEmptyCell: false
  }
} as const;

// ✅ Type pour la sélection de sort
interface SelectedSpell {
  spellId: number;
  spell: typeof UNIFIED_SPELLS[keyof typeof UNIFIED_SPELLS];
  caster: string;
}

export const useCombatDofus = () => {
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

  // ✅ NOUVEAU: État pour les animations de dégâts
  const [damageAnimations, setDamageAnimations] = useState<DamageAnimation[]>([]);

  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(DOFUS_COMBAT_CONFIG.TURN_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ NOUVEAU: Fonction pour ajouter une animation de dégâts
  const addDamageAnimation = useCallback((
    targetId: string,
    position: Position,
    damage: number,
    type: 'damage' | 'heal'
  ) => {
    const animation: DamageAnimation = {
      id: `damage-${Date.now()}-${Math.random()}`,
      targetId,
      position: { ...position }, // Copie de la position
      damage,
      type,
      timestamp: Date.now(),
      duration: 2000 // 2 secondes
    };

    console.log(`💥 Animation de ${type} créée: ${damage} sur ${targetId} à (${position.x}, ${position.y})`);

    setDamageAnimations(prev => [...prev, animation]);

    // Supprimer l'animation automatiquement après la durée
    setTimeout(() => {
      setDamageAnimations(prev => prev.filter(anim => anim.id !== animation.id));
    }, animation.duration);
  }, []);

  /**
   * ✅ FONCTION DE DEBUG POUR PORTÉE
   */
  const debugSpellRange = useCallback((
    casterPos: Position, 
    targetPos: Position, 
    spell: typeof UNIFIED_SPELLS[keyof typeof UNIFIED_SPELLS]
  ): { distance: number; inRange: boolean; debug: string } => {
    const distance = Math.abs(targetPos.x - casterPos.x) + Math.abs(targetPos.y - casterPos.y);
    const inRange = distance <= spell.range;
    
    const debug = `
🎯 DEBUG PORTÉE:
├─ Sort: ${spell.name} (${spell.icon})
├─ Portée max: ${spell.range}
├─ Lanceur: (${casterPos.x}, ${casterPos.y})
├─ Cible: (${targetPos.x}, ${targetPos.y})
├─ Distance calculée: ${distance}
└─ ✅ Résultat: ${inRange ? 'PORTÉE OK' : 'TROP LOIN'}`;
    
    return { distance, inRange, debug };
  }, []);

  /**
   * ✅ FONCTION DE DEBUG POUR CIBLES
   */
  const debugSpellTarget = useCallback((
    spell: typeof UNIFIED_SPELLS[keyof typeof UNIFIED_SPELLS],
    caster: Combatant,
    target: Combatant
  ): { canTarget: boolean; debug: string } => {
    let canTarget = false;
    let reason = '';

    if (spell.type === 'damage') {
      // Sort d'attaque : seulement les ennemis
      if (target.team !== caster.team) {
        canTarget = true;
        reason = 'Sort d\'attaque sur ennemi ✅';
      } else {
        reason = 'Sort d\'attaque sur allié ❌';
      }
    } else if (spell.type === 'heal') {
      // Sort de soin : seulement les alliés
      if (target.team === caster.team) {
        canTarget = true;
        reason = 'Sort de soin sur allié ✅';
      } else {
        reason = 'Sort de soin sur ennemi ❌';
      }
    }

    const debug = `
🎯 DEBUG CIBLE:
├─ Sort: ${spell.name} (Type: ${spell.type})
├─ Lanceur: ${caster.name} (Équipe: ${caster.team})
├─ Cible: ${target.name} (Équipe: ${target.team})
└─ Résultat: ${reason}`;

    return { canTarget, debug };
  }, []);

  /**
   * ✅ CALCUL DE DISTANCE AMÉLIORÉ
   */
  const calculateDistance = useCallback((pos1: Position, pos2: Position): number => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }, []);

  /**
   * ✅ TIMER FUNCTIONS
   */
  const startTurnTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTurnTimeLeft(DOFUS_COMBAT_CONFIG.TURN_TIME);

    timerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          console.log('⏰ Temps écoulé ! Passage automatique au tour suivant');
          nextTurn();
          return DOFUS_COMBAT_CONFIG.TURN_TIME;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTurnTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * ✅ IA ENNEMIE SIMPLIFIÉE AVEC ANIMATIONS
   */
  const executeEnemyAI = useCallback((enemy: Combatant) => {
    console.log(`🤖 === IA DE ${enemy.name.toUpperCase()} ===`);
    
    setCombatState(prev => {
      const player = prev.combatants.find(c => c.team === 'player');
      if (!player) return prev;

      const distance = calculateDistance(enemy.position, player.position);
      console.log(`📏 Distance jusqu'au joueur: ${distance}`);

      // Stratégie simple : attaquer si possible, sinon se rapprocher
      if (distance <= 1 && enemy.pa >= 3) {
        // Attaque avec animation
        const damage = Math.floor(Math.random() * 15) + 10;
        
        // ✅ NOUVEAU: Déclencher l'animation de dégâts pour l'IA
        addDamageAnimation(player.id, player.position, damage, 'damage');
        
        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === enemy.id) {
            return { ...c, pa: c.pa - 3 };
          }
          if (c.id === player.id) {
            const newHealth = Math.max(0, c.health - damage);
            return { ...c, health: newHealth, isAlive: newHealth > 0 };
          }
          return c;
        });

        return {
          ...prev,
          combatants: updatedCombatants,
          combatLog: [...prev.combatLog, {
            id: `ai-attack-${Date.now()}`,
            turn: prev.turnNumber,
            actor: enemy.name,
            action: 'attack',
            description: `${enemy.name} attaque et inflige ${damage} dégâts !`,
            timestamp: new Date()
          }]
        };
      } else if (distance > 1 && enemy.pm > 0) {
        // Se rapprocher
        const possibleMoves = [
          { x: enemy.position.x + 1, y: enemy.position.y },
          { x: enemy.position.x - 1, y: enemy.position.y },
          { x: enemy.position.x, y: enemy.position.y + 1 },
          { x: enemy.position.x, y: enemy.position.y - 1 }
        ];

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
          const updatedCombatants = prev.combatants.map(c => 
            c.id === enemy.id 
              ? { ...c, position: bestMove!, pm: c.pm - 1 }
              : c
          );

          return {
            ...prev,
            combatants: updatedCombatants,
            combatLog: [...prev.combatLog, {
              id: `ai-move-${Date.now()}`,
              turn: prev.turnNumber,
              actor: enemy.name,
              action: 'move',
              description: `${enemy.name} se rapproche !`,
              timestamp: new Date()
            }]
          };
        }
      }

      return prev;
    });
  }, [calculateDistance, addDamageAnimation]);

  /**
   * ✅ DÉMARRER LE COMBAT
   */
  const startCombat = useCallback((monster: Monster, playerPosition: Position) => {
    console.log(`⚔️ DÉBUT DU COMBAT avec ${monster.name} !`);
    
    // ✅ NOUVEAU: Nettoyer les animations précédentes
    setDamageAnimations([]);
    
    const playerZone: PlacementZone = {
      team: 'player',
      color: '#3B82F6',
      name: 'Zone Joueur',
      positions: [
        { x: 6, y: 7 }, { x: 7, y: 7 },
        { x: 6, y: 8 }, { x: 7, y: 8 }
      ]
    };

    const enemyZone: PlacementZone = {
      team: 'enemy',
      color: '#EF4444',
      name: 'Zone Ennemie', 
      positions: [
        { x: 9, y: 7 }, { x: 10, y: 7 },
        { x: 9, y: 8 }, { x: 10, y: 8 }
      ]
    };

    const randomEnemyPosition = enemyZone.positions[Math.floor(Math.random() * enemyZone.positions.length)];

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
      speed: monster.speed + Math.floor(Math.random() * 3)
    };

    setCombatState({
      phase: 'placement',
      combatants: [playerCombatant, monsterCombatant],
      currentTurnCombatantId: null,
      placementZones: [playerZone, enemyZone],
      selectedCombatantId: 'player',
      turnNumber: 1,
      combatLog: [{
        id: `combat-start-${Date.now()}`,
        turn: 1,
        actor: 'Système',
        action: 'combat-start',
        description: `Combat commencé ! ${monster.name} est en position. Choisissez votre case bleue.`,
        timestamp: new Date()
      }],
      originalMonster: monster,
      selectedSpell: null
    });
  }, []);

  /**
   * ✅ PLACER UN COMBATTANT
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
          ? { ...c, startPosition: newPosition, position: newPosition, isReady: true }
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
   * ✅ VÉRIFIER SI ON PEUT COMMENCER LE COMBAT
   */
  const checkStartFighting = useCallback(() => {
    setCombatState(prev => {
      const allReady = prev.combatants.every(c => c.isReady);
      
      if (allReady && prev.phase === 'placement') {
        console.log('🚀 TOUS PRÊTS - DÉBUT DU COMBAT !');
        
        const sortedCombatants = [...prev.combatants].sort((a, b) => b.speed - a.speed);
        const firstCombatant = sortedCombatants[0];

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
   * ✅ DÉPLACER UN COMBATTANT
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

      const distance = calculateDistance(combatant.position, newPosition);
      const pmCost = distance * DOFUS_COMBAT_CONFIG.MOVE_COST;

      if (pmCost > combatant.pm) {
        result = { success: false, message: `Pas assez de PM (${combatant.pm}/${pmCost})`, paCost: 0 };
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
  }, [calculateDistance]);

  /**
   * ✅ SÉLECTIONNER UN SORT (CORRIGÉ)
   */
  const selectSpell = useCallback((combatantId: string, spellId: number): ActionResult => {
    console.log(`
🔮 === SÉLECTION DE SORT ===
├─ Combattant: ${combatantId}
├─ Sort ID: ${spellId}
└─ Phase: ${combatState.phase}`);

    let result: ActionResult = { success: false, message: "Erreur", paCost: 0 };

    setCombatState(prev => {
      // Désélection spéciale
      if (spellId === -1) {
        console.log(`🔄 Désélection manuelle`);
        result = { success: true, message: "Sort désélectionné", paCost: 0 };
        return { ...prev, selectedSpell: null };
      }

      const combatant = prev.combatants.find(c => c.id === combatantId);
      
      if (!combatant) {
        result = { success: false, message: "Combattant introuvable", paCost: 0 };
        return prev;
      }

      if (prev.phase !== 'fighting') {
        result = { success: false, message: "Pas en combat", paCost: 0 };
        return prev;
      }

      if (prev.currentTurnCombatantId !== combatantId) {
        result = { success: false, message: "Ce n'est pas votre tour", paCost: 0 };
        return prev;
      }

      // Désélection normale (même sort)
      if (prev.selectedSpell && prev.selectedSpell.spellId === spellId) {
        console.log(`🔄 Désélection du même sort`);
        result = { success: true, message: "Sort désélectionné", paCost: 0 };
        return { ...prev, selectedSpell: null };
      }

      // ✅ Utiliser la définition unifiée
      const spell = UNIFIED_SPELLS[spellId as keyof typeof UNIFIED_SPELLS];
      if (!spell) {
        result = { success: false, message: `Sort ${spellId} inconnu`, paCost: 0 };
        return prev;
      }

      if (spell.paCost > combatant.pa) {
        result = { success: false, message: `Pas assez de PA (${combatant.pa}/${spell.paCost})`, paCost: 0 };
        return prev;
      }

      console.log(`✅ Sort ${spell.name} sélectionné`);
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
  }, [combatState.phase]);

  /**
   * ✅ LANCER UN SORT SUR UN COMBATTANT (VERSION CORRIGÉE AVEC DEBUG ET ANIMATIONS)
   */
  const castSpellOnCombatant = useCallback((targetCombatant: Combatant): ActionResult => {
    console.log(`
✨ === LANCEMENT DE SORT ===
├─ Cible: ${targetCombatant.name} (${targetCombatant.team})
└─ Position: (${targetCombatant.position.x}, ${targetCombatant.position.y})`);

    let result: ActionResult = { success: false, message: "Erreur", paCost: 0 };

    setCombatState(prev => {
      // Vérification du sort sélectionné
      if (!prev.selectedSpell) {
        result = { success: false, message: "❌ Aucun sort sélectionné", paCost: 0 };
        console.log(`❌ Aucun sort sélectionné`);
        return prev;
      }

      const { spell, caster } = prev.selectedSpell;
      const combatant = prev.combatants.find(c => c.id === caster);
      
      if (!combatant) {
        result = { success: false, message: "❌ Lanceur introuvable", paCost: 0 };
        console.log(`❌ Lanceur ${caster} introuvable`);
        return prev;
      }

      // Vérification du tour
      if (prev.currentTurnCombatantId !== 'player') {
        result = { success: false, message: "❌ Ce n'est pas votre tour", paCost: 0 };
        console.log(`❌ Ce n'est pas le tour du joueur (tour actuel: ${prev.currentTurnCombatantId})`);
        return prev;
      }

      // ✅ DEBUG DE LA PORTÉE
      const rangeCheck = debugSpellRange(combatant.position, targetCombatant.position, spell);
      console.log(rangeCheck.debug);
      
      if (!rangeCheck.inRange) {
        result = { 
          success: false, 
          message: `❌ Cible trop loin (Distance: ${rangeCheck.distance}, Portée: ${spell.range})`, 
          paCost: 0 
        };
        return prev;
      }

      // ✅ DEBUG DE LA CIBLE
      const targetCheck = debugSpellTarget(spell, combatant, targetCombatant);
      console.log(targetCheck.debug);
      
      if (!targetCheck.canTarget) {
        result = { success: false, message: "❌ Cible invalide", paCost: 0 };
        return prev;
      }

      // ✅ VÉRIFICATION DES PA
      if (spell.paCost > combatant.pa) {
        result = { 
          success: false, 
          message: `❌ Pas assez de PA (${combatant.pa}/${spell.paCost})`, 
          paCost: 0 
        };
        console.log(`❌ PA insuffisants: ${combatant.pa}/${spell.paCost}`);
        return prev;
      }

      // ✅ APPLIQUER LES EFFETS AVEC ANIMATIONS
      console.log(`✅ Toutes les vérifications passées - Application des effets avec animations`);

      if (spell.type === 'damage') {
        const damage = Math.floor(Math.random() * (spell.maxDamage - spell.minDamage + 1)) + spell.minDamage;
        
        // ✅ NOUVEAU: Déclencher l'animation de dégâts
        addDamageAnimation(targetCombatant.id, targetCombatant.position, damage, 'damage');
        
        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === caster) {
            return { ...c, pa: c.pa - spell.paCost };
          }
          if (c.id === targetCombatant.id) {
            const newHealth = Math.max(0, c.health - damage);
            const stillAlive = newHealth > 0;
            return { ...c, health: newHealth, isAlive: stillAlive };
          }
          return c;
        });

        result = {
          success: true,
          message: `✅ ${spell.name} inflige ${damage} dégâts à ${targetCombatant.name} !`,
          damage: damage,
          heal: 0,
          paCost: spell.paCost
        };

        console.log(`🎯 SORT RÉUSSI: ${damage} dégâts infligés avec animation !`);

        return {
          ...prev,
          combatants: updatedCombatants,
          selectedSpell: null,
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
        const healAmount = Math.floor(Math.random() * ((spell.maxHeal || 0) - (spell.minHeal || 0) + 1)) + (spell.minHeal || 0);

        // ✅ NOUVEAU: Déclencher l'animation de soins
        addDamageAnimation(targetCombatant.id, targetCombatant.position, healAmount, 'heal');

        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === caster) {
            return { ...c, pa: c.pa - spell.paCost };
          }
          if (c.id === targetCombatant.id) {
            const newHealth = Math.min(c.maxHealth, c.health + healAmount);
            return { ...c, health: newHealth };
          }
          return c;
        });

        result = {
          success: true,
          message: `✅ ${spell.name} soigne ${targetCombatant.name} de ${healAmount} PV !`,
          damage: 0,
          heal: healAmount,
          paCost: spell.paCost
        };

        console.log(`💚 SORT RÉUSSI: ${healAmount} PV soignés avec animation !`);

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

      result = { success: false, message: "❌ Type de sort non géré", paCost: 0 };
      return prev;
    });

    console.log(`
🔮 === RÉSULTAT FINAL ===
├─ Succès: ${result.success ? 'OUI' : 'NON'}
├─ Message: ${result.message}
├─ Dégâts: ${result.damage || 0}
├─ Soins: ${result.heal || 0}
└─ Coût PA: ${result.paCost || 0}`);

    return result;
  }, [debugSpellRange, debugSpellTarget, addDamageAnimation]);

  /**
   * ✅ FONCTION DE COMPATIBILITÉ (ancienne interface)
   */
  const castSpellOnTarget = useCallback((targetPosition: Position): ActionResult => {
    const targetCombatant = combatState.combatants.find(c => 
      c.position.x === targetPosition.x && c.position.y === targetPosition.y && c.isAlive
    );

    if (targetCombatant) {
      return castSpellOnCombatant(targetCombatant);
    } else {
      return { success: false, message: "❌ Aucune cible à cette position", paCost: 0 };
    }
  }, [combatState.combatants, castSpellOnCombatant]);

  /**
   * ✅ PASSER AU TOUR SUIVANT
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

      startTurnTimer();

      // IA pour les ennemis
      if (nextCombatant.team === 'enemy') {
        console.log(`🤖 Tour de ${nextCombatant.name} - IA dans 2s`);
        
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
        
        aiTimeoutRef.current = setTimeout(() => {
          executeEnemyAI(nextCombatant);
          setTimeout(() => nextTurn(), 2000);
        }, 2000);
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
   * ✅ SORTIR DU COMBAT
   */
  const exitCombat = useCallback(() => {
    stopTurnTimer();
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }

    // ✅ NOUVEAU: Nettoyer les animations
    setDamageAnimations([]);

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
   * ✅ VÉRIFICATIONS AUTOMATIQUES
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

  useEffect(() => {
    if (combatState.phase === 'placement') {
      checkStartFighting();
    }
  }, [combatState.combatants, combatState.phase, checkStartFighting]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  // ✅ FONCTIONS DE COMPATIBILITÉ
  const setCombatantReady = useCallback((combatantId: string) => {
    // Plus nécessaire
  }, []);

  const castSpell = useCallback((combatantId: string, spellId: number): ActionResult => {
    return selectSpell(combatantId, spellId);
  }, [selectSpell]);

  return {
    // État du combat
    combatState,
    turnTimeLeft,
    
    // ✅ NOUVEAU: État des animations de dégâts
    damageAnimations,
    
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
    castSpellOnTarget,
    castSpellOnCombatant,
    nextTurn,
    
    // Timer
    startTurnTimer,
    stopTurnTimer,
    
    // Configuration et sorts
    DOFUS_COMBAT_CONFIG,
    AVAILABLE_SPELLS: UNIFIED_SPELLS // ✅ Export de la définition unifiée
  };
};