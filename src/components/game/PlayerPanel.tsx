/**
 * PANNEAU STATISTIQUES JOUEUR - VERSION DÉDIÉE
 * ✅ Focus sur les stats du personnage uniquement
 * ✅ Scroll optimisé et layout harmonieux
 * ✅ Interface moderne et intuitive
 * ✅ Extensible pour de nouvelles fonctionnalités
 */

import React from 'react';
import { Character, PlayerStats, Position } from '../../types/game';
import { X, Heart, Plus, Sword, Shield, Activity, Sparkles, Target, Brain, User, MapPin, Gauge, Award, Trophy, TrendingUp, Zap } from 'lucide-react';

interface PlayerStatsePanelProps {
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
  onClose?: () => void;
}

/**
 * Composant de barre de progression moderne
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
 * Composant de stat moderne et lisible
 */
const StatCard: React.FC<{
  stat: {
    key: keyof PlayerStats;
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    bgColor: string;
  };
  value: number;
  availablePoints: number;
  inputValue: number;
  onImprove: () => void;
  onInputChange: (value: number) => void;
}> = ({ stat, value, availablePoints, inputValue, onImprove, onInputChange }) => {
  return (
    <div className={`${stat.bgColor} rounded-xl p-4 border border-gray-700/50 transition-all hover:border-gray-600 hover:scale-105`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center border border-gray-600">
            {stat.icon}
          </div>
          <div>
            <span className="text-white font-semibold text-base">{stat.name}</span>
            <p className="text-xs text-gray-400">{stat.description}</p>
          </div>
        </div>
        <span className={`${stat.color} font-bold text-3xl`}>
          {value}
        </span>
      </div>
      
      {/* Section d'amélioration des stats */}
      {availablePoints > 0 && (
        <div className="flex items-center space-x-3 mt-3">
          <input
            type="number"
            min="1"
            max={availablePoints}
            value={inputValue}
            onChange={(e) => onInputChange(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-2 bg-gray-700/50 text-white rounded border border-gray-600 focus:border-orange-500 focus:outline-none text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button 
            onClick={onImprove}
            disabled={availablePoints < inputValue}
            className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-600/20 disabled:cursor-not-allowed text-green-400 disabled:text-gray-500 rounded-lg border border-green-600/40 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
          >
            <Plus size={14} />
            <span>Améliorer +{inputValue}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const PlayerStatsPanel: React.FC<PlayerStatsePanelProps> = ({
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
  // Configuration des stats avec icônes modernes
  const statsConfig = [
    { key: 'vitality' as keyof PlayerStats, name: 'Vitalité', icon: <Heart size={24} className="text-red-400" />, color: 'text-red-400', description: '+5 Points de Vie', bgColor: 'bg-red-500/10' },
    { key: 'wisdom' as keyof PlayerStats, name: 'Sagesse', icon: <Sparkles size={24} className="text-purple-400" />, color: 'text-purple-400', description: '+3 Points de Mana', bgColor: 'bg-purple-500/10' },
    { key: 'strength' as keyof PlayerStats, name: 'Force', icon: <Sword size={24} className="text-orange-400" />, color: 'text-orange-400', description: 'Dégâts mêlée', bgColor: 'bg-orange-500/10' },
    { key: 'agility' as keyof PlayerStats, name: 'Agilité', icon: <Activity size={24} className="text-green-400" />, color: 'text-green-400', description: 'Esquive et critique', bgColor: 'bg-green-500/10' },
    { key: 'chance' as keyof PlayerStats, name: 'Chance', icon: <Target size={24} className="text-blue-400" />, color: 'text-blue-400', description: 'Dégâts à distance', bgColor: 'bg-blue-500/10' },
    { key: 'intelligence' as keyof PlayerStats, name: 'Intelligence', icon: <Brain size={24} className="text-cyan-400" />, color: 'text-cyan-400', description: 'Dégâts magiques', bgColor: 'bg-cyan-500/10' }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      
      {/* HEADER FIXE */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <TrendingUp size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Statistiques du Personnage</h1>
              <p className="text-gray-400">Gérez les caractéristiques de votre héros</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {availablePoints > 0 && (
              <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-xl border border-green-600/40 font-bold">
                +{availablePoints} points disponibles
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-700 rounded-xl transition-colors text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          
          {/* GRILLE EN 2 COLONNES POUR PLUS D'ESPACE */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* COLONNE DE GAUCHE - Informations du personnage */}
            <div className="col-span-5 space-y-6">
              
              {/* Carte du personnage */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <div className="text-center">
                  <div 
                    className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl border-4 border-gray-600 shadow-2xl mx-auto mb-6 relative"
                    style={{ 
                      background: `linear-gradient(145deg, ${character.class.color}20, ${character.class.color}40)`,
                      boxShadow: `0 0 40px ${character.class.color}40`
                    }}
                  >
                    {character.class.avatar}
                    <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent rounded-2xl animate-pulse" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">{character.name}</h2>
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Award className="text-blue-400" size={20} />
                    <span className="text-blue-300 font-semibold text-xl">Niveau {character.level}</span>
                  </div>
                  <div 
                    className="inline-block px-4 py-2 rounded-xl border font-medium"
                    style={{ 
                      color: character.class.color,
                      borderColor: character.class.color + '40',
                      backgroundColor: character.class.color + '10'
                    }}
                  >
                    {character.class.name}
                  </div>
                </div>
              </div>

              {/* Barres de vie et mana */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl space-y-6">
                <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center">
                  <Heart size={20} className="mr-2" />
                  État Vital
                </h3>
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

              {/* Position et carte */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-orange-400 font-bold text-lg mb-4 flex items-center">
                  <MapPin size={20} className="mr-2" />
                  Localisation
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Coordonnées:</span>
                    <span className="font-mono text-yellow-400 text-lg">({playerPosition.x}, {playerPosition.y})</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Carte actuelle:</span>
                    <span className="text-green-400 font-medium">{currentMapName}</span>
                  </div>
                </div>
              </div>

              {/* Statistiques de Combat */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-green-400 font-bold text-lg mb-4 flex items-center">
                  <Trophy size={20} className="mr-2" />
                  Statistiques de Combat
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Ennemis vaincus:</span>
                    <span className="text-red-400 font-bold">127</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Dégâts infligés:</span>
                    <span className="text-orange-400 font-bold">2,340</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Victoires:</span>
                    <span className="text-green-400 font-bold">89%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Temps de jeu:</span>
                    <span className="text-blue-400 font-bold">24h 15m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DE DROITE - Caractéristiques */}
            <div className="col-span-7 space-y-6">
              
              {/* Caractéristiques principales */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-orange-400 font-bold text-xl mb-6 flex items-center">
                  <Gauge size={24} className="mr-3" />
                  Caractéristiques du Héros
                </h3>
                
                {/* Grille des stats en 2 colonnes */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {statsConfig.map((stat) => (
                    <StatCard
                      key={stat.key}
                      stat={stat}
                      value={playerStats[stat.key]}
                      availablePoints={availablePoints}
                      inputValue={statInputs[stat.key]}
                      onImprove={() => onImproveStat(stat.key)}
                      onInputChange={(value) => onUpdateStatInput(stat.key, value)}
                    />
                  ))}
                </div>
                
                {/* Informations sur les points */}
                {availablePoints > 0 ? (
                  <div className="p-4 bg-green-600/10 border border-green-600/30 rounded-xl">
                    <p className="text-green-400 text-center font-medium">
                      💡 Vous avez <span className="font-bold text-lg">{availablePoints} points</span> à répartir !
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl">
                    <p className="text-blue-400 text-center font-medium">
                      ✨ Toutes vos caractéristiques sont optimisées !
                    </p>
                  </div>
                )}
              </div>

              {/* Équipements */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-yellow-400 font-bold text-xl mb-6 flex items-center">
                  <Shield size={24} className="mr-3" />
                  Équipements Actuels
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-800/30 p-4 rounded-lg text-center hover:bg-gray-700/30 transition-colors">
                    <div className="text-3xl mb-2">⚔️</div>
                    <p className="text-white text-sm font-bold">Épée de Fer</p>
                    <p className="text-gray-400 text-xs">+15 Attaque</p>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg text-center hover:bg-gray-700/30 transition-colors">
                    <div className="text-3xl mb-2">🛡️</div>
                    <p className="text-white text-sm font-bold">Bouclier Renforcé</p>
                    <p className="text-gray-400 text-xs">+10 Défense</p>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg text-center hover:bg-gray-700/30 transition-colors">
                    <div className="text-3xl mb-2">👑</div>
                    <p className="text-white text-sm font-bold">Couronne Royale</p>
                    <p className="text-gray-400 text-xs">+5 Charisme</p>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg text-center hover:bg-gray-700/30 transition-colors">
                    <div className="text-3xl mb-2">👟</div>
                    <p className="text-white text-sm font-bold">Bottes Magiques</p>
                    <p className="text-gray-400 text-xs">+3 Vitesse</p>
                  </div>
                </div>
              </div>

              {/* Objectifs et Progression */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-cyan-400 font-bold text-xl mb-6 flex items-center">
                  <Zap size={24} className="mr-3" />
                  Progression & Objectifs
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white text-sm font-bold">🎯 Atteindre le niveau 10</p>
                      <span className="text-blue-400 text-sm">30%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white text-sm font-bold">💪 Améliorer toutes les stats</p>
                      <span className="text-green-400 text-sm">75%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white text-sm font-bold">🏆 Devenir légendaire</p>
                      <span className="text-purple-400 text-sm">15%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsPanel;