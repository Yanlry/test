/**
 * CONSTANTES ET CONFIGURATION DU JEU
 * Pour modifier les dimensions, zones spéciales et configurations, c'est ici
 */

import { Position, EquippedItem, InventoryItem } from '../types/game';

// ===== DIMENSIONS DE LA CARTE =====
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;
export const TOTAL_TILES = MAP_WIDTH * MAP_HEIGHT; // 1200 tuiles

// ===== VITESSE DE DÉPLACEMENT =====
export const MOVEMENT_SPEED = 200; // ms entre chaque case

// ===== POSITIONS DE DÉPART =====
export const DEFAULT_START_POSITION: Position = { x: 21, y: 27 };

// ===== PORTAILS DE TÉLÉPORTATION =====
export const TELEPORT_POSITIONS = {
  WORLD_TO_NEW: { x: 32, y: 1 },
  NEW_TO_WORLD: { x: 18, y: 29 },
  WORLD_SPAWN_FROM_NEW: { x: 32, y: 2 },
  NEW_SPAWN_FROM_WORLD: { x: 18, y: 28 }
};

// ===== FONCTION DE DÉTECTION DES ZONES D'EAU =====
/**
 * Vérifie si une case est dans une zone d'eau (non praticable)
 * @param x Coordonnée X
 * @param y Coordonnée Y
 * @returns true si la case est dans l'eau
 */
export const isInWaterZone = (x: number, y: number): boolean => {
  // Exception : La case (14, 16) reste accessible
  if (x === 14 && y === 16) {
    return false;
  }
  
  // Exceptions : Cases du Nord accessibles
  if ((y === 9 && x >= 30 && x <= 34) || 
      (y === 10 && x >= 28 && x <= 32)) {
    return false;
  }
  
  // Exceptions : Cases du côté gauche accessibles  
  if ((y === 16 && x === 15) ||
      (y === 17 && x >= 18 && x <= 20) ||
      (y === 18 && x >= 20 && x <= 21) ||
      (y === 19 && x === 22) ||
      (y === 23 && x === 25)) {
    return false;
  }
  
  // ===== ZONE D'EAU CÔTÉ GAUCHE =====
  // Ligne par ligne, bloquer les cases à gauche du tracé de côte
  
  if (y === 0 && x >= 0 && x <= 27) return true;
  if (y === 1 && x >= 0 && x <= 27) return true;
  if (y === 2 && x >= 0 && x <= 25) return true;
  if (y === 3 && x >= 0 && x <= 16) return true;
  if (y === 4 && x >= 0 && x <= 16) return true;
  if (y === 5 && x >= 0 && x <= 8) return true;
  if (y === 6 && x >= 0 && x <= 7) return true;
  if (y === 7 && x >= 0 && x <= 6) return true;
  if (y === 8 && x >= 0 && x <= 6) return true;
  if (y === 9 && x >= 0 && x <= 5) return true;
  if (y === 10 && x >= 0 && x <= 5) return true;
  if (y === 11 && x >= 0 && x <= 5) return true;
  if (y === 12 && x >= 0 && x <= 5) return true;
  if (y === 13 && x >= 0 && x <= 5) return true;
  if (y === 14 && x >= 0 && x <= 6) return true;
  if (y === 15 && x >= 0 && x <= 7) return true;
  if (y === 16 && x >= 0 && x <= 8) return true;
  if (y === 17 && x >= 0 && x <= 8) return true;
  if (y === 18 && x >= 0 && x <= 9) return true;
  if (y === 19 && x >= 0 && x <= 13) return true;
  if (y === 20 && x >= 0 && x <= 13) return true;
  if (y === 21 && x >= 0 && x <= 13) return true;
  if (y === 22 && x >= 0 && x <= 13) return true;
  if (y === 23 && x >= 0 && x <= 14) return true;
  if (y === 24 && x >= 0 && x <= 14) return true;
  if (y === 25 && x >= 0 && x <= 15) return true;
  if (y === 26 && x >= 0 && x <= 15) return true;
  if (y === 27 && x >= 0 && x <= 15) return true;
  if (y === 28 && x >= 0 && x <= 15) return true;
  if (y === 29 && x >= 0 && x <= 15) return true;
  
  // ===== ZONE D'EAU CÔTÉ DROIT =====
  
  if (y === 9 && x >= 35 && x <= 39) return true;
  if (y === 10 && x >= 33 && x <= 39) return true;
  if (y === 11 && x >= 26 && x <= 39) return true;
  if (y === 12 && x >= 22 && x <= 39) return true;
  if (y === 13 && x >= 16 && x <= 39) return true;
  if (y === 14 && x >= 15 && x <= 39) return true;
  if (y === 15 && x >= 15 && x <= 39) return true;
  if (y === 16 && x >= 16 && x <= 39) return true;
  if (y === 17 && x >= 21 && x <= 39) return true;
  if (y === 18 && x >= 22 && x <= 39) return true;
  if (y === 19 && x >= 23 && x <= 39) return true;
  if (y === 20 && x >= 24 && x <= 39) return true;
  if (y === 21 && x >= 24 && x <= 39) return true;
  if (y === 22 && x >= 25 && x <= 39) return true;
  if (y === 23 && x >= 26 && x <= 39) return true;
  if (y === 24 && x >= 25 && x <= 39) return true;
  if (y === 25 && x >= 26 && x <= 39) return true;
  if (y === 26 && x >= 26 && x <= 39) return true;
  if (y === 27 && x >= 27 && x <= 39) return true;
  if (y === 28 && x >= 27 && x <= 39) return true;
  if (y === 29 && x >= 27 && x <= 39) return true;
  
  return false;
};

// ===== ÉQUIPEMENTS PAR DÉFAUT =====
export const DEFAULT_EQUIPPED_ITEMS: Record<string, EquippedItem | null> = {
  helmet: { icon: '⛑️', name: 'Casque en fer' },
  weapon: { icon: '🗡️', name: 'Dague en fer' },
  chest: { icon: '🛡️', name: 'Armure de cuir' },
  gloves: { icon: '🧤', name: 'Gants de cuir' },
  boots: { icon: '🥾', name: 'Bottes de voyage' },
  ring1: null,
  ring2: null,
  necklace: null,
};

// ===== INVENTAIRE PAR DÉFAUT =====
export const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  // ÉQUIPEMENTS DISPONIBLES
  { id: 1, name: 'Casque en acier', icon: '⛑️', quantity: 1, type: 'equipement', equipSlot: 'helmet' },
  { id: 2, name: 'Épée longue', icon: '⚔️', quantity: 1, type: 'equipement', equipSlot: 'weapon' },
  { id: 3, name: 'Anneau de force', icon: '💍', quantity: 1, type: 'equipement', equipSlot: 'ring' },
  { id: 4, name: 'Collier magique', icon: '📿', quantity: 1, type: 'equipement', equipSlot: 'necklace' },
  
  // CONSOMMABLES
  { id: 5, name: 'Potion de vie', icon: '🧪', quantity: 5, type: 'consommable' },
  { id: 6, name: 'Potion de mana', icon: '💙', quantity: 3, type: 'consommable' },
  { id: 7, name: 'Pain', icon: '🍞', quantity: 8, type: 'consommable' },
  { id: 8, name: 'Antidote', icon: '💚', quantity: 2, type: 'consommable' },
  { id: 9, name: 'Parchemin de téléportation', icon: '📜', quantity: 1, type: 'consommable' },
  
  // RESSOURCES
  { id: 10, name: 'Or', icon: '🪙', quantity: 250, type: 'ressource' },
  { id: 11, name: 'Fer', icon: '🔩', quantity: 15, type: 'ressource' },
  { id: 12, name: 'Bois', icon: '🪵', quantity: 23, type: 'ressource' },
  { id: 13, name: 'Pierre', icon: '🪨', quantity: 12, type: 'ressource' },
  { id: 14, name: 'Clé rouillée', icon: '🗝️', quantity: 1, type: 'ressource' },
  { id: 15, name: 'Gemme rouge', icon: '💎', quantity: 3, type: 'ressource' },
];

// ===== SORTS DE BASE =====
export const DEFAULT_SPELLS = [
  { id: 1, name: 'Coup de Dague', icon: '🗡️', manaCost: 10, cooldown: 0 },
  { id: 2, name: 'Furtivité', icon: '👤', manaCost: 20, cooldown: 0 },
  { id: 3, name: 'Poison', icon: '☠️', manaCost: 15, cooldown: 0 },
  { id: 4, name: 'Téléportation', icon: '✨', manaCost: 50, cooldown: 0 },
];

// ===== STATS INITIALES =====
export const DEFAULT_PLAYER_STATS = {
  vitality: 16,
  wisdom: 0,
  strength: 0,
  agility: 0,
  chance: 0,
  intelligence: 0,
};

export const DEFAULT_AVAILABLE_POINTS = 75;