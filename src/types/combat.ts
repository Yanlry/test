/**
 * TYPES POUR LE SYSTÈME DE COMBAT STYLE DOFUS
 * Avec phase de placement tactique et combat tour par tour
 */

import { Position } from './game';

// Types pour le monstre
export interface Monster {
  id: string;
  name: string;
  position: Position;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  icon: string;
  color: string;
  isAlive: boolean;
  
  // Statistiques de combat
  attack: number;
  defense: number;
  speed: number;
  
  // IA du monstre
  movementPattern: 'random' | 'patrol' | 'aggressive';
  lastMoveTime: number;
  moveInterval: number; // en millisecondes
}

// ✅ NOUVEAU: Phases du combat style Dofus
export type CombatPhase = 
  | 'exploring'     // Exploration normale
  | 'placement'     // Phase de placement tactique  
  | 'fighting'      // Combat en cours
  | 'victory'       // Victoire
  | 'defeat';       // Défaite

// ✅ NOUVEAU: Équipes de combat
export type CombatTeam = 'player' | 'enemy';

// ✅ NOUVEAU: Zone de placement tactique
export interface PlacementZone {
  team: CombatTeam;
  positions: Position[];
  color: string;
  name: string;
}

// ✅ NOUVEAU: Combattant (joueur ou monstre)
export interface Combatant {
  id: string;
  name: string;
  team: CombatTeam;
  position: Position;
  startPosition?: Position; // Position choisie pendant le placement
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  icon: string;
  color: string;
  isAlive: boolean;
  isReady: boolean; // Prêt pour le combat ?
  
  // Stats de combat
  pa: number;      // Points d'Action actuels
  maxPA: number;   // PA maximum par tour
  pm: number;      // Points de Mouvement actuels  
  maxPM: number;   // PM maximum par tour
  attack: number;
  defense: number;
  speed: number;
}

// État principal du combat style Dofus
export interface CombatState {
  // Phase actuelle
  phase: CombatPhase;
  
  // Combattants
  combatants: Combatant[];
  currentTurnCombatantId: string | null;
  
  // Phase de placement
  placementZones: PlacementZone[];
  selectedCombatantId: string | null; // Combattant qu'on place
  
  // Combat
  turnNumber: number;
  combatLog: CombatLogEntry[];
  
  // Monstre original qui a déclenché le combat
  originalMonster: Monster | null;
  selectedSpell: {
    spellId: number;
    spell: any;
    caster: string;
  } | null;
}

// Types pour le log de combat
export interface CombatLogEntry {
  id: string;
  turn: number;
  actor: string; // Nom du combattant
  action: string;
  description: string;
  timestamp: Date;
}

// Types pour les actions de combat
export type CombatAction = 
  | 'move'      // Se déplacer (coûte PM)
  | 'attack'    // Attaque de base (coûte PA)
  | 'spell'     // Lancer un sort (coût variable)
  | 'wait'      // Passer son tour
  | 'flee';     // Fuir le combat

// Types pour les résultats d'action
export interface ActionResult {
  success: boolean;
  damage?: number;
  heal?: number;
  effects?: string[];
  message: string;
  paCost: number;
  pmCost?: number;
}

// Types pour la grille de combat tactique
export interface CombatTile {
  x: number;
  y: number;
  type: 'normal' | 'placement-player' | 'placement-enemy' | 'blocked';
  isPlayerReachable: boolean; // Peut-on s'y déplacer avec les PM restants ?
  isInRange: boolean; // Dans la portée d'un sort sélectionné ?
  distanceFromPlayer: number;
  isOccupied: boolean; // Y a-t-il un combattant dessus ?
  occupiedBy?: string; // ID du combattant qui occupe la case
}