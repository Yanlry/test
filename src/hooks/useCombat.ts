/**
 * HOOK DE COMBAT STYLE DOFUS - VERSION AVEC SYSTÈME DE CIBLAGE
 * ✅ DÉPLACEMENT FONCTIONNE PARFAITEMENT
 * ✅ SYSTÈME DE SORTS avec sélection et ciblage comme Dofus
 * ✅ Affichage de la portée des sorts
 * ✅ Possibilité de désélectionner un sort
 */

import { useState, useCallback, useEffect } from 'react';
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
};

// ✅ Définition des sorts disponibles avec portée
const AVAILABLE_SPELLS = {
  1: { 
    name: 'Coup de Dague', 
    paCost: 3, 
    type: 'damage',
    minDamage: 15,
    maxDamage: 25,
    range: 1, // Portée de 1 case
    description: 'Attaque rapide',
    targetType: 'enemy' // Cible les ennemis
  },
  2: { 
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
    name: 'Soin Mineur', 
    paCost: 3, 
    type: 'heal',
    minHeal: 20,
    maxHeal: 30,
    range: 3,
    description: 'Soigne les blessures',
    targetType: 'self' // Cible soi-même ou alliés
  },
  5: { 
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
    name: 'Soin Majeur', 
    paCost: 5, 
    type: 'heal',
    minHeal: 40,
    maxHeal: 50,
    range: 2,
    description: 'Soigne beaucoup',
    targetType: 'self'
  },
  7: { 
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
    name: 'Gel', 
    paCost: 3, 
    type: 'damage',
    minDamage: 20,
    maxDamage: 25,
    range: 3,
    description: 'Gèle l\'ennemi',
    targetType: 'enemy'
  },
  9: { 
    name: 'Régénération', 
    paCost: 4, 
    type: 'heal',
    minHeal: 30,
    maxHeal: 40,
    range: 1,
    description: 'Régénère la santé',
    targetType: 'self'
  },
  10: { 
    name: 'Explosion', 
    paCost: 6, 
    type: 'damage',
    minDamage: 50,
    maxDamage: 60,
    range: 2,
    description: 'Explosion dévastatrice',
    targetType: 'enemy'
  },
  11: { 
    name: 'Météore', 
    paCost: 6, 
    type: 'damage',
    minDamage: 60,
    maxDamage: 80,
    range: 6,
    description: 'Météore dévastateur',
    targetType: 'enemy'
  },
  12: { 
    name: 'Protection', 
    paCost: 2, 
    type: 'buff',
    effect: 'defense',
    value: 10,
    range: 1,
    description: 'Augmente la défense',
    targetType: 'self'
  },
  13: { 
    name: 'Bénédiction', 
    paCost: 3, 
    type: 'heal',
    minHeal: 35,
    maxHeal: 45,
    range: 4,
    description: 'Soigne avec bénédiction',
    targetType: 'self'
  },
  14: { 
    name: 'Nova', 
    paCost: 5, 
    type: 'damage',
    minDamage: 40,
    maxDamage: 50,
    range: 3,
    description: 'Attaque en zone',
    targetType: 'enemy'
  },
  15: { 
    name: 'Résurrection', 
    paCost: 6, 
    type: 'heal',
    minHeal: 999,
    maxHeal: 999,
    range: 1,
    description: 'Restaure tous les PV',
    targetType: 'self'
  },
  16: { 
    name: 'Apocalypse', 
    paCost: 6, 
    type: 'damage',
    minDamage: 80,
    maxDamage: 100,
    range: 8,
    description: 'Sort ultime',
    targetType: 'enemy'
  }
} as const;

// ✅ NOUVEAU: État étendu du combat avec sort sélectionné
interface ExtendedCombatState extends CombatState {
  selectedSpell: {
    spellId: number;
    spell: any;
    caster: string;
  } | null;
}

export const useCombatDofus = () => {
  // ✅ État principal du combat avec sort sélectionné
  const [combatState, setCombatState] = useState<ExtendedCombatState>({
    phase: 'exploring',
    combatants: [],
    currentTurnCombatantId: null,
    placementZones: [],
    selectedCombatantId: null,
    turnNumber: 1,
    combatLog: [],
    originalMonster: null,
    selectedSpell: null // ✅ NOUVEAU: Sort actuellement sélectionné
  });

  /**
   * ✅ DÉCLENCHER LE COMBAT avec placement automatique de l'ennemi
   */
  const startCombat = useCallback((monster: Monster, playerPosition: Position) => {
    console.log(`⚔️ DÉBUT DU COMBAT STYLE DOFUS avec ${monster.name} !`);
    
    // Créer les zones de placement (4 cases par équipe)
    const playerZone: PlacementZone = {
      team: 'player',
      color: '#3B82F6', // Bleu
      name: 'Zone Joueur',
      positions: [
        { x: 6, y: 7 },   // Cases bleues pour le joueur
        { x: 7, y: 7 },
        { x: 6, y: 8 },
        { x: 7, y: 8 }
      ]
    };

    const enemyZone: PlacementZone = {
      team: 'enemy',
      color: '#EF4444', // Rouge
      name: 'Zone Ennemie', 
      positions: [
        { x: 9, y: 7 },   // Cases rouges pour les ennemis
        { x: 10, y: 7 },
        { x: 9, y: 8 },
        { x: 10, y: 8 }
      ]
    };

    // Choisir automatiquement une position pour l'ennemi
    const randomEnemyPosition = enemyZone.positions[Math.floor(Math.random() * enemyZone.positions.length)];

    // Créer le combattant joueur (pas encore placé)
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
      isReady: false, // Le joueur doit encore se placer
      pa: DOFUS_COMBAT_CONFIG.PLAYER_MAX_PA,
      maxPA: DOFUS_COMBAT_CONFIG.PLAYER_MAX_PA,
      pm: DOFUS_COMBAT_CONFIG.PLAYER_MAX_PM,
      maxPM: DOFUS_COMBAT_CONFIG.PLAYER_MAX_PM,
      attack: 25,
      defense: 15,
      speed: 10
    };

    // Créer le combattant monstre DÉJÀ PLACÉ et PRÊT
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
      isReady: true, // L'ennemi est automatiquement prêt
      pa: 4,
      maxPA: 4,
      pm: 2,
      maxPM: 2,
      attack: monster.attack,
      defense: monster.defense,
      speed: monster.speed
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
      selectedSpell: null // ✅ Pas de sort sélectionné au début
    });

    console.log(`🎯 ${monster.name} placé automatiquement en (${randomEnemyPosition.x}, ${randomEnemyPosition.y})`);
    console.log('🎯 Phase de placement activée - Choisissez votre case bleue !');
  }, []);

  /**
   * ✅ PLACER UN COMBATTANT sur une case de placement
   */
  const placeCombatant = useCallback((combatantId: string, newPosition: Position) => {
    setCombatState(prev => {
      const combatant = prev.combatants.find(c => c.id === combatantId);
      if (!combatant) {
        console.log(`❌ Combattant ${combatantId} introuvable`);
        return prev;
      }

      // Vérifier que la position est dans la zone de l'équipe
      const zone = prev.placementZones.find(z => z.team === combatant.team);
      if (!zone) {
        console.log(`❌ Zone de placement introuvable pour l'équipe ${combatant.team}`);
        return prev;
      }

      const isValidPosition = zone.positions.some(p => p.x === newPosition.x && p.y === newPosition.y);
      if (!isValidPosition) {
        console.log(`❌ Position (${newPosition.x}, ${newPosition.y}) invalide pour ${combatant.name}`);
        return prev;
      }

      // Vérifier que la case n'est pas occupée
      const isOccupied = prev.combatants.some(c => 
        c.id !== combatantId && 
        c.startPosition?.x === newPosition.x && 
        c.startPosition?.y === newPosition.y
      );
      
      if (isOccupied) {
        console.log(`❌ Case (${newPosition.x}, ${newPosition.y}) occupée !`);
        return prev;
      }

      console.log(`✅ ${combatant.name} placé en (${newPosition.x}, ${newPosition.y})`);

      const updatedCombatants = prev.combatants.map(c => 
        c.id === combatantId 
          ? { 
              ...c, 
              startPosition: newPosition, 
              position: newPosition, 
              isReady: true  // Auto-prêt après placement
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
   * ✅ MARQUER UN COMBATTANT COMME PRÊT (maintenu pour compatibilité)
   */
  const setCombatantReady = useCallback((combatantId: string) => {
    setCombatState(prev => {
      const combatant = prev.combatants.find(c => c.id === combatantId);
      if (!combatant || !combatant.startPosition) {
        console.log(`❌ ${combatant?.name || 'Combattant'} doit d'abord se placer !`);
        return prev;
      }

      const updatedCombatants = prev.combatants.map(c => 
        c.id === combatantId ? { ...c, isReady: true } : c
      );

      console.log(`✅ ${combatant.name} est prêt !`);

      return {
        ...prev,
        combatants: updatedCombatants,
        combatLog: [...prev.combatLog, {
          id: `ready-${Date.now()}`,
          turn: 1,
          actor: combatant.name,
          action: 'ready',
          description: `${combatant.name} est prêt pour le combat !`,
          timestamp: new Date()
        }]
      };
    });
  }, []);

  /**
   * ✅ VÉRIFIER SI TOUS LES COMBATTANTS SONT PRÊTS et commencer le combat
   */
  const checkStartFighting = useCallback(() => {
    setCombatState(prev => {
      // Vérifier si tous les combattants sont prêts
      const allReady = prev.combatants.every(c => c.isReady);
      
      if (allReady && prev.phase === 'placement') {
        console.log('🚀 TOUS LES COMBATTANTS SONT PRÊTS - DÉBUT DU COMBAT !');
        
        // Déterminer l'ordre des tours (par vitesse)
        const sortedCombatants = [...prev.combatants].sort((a, b) => b.speed - a.speed);
        const firstCombatant = sortedCombatants[0];

        console.log(`🎯 Premier tour : ${firstCombatant.name} (vitesse: ${firstCombatant.speed})`);

        return {
          ...prev,
          phase: 'fighting',
          currentTurnCombatantId: firstCombatant.id,
          selectedSpell: null, // ✅ Reset du sort sélectionné
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
  }, []);

  /**
   * ✅ DÉPLACER UN COMBATTANT (coûte des PM) - VERSION QUI MARCHE
   */
  const moveCombatant = useCallback((combatantId: string, newPosition: Position): ActionResult => {
    console.log(`🏃 === TENTATIVE DE DÉPLACEMENT ===`);
    console.log(`🧙 Combattant: ${combatantId}`);
    console.log(`📍 Vers: (${newPosition.x}, ${newPosition.y})`);

    // Obtenir l'état actuel du combat
    const currentCombatState = combatState;
    const combatant = currentCombatState.combatants.find(c => c.id === combatantId);
    
    if (!combatant) {
      console.log(`❌ Combattant ${combatantId} introuvable`);
      return { success: false, message: "Combattant introuvable", paCost: 0 };
    }

    console.log(`🎮 Combattant trouvé: ${combatant.name}`);
    console.log(`📊 PM actuels: ${combatant.pm}/${combatant.maxPM}`);
    console.log(`📍 Position actuelle: (${combatant.position.x}, ${combatant.position.y})`);

    if (currentCombatState.currentTurnCombatantId !== combatantId) {
      console.log(`❌ Ce n'est pas le tour de ${combatant.name}`);
      console.log(`🎯 Tour actuel: ${currentCombatState.currentTurnCombatantId}`);
      return { success: false, message: "Ce n'est pas votre tour", paCost: 0 };
    }

    // Calculer la distance et le coût
    const distance = Math.abs(newPosition.x - combatant.position.x) + 
                    Math.abs(newPosition.y - combatant.position.y);
    const pmCost = distance * DOFUS_COMBAT_CONFIG.MOVE_COST;

    console.log(`📏 Distance: ${distance} cases`);
    console.log(`💰 Coût PM: ${pmCost}`);

    if (pmCost > combatant.pm) {
      console.log(`❌ Pas assez de PM ! Requis: ${pmCost}, Disponibles: ${combatant.pm}`);
      return { 
        success: false, 
        message: `Pas assez de PM (${pmCost} requis, ${combatant.pm} disponibles)`, 
        paCost: 0 
      };
    }

    // Vérifier que la case n'est pas occupée
    const isOccupied = currentCombatState.combatants.some(c => 
      c.id !== combatantId && 
      c.position.x === newPosition.x && 
      c.position.y === newPosition.y
    );
    
    if (isOccupied) {
      console.log(`❌ Case (${newPosition.x}, ${newPosition.y}) occupée`);
      return { success: false, message: "Case occupée", paCost: 0 };
    }

    // ✅ EFFECTUER LE DÉPLACEMENT IMMÉDIATEMENT
    console.log(`✅ Déplacement validé ! ${combatant.name} se déplace`);
    
    setCombatState(prev => {
      const updatedCombatants = prev.combatants.map(c => 
        c.id === combatantId 
          ? { 
              ...c, 
              position: newPosition, 
              pm: c.pm - pmCost  // ✅ DÉCOMPTER LES PM
            }
          : c
      );

      console.log(`✅ Nouveaux PM: ${combatant.pm - pmCost}/${combatant.maxPM}`);

      return {
        ...prev,
        combatants: updatedCombatants,
        selectedSpell: null, // ✅ Annuler la sélection de sort après mouvement
        combatLog: [...prev.combatLog, {
          id: `move-${Date.now()}`,
          turn: prev.turnNumber,
          actor: combatant.name,
          action: 'move',
          description: `${combatant.name} se déplace vers (${newPosition.x}, ${newPosition.y}) [-${pmCost} PM]`,
          timestamp: new Date()
        }]
      };
    });

    return { 
      success: true, 
      message: `Déplacement réussi (-${pmCost} PM)`, 
      paCost: 0,
      pmCost: pmCost
    };
  }, [combatState]);

  /**
   * ✅ NOUVEAU: SÉLECTIONNER UN SORT (ne le lance pas encore)
   */
  const selectSpell = useCallback((combatantId: string, spellId: number): ActionResult => {
    console.log(`📜 === SÉLECTION DE SORT ===`);
    console.log(`🧙 Combattant: ${combatantId}`);
    console.log(`📜 Sort ID: ${spellId}`);

    const currentCombatState = combatState;
    const combatant = currentCombatState.combatants.find(c => c.id === combatantId);
    
    if (!combatant) {
      console.log(`❌ Combattant ${combatantId} introuvable`);
      return { success: false, message: "Combattant introuvable", paCost: 0 };
    }

    if (currentCombatState.currentTurnCombatantId !== combatantId) {
      console.log(`❌ Ce n'est pas le tour de ${combatant.name}`);
      return { success: false, message: "Ce n'est pas votre tour", paCost: 0 };
    }

    // ✅ RÉCUPÉRER LES DONNÉES DU SORT
    const spell = AVAILABLE_SPELLS[spellId as keyof typeof AVAILABLE_SPELLS];
    if (!spell) {
      console.log(`❌ Sort ${spellId} introuvable`);
      return { success: false, message: "Sort inconnu", paCost: 0 };
    }

    console.log(`📜 Sort trouvé: ${spell.name} (${spell.paCost} PA)`);
    console.log(`📊 PA actuels: ${combatant.pa}/${combatant.maxPA}`);

    if (spell.paCost > combatant.pa) {
      console.log(`❌ Pas assez de PA ! Requis: ${spell.paCost}, Disponibles: ${combatant.pa}`);
      return { 
        success: false, 
        message: `Pas assez de PA (${spell.paCost} requis, ${combatant.pa} disponibles)`, 
        paCost: 0 
      };
    }

    // ✅ VÉRIFIER SI LE SORT EST DÉJÀ SÉLECTIONNÉ
    if (currentCombatState.selectedSpell?.spellId === spellId) {
      console.log(`🔄 Désélection du sort ${spell.name}`);
      setCombatState(prev => ({
        ...prev,
        selectedSpell: null // Désélectionner le sort
      }));
      return { success: true, message: `Sort ${spell.name} désélectionné`, paCost: 0 };
    }

    // ✅ SÉLECTIONNER LE SORT
    console.log(`✅ Sort ${spell.name} sélectionné !`);
    setCombatState(prev => ({
      ...prev,
      selectedSpell: {
        spellId: spellId,
        spell: spell,
        caster: combatantId
      }
    }));

    return { 
      success: true, 
      message: `Sort ${spell.name} sélectionné ! Choisissez une cible.`, 
      paCost: 0 
    };
  }, [combatState]);

  /**
   * ✅ NOUVEAU: LANCER UN SORT SUR UNE CIBLE (après sélection)
   */
  const castSpellOnTarget = useCallback((targetPosition: Position): ActionResult => {
    console.log(`✨ === LANCEMENT DE SORT SUR CIBLE ===`);
    console.log(`🎯 Position cible: (${targetPosition.x}, ${targetPosition.y})`);

    const currentCombatState = combatState;

    // Vérifier qu'un sort est sélectionné
    if (!currentCombatState.selectedSpell) {
      console.log(`❌ Aucun sort sélectionné`);
      return { success: false, message: "Aucun sort sélectionné", paCost: 0 };
    }

    const { spell, caster } = currentCombatState.selectedSpell;
    const combatant = currentCombatState.combatants.find(c => c.id === caster);
    
    if (!combatant) {
      console.log(`❌ Lanceur introuvable`);
      return { success: false, message: "Lanceur introuvable", paCost: 0 };
    }

    // Vérifier la portée du sort
    const distance = Math.abs(targetPosition.x - combatant.position.x) + 
                    Math.abs(targetPosition.y - combatant.position.y);
    
    if (distance > spell.range) {
      console.log(`❌ Cible trop loin ! Distance: ${distance}, Portée: ${spell.range}`);
      return { 
        success: false, 
        message: `Cible trop loin (portée: ${spell.range}, distance: ${distance})`, 
        paCost: 0 
      };
    }

    // Trouver la cible à cette position
    const target = currentCombatState.combatants.find(c => 
      c.position.x === targetPosition.x && c.position.y === targetPosition.y && c.isAlive
    );

    // ✅ APPLIQUER L'EFFET DU SORT
    let effectResult = { success: true, message: '', damage: 0, heal: 0 };

    if (spell.type === 'damage') {
      if (!target) {
        console.log(`❌ Aucune cible à cette position`);
        return { success: false, message: "Aucune cible à cette position", paCost: 0 };
      }

      if (spell.targetType === 'enemy' && target.team === combatant.team) {
        console.log(`❌ Ne peut pas attaquer un allié`);
        return { success: false, message: "Ne peut pas attaquer un allié", paCost: 0 };
      }

      // Calculer les dégâts aléatoirement entre min et max
      const damage = Math.floor(Math.random() * (spell.maxDamage - spell.minDamage + 1)) + spell.minDamage;
      console.log(`⚔️ Dégâts calculés: ${damage}`);

      setCombatState(prev => {
        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === caster) {
            return { ...c, pa: c.pa - spell.paCost }; // Décompter les PA
          }
          if (c.id === target.id) {
            const newHealth = Math.max(0, c.health - damage);
            return { ...c, health: newHealth, isAlive: newHealth > 0 };
          }
          return c;
        });

        return {
          ...prev,
          combatants: updatedCombatants,
          selectedSpell: null, // ✅ Désélectionner le sort après utilisation
          combatLog: [...prev.combatLog, {
            id: `spell-damage-${Date.now()}`,
            turn: prev.turnNumber,
            actor: combatant.name,
            action: 'spell',
            description: `${combatant.name} lance ${spell.name} sur ${target.name} ! ${damage} dégâts [-${spell.paCost} PA]`,
            timestamp: new Date()
          }]
        };
      });

      effectResult = {
        success: true,
        message: `${spell.name} inflige ${damage} dégâts à ${target.name} !`,
        damage: damage,
        heal: 0
      };

    } else if (spell.type === 'heal') {
      // Sort de soin - peut cibler soi-même ou la position cliquée
      let healTarget = target || combatant; // Si pas de cible, se soigner soi-même

      if (spell.targetType === 'self' && target && target.team !== combatant.team) {
        console.log(`❌ Ne peut pas soigner un ennemi`);
        return { success: false, message: "Ne peut pas soigner un ennemi", paCost: 0 };
      }

      const healAmount = Math.floor(Math.random() * (spell.maxHeal - spell.minHeal + 1)) + spell.minHeal;
      console.log(`💚 Soins calculés: ${healAmount}`);

      setCombatState(prev => {
        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === caster) {
            // Si on se soigne soi-même
            if (!target || c.id === healTarget.id) {
              const newHealth = Math.min(c.maxHealth, c.health + healAmount);
              return { 
                ...c, 
                pa: c.pa - spell.paCost, // Décompter les PA
                health: newHealth 
              };
            } else {
              return { ...c, pa: c.pa - spell.paCost }; // Juste décompter les PA
            }
          }
          if (target && c.id === healTarget.id && c.id !== caster) {
            const newHealth = Math.min(c.maxHealth, c.health + healAmount);
            return { ...c, health: newHealth };
          }
          return c;
        });

        return {
          ...prev,
          combatants: updatedCombatants,
          selectedSpell: null, // ✅ Désélectionner le sort après utilisation
          combatLog: [...prev.combatLog, {
            id: `spell-heal-${Date.now()}`,
            turn: prev.turnNumber,
            actor: combatant.name,
            action: 'spell',
            description: `${combatant.name} lance ${spell.name} et ${healTarget.name} récupère ${healAmount} PV [-${spell.paCost} PA]`,
            timestamp: new Date()
          }]
        };
      });

      effectResult = {
        success: true,
        message: `${spell.name} soigne ${healTarget.name} de ${healAmount} PV !`,
        damage: 0,
        heal: healAmount
      };

    } else if (spell.type === 'buff') {
      // Sort de buff - améliorer les stats
      console.log(`🛡️ Buff appliqué: ${spell.effect} +${spell.value}`);

      setCombatState(prev => {
        const updatedCombatants = prev.combatants.map(c => {
          if (c.id === caster) {
            return { 
              ...c, 
              pa: c.pa - spell.paCost, // Décompter les PA
              defense: c.defense + (spell.value || 0) // Améliorer la défense
            };
          }
          return c;
        });

        return {
          ...prev,
          combatants: updatedCombatants,
          selectedSpell: null, // ✅ Désélectionner le sort après utilisation
          combatLog: [...prev.combatLog, {
            id: `spell-buff-${Date.now()}`,
            turn: prev.turnNumber,
            actor: combatant.name,
            action: 'spell',
            description: `${combatant.name} lance ${spell.name} et améliore sa défense de ${spell.value} [-${spell.paCost} PA]`,
            timestamp: new Date()
          }]
        };
      });

      effectResult = {
        success: true,
        message: `${spell.name} améliore votre défense de ${spell.value} !`,
        damage: 0,
        heal: 0
      };
    }

    console.log(`✅ Sort lancé avec succès: ${effectResult.message}`);

    return { 
      success: true, 
      message: effectResult.message,
      damage: effectResult.damage,
      heal: effectResult.heal,
      paCost: spell.paCost 
    };
  }, [combatState]);

  /**
   * ✅ ANCIEN: Maintenu pour compatibilité (utilise maintenant selectSpell)
   */
  const castSpell = useCallback((combatantId: string, spellId: number, providedSpellCost?: number): ActionResult => {
    // Rediriger vers la fonction de sélection
    return selectSpell(combatantId, spellId);
  }, [selectSpell]);

  /**
   * ✅ PASSER AU COMBATTANT SUIVANT
   */
  const nextTurn = useCallback(() => {
    setCombatState(prev => {
      if (prev.phase !== 'fighting') return prev;

      const aliveCombatants = prev.combatants.filter(c => c.isAlive);
      const currentIndex = aliveCombatants.findIndex(c => c.id === prev.currentTurnCombatantId);
      const nextIndex = (currentIndex + 1) % aliveCombatants.length;
      const nextCombatant = aliveCombatants[nextIndex];

      // Si on revient au premier combattant, nouveau tour
      const newTurnNumber = nextIndex === 0 ? prev.turnNumber + 1 : prev.turnNumber;

      // Recharger les PA/PM si c'est un nouveau tour complet
      const updatedCombatants = prev.combatants.map(c => {
        if (!c.isAlive) return c;
        
        if (nextIndex === 0) {
          // Nouveau tour complet - recharger PA/PM
          return {
            ...c,
            pa: c.maxPA,
            pm: c.maxPM
          };
        }
        return c;
      });

      console.log(`🔄 Tour suivant: ${nextCombatant.name}`);
      if (newTurnNumber > prev.turnNumber) {
        console.log(`🔄 NOUVEAU TOUR ${newTurnNumber} - PA/PM rechargés pour tous !`);
      }

      return {
        ...prev,
        currentTurnCombatantId: nextCombatant.id,
        turnNumber: newTurnNumber,
        combatants: updatedCombatants,
        selectedSpell: null, // ✅ Reset du sort sélectionné
        combatLog: [...prev.combatLog, {
          id: `next-turn-${Date.now()}`,
          turn: newTurnNumber,
          actor: 'Système',
          action: 'next-turn',
          description: `C'est au tour de ${nextCombatant.name} ${newTurnNumber > prev.turnNumber ? '(Nouveau tour !)' : ''}`,
          timestamp: new Date()
        }]
      };
    });
  }, []);

  /**
   * ✅ TERMINER LE COMBAT
   */
  const endCombat = useCallback((reason: 'victory' | 'defeat' | 'flee') => {
    console.log(`🏁 Combat terminé : ${reason}`);
    
    setCombatState(prev => {
      const endLog: CombatLogEntry = {
        id: `combat-end-${Date.now()}`,
        turn: prev.turnNumber,
        actor: 'Système',
        action: 'combat-end',
        description: reason === 'victory' ? 'Victoire !' : 
                     reason === 'defeat' ? 'Défaite...' : 
                     'Combat annulé',
        timestamp: new Date()
      };

      return {
        ...prev,
        phase: reason === 'victory' ? 'victory' : reason === 'defeat' ? 'defeat' : 'exploring',
        selectedSpell: null, // ✅ Reset du sort sélectionné
        combatLog: [...prev.combatLog, endLog]
      };
    });
  }, []);

  /**
   * ✅ RETOURNER EN MODE EXPLORATION
   */
  const exitCombat = useCallback(() => {
    console.log('🚪 Sortie du combat - Retour en exploration');
    setCombatState({
      phase: 'exploring',
      combatants: [],
      currentTurnCombatantId: null,
      placementZones: [],
      selectedCombatantId: null,
      turnNumber: 1,
      combatLog: [],
      originalMonster: null,
      selectedSpell: null // ✅ Reset du sort sélectionné
    });
  }, []);

  /**
   * ✅ VÉRIFIER AUTOMATIQUEMENT les conditions de victoire/défaite
   */
  useEffect(() => {
    if (combatState.phase !== 'fighting') return;

    const playerAlive = combatState.combatants.some(c => c.team === 'player' && c.isAlive);
    const enemyAlive = combatState.combatants.some(c => c.team === 'enemy' && c.isAlive);

    if (!playerAlive) {
      console.log('💀 Joueur mort - Défaite');
      setTimeout(() => endCombat('defeat'), 1000);
    } else if (!enemyAlive) {
      console.log('🏆 Ennemis morts - Victoire');
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

  return {
    // État du combat
    combatState,
    
    // Actions principales
    startCombat,
    exitCombat,
    endCombat,
    
    // Phase de placement
    placeCombatant,
    setCombatantReady,
    
    // Phase de combat
    moveCombatant,
    castSpell, // ✅ Fonction de sélection de sorts
    selectSpell, // ✅ NOUVEAU: Sélectionner un sort
    castSpellOnTarget, // ✅ NOUVEAU: Lancer un sort sur une cible
    nextTurn,
    
    // Configuration
    DOFUS_COMBAT_CONFIG,
    AVAILABLE_SPELLS // ✅ NOUVEAU: Exporter les sorts disponibles
  };
};