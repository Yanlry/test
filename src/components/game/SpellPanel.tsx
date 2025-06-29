/**
 * PANNEAU SORTS - GRIMOIRE COMPLET
 * ✅ Interface dédiée uniquement aux sorts
 * ✅ Progression magique détaillée
 * ✅ Écoles de magie et spécialisations
 * ✅ Statistiques de lancement de sorts
 */

import React, { useState } from 'react';
import { Character } from '../../types/game';
import { DEFAULT_SPELLS } from '../../utils/gameConstants';
import { X, Star, Sparkles, Book, Brain, Award, TrendingUp, Lock, Unlock, Search } from 'lucide-react';

interface SpellsPanelProps {
  character: Character;
  onClose?: () => void;
  selectedSpellId?: number | null;
  onSpellSelect?: (spellId: number) => void;
}

// Type étendu pour les sorts avec propriétés optionnelles
interface ExtendedSpell {
  id: number;
  name: string;
  icon: string;
  manaCost: number;
  cooldown: number;
  type?: 'damage' | 'heal' | 'buff';
  description?: string;
  range?: number;
  school?: string;
}

/**
 * Composant de sort détaillé
 */
const SpellCard: React.FC<{
  spell: ExtendedSpell;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ spell, index, isSelected = false, onClick }) => {
  const isUnlocked = index < 6; // Plus de sorts débloqués pour la démo
  const spellType = spell.type || 'damage';
  const spellDescription = spell.description || `Sort ${spell.name} - Coût: ${spell.manaCost || 0} mana`;
  const spellRange = spell.range || 3;
  const spellSchool = spell.school || 'Générale';
  
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border transition-all text-left group hover:scale-105 cursor-pointer ${
        isSelected 
          ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-orange-600/30 shadow-lg shadow-yellow-500/20' 
          : isUnlocked 
            ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-orange-600/20 hover:from-orange-500/20 hover:to-orange-600/30 shadow-lg shadow-orange-500/10' 
            : 'border-gray-600/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50'
      }`}
      title={`${spell.name} - ${spell.manaCost || 0} mana`}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all ${
          isSelected 
            ? 'border-yellow-500 bg-yellow-500/20 scale-110' 
            : isUnlocked 
              ? 'border-orange-500/50 bg-orange-500/10 group-hover:scale-105' 
              : 'border-gray-600 bg-gray-800/50'
        }`}>
          <div className="text-3xl group-hover:scale-110 transition-transform">
            {spell.icon}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <p className="text-white font-bold text-lg">{spell.name}</p>
              {isSelected && <Star className="text-yellow-400" size={16} />}
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-sm border border-blue-600/30 font-medium">
                {spell.manaCost || 0} MP
              </span>
              {isUnlocked ? (
                <Unlock className="text-green-400" size={16} />
              ) : (
                <Lock className="text-gray-500" size={16} />
              )}
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-2 leading-relaxed">
            {spellDescription}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>Portée: {spellRange}</span>
              <span>Type: {spellType === 'damage' ? 'Dégâts' : spellType === 'heal' ? 'Soin' : spellType === 'buff' ? 'Buff' : 'Dégâts'}</span>
              <span>École: {spellSchool}</span>
            </div>
            <div className="text-xs text-gray-500">
              {isUnlocked ? '✅ Disponible' : '🔒 Niveau requis: ' + (10 + index * 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant d'école de magie
 */
const MagicSchoolCard: React.FC<{
  school: {
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    description: string;
    spellsCount: number;
    mastery: number;
  };
}> = ({ school }) => {
  return (
    <div className={`${school.bgColor} rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-3xl">{school.icon}</div>
        <div>
          <h4 className={`${school.color} font-bold text-lg`}>{school.name}</h4>
          <p className="text-gray-400 text-sm">{school.description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">Maîtrise</span>
          <span className={`${school.color} font-bold`}>{school.mastery}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${school.color.replace('text-', 'from-').replace('-400', '-600')} to-${school.color.replace('text-', '').replace('-400', '-400')}`}
            style={{ width: `${school.mastery}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-xs">{school.spellsCount} sorts maîtrisés</p>
      </div>
    </div>
  );
};

const SpellsPanel: React.FC<SpellsPanelProps> = ({
  character,
  onClose,
  selectedSpellId,
  onSpellSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'damage' | 'heal' | 'buff'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Configuration des écoles de magie
  const magicSchools = [
    {
      name: 'Feu',
      icon: '🔥',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      description: 'Dégâts et destruction',
      spellsCount: 4,
      mastery: 75
    },
    {
      name: 'Eau',
      icon: '💧',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      description: 'Soins et protection',
      spellsCount: 3,
      mastery: 60
    },
    {
      name: 'Terre',
      icon: '🌍',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      description: 'Défense et résistance',
      spellsCount: 2,
      mastery: 45
    },
    {
      name: 'Air',
      icon: '💨',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      description: 'Vitesse et mobilité',
      spellsCount: 3,
      mastery: 80
    }
  ];

  // Conversion des sorts avec types étendus
  const extendedSpells: ExtendedSpell[] = DEFAULT_SPELLS.map((spell, index) => ({
    ...spell,
    type: index % 3 === 0 ? 'damage' : index % 3 === 1 ? 'heal' : 'buff',
    description: `Sort ${spell.name} - Coût: ${spell.manaCost || 0} mana`,
    range: 3 + (index % 4),
    school: ['Feu', 'Eau', 'Terre', 'Air'][index % 4]
  }));

  // Filtrage des sorts
  const filteredSpells = extendedSpells.filter(spell => {
    const matchesCategory = selectedCategory === 'all' || spell.type === selectedCategory;
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      
      {/* HEADER FIXE */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Book size={24} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Grimoire de Sorts</h1>
              <p className="text-gray-400">Maîtrisez l'art de la magie</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600/20 text-purple-400 px-4 py-2 rounded-xl border border-purple-600/40 font-bold">
              {filteredSpells.filter((_, i) => i < 6).length}/{DEFAULT_SPELLS.length} sorts maîtrisés
            </div>
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
          
          {/* GRILLE EN 3 COLONNES */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* COLONNE DE GAUCHE - Écoles de magie */}
            <div className="col-span-4 space-y-6">
              
              {/* Progression générale */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-purple-400 font-bold text-xl mb-6 flex items-center">
                  <Sparkles size={24} className="mr-3" />
                  Progression Magique
                </h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-purple-500/20 border-4 border-purple-500/50 flex items-center justify-center mx-auto mb-4">
                      <div className="text-2xl">🎭</div>
                    </div>
                    <h4 className="text-white font-bold text-lg">{character.name}</h4>
                    <p className="text-purple-400 font-medium">Mage Niveau {character.level}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300">Expérience magique:</span>
                      <span className="text-purple-400 font-bold">2,450</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300">Sorts lancés:</span>
                      <span className="text-blue-400 font-bold">156</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300">Dégâts magiques:</span>
                      <span className="text-red-400 font-bold">4,280</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300">Soins prodigués:</span>
                      <span className="text-green-400 font-bold">1,890</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Écoles de magie */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-orange-400 font-bold text-xl mb-6 flex items-center">
                  <Brain size={24} className="mr-3" />
                  Écoles de Magie
                </h3>
                
                <div className="space-y-4">
                  {magicSchools.map((school, index) => (
                    <MagicSchoolCard key={index} school={school} />
                  ))}
                </div>
              </div>

              {/* Statistiques avancées */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-cyan-400 font-bold text-xl mb-6 flex items-center">
                  <TrendingUp size={24} className="mr-3" />
                  Maîtrise Magique
                </h3>
                
                <div className="space-y-4">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm">Précision des sorts</span>
                      <span className="text-green-400 font-bold">94%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm">Efficacité magique</span>
                      <span className="text-blue-400 font-bold">87%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm">Résistance magique</span>
                      <span className="text-purple-400 font-bold">72%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DE DROITE - Liste des sorts */}
            <div className="col-span-8 space-y-6">
              
              {/* Filtres et recherche */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <div className="flex items-center justify-between space-x-4">
                  
                  {/* Barre de recherche */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher un sort..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  {/* Filtres par catégorie */}
                  <div className="flex space-x-2">
                    {[
                      { id: 'all', name: 'Tous', icon: '✨' },
                      { id: 'damage', name: 'Dégâts', icon: '⚔️' },
                      { id: 'heal', name: 'Soins', icon: '💚' },
                      { id: 'buff', name: 'Buffs', icon: '🛡️' }
                    ].map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === category.id
                            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                            : 'bg-gray-700/30 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30'
                        }`}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Liste des sorts */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-purple-400 font-bold text-xl mb-6 flex items-center">
                  <Book size={24} className="mr-3" />
                  Sorts Disponibles
                  <span className="ml-3 text-sm text-gray-400">({filteredSpells.length} sorts)</span>
                </h3>
                
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {filteredSpells.map((spell, index) => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      index={index}
                      isSelected={selectedSpellId === spell.id}
                      onClick={() => onSpellSelect?.(spell.id)}
                    />
                  ))}
                </div>

                {filteredSpells.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-400">Aucun sort trouvé avec ces critères</p>
                  </div>
                )}
              </div>

              {/* Prochains sorts à débloquer */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-yellow-400 font-bold text-xl mb-6 flex items-center">
                  <Award size={24} className="mr-3" />
                  Prochains Débloquages
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-gray-800/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🌟</div>
                      <div>
                        <p className="text-white font-bold">Sort de Téléportation</p>
                        <p className="text-gray-400 text-sm">Déplacement instantané</p>
                      </div>
                    </div>
                    <span className="text-yellow-400 font-bold">Niveau 12</span>
                  </div>
                  
                  <div className="p-4 bg-gray-800/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">❄️</div>
                      <div>
                        <p className="text-white font-bold">Blizzard</p>
                        <p className="text-gray-400 text-sm">Dégâts de zone glaciale</p>
                      </div>
                    </div>
                    <span className="text-yellow-400 font-bold">Niveau 15</span>
                  </div>
                  
                  <div className="p-4 bg-gray-800/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">⚡</div>
                      <div>
                        <p className="text-white font-bold">Chaîne d'Éclairs</p>
                        <p className="text-gray-400 text-sm">Électrocute plusieurs ennemis</p>
                      </div>
                    </div>
                    <span className="text-yellow-400 font-bold">Niveau 18</span>
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

export default SpellsPanel;