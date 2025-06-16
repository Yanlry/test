/**
 * COMPOSANT DE SÉLECTION DE CLASSE
 * Pour modifier l'apparence du panneau de sélection des classes (gauche), c'est ici
 */

import React from 'react';
import { CharacterClass } from '../../types/game';

interface ClassSelectorProps {
  characterClasses: CharacterClass[];
  selectedClass: CharacterClass | null;
  onClassSelect: (characterClass: CharacterClass) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  characterClasses,
  selectedClass,
  onClassSelect
}) => {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Classes</h3>
      
      <div className="space-y-3">
        {characterClasses.map((charClass) => (
          <div
            key={charClass.id}
            onClick={() => onClassSelect(charClass)}
            className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
              selectedClass?.id === charClass.id
                ? 'border-current shadow-lg'
                : 'bg-gray-800/50 hover:bg-gray-700/70 border-gray-600 hover:border-gray-500'
            }`}
            style={{
              borderColor: selectedClass?.id === charClass.id ? charClass.color : undefined,
              background: selectedClass?.id === charClass.id 
                ? `linear-gradient(to right, ${charClass.color}30, ${charClass.color}10)`
                : undefined,
              boxShadow: selectedClass?.id === charClass.id 
                ? `0 0 20px ${charClass.color}40` 
                : undefined
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{charClass.avatar}</div>
              <div>
                <h4 className="text-lg font-bold text-white">{charClass.name}</h4>
                <div className="flex space-x-1 mt-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: charClass.color }}
                  ></div>
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: charClass.color }}
                  ></div>
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                </div>
              </div>
            </div>
            
            {/* Indicateur de sélection */}
            {selectedClass?.id === charClass.id && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                <div 
                  className="w-4 h-4 rotate-45" 
                  style={{ backgroundColor: charClass.color }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Info supplémentaire */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          {selectedClass 
            ? `${selectedClass.name} sélectionné` 
            : 'Choisissez votre classe'}
        </p>
        {selectedClass && (
          <div className="mt-2">
            <span 
              className="px-2 py-1 rounded text-xs font-bold"
              style={{ 
                color: selectedClass.color,
                backgroundColor: `${selectedClass.color}20`,
                border: `1px solid ${selectedClass.color}40`
              }}
            >
              Élément: {selectedClass.element}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassSelector;