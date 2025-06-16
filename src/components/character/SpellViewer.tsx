/**
 * COMPOSANT D'AFFICHAGE DES SORTS ET PERSONNALISATION
 * Pour modifier l'apparence du panneau de détails des sorts (droite), c'est ici
 */

import React from 'react';
import { CharacterClass, ClassSpell, CharacterAppearance } from '../../types/game';

interface SpellViewerProps {
  selectedClass: CharacterClass | null;
  selectedSpell: ClassSpell | null;
  characterAppearance: CharacterAppearance;
  onAppearanceChange: (appearance: Partial<CharacterAppearance>) => void;
  onCreateCharacter: () => void;
  isCreationValid: () => boolean;
  characterName: string;
}

const SpellViewer: React.FC<SpellViewerProps> = ({
  selectedClass,
  selectedSpell,
  characterAppearance,
  onAppearanceChange,
  onCreateCharacter,
  isCreationValid,
  characterName
}) => {
  // Couleurs prédéfinies pour les cheveux
  const hairColors = ['#8B4513', '#FFC0CB', '#FFD700', '#000000', '#FFFFFF'];

  if (!selectedClass) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">📜</div>
          <p className="text-sm">Sélectionnez une classe pour voir sa progression de sorts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Détails du sort sélectionné */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
        {selectedSpell ? (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-4xl">{selectedSpell.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedSpell.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded ${
                    selectedSpell.type === 'offensive' ? 'bg-red-600/20 text-red-400' :
                    selectedSpell.type === 'defensive' ? 'bg-blue-600/20 text-blue-400' :
                    selectedSpell.type === 'utility' ? 'bg-green-600/20 text-green-400' :
                    'bg-purple-600/20 text-purple-400'
                  }`}>
                    {selectedSpell.type === 'offensive' ? '⚔️ Offensif' :
                     selectedSpell.type === 'defensive' ? '🛡️ Défensif' :
                     selectedSpell.type === 'utility' ? '⚡ Utilitaire' : '💫 Ultime'}
                  </span>
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                    Niveau {selectedSpell.unlockedAt}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              {selectedSpell.description}
            </p>
            
            <div className="space-y-3">
              {selectedSpell.damage && (
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400">💥</span>
                    <span className="text-white font-semibold">Dégâts:</span>
                    <span className="text-red-400">{selectedSpell.damage}</span>
                  </div>
                </div>
              )}
              
              {selectedSpell.effect && (
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">✨</span>
                    <span className="text-white font-semibold">Effet:</span>
                    <span className="text-blue-400">{selectedSpell.effect}</span>
                  </div>
                </div>
              )}
              
              {selectedSpell.range && (
                <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">🎯</span>
                    <span className="text-white font-semibold">Portée:</span>
                    <span className="text-green-400">{selectedSpell.range}</span>
                  </div>
                </div>
              )}
              
              {selectedSpell.cooldown && (
                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⏱️</span>
                    <span className="text-white font-semibold">Cooldown:</span>
                    <span className="text-yellow-400">{selectedSpell.cooldown}</span>
                  </div>
                </div>
              )}
            </div>
            
            {selectedSpell.unlockedAt > 6 && (
              <div className="mt-4 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-400">
                  <span>🔒</span>
                  <span className="text-sm">Ce sort sera débloqué au niveau {selectedSpell.unlockedAt}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">📜</div>
            <h3 className="text-xl font-bold mb-2">Détails des sorts</h3>
            <p>Cliquez sur un sort dans la liste pour voir ses caractéristiques détaillées</p>
          </div>
        )}
      </div>

      {/* Résumé de la progression */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Progression de classe</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Sorts totaux:</span>
            <span className="text-white font-bold">{selectedClass.spells.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Sorts au niveau 1:</span>
            <span className="text-green-400 font-bold">
              {selectedClass.spells.filter(s => s.unlockedAt <= 6).length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Sorts offensifs:</span>
            <span className="text-red-400 font-bold">
              {selectedClass.spells.filter(s => s.type === 'offensive').length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Sorts défensifs:</span>
            <span className="text-blue-400 font-bold">
              {selectedClass.spells.filter(s => s.type === 'defensive').length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Sorts ultimes:</span>
            <span className="text-purple-400 font-bold">
              {selectedClass.spells.filter(s => s.type === 'ultimate').length}
            </span>
          </div>
        </div>
      </div>

      {/* Personnalisation rapide */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Apparence</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Genre</label>
            <div className="flex space-x-2">
              <button
                onClick={() => onAppearanceChange({ gender: 'male' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                  characterAppearance.gender === 'male'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ♂ Homme
              </button>
              <button
                onClick={() => onAppearanceChange({ gender: 'female' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                  characterAppearance.gender === 'female'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ♀ Femme
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Cheveux</label>
            <div className="flex space-x-1">
              {hairColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onAppearanceChange({ hairColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    characterAppearance.hairColor === color ? 'border-white scale-110' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de création avec feedback */}
      <button
        onClick={onCreateCharacter}
        disabled={!isCreationValid()}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
        style={{
          boxShadow: selectedClass ? `0 0 30px ${selectedClass.color}40` : undefined
        }}
      >
        {!selectedClass ? '🔒 Choisissez une classe d\'abord' :
         !characterName.trim() ? '🔒 Entrez un nom pour votre héros' :
         '⚡ Créer le Héros ⚡'}
      </button>
      
      {/* Debug info */}
      <div className="text-center text-sm">
        <div className={`${selectedClass ? 'text-green-400' : 'text-red-400'}`}>
          {selectedClass ? '✅ Classe sélectionnée: ' + selectedClass.name : '❌ Aucune classe sélectionnée'}
        </div>
        <div className={`${characterName.trim() ? 'text-green-400' : 'text-red-400'}`}>
          {characterName.trim() ? '✅ Nom entré: ' + characterName : '❌ Aucun nom entré'}
        </div>
      </div>
    </div>
  );
};

export default SpellViewer;