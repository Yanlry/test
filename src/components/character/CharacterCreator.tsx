import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User as Star, Volume2, VolumeX, Crown, Sparkles, Shield, Sword, Wand2, Heart, Zap, Eye, Palette } from 'lucide-react';
import { User, Character, CharacterClass, CharacterAppearance, ClassSpell } from '../../types/game';
import { useMusic } from '../../context/MusicContext'; 
import { characterClasses } from '../../data/characterClasses'; 

interface CharacterCreatorProps {
  currentUser: User;
  characterName: string;
  selectedClass: CharacterClass | null;
  selectedSpell: ClassSpell | null;
  characterAppearance: CharacterAppearance;
  onNameChange: (name: string) => void;
  onClassSelect: (characterClass: CharacterClass) => void;
  onSpellSelect: (spell: ClassSpell) => void;
  onAppearanceChange: (appearance: Partial<CharacterAppearance>) => void;
  onCreateCharacter: () => { success: boolean; error?: string; character?: Character };
  onBackToLogin: () => void;
  isCreationValid: () => boolean;
}

interface MagicParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'glow' | 'star' | 'rune';
}

interface FloatingRune {
  id: number;
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  opacity: number;
  symbol: string;
  color: string;
}

/**
 * Composant de contrôle musical avec design Dofus
 */
const MusicToggle: React.FC = React.memo(() => {
  const { isPlaying, toggleMusic } = useMusic();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <button 
        onClick={toggleMusic}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-4 rounded-full border-3 shadow-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-12
          ${isPlaying 
            ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-yellow-100 border-amber-400 shadow-amber-500/50' 
            : 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-red-400 border-red-500 shadow-red-500/30'
          }
          before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        `}
        title={isPlaying ? 'Couper la musique' : 'Activer la musique'}
      >
        <div className="relative z-10">
          {isPlaying ? (
            <Volume2 size={24} className={`${isHovered ? 'animate-bounce' : 'animate-pulse'}`} />
          ) : (
            <VolumeX size={24} className={isHovered ? 'animate-shake' : ''} />
          )}
        </div>
        
        {/* Effet de lueur magique */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/30"></div>
        )}
      </button>
      
      {/* Tooltip élégant */}
      <div className={`
        absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 
        bg-gray-900/95 text-amber-300 text-sm rounded-lg border border-amber-500/30
        transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}>
        {isPlaying ? 'Musique activée' : 'Musique désactivée'}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-amber-500/30 rotate-45"></div>
      </div>
    </div>
  );
});

/**
 * Composant de sélection de classe avec design premium
 */
const ClassSelector: React.FC<{
  characterClasses: CharacterClass[];
  selectedClass: CharacterClass | null;
  onClassSelect: (characterClass: CharacterClass) => void;
}> = React.memo(({ characterClasses, selectedClass, onClassSelect }) => {
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);

  return (
    <div className="relative">
      {/* Bordure magique animée */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-red-500/20 rounded-2xl blur-xl animate-pulse"></div>
      
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl shadow-2xl border-2 border-amber-500/30 p-6 backdrop-blur-lg">
        {/* Header avec effet de texte magique */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            ⚔️ Classes Héroïques ⚔️
          </h3>
          <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
        </div>

        <div className="space-y-4">
          {characterClasses.map((charClass) => {
            const isSelected = selectedClass?.id === charClass.id;
            const isHovered = hoveredClass === charClass.id;
            
            return (
              <div
                key={charClass.id}
                onClick={() => onClassSelect(charClass)}
                onMouseEnter={() => setHoveredClass(charClass.id)}
                onMouseLeave={() => setHoveredClass(null)}
                className={`
                  relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-500 transform
                  ${isSelected 
                    ? 'border-amber-400 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 shadow-2xl shadow-amber-500/30 scale-105' 
                    : 'border-slate-600 bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20 hover:scale-102'
                  }
                  ${isHovered ? 'animate-glow' : ''}
                `}
                style={{
                  boxShadow: isSelected 
                    ? `0 0 30px ${charClass.color}40, inset 0 0 20px ${charClass.color}20` 
                    : isHovered 
                      ? `0 0 20px ${charClass.color}30` 
                      : ''
                }}
              >
                {/* Effet de particules sur hover */}
                {isHovered && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-400 rounded-full animate-ping"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${1 + Math.random()}s`
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="relative flex items-center space-x-4">
                  {/* Avatar avec effet de lueur */}
                  <div className="relative">
                    <div 
                      className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300 ${isSelected || isHovered ? 'opacity-60' : 'opacity-0'}`}
                      style={{ backgroundColor: charClass.color }}
                    ></div>
                    <div 
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 transition-all duration-300 ${
                        isSelected ? 'border-amber-400 shadow-lg' : 'border-slate-600'
                      }`}
                      style={{ 
                        background: `linear-gradient(145deg, ${charClass.color}30, ${charClass.color}50)`,
                        transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
                      }}
                    >
                      {charClass.avatar}
                    </div>
                  </div>

                  {/* Informations de classe */}
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg transition-colors duration-300 ${
                      isSelected ? 'text-amber-300' : 'text-white'
                    }`}>
                      {charClass.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span 
                        className="px-3 py-1 text-xs font-bold rounded-full border"
                        style={{ 
                          color: charClass.color, 
                          borderColor: charClass.color,
                          backgroundColor: `${charClass.color}20` 
                        }}
                      >
                        {charClass.element}
                      </span>
                      {isSelected && (
                        <Crown size={16} className="text-amber-400 animate-bounce" />
                      )}
                    </div>
                  </div>

                  {/* Indicateur de sélection */}
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-400/50' 
                      : 'border-slate-500'
                  }`}>
                    {isSelected && (
                      <div className="w-full h-full rounded-full bg-amber-400 animate-ping"></div>
                    )}
                  </div>
                </div>

                {/* Description au hover */}
                {isHovered && (
                  <div className="mt-3 pt-3 border-t border-slate-600/50">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {charClass.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer décoratif */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-amber-400/60">
            <Sparkles size={16} />
            <span className="text-sm">Choisissez votre destinée</span>
            <Sparkles size={16} />
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Composant d'aperçu du personnage avec animations avancées
 */
const CharacterPreview: React.FC<{
  selectedClass: CharacterClass | null;
  selectedSpell: ClassSpell | null;
  characterName: string;
  characterAppearance: CharacterAppearance;
  onNameChange: (name: string) => void;
  onSpellSelect: (spell: ClassSpell) => void;
}> = React.memo(({ selectedClass, selectedSpell, characterName, characterAppearance, onNameChange, onSpellSelect }) => {
  const [nameError, setNameError] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [hoveredSpell, setHoveredSpell] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    if (value.length > 20) {
      setNameError('Le nom ne peut pas dépasser 20 caractères');
      return;
    }
    if (value && !/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
      setNameError('Le nom ne peut contenir que des lettres');
      return;
    }
    setNameError('');
    onNameChange(value);
  };

  const getSpellTypeIcon = (type: string) => {
    switch (type) {
      case 'offensive': return <Sword size={16} className="text-red-400" />;
      case 'defensive': return <Shield size={16} className="text-blue-400" />;
      case 'utility': return <Wand2 size={16} className="text-green-400" />;
      case 'healing': return <Heart size={16} className="text-pink-400" />;
      default: return <Zap size={16} className="text-purple-400" />;
    }
  };

  const getSpellTypeColor = (type: string) => {
    switch (type) {
      case 'offensive': return 'from-red-600/20 to-red-500/20 border-red-500/30';
      case 'defensive': return 'from-blue-600/20 to-blue-500/20 border-blue-500/30';
      case 'utility': return 'from-green-600/20 to-green-500/20 border-green-500/30';
      case 'healing': return 'from-pink-600/20 to-pink-500/20 border-pink-500/30';
      default: return 'from-purple-600/20 to-purple-500/20 border-purple-500/30';
    }
  };

  return (
    <div className="relative">
      {/* Bordure magique principale */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-red-500/20 rounded-3xl blur-2xl animate-pulse"></div>
      
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl border-2 border-amber-500/30 p-8 backdrop-blur-lg min-h-[600px]">
        {selectedClass ? (
          <div className="text-center space-y-6">
            {/* Avatar principal avec effets avancés */}
            <div className="relative mb-8">
              {/* Cercles magiques rotatifs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-64 h-64 rounded-full border-2 border-dashed opacity-30 animate-spin-slow"
                  style={{ borderColor: selectedClass.color }}
                ></div>
                <div 
                  className="absolute w-72 h-72 rounded-full border border-dotted opacity-20 animate-reverse-spin"
                  style={{ borderColor: selectedClass.color }}
                ></div>
              </div>

              {/* Aura magique */}
              <div 
                className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse"
                style={{ 
                  background: `radial-gradient(circle, ${selectedClass.color}40 0%, transparent 70%)`,
                  transform: 'scale(1.2)'
                }}
              ></div>

              {/* Avatar principal */}
              <div className="relative">
                <div 
                  className="w-56 h-56 mx-auto rounded-full flex items-center justify-center text-8xl border-4 shadow-2xl transition-all duration-500 hover:scale-105"
                  style={{ 
                    background: `linear-gradient(145deg, ${selectedClass.color}30, ${selectedClass.color}60)`,
                    borderColor: selectedClass.color,
                    boxShadow: `0 0 60px ${selectedClass.color}60, inset 0 0 30px ${selectedClass.color}20`
                  }}
                >
                  <span className="animate-float">{selectedClass.avatar}</span>
                </div>

                {/* Particules orbitales */}
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full animate-orbit"
                    style={{
                      backgroundColor: selectedClass.color,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: '4s',
                      top: '50%',
                      left: '50%',
                      transformOrigin: `${120 + i * 10}px 0px`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Champ de nom avec validation */}
            <div className="relative mb-6">
              <div className={`relative transition-all duration-300 ${isNameFocused ? 'scale-105' : ''}`}>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  className={`
                    text-3xl font-bold text-center bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-white 
                    border-2 rounded-xl px-6 py-3 transition-all duration-300 backdrop-blur-sm
                    focus:outline-none focus:scale-105 w-full max-w-md mx-auto block
                    ${nameError 
                      ? 'border-red-500 shadow-lg shadow-red-500/30' 
                      : isNameFocused 
                        ? 'border-amber-400 shadow-lg shadow-amber-400/30' 
                        : 'border-slate-600'
                    }
                  `}
                  placeholder="Nom du héros"
                  maxLength={25}
                />
                
                {/* Compteur de caractères */}
                <div className="absolute -bottom-6 right-0 text-xs text-slate-400">
                  {characterName.length}/20
                </div>
              </div>
              
              {/* Message d'erreur */}
              {nameError && (
                <div className="mt-2 text-red-400 text-sm animate-shake">
                  ⚠️ {nameError}
                </div>
              )}
            </div>

            {/* Informations de classe */}
            <div className="space-y-4">
              <h2 
                className="text-4xl font-bold animate-glow"
                style={{ color: selectedClass.color, textShadow: `0 0 20px ${selectedClass.color}60` }}
              >
                {selectedClass.name}
              </h2>
              
              <div className="flex items-center justify-center space-x-4">
                <span 
                  className="px-6 py-2 rounded-full text-lg font-bold border-2 transition-all duration-300 hover:scale-110"
                  style={{ 
                    color: selectedClass.color, 
                    borderColor: selectedClass.color,
                    backgroundColor: `${selectedClass.color}20`,
                    boxShadow: `0 0 20px ${selectedClass.color}30`
                  }}
                >
                  ✨ {selectedClass.element}
                </span>
              </div>
              
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
                {selectedClass.description}
              </p>
            </div>

            {/* Grimoire des sorts */}
            <div className="mt-8">
              <div className="relative mb-6">
                <h3 className="text-2xl font-bold text-amber-400 mb-2">📜 Grimoire des Sorts</h3>
                <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <div className="grid gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {selectedClass.spells.map((spell) => {
                    const isUnlocked = spell.unlockedAt <= 6;
                    const isSelected = selectedSpell?.id === spell.id;
                    const isHovered = hoveredSpell === spell.id;
                    
                    return (
                      <div
                        key={spell.id}
                        onClick={() => onSpellSelect(spell)}
                        onMouseEnter={() => setHoveredSpell(spell.id)}
                        onMouseLeave={() => setHoveredSpell(null)}
                        className={`
                          relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-500 transform
                          ${isSelected 
                            ? 'border-amber-400 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 shadow-2xl shadow-amber-500/30 scale-105' 
                            : isUnlocked 
                              ? `border-slate-600 bg-gradient-to-r ${getSpellTypeColor(spell.type)} hover:border-amber-500/50 hover:shadow-xl hover:scale-102`
                              : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/60'
                          }
                          ${isHovered && isUnlocked ? 'animate-glow' : ''}
                        `}
                        style={{
                          opacity: isUnlocked ? 1 : 0.5,
                          filter: isUnlocked ? 'none' : 'grayscale(70%)'
                        }}
                      >
                        {/* Effet de particules pour les sorts sélectionnés */}
                        {isSelected && (
                          <div className="absolute inset-0 overflow-hidden rounded-xl">
                            {Array.from({ length: 8 }, (_, i) => (
                              <div
                                key={i}
                                className="absolute w-1 h-1 bg-amber-400 rounded-full animate-ping"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animationDelay: `${Math.random() * 2}s`,
                                  animationDuration: `${1 + Math.random()}s`
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <div className="relative flex items-center space-x-4">
                          {/* Icône du sort */}
                          <div className={`relative transition-transform duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`}>
                            <div 
                              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
                                isSelected ? 'border-amber-400 shadow-lg' : 'border-slate-600'
                              }`}
                              style={{ 
                                background: isUnlocked 
                                  ? `linear-gradient(145deg, ${selectedClass.color}20, ${selectedClass.color}40)` 
                                  : 'linear-gradient(145deg, #374151, #1f2937)'
                              }}
                            >
                              {spell.icon}
                            </div>
                            {isSelected && (
                              <div className="absolute inset-0 rounded-lg bg-amber-400/20 animate-ping"></div>
                            )}
                          </div>

                          {/* Informations du sort */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-bold text-lg transition-colors duration-300 ${
                                isSelected ? 'text-amber-300' : isUnlocked ? 'text-white' : 'text-slate-400'
                              }`}>
                                {spell.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {getSpellTypeIcon(spell.type)}
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                  isUnlocked ? 'bg-green-600/20 text-green-400' : 'bg-slate-600/20 text-slate-400'
                                }`}>
                                  Niv {spell.unlockedAt}
                                </span>
                                {!isUnlocked && (
                                  <span className="text-slate-500 text-lg">🔒</span>
                                )}
                                {isSelected && (
                                  <Crown size={16} className="text-amber-400 animate-bounce" />
                                )}
                              </div>
                            </div>
                            <p className={`text-sm transition-colors duration-300 ${
                              isUnlocked ? 'text-slate-300' : 'text-slate-500'
                            }`}>
                              {spell.description}
                            </p>
                          </div>
                        </div>

                        {/* Barre de progression pour les sorts débloqués */}
                        {isUnlocked && (
                          <div className="mt-3 w-full bg-slate-700 rounded-full h-1">
                            <div 
                              className="h-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                              style={{ width: '100%' }}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-amber-400/80">
                    <Sparkles size={16} />
                    <span className="text-sm">Cliquez sur un sort pour voir ses détails</span>
                    <Sparkles size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="text-8xl mb-4 animate-float">🎭</div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-bold text-amber-400 animate-glow">
                Choisissez votre Classe
              </h3>
              <p className="text-xl text-slate-300 max-w-md mx-auto leading-relaxed">
                Sélectionnez la voie qui forgera votre légende dans ce monde mystique
              </p>
              <div className="flex items-center justify-center space-x-4 text-amber-400/60">
                <Sparkles size={20} className="animate-spin" />
                <span>Votre aventure commence ici</span>
                <Sparkles size={20} className="animate-spin" style={{ animationDirection: 'reverse' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Panneau de personnalisation avancé
 */
const CustomizationPanel: React.FC<{
  selectedClass: CharacterClass | null;
  selectedSpell: ClassSpell | null;
  characterAppearance: CharacterAppearance;
  onAppearanceChange: (appearance: Partial<CharacterAppearance>) => void;
  onCreateCharacter: () => void;
  isCreationValid: () => boolean;
  characterName: string;
}> = React.memo(({ 
  selectedClass, 
  selectedSpell, 
  characterAppearance, 
  onAppearanceChange, 
  onCreateCharacter, 
  isCreationValid, 
  characterName 
}) => {
  const [activeTab, setActiveTab] = useState<'spell' | 'appearance'>('spell');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCharacter = async () => {
    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation
      onCreateCharacter();
    } finally {
      setIsCreating(false);
    }
  };

  const appearanceOptions = {
    hairColor: [
      { value: 'brown', label: 'Châtain', color: '#8B4513' },
      { value: 'black', label: 'Noir', color: '#000000' },
      { value: 'blonde', label: 'Blond', color: '#FFD700' },
      { value: 'red', label: 'Roux', color: '#FF4500' },
      { value: 'white', label: 'Blanc', color: '#F5F5F5' },
      { value: 'silver', label: 'Argenté', color: '#C0C0C0' }
    ],
    eyeColor: [
      { value: 'brown', label: 'Marron', color: '#8B4513' },
      { value: 'blue', label: 'Bleu', color: '#4169E1' },
      { value: 'green', label: 'Vert', color: '#228B22' },
      { value: 'hazel', label: 'Noisette', color: '#CD853F' },
      { value: 'gray', label: 'Gris', color: '#808080' },
      { value: 'violet', label: 'Violet', color: '#8A2BE2' }
    ],
    skinTone: [
      { value: 'fair', label: 'Clair', color: '#FDBCB4' },
      { value: 'medium', label: 'Moyen', color: '#E1A95F' },
      { value: 'olive', label: 'Olive', color: '#C68642' },
      { value: 'dark', label: 'Foncé', color: '#8D5524' },
      { value: 'pale', label: 'Pâle', color: '#F7E7CE' },
      { value: 'tan', label: 'Hâlé', color: '#D2B48C' }
    ]
  };

  return (
    <div className="relative">
      {/* Bordure magique */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-red-500/20 rounded-2xl blur-xl animate-pulse"></div>
      
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl shadow-2xl border-2 border-amber-500/30 p-6 backdrop-blur-lg">
        {/* Header avec onglets */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-slate-800/50 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('spell')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-300 ${
                activeTab === 'spell'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Wand2 size={16} className="inline mr-2" />
              Sort
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === 'spell' ? (
            <div className="space-y-4">
              {selectedSpell ? (
                <div className="text-center space-y-4">
                  {/* Icône du sort avec effet */}
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse"
                      style={{ backgroundColor: selectedClass?.color || '#F59E0B' }}
                    ></div>
                    <div 
                      className="relative w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl border-4 shadow-2xl"
                      style={{ 
                        background: `linear-gradient(145deg, ${selectedClass?.color || '#F59E0B'}30, ${selectedClass?.color || '#F59E0B'}60)`,
                        borderColor: selectedClass?.color || '#F59E0B',
                        boxShadow: `0 0 30px ${selectedClass?.color || '#F59E0B'}60`
                      }}
                    >
                      {selectedSpell.icon}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xl mb-2">{selectedSpell.name}</h4>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <span className={`px-3 py-1 text-sm font-bold rounded-full border ${
                        selectedSpell.type === 'offensive' ? 'bg-red-600/20 text-red-400 border-red-500/30' :
                        selectedSpell.type === 'defensive' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' :
                        selectedSpell.type === 'utility' ? 'bg-green-600/20 text-green-400 border-green-500/30' :
                        selectedSpell.type === 'healing' ? 'bg-pink-600/20 text-pink-400 border-pink-500/30' :
                        'bg-purple-600/20 text-purple-400 border-purple-500/30'
                      }`}>
                        {selectedSpell.type}
                      </span>
                      <span className="px-3 py-1 text-sm font-bold rounded-full bg-amber-600/20 text-amber-400 border border-amber-500/30">
                        Niveau {selectedSpell.unlockedAt}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {selectedSpell.description}
                    </p>
                  </div>

                  {/* Statistiques du sort */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                      <div className="text-amber-400 text-sm font-bold">Puissance</div>
                      <div className="text-white text-lg">★★★★☆</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                      <div className="text-amber-400 text-sm font-bold">Portée</div>
                      <div className="text-white text-lg">★★★☆☆</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <div className="text-4xl mb-3">✨</div>
                  <p>Sélectionnez un sort pour voir ses détails</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Couleur des cheveux */}
              <div>
                <label className="flex items-center text-amber-400 text-sm font-bold mb-3">
                  <Palette size={16} className="mr-2" />
                  Couleur des cheveux
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {appearanceOptions.hairColor.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAppearanceChange({ hairColor: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        characterAppearance.hairColor === option.value
                          ? 'border-amber-400 bg-amber-500/20 shadow-lg'
                          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full mx-auto mb-1 border-2 border-white/30"
                        style={{ backgroundColor: option.color }}
                      ></div>
                      <div className="text-xs text-white">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleur des yeux */}
              <div>
                <label className="flex items-center text-amber-400 text-sm font-bold mb-3">
                  <Eye size={16} className="mr-2" />
                  Couleur des yeux
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {appearanceOptions.eyeColor.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAppearanceChange({ eyeColor: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        characterAppearance.eyeColor === option.value
                          ? 'border-amber-400 bg-amber-500/20 shadow-lg'
                          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full mx-auto mb-1 border-2 border-white/30"
                        style={{ backgroundColor: option.color }}
                      ></div>
                      <div className="text-xs text-white">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Teint de peau */}
              <div>
                <label className="flex items-center text-amber-400 text-sm font-bold mb-3">
                  <span className="mr-2">👤</span>
                  Teint de peau
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {appearanceOptions.skinTone.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAppearanceChange({ skinTone: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        characterAppearance.skinTone === option.value
                          ? 'border-amber-400 bg-amber-500/20 shadow-lg'
                          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full mx-auto mb-1 border-2 border-white/30"
                        style={{ backgroundColor: option.color }}
                      ></div>
                      <div className="text-xs text-white">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bouton de création */}
        <div className="mt-8">
          <button
            onClick={handleCreateCharacter}
            disabled={!isCreationValid() || isCreating}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all duration-500 transform relative overflow-hidden
              ${isCreationValid() && !isCreating
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white hover:from-amber-700 hover:via-orange-700 hover:to-red-700 shadow-2xl hover:shadow-amber-500/30 hover:scale-105 border-2 border-amber-400'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed border-2 border-slate-600'
              }
            `}
          >
            {/* Effet de brillance */}
            {isCreationValid() && !isCreating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
            )}
            
            <div className="relative flex items-center justify-center space-x-3">
              {isCreating ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <Crown size={20} className={isCreationValid() ? 'animate-bounce' : ''} />
                  <span>Forger le Héros</span>
                  <Sparkles size={20} className={isCreationValid() ? 'animate-pulse' : ''} />
                </>
              )}
            </div>
          </button>

          {/* Indicateur de validation */}
          <div className="mt-3 text-center text-sm">
            {!characterName.trim() ? (
              <span className="text-red-400">⚠️ Nom requis</span>
            ) : !selectedClass ? (
              <span className="text-red-400">⚠️ Classe requise</span>
            ) : (
              <span className="text-green-400">✅ Prêt à créer</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Composant principal de création de personnage
 */
const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  currentUser,
  characterName,
  selectedClass,
  selectedSpell,
  characterAppearance,
  onNameChange,
  onClassSelect,
  onSpellSelect,
  onAppearanceChange,
  onCreateCharacter,
  onBackToLogin,
  isCreationValid
}) => {
  const [magicParticles, setMagicParticles] = useState<MagicParticle[]>([]);
  const [floatingRunes, setFloatingRunes] = useState<FloatingRune[]>([]);
  const animationRef = useRef<number | null>(null);

  /**
   * Gestion de la création du personnage avec feedback
   */
  const handleCreateCharacter = useCallback((): void => {
    try {
      const result = onCreateCharacter();
      if (!result.success && result.error) {
        // Animation d'erreur
        document.body.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          document.body.style.animation = '';
        }, 500);
        alert(`❌ ${result.error}`);
      } else if (result.success) {
        // Animation de succès
        document.body.style.animation = 'success-glow 1s ease-in-out';
        setTimeout(() => {
          document.body.style.animation = '';
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur lors de la création du personnage:', error);
    }
  }, [onCreateCharacter]);

  /**
   * Animation des particules magiques
   */
  const updateParticles = useCallback(() => {
    setMagicParticles(prev => {
      const updated = prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1,
        vy: particle.vy + 0.02 // Gravité légère
      })).filter(particle => particle.life > 0);

      // Ajouter de nouvelles particules
      if (Math.random() < 0.3) {
        const newParticle: MagicParticle = {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          y: 100,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -Math.random() * 2 - 1,
          life: 60 + Math.random() * 60,
          maxLife: 120,
          color: ['#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][Math.floor(Math.random() * 4)],
          size: Math.random() * 3 + 1,
          type: ['spark', 'glow', 'star', 'rune'][Math.floor(Math.random() * 4)] as any
        };
        updated.push(newParticle);
      }

      return updated;
    });

    setFloatingRunes(prev => 
      prev.map(rune => ({
        ...rune,
        rotation: rune.rotation + rune.rotationSpeed,
        y: rune.y + Math.sin(Date.now() * 0.001 + rune.id) * 0.1,
        opacity: 0.3 + Math.sin(Date.now() * 0.002 + rune.id) * 0.2
      }))
    );

    animationRef.current = requestAnimationFrame(updateParticles);
  }, []);

  /**
   * Initialisation des runes flottantes
   */
  const initializeRunes = useCallback(() => {
    const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];
    const colors = ['#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981'];
    
    const newRunes: FloatingRune[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 0.2 + Math.random() * 0.3,
      symbol: runes[Math.floor(Math.random() * runes.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    
    setFloatingRunes(newRunes);
  }, []);

  useEffect(() => {
    initializeRunes();
    updateParticles();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeRunes, updateParticles]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Arrière-plan mystique multicouche */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 60% 40%, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 20%, #374151 40%, #1f2937 60%, #111827 80%, #0f172a 100%)
          `
        }}
      />
      
      {/* Texture de parchemin ancien */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, rgba(31, 41, 55, 0.3) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(31, 41, 55, 0.3) 25%, transparent 25%),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245, 158, 11, 0.03) 2px, rgba(245, 158, 11, 0.03) 4px)
          `,
          backgroundSize: '400px 400px, 300px 300px, 60px 60px, 60px 60px, 20px 20px'
        }}
      />

      {/* Particules magiques animées */}
      {magicParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: particle.type === 'star' ? '0' : '50%',
            opacity: particle.life / particle.maxLife,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            transform: particle.type === 'star' ? 'rotate(45deg)' : 'none',
            animation: particle.type === 'glow' ? 'pulse 2s infinite' : 'none'
          }}
        />
      ))}

      {/* Runes flottantes mystiques */}
      {floatingRunes.map(rune => (
        <div
          key={rune.id}
          className="absolute pointer-events-none text-2xl font-bold select-none"
          style={{
            left: `${rune.x}%`,
            top: `${rune.y}%`,
            color: rune.color,
            opacity: rune.opacity,
            transform: `rotate(${rune.rotation}deg) scale(${rune.scale})`,
            textShadow: `0 0 10px ${rune.color}`,
            fontFamily: 'serif'
          }}
        >
          {rune.symbol}
        </div>
      ))}

      {/* Étoiles scintillantes améliorées */}
      {Array.from({ length: 15 }, (_, i) => (
        <Star
          key={i}
          size={8 + Math.random() * 8}
          className="absolute text-yellow-400 opacity-60 animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            filter: 'drop-shadow(0 0 6px currentColor)'
          }}
        />
      ))}

      {/* Contrôles de navigation */}
      <div className="absolute top-6 left-6 z-50">
        <MusicToggle />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={onBackToLogin}
          className="group relative px-6 py-3 bg-gradient-to-r from-slate-800/90 to-slate-700/90 hover:from-slate-700 hover:to-slate-600 text-slate-300 hover:text-white rounded-xl transition-all duration-300 backdrop-blur-sm border-2 border-slate-600 hover:border-slate-500 shadow-xl hover:shadow-2xl transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative flex items-center space-x-2">
            <span>←</span>
            <span>Retour</span>
          </span>
        </button>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header majestueux */}
        <div className="text-center mb-12 relative">
          <div className="relative inline-block">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 mb-4 animate-glow">
              ⚔️ Forge de Héros ⚔️
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-red-400/20 blur-2xl animate-pulse"></div>
          </div>
          
          <p className="text-2xl text-slate-300 mb-2">
            Forgez votre destinée, 
            <span className="text-amber-400 font-bold animate-glow"> {currentUser.username}</span>
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-amber-400/80">
            <Sparkles size={20} className="animate-spin" />
            <span className="text-lg">Que votre légende commence</span>
            <Sparkles size={20} className="animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
          
          {/* Ligne décorative */}
          <div className="mt-6 w-96 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full mx-auto"></div>
        </div>

        {/* Grille principale responsive */}
        <div className="grid xl:grid-cols-12 lg:grid-cols-1 gap-8">
          {/* Panneau de sélection des classes */}
          <div className="xl:col-span-3 lg:col-span-1">
            <ClassSelector
              characterClasses={characterClasses}
              selectedClass={selectedClass}
              onClassSelect={onClassSelect}
            />
          </div>

          {/* Aperçu central du personnage */}
          <div className="xl:col-span-6 lg:col-span-1">
            <CharacterPreview
              selectedClass={selectedClass}
              selectedSpell={selectedSpell}
              characterName={characterName}
              characterAppearance={characterAppearance}
              onNameChange={onNameChange}
              onSpellSelect={onSpellSelect}
            />
          </div>

          {/* Panneau de personnalisation */}
          <div className="xl:col-span-3 lg:col-span-1">
            <CustomizationPanel
              selectedClass={selectedClass}
              selectedSpell={selectedSpell}
              characterAppearance={characterAppearance}
              onAppearanceChange={onAppearanceChange}
              onCreateCharacter={handleCreateCharacter}
              isCreationValid={isCreationValid}
              characterName={characterName}
            />
          </div>
        </div>
      </div>

      {/* Styles CSS personnalisés intégrés */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; }
          50% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes success-glow {
          0%, 100% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
          50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.5); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-orbit { animation: orbit 4s linear infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 12s linear infinite; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #F59E0B, #EF4444);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #D97706, #DC2626);
        }
      `}</style>
    </div>
  );
};

export default CharacterCreator;