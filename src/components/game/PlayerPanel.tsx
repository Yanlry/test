/**
 * PANNEAU DU JOUEUR (SIDEBAR GAUCHE) - STYLE MMO SOMBRE
 * Pour modifier l'apparence des stats, sorts et barres de vie, c'est ici
 */

import React, { useState } from 'react';
import { Character, PlayerStats, Position } from '../../types/game';
import { DEFAULT_SPELLS } from '../../utils/gameConstants';
import { X, Star, Heart, Zap, Plus, LogOut, ChevronDown, ChevronUp } from 'lucide-react';

interface PlayerPanelProps {
  character: Character;
  playerPosition: Position;
  currentMapName: string;
  playerStats: PlayerStats;
  availablePoints: number;
  statInputs: Record<keyof PlayerStats, number>;
  currentHP: number;
  maxHP: number;
  currentMP: number;
  maxMP: number;
  onImproveStat: (statName: keyof PlayerStats, pointsToAdd?: number) => void;
  onUpdateStatInput: (statName: keyof PlayerStats, value: number) => void;
  onBackToMenu: () => void;
  onClose?: () => void; // Nouveau prop pour fermer le panel
}

/**
 * Composant de barre de progression améliorée
 */
const ProgressBar: React.FC<{
  current: number;
  max: number;
  color: string;
  label: string;
  icon: string;
  showNumbers?: boolean;
}> = React.memo(({ current, max, color, label, icon, showNumbers = true }) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <span className="text-gray-300 font-medium text-sm">{label}</span>
        </div>
        {showNumbers && (
          <span className="text-gray-400 font-mono text-sm">{current}/{max}</span>
        )}
      </div>
      <div className="h-4 bg-gray-800 rounded-full border border-gray-700 overflow-hidden shadow-inner">
        <div 
          className={`h-full transition-all duration-500 ${color} shadow-lg relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
});

/**
 * Composant pour les sections déroulables
 */
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}> = ({ title, icon, isOpen, onToggle, children, badge }) => {
  return (
    <div className="border-b border-gray-700">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <h4 className="text-lg font-bold text-orange-400">{title}</h4>
          {badge && (
            <span className="text-sm bg-green-600/20 text-green-400 px-3 py-1 rounded-full border border-green-600/40">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="text-gray-400" size={20} />
        ) : (
          <ChevronDown className="text-gray-400" size={20} />
        )}
      </button>
      
      {/* Contenu déroulable avec animation */}
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  character,
  playerPosition,
  currentMapName,
  playerStats,
  availablePoints,
  statInputs,
  currentHP,
  maxHP,
  currentMP,
  maxMP,
  onImproveStat,
  onUpdateStatInput,
  onBackToMenu,
  onClose
}) => {
  // États pour gérer l'ouverture/fermeture des sections
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(true);
  const [isSpellsOpen, setIsSpellsOpen] = useState<boolean>(true);

  // Configuration des stats avec leurs icônes et couleurs MMO
  const statsConfig = [
    { key: 'vitality' as keyof PlayerStats, name: 'Vitalité', icon: '❤️', color: 'text-red-400', description: '+5 PV', bgColor: 'bg-red-500/20' },
    { key: 'wisdom' as keyof PlayerStats, name: 'Sagesse', icon: '🔮', color: 'text-purple-400', description: '+3 PM', bgColor: 'bg-purple-500/20' },
    { key: 'strength' as keyof PlayerStats, name: 'Force', icon: '💪', color: 'text-orange-400', description: 'dégâts mêlée', bgColor: 'bg-orange-500/20' },
    { key: 'agility' as keyof PlayerStats, name: 'Agilité', icon: '🏃', color: 'text-green-400', description: 'esquive, critique', bgColor: 'bg-green-500/20' },
    { key: 'chance' as keyof PlayerStats, name: 'Chance', icon: '🎯', color: 'text-blue-400', description: 'dégâts à distance', bgColor: 'bg-blue-500/20' },
    { key: 'intelligence' as keyof PlayerStats, name: 'Intelligence', icon: '🧠', color: 'text-cyan-400', description: 'dégâts sorts', bgColor: 'bg-cyan-500/20' }
  ];

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 flex flex-col backdrop-blur-sm">
      {/* Header avec bouton de fermeture */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
        <h2 className="text-xl font-bold text-orange-400 flex items-center">
          <Heart className="mr-2" size={20} />
          Personnage
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Informations du personnage */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 border-gray-600 shadow-lg relative"
              style={{ 
                background: `linear-gradient(145deg, ${character.class.color}20, ${character.class.color}40)`,
                boxShadow: `0 0 20px ${character.class.color}40`
              }}
            >
              {character.class.avatar}
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{character.name}</h3>
              <p className="text-blue-300 font-semibold">Niveau {character.level}</p>
              <p 
                className="text-sm font-medium"
                style={{ color: character.class.color }}
              >
                {character.class.name}
              </p>
            </div>
          </div>

          {/* Position et carte avec style MMO */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-700 shadow-inner">
            <h4 className="text-orange-400 font-semibold text-sm mb-2 flex items-center">
              <span className="mr-1">📍</span>
              Position
            </h4>
            <div className="text-gray-300 text-sm space-y-1">
              <p className="font-mono">X: {playerPosition.x}, Y: {playerPosition.y}</p>
              <p className="text-yellow-400">🗺️ {currentMapName}</p>
            </div>
          </div>

          {/* Barres de vie et mana améliorées */}
          <div className="space-y-4">
            <ProgressBar
              current={currentHP}
              max={maxHP}
              color="bg-gradient-to-r from-red-600 via-red-500 to-red-400"
              label="Points de Vie"
              icon="❤️"
            />
            <ProgressBar
              current={currentMP}
              max={maxMP}
              color="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"
              label="Points de Mana"
              icon="💙"
            />
          </div>
        </div>

        {/* Section Caractéristiques déroulable */}
        <CollapsibleSection
          title="Caractéristiques"
          icon={<Star size={18} className="text-orange-400" />}
          isOpen={isStatsOpen}
          onToggle={() => setIsStatsOpen(!isStatsOpen)}
          badge={availablePoints > 0 ? `+${availablePoints}` : undefined}
        >
          <div className="space-y-3">
            {statsConfig.map((stat) => (
              <div key={stat.key} className={`${stat.bgColor} rounded-lg p-3 border border-gray-700/50 transition-all hover:border-gray-600`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <span className="text-white font-medium">{stat.name}</span>
                      <p className="text-xs text-gray-400">{stat.description}</p>
                    </div>
                  </div>
                  <span className={`${stat.color} font-bold text-xl`}>
                    {playerStats[stat.key]}
                  </span>
                </div>
                
                {availablePoints > 0 && (
                  <div className="flex items-center space-x-2 mt-3">
                    <input
                      type="number"
                      min="1"
                      max={availablePoints}
                      value={statInputs[stat.key]}
                      onChange={(e) => onUpdateStatInput(stat.key, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-orange-500 focus:outline-none text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ MozAppearance: 'textfield' }}
                    />
                    <button 
                      onClick={() => onImproveStat(stat.key)}
                      disabled={availablePoints < statInputs[stat.key]}
                      className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-600/50 disabled:cursor-not-allowed text-green-400 disabled:text-gray-500 rounded border border-green-600/40 transition-colors text-sm font-medium flex items-center space-x-1"
                      title={`Améliorer ${stat.name} (${stat.description})`}
                    >
                      <Plus size={14} />
                      <span>Améliorer</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Section Sorts déroulable */}
        <CollapsibleSection
          title="Sorts & Capacités"
          icon={<Zap size={18} className="text-orange-400" />}
          isOpen={isSpellsOpen}
          onToggle={() => setIsSpellsOpen(!isSpellsOpen)}
        >
          <div className="space-y-2">
            {DEFAULT_SPELLS.map((spell, index) => (
              <button
                key={spell.id}
                className={`w-full p-3 rounded-lg border transition-all text-left group ${
                  index < 3 
                    ? 'border-orange-500/50 bg-orange-500/20 hover:bg-orange-500/30 shadow-lg shadow-orange-500/20' 
                    : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                }`}
                title={`${spell.name} - ${spell.manaCost} mana`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform">
                    {spell.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-bold text-sm">{spell.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                          {spell.manaCost} MP
                        </span>
                        {index >= 3 && (
                          <span className="text-gray-500 text-xs">🔒</span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {index < 3 ? 'Disponible' : 'Capacité verrouillée'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CollapsibleSection>
      </div>

      {/* Footer avec bouton retour stylisé */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <button 
          onClick={onBackToMenu}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-bold flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
        >
          <LogOut size={18} />
          <span>Retour au Menu</span>
        </button>
      </div>
    </div>
  );
};

export default PlayerPanel;