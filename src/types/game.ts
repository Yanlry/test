/**
 * TYPES DU JEU - Toutes les interfaces TypeScript
 * Pour modifier les structures de données du jeu, c'est ici
 */

// ===== TYPES D'AUTHENTIFICATION =====
export interface User {
 id: string;
 username: string;
 email: string;
 level: number;
 characterClass: string;
}

export interface LoginCredentials {
 username: string;
 password: string;
}

export interface RegisterData extends LoginCredentials {
 email: string;
 confirmPassword: string;
}

// ===== TYPES DE PERSONNAGE =====
export interface Character {
 id: string;
 name: string;
 class: CharacterClass;
 appearance: CharacterAppearance;
 level: number;
}

export interface CharacterAppearance {
 hairColor: string;
 eyeColor: string;
 skinTone: string;
 gender: 'male' | 'female';
}

export interface CharacterClass {
 id: string;
 name: string;
 description: string;
 icon: string;
 avatar: string;
 color: string;
 element: string;
 spells: ClassSpell[];
}

export interface ClassSpell {
 id: string;
 name: string;
 description: string;
 icon: string;
 unlockedAt: number;
 type: 'offensive' | 'defensive' | 'utility' | 'ultimate';
 damage?: string;
 effect?: string;
 cooldown?: string;
 range?: string;
}

// ===== TYPES DE GAMEPLAY =====
export interface Position {
 x: number;
 y: number;
}

export interface PlayerStats {
 vitality: number;
 wisdom: number;
 strength: number;
 agility: number;
 chance: number;
 intelligence: number;
}

export interface InventoryItem {
 id: number;
 name: string;
 icon: string;
 quantity: number;
 type: 'equipement' | 'consommable' | 'ressource';
 equipSlot?: string;
}

export interface EquippedItem {
 icon: string;
 name: string;
}

export interface PathNode {
 x: number;
 y: number;
 g: number;
 h: number;
 f: number;
 parent: PathNode | null;
}

// ===== TYPES D'ÉTAT DE L'APPLICATION =====
export type GamePhase = 'login' | 'character-creation' | 'game';
export type MapType = 'world' | 'new';
export type InventoryTab = 'equipement' | 'consommable' | 'ressource';