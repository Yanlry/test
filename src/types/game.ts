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
  
  // ===== TYPES DE HÉROS ET CONFRÉRIES ===== 
  // ✅ AJOUTÉ : Types pour vos nouveaux héros
  export type CharacterClassId = 
    // Confrérie du Sang Ancien
    | 'sombrelame' 
    | 'audauv' 
    | 'mairym'
    // Confrérie du Cycle Éternel  
    | 'otevel'
    | 'nasel'
    | 'alleen'
    // Confrérie du Serment Brisé
    | 'falkrem'
    | 'idadhgable'
    | 'lamat';
  
  // ✅ AJOUTÉ : Type pour les confréries
  export type Brotherhood = 
    | '🩸 CONFRÉRIE DU SANG ANCIEN'
    | '🌿 CONFRÉRIE DU CYCLE ÉTERNEL' 
    | '⚔️ CONFRÉRIE DU SERMENT BRISÉ';
  
  // ===== TYPES DE PERSONNAGE =====
  export interface Character {
    id: string;
    name: string;
    class: CharacterClassData; // ✅ MODIFIÉ : Utilise CharacterClassData
    appearance: CharacterAppearance;
    level: number;
  }
  
  export interface CharacterAppearance {
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    gender: 'male' | 'female';
  }
  
  // ✅ MODIFIÉ : Renommé et ajouté brotherhood
  export interface CharacterClassData {
    id: CharacterClassId; // ✅ MODIFIÉ : Utilise CharacterClassId
    name: string;
    description: string;
    icon: string;
    avatar: string;
    color: string;
    element: string;
    brotherhood: Brotherhood; // ✅ AJOUTÉ : Champ confrérie
    spells: ClassSpell[];
  }
  
  export interface ClassSpell {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: number;
    type: 'offensive' | 'defensive' | 'utility' | 'ultimate'  | 'healing';
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
  
  // ===== TYPES POUR LA COMPATIBILITÉ ===== 
  // ✅ AJOUTÉ : Alias pour maintenir la compatibilité
  export type CharacterClass = CharacterClassData; // Pour l'ancien code qui utilise encore CharacterClass