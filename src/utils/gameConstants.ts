/**
 * CONSTANTES ET CONFIGURATION DU JEU - VRAIES DIMENSIONS TILED
 * ✅ CORRIGÉ: Utilise les vraies dimensions de ta map Tiled (256x128)
 */

import { Position, EquippedItem, InventoryItem } from '../types/game';

// ===== DIMENSIONS DE LA CARTE TILED =====
export const MAP_WIDTH = 16;  // Ta map 16x16
export const MAP_HEIGHT = 16;
export const TOTAL_TILES = MAP_WIDTH * MAP_HEIGHT; // 256 tuiles

// ===== VRAIES DIMENSIONS DES TILES TILED =====
// ✅ CORRIGÉ: Utilise les dimensions EXACTES de ta map Tiled
export const TILE_WIDTH = 256;   // Ta vraie largeur de tile
export const TILE_HEIGHT = 128;  // Ta vraie hauteur de tile

// ===== VITESSE DE DÉPLACEMENT =====
export const MOVEMENT_SPEED = 200; // ms entre chaque case

// ===== POSITIONS DE DÉPART (adaptées à 16x16) =====
export const DEFAULT_START_POSITION: Position = { x: 8, y: 7 }; // Centre de la map

// ===== PORTAILS DE TÉLÉPORTATION (adaptés à 16x16) =====
export const TELEPORT_POSITIONS = {
  WORLD_TO_NEW: { x: 15, y: 1 },
  NEW_TO_WORLD: { x: 8, y: 15 },
  WORLD_SPAWN_FROM_NEW: { x: 15, y: 2 },
  NEW_SPAWN_FROM_WORLD: { x: 8, y: 14 }
};

// ===== FONCTION DE DÉTECTION DES ZONES D'EAU (simplifiée pour 16x16) =====
/**
 * Vérifie si une case est dans une zone d'eau (non praticable)
 * @param x Coordonnée X
 * @param y Coordonnée Y
 * @returns true si la case est dans l'eau
 */
export const isInWaterZone = (x: number, y: number): boolean => {
  // Pour le moment, pas de zones d'eau sur ta map 16x16
  // Tu pourras ajouter des zones spécifiques plus tard
  
  // Exemple : bordures comme zones d'eau
  if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
    return false; // Les bordures sont praticables pour le moment
  }
  
  return false; // Toutes les cases sont praticables pour commencer
};

// ===== COLLISION BASÉE SUR LES TILES =====
/**
 * Vérifie si une tile est un obstacle (pour ton système de collision)
 * @param tileId ID de la tile à vérifier
 * @returns true si la tile bloque le passage
 */
// export const isTileBlocked = (tileId: number): boolean => {
//   // IDs des tiles qui bloquent le passage (à adapter selon tes tiles)
//   const blockedTiles = [
//     // Exemple : props qui bloquent le passage
//     // Tu ajouteras ici les IDs de tes murs, arbres, rochers, etc.
//   ];
  
//   return blockedTiles.includes(tileId);
// };

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