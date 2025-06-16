// Types de base pour le jeu
export interface User {
    id: string;
    username: string;
    email: string;
    level: number;
    characterClass: string;
    createdAt: Date;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface RegisterData extends LoginCredentials {
    email: string;
    confirmPassword: string;
  }
  
  export interface Character {
    id: string;
    name: string;
    class: CharacterClass;
    level: number;
    stats: CharacterStats;
    equipment: Equipment;
  }
  
  export interface CharacterStats {
    health: number;
    mana: number;
    strength: number;
    agility: number;
    intelligence: number;
  }
  
  export type CharacterClass = 'Guerrier' | 'Mage' | 'Archer' | 'Voleur' | 'Prêtre';
  
  export interface Equipment {
    weapon?: Item;
    armor?: Item;
    helmet?: Item;
    boots?: Item;
  }
  
  export interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    stats: Partial<CharacterStats>;
  }
  
  export type ItemType = 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory';
  export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';