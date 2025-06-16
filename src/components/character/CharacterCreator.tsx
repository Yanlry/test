import React, { useState, useEffect, useCallback } from 'react';
import { User as UserIcon, Shield, Target, Sparkles, Star, Flame, Crown } from 'lucide-react';
import { User, Character, CharacterClass, CharacterAppearance, ClassSpell } from '../../types/game';

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

/**
 * Interface pour les particules d'animation
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

/**
 * Composant de contrôle musical
 */
const MusicToggle: React.FC = React.memo(() => (
  <button className="bg-gray-900 hover:bg-gray-800 text-orange-400 p-3 rounded-full border-2 border-orange-600 shadow-xl transition-all duration-300 hover:shadow-orange-500/20 hover:scale-110">
    <Flame size={20} className="animate-pulse" />
  </button>
));

/**
 * Composant sélecteur de classe simplifié
 */
const ClassSelector: React.FC<{
  characterClasses: CharacterClass[];
  selectedClass: CharacterClass | null;
  onClassSelect: (characterClass: CharacterClass) => void;
}> = React.memo(({ characterClasses, selectedClass, onClassSelect }) => (
  <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl shadow-2xl border border-gray-700 p-6 backdrop-blur-sm">
    <h3 className="text-orange-400 font-bold text-lg tracking-wider uppercase mb-6 text-center">
      Classes Héroïques
    </h3>
    <div className="space-y-4">
      {characterClasses.map((charClass) => (
        <div
          key={charClass.id}
          onClick={() => onClassSelect(charClass)}
          className={`
            p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
            ${selectedClass?.id === charClass.id 
              ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/30' 
              : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/70 hover:border-gray-500'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{charClass.avatar}</div>
            <div className="flex-1">
              <h4 className="font-bold text-white">{charClass.name}</h4>
              <p className="text-sm text-gray-400">{charClass.element}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

/**
 * Composant visualiseur de sorts
 */
const SpellViewer: React.FC<{
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
}) => (
  <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl shadow-2xl border border-gray-700 p-6 backdrop-blur-sm">
    <h3 className="text-orange-400 font-bold text-lg tracking-wider uppercase mb-6 text-center">
      Personnalisation
    </h3>
    
    {selectedSpell ? (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">{selectedSpell.icon}</div>
          <h4 className="font-bold text-white text-lg">{selectedSpell.name}</h4>
          <span className={`px-3 py-1 text-xs rounded-full ${
            selectedSpell.type === 'offensive' ? 'bg-red-600/20 text-red-400' :
            selectedSpell.type === 'defensive' ? 'bg-blue-600/20 text-blue-400' :
            selectedSpell.type === 'utility' ? 'bg-green-600/20 text-green-400' :
            'bg-purple-600/20 text-purple-400'
          }`}>
            {selectedSpell.type}
          </span>
        </div>
        <p className="text-gray-300 text-sm text-center">{selectedSpell.description}</p>
      </div>
    ) : (
      <div className="text-center text-gray-400 mb-6">
        <div className="text-4xl mb-2">✨</div>
        <p>Sélectionnez un sort pour voir ses détails</p>
      </div>
    )}

    {/* Personnalisation de l'apparence */}
    <div className="mt-6 space-y-4">
      <div>
        <label className="block text-orange-400 text-sm font-bold mb-2">
          Couleur des cheveux
        </label>
        <select
          value={characterAppearance.hairColor}
          onChange={(e) => onAppearanceChange({ hairColor: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
        >
          <option value="brown">Brun</option>
          <option value="black">Noir</option>
          <option value="blonde">Blond</option>
          <option value="red">Roux</option>
          <option value="white">Blanc</option>
        </select>
      </div>

      <div>
        <label className="block text-orange-400 text-sm font-bold mb-2">
          Couleur des yeux
        </label>
        <select
          value={characterAppearance.eyeColor}
          onChange={(e) => onAppearanceChange({ eyeColor: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
        >
          <option value="brown">Marron</option>
          <option value="blue">Bleu</option>
          <option value="green">Vert</option>
          <option value="hazel">Noisette</option>
          <option value="gray">Gris</option>
        </select>
      </div>

      <div>
        <label className="block text-orange-400 text-sm font-bold mb-2">
          Teint de peau
        </label>
        <select
          value={characterAppearance.skinTone}
          onChange={(e) => onAppearanceChange({ skinTone: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
        >
          <option value="fair">Clair</option>
          <option value="medium">Moyen</option>
          <option value="olive">Olive</option>
          <option value="dark">Foncé</option>
        </select>
      </div>
    </div>

    {/* Bouton de création */}
    <button
      onClick={onCreateCharacter}
      disabled={!isCreationValid()}
      className={`
        w-full mt-6 py-3 rounded-lg font-bold transition-all duration-300
        ${isCreationValid()
          ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-orange-500/30 hover:scale-105'
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      <Crown className="inline mr-2" size={18} />
      Créer le Héros
    </button>
  </div>
));

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
  const [particles, setParticles] = useState<Particle[]>([]);

  // Données de démonstration pour les classes
  const characterClasses: CharacterClass[] = [
    {
      id: 'knight',
      name: 'Chevalier',
      color: '#3b82f6',
      element: 'Lumière',
      description: 'Un défenseur noble qui protège ses alliés avec bravoure et honneur.',
      avatar: '🛡️',
      icon: '🛡️',
      spells: [
        { id: 'shield-bash', name: 'Coup de Bouclier', icon: '🛡️', description: 'Frappe l\'ennemi avec le bouclier', type: 'offensive', unlockedAt: 1 },
        { id: 'healing-light', name: 'Lumière Curative', icon: '✨', description: 'Soigne les blessures mineures', type: 'ultimate', unlockedAt: 3 },
        { id: 'divine-protection', name: 'Protection Divine', icon: '🌟', description: 'Augmente la défense temporairement', type: 'defensive', unlockedAt: 5 }
      ]
    },
    {
      id: 'archer',
      name: 'Archer',
      color: '#10b981',
      element: 'Nature',
      description: 'Un maître de l\'arc qui frappe ses ennemis avec une précision mortelle.',
      avatar: '🏹',
      icon: '🏹',
      spells: [
        { id: 'precise-shot', name: 'Tir Précis', icon: '🎯', description: 'Tir avec précision accrue', type: 'offensive', unlockedAt: 1 },
        { id: 'nature-bond', name: 'Lien Naturel', icon: '🌿', description: 'Communique avec les animaux', type: 'utility', unlockedAt: 3 },
        { id: 'arrow-rain', name: 'Pluie de Flèches', icon: '🌧️', description: 'Attaque de zone dévastatrice', type: 'ultimate', unlockedAt: 6 }
      ]
    },
    {
      id: 'mage',
      name: 'Mage',
      color: '#8b5cf6',
      element: 'Arcane',
      description: 'Un tisseur de sorts qui maîtrise les forces mystiques de l\'univers.',
      avatar: '🔮',
      icon: '🔮',
      spells: [
        { id: 'magic-missile', name: 'Projectile Magique', icon: '✨', description: 'Lance un projectile d\'énergie pure', type: 'offensive', unlockedAt: 1 },
        { id: 'mana-shield', name: 'Bouclier de Mana', icon: '🔵', description: 'Absorbe les dégâts avec la mana', type: 'defensive', unlockedAt: 3 },
        { id: 'teleport', name: 'Téléportation', icon: '🌀', description: 'Se déplace instantanément', type: 'utility', unlockedAt: 4 }
      ]
    }
  ];

  /**
   * Gestion de la création du personnage
   */
  const handleCreateCharacter = useCallback((): void => {
    try {
      const result = onCreateCharacter();
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la création du personnage:', error);
    }
  }, [onCreateCharacter]);

  /**
   * Génération des particules d'animation
   */
  const generateParticles = useCallback((): void => {
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    generateParticles();
  }, [generateParticles]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Arrière-plan MMO sombre identique à l'interface d'authentification */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(30, 41, 59, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(55, 48, 163, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(139, 69, 19, 0.5) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #374151 50%, #1f2937 75%, #111827 100%)
          `
        }}
      />
      
      {/* Overlay de texture */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, rgba(31, 41, 55, 0.2) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(31, 41, 55, 0.2) 25%, transparent 25%)
          `,
          backgroundSize: '400px 400px, 300px 300px, 60px 60px, 60px 60px'
        }}
      />

      {/* Particules magiques flottantes */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}

      {/* Étoiles scintillantes */}
      {Array.from({ length: 8 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className="absolute text-yellow-400 opacity-60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}

      {/* Bouton musique */}
      <div className="absolute top-6 left-6 z-50">
        <MusicToggle />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 mb-2">
            Création de Personnage
          </h1>
          <p className="text-xl text-gray-300">Forgez votre destinée, <span className="text-orange-400 font-bold">{currentUser.username}</span></p>
          
          {/* Bouton retour */}
          <button 
            onClick={onBackToLogin}
            className="absolute top-0 right-0 px-6 py-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all duration-300 backdrop-blur-sm border border-gray-600 hover:border-gray-500"
          >
            ← Retour
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Panneau gauche - Classes */}
          <div className="lg:col-span-3">
            <ClassSelector
              characterClasses={characterClasses}
              selectedClass={selectedClass}
              onClassSelect={onClassSelect}
            />
          </div>

          {/* Panneau central - Aperçu du personnage */}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl shadow-2xl border border-gray-700 p-8 backdrop-blur-sm min-h-96">
              {selectedClass ? (
                <div className="text-center">
                  {/* Avatar géant du personnage */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full blur-xl opacity-50"
                         style={{ backgroundColor: selectedClass.color }}></div>
                    <div className="relative w-48 h-48 mx-auto rounded-full flex items-center justify-center text-8xl border-4 border-gray-600 shadow-2xl"
                         style={{ 
                           background: `linear-gradient(145deg, ${selectedClass.color}20, ${selectedClass.color}40)`,
                           boxShadow: `0 0 40px ${selectedClass.color}40`
                         }}>
                      {selectedClass.avatar}
                    </div>
                  </div>

                  {/* Nom du personnage */}
                  <div className="mb-6">
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => onNameChange(e.target.value)}
                      className="text-3xl font-bold text-center bg-transparent text-white border-b-2 border-gray-600 focus:border-orange-500 focus:outline-none px-4 py-2 transition-colors duration-300"
                      placeholder="Nom du héros"
                      maxLength={20}
                    />
                  </div>

                  {/* Nom et description de la classe */}
                  <h2 className="text-4xl font-bold mb-2" style={{ color: selectedClass.color }}>
                    {selectedClass.name}
                  </h2>
                  <div className="mb-4">
                    <span className="px-4 py-2 rounded-full text-sm font-bold border-2"
                          style={{ 
                            color: selectedClass.color, 
                            borderColor: selectedClass.color,
                            backgroundColor: `${selectedClass.color}20` 
                          }}>
                      Élément: {selectedClass.element}
                    </span>
                  </div>
                  <p className="text-lg text-gray-300 leading-relaxed max-w-lg mx-auto mb-8">
                    {selectedClass.description}
                  </p>

                  {/* Liste de tous les sorts */}
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-orange-400 mb-4">Progression des sorts</h3>
                    <div className="grid gap-3 max-h-80 overflow-y-auto">
                      {selectedClass.spells.map((spell) => {
                        const isUnlocked = spell.unlockedAt <= 6;
                        const isSelected = selectedSpell?.id === spell.id;
                        
                        return (
                          <div
                            key={spell.id}
                            onClick={() => onSpellSelect(spell)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                              isSelected 
                                ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/30'
                                : isUnlocked 
                                  ? 'border-gray-600 bg-gray-800/60 hover:bg-gray-700/70 hover:border-gray-500'
                                  : 'border-gray-800 bg-gray-900/40 hover:bg-gray-800/60 hover:border-gray-700'
                            }`}
                            style={{
                              opacity: isUnlocked ? 1 : 0.6
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`text-2xl ${!isUnlocked ? 'grayscale' : ''}`}>
                                {spell.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                    {spell.name}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      spell.type === 'offensive' ? 'bg-red-600/20 text-red-400' :
                                      spell.type === 'defensive' ? 'bg-blue-600/20 text-blue-400' :
                                      spell.type === 'utility' ? 'bg-green-600/20 text-green-400' :
                                      'bg-purple-600/20 text-purple-400'
                                    }`}>
                                      Niv {spell.unlockedAt}
                                    </span>
                                    {!isUnlocked && (
                                      <span className="text-gray-500 text-xs">🔒</span>
                                    )}
                                  </div>
                                </div>
                                <p className={`text-sm mt-1 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {spell.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-gray-400">
                      ✨ Cliquez sur un sort pour voir ses détails complets
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">🎭</div>
                    <h3 className="text-2xl font-bold mb-2 text-orange-400">Sélectionnez une classe</h3>
                    <p>Choisissez votre voie parmi les classes disponibles</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panneau droit - Détails et personnalisation */}
          <div className="lg:col-span-3">
            <SpellViewer
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
    </div>
  );
};

export default CharacterCreator;