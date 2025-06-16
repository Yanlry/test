/**
 * HOOK DE CRÉATION DE PERSONNAGE
 * Pour modifier la logique de sélection de classe et création, c'est ici
 */

import { useState, useCallback } from 'react';
import { Character, CharacterClass, CharacterAppearance, ClassSpell } from '../types/game';

export const useCharacterCreation = () => {
  // États pour la création de personnage
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [characterName, setCharacterName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<ClassSpell | null>(null);
  
  // État pour l'apparence du personnage
  const [characterAppearance, setCharacterAppearance] = useState<CharacterAppearance>({
    hairColor: '#8B4513',
    eyeColor: '#4169E1',
    skinTone: '#FDBCB4',
    gender: 'male'
  });

  // Fonction pour sélectionner une classe
  const handleClassSelection = useCallback((characterClass: CharacterClass) => {
    setSelectedClass(characterClass);
    setSelectedSpell(null); // Reset le sort sélectionné
    console.log('Classe sélectionnée:', characterClass.name);
  }, []);

  // Fonction pour sélectionner un sort
  const handleSpellSelection = useCallback((spell: ClassSpell) => {
    setSelectedSpell(spell);
    console.log('Sort sélectionné:', spell.name);
  }, []);

  // Fonction pour changer l'apparence
  const updateAppearance = useCallback((updates: Partial<CharacterAppearance>) => {
    setCharacterAppearance(prev => ({ ...prev, ...updates }));
  }, []);

  // Fonction pour valider et créer le personnage
  const handleCharacterCreation = useCallback(() => {
    // Validation
    if (!selectedClass) {
      const error = 'Veuillez sélectionner une classe pour votre personnage';
      console.error(error);
      return { success: false, error };
    }
    
    if (!characterName.trim()) {
      const error = 'Veuillez choisir un nom pour votre personnage';
      console.error(error);
      return { success: false, error };
    }

    if (characterName.trim().length < 2) {
      const error = 'Le nom doit faire au moins 2 caractères';
      console.error(error);
      return { success: false, error };
    }

    if (characterName.trim().length > 20) {
      const error = 'Le nom ne peut pas dépasser 20 caractères';
      console.error(error);
      return { success: false, error };
    }

    // Création du personnage
    const newCharacter: Character = {
      id: Math.random().toString(36).substr(2, 9),
      name: characterName.trim(),
      class: selectedClass,
      appearance: characterAppearance,
      level: 1
    };

    setCurrentCharacter(newCharacter);
    console.log('🎮 Personnage créé:', newCharacter);
    return { success: true, character: newCharacter };
  }, [selectedClass, characterName, characterAppearance]);

  // Fonction pour obtenir les sorts débloqués au niveau 1
  const getUnlockedSpells = useCallback((classData: CharacterClass | null, level: number = 6) => {
    if (!classData) return [];
    return classData.spells.filter(spell => spell.unlockedAt <= level);
  }, []);

  // Fonction pour obtenir les statistiques de progression d'une classe
  const getClassProgression = useCallback((classData: CharacterClass | null) => {
    if (!classData) return null;
    
    const spells = classData.spells;
    return {
      totalSpells: spells.length,
      earlySpells: spells.filter(s => s.unlockedAt <= 6).length,
      offensiveSpells: spells.filter(s => s.type === 'offensive').length,
      defensiveSpells: spells.filter(s => s.type === 'defensive').length,
      utilitySpells: spells.filter(s => s.type === 'utility').length,
      ultimateSpells: spells.filter(s => s.type === 'ultimate').length,
    };
  }, []);

  // Fonction pour réinitialiser la création
  const resetCharacterCreation = useCallback(() => {
    setCurrentCharacter(null);
    setCharacterName('');
    setSelectedClass(null);
    setSelectedSpell(null);
    setCharacterAppearance({
      hairColor: '#8B4513',
      eyeColor: '#4169E1',
      skinTone: '#FDBCB4',
      gender: 'male'
    });
  }, []);

  // Fonction pour vérifier si la création est complète
  const isCreationValid = useCallback(() => {
    return selectedClass !== null && characterName.trim().length >= 2;
  }, [selectedClass, characterName]);

  return {
    // États
    currentCharacter,
    characterName,
    selectedClass,
    selectedSpell,
    characterAppearance,
    
    // Actions
    handleClassSelection,
    handleSpellSelection,
    handleCharacterCreation,
    updateAppearance,
    resetCharacterCreation,
    
    // Setters
    setCharacterName,
    setCurrentCharacter,
    
    // Utilitaires
    getUnlockedSpells,
    getClassProgression,
    isCreationValid
  };
};