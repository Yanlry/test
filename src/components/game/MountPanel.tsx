/**
 * PANNEAU MONTURES - GESTION DES MONTURES
 * ✅ Collection de montures complète
 * ✅ Statistiques et capacités
 * ✅ Système d'équipement de monture
 * ✅ Élevage et amélioration
 */

import React, { useState } from 'react';
import { Character } from '../../types/game';
import { 
  X, 
  Crown, 
  Star, 
  Heart, 
  Zap, 
  Wind, 
  Shield, 
  Plus,
  Settings,
  Award,
  TrendingUp,
  Clock,
  Gift,
  Sparkles,
  Target,
  Users,
  Search,
  Filter,
  Lock,
  Unlock
} from 'lucide-react';

interface MountPanelProps {
  character: Character;
  onClose?: () => void;
}

interface Mount {
  id: string;
  name: string;
  species: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level: number;
  experience: number;
  maxExperience: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  speed: number;
  carrying: number;
  reproduction: number;
  isEquipped: boolean;
  avatar: string;
  color: string;
  abilities: string[];
  acquired: Date;
  isUnlocked: boolean;
  unlockCondition?: string;
}

interface MountEquipment {
  id: string;
  name: string;
  type: 'saddle' | 'bridle' | 'horseshoe' | 'armor';
  bonuses: {
    speed?: number;
    health?: number;
    stamina?: number;
    carrying?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  equipped: boolean;
}

const MountPanel: React.FC<MountPanelProps> = ({ character, onClose }) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'stable' | 'breeding' | 'equipment'>('collection');
  const [selectedMount, setSelectedMount] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');

  // Collection de montures
  const [mounts] = useState<Mount[]>([
    {
      id: '1',
      name: 'Tonnerre',
      species: 'Cheval de Guerre',
      rarity: 'legendary',
      level: 25,
      experience: 8750,
      maxExperience: 10000,
      health: 450,
      maxHealth: 500,
      stamina: 320,
      maxStamina: 350,
      speed: 95,
      carrying: 180,
      reproduction: 75,
      isEquipped: true,
      avatar: '🐎',
      color: '#FFD700',
      abilities: ['Charge', 'Galop Éternel', 'Résistance Magique'],
      acquired: new Date('2024-03-15'),
      isUnlocked: true
    },
    {
      id: '2',
      name: 'Ombre-Lune',
      species: 'Loup Spectral',
      rarity: 'epic',
      level: 18,
      experience: 4200,
      maxExperience: 6000,
      health: 280,
      maxHealth: 320,
      stamina: 420,
      maxStamina: 450,
      speed: 105,
      carrying: 120,
      reproduction: 60,
      isEquipped: false,
      avatar: '🐺',
      color: '#9932CC',
      abilities: ['Invisibilité', 'Saut Dimensionnel'],
      acquired: new Date('2024-04-02'),
      isUnlocked: true
    },
    {
      id: '3',
      name: 'Éclair-Doré',
      species: 'Griffon Royal',
      rarity: 'legendary',
      level: 1,
      experience: 0,
      maxExperience: 1000,
      health: 200,
      maxHealth: 600,
      stamina: 300,
      maxStamina: 500,
      speed: 120,
      carrying: 200,
      reproduction: 90,
      isEquipped: false,
      avatar: '🦅',
      color: '#FFD700',
      abilities: ['Vol', 'Cri Perçant', 'Vision Aérienne'],
      acquired: new Date(),
      isUnlocked: true
    },
    {
      id: '4',
      name: 'Flamme-Éternelle',
      species: 'Dragon Mineur',
      rarity: 'legendary',
      level: 0,
      experience: 0,
      maxExperience: 1000,
      health: 0,
      maxHealth: 800,
      stamina: 0,
      maxStamina: 600,
      speed: 80,
      carrying: 300,
      reproduction: 95,
      isEquipped: false,
      avatar: '🐲',
      color: '#FF4500',
      abilities: ['Souffle de Feu', 'Vol Supérieur', 'Immunité Feu'],
      acquired: new Date(),
      isUnlocked: false,
      unlockCondition: 'Vaincre le Dragon des Flammes Anciennes'
    }
  ]);

  const [equipment] = useState<MountEquipment[]>([
    {
      id: '1',
      name: 'Selle du Conquistador',
      type: 'saddle',
      bonuses: { speed: 10, carrying: 50 },
      rarity: 'epic',
      equipped: true
    },
    {
      id: '2',
      name: 'Bride Enchantée',
      type: 'bridle',
      bonuses: { speed: 15, stamina: 25 },
      rarity: 'rare',
      equipped: true
    },
    {
      id: '3',
      name: 'Fers Mithril',
      type: 'horseshoe',
      bonuses: { speed: 20, health: 30 },
      rarity: 'legendary',
      equipped: false
    }
  ]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'epic': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
      case 'rare': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
      case 'common': return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
      default: return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'Légendaire';
      case 'epic': return 'Épique';
      case 'rare': return 'Rare';
      case 'common': return 'Commun';
      default: return 'Inconnu';
    }
  };

  const filteredMounts = mounts.filter(mount => {
    const matchesSearch = mount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mount.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter === 'all' || mount.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  const selectedMountData = selectedMount ? mounts.find(m => m.id === selectedMount) : null;

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      
      {/* HEADER */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
              <Crown size={24} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Écurie & Montures</h1>
              <p className="text-gray-400">Gérez votre collection de montures</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-600/20 text-yellow-400 px-4 py-2 rounded-xl border border-yellow-600/40 font-bold">
              {mounts.filter(m => m.isUnlocked).length}/{mounts.length} débloquées
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

      {/* NAVIGATION */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700/50">
        <div className="flex space-x-2">
          {[
            { id: 'collection', name: 'Collection', icon: Crown },
            { id: 'stable', name: 'Écurie', icon: Heart },
            { id: 'breeding', name: 'Élevage', icon: Sparkles },
            { id: 'equipment', name: 'Équipement', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50'
                    : 'bg-gray-700/30 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENU */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          
          {/* ONGLET COLLECTION */}
          {activeTab === 'collection' && (
            <div className="space-y-6">
              
              {/* Filtres */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher une monture..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="all">Toutes les raretés</option>
                  <option value="legendary">Légendaire</option>
                  <option value="epic">Épique</option>
                  <option value="rare">Rare</option>
                  <option value="common">Commun</option>
                </select>
              </div>

              {/* Grille des montures */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMounts.map((mount) => (
                  <div 
                    key={mount.id} 
                    className={`rounded-xl p-6 border transition-all cursor-pointer ${
                      mount.isUnlocked 
                        ? `${getRarityColor(mount.rarity)} hover:scale-105 transform-gpu`
                        : 'border-gray-600/50 bg-gray-800/30 opacity-50'
                    } ${selectedMount === mount.id ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => mount.isUnlocked && setSelectedMount(mount.id)}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4 relative">
                        {mount.avatar}
                        {mount.isEquipped && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Star size={12} className="text-white" />
                          </div>
                        )}
                        {!mount.isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <Lock size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-white font-bold text-lg mb-1">{mount.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{mount.species}</p>
                      
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRarityColor(mount.rarity)}`}>
                        {getRarityName(mount.rarity)}
                      </div>
                      
                      {mount.isUnlocked ? (
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Niveau</span>
                            <span className="text-white font-bold">{mount.level}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Vitesse</span>
                            <span className="text-yellow-400 font-bold">{mount.speed}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <p className="text-gray-500 text-xs">{mount.unlockCondition}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET ÉCURIE (Détails de la monture sélectionnée) */}
          {activeTab === 'stable' && (
            <div className="space-y-6">
              
              {selectedMountData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Informations principales */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="text-center mb-6">
                      <div className="text-8xl mb-4">{selectedMountData.avatar}</div>
                      <h2 className="text-white font-bold text-2xl mb-2">{selectedMountData.name}</h2>
                      <p className="text-gray-400 mb-2">{selectedMountData.species}</p>
                      <div className={`inline-block px-3 py-1 rounded ${getRarityColor(selectedMountData.rarity)}`}>
                        {getRarityName(selectedMountData.rarity)}
                      </div>
                    </div>
                    
                    {/* Barre d'expérience */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Expérience</span>
                        <span className="text-white">{selectedMountData.experience}/{selectedMountData.maxExperience}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ width: `${(selectedMountData.experience / selectedMountData.maxExperience) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {!selectedMountData.isEquipped ? (
                        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Équiper
                        </button>
                      ) : (
                        <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg cursor-not-allowed">
                          Équipée
                        </button>
                      )}
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Nourrir
                      </button>
                    </div>
                  </div>

                  {/* Statistiques détaillées */}
                  <div className="space-y-4">
                    
                    {/* Stats principales */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-white font-bold text-lg mb-4">Statistiques</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 flex items-center space-x-2">
                              <Heart size={16} className="text-red-400" />
                              <span>Santé</span>
                            </span>
                            <span className="text-white">{selectedMountData.health}/{selectedMountData.maxHealth}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${(selectedMountData.health / selectedMountData.maxHealth) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 flex items-center space-x-2">
                              <Zap size={16} className="text-blue-400" />
                              <span>Endurance</span>
                            </span>
                            <span className="text-white">{selectedMountData.stamina}/{selectedMountData.maxStamina}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(selectedMountData.stamina / selectedMountData.maxStamina) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                              <Wind size={16} className="text-yellow-400" />
                              <span className="text-gray-400 text-sm">Vitesse</span>
                            </div>
                            <span className="text-yellow-400 font-bold text-xl">{selectedMountData.speed}</span>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                              <Target size={16} className="text-green-400" />
                              <span className="text-gray-400 text-sm">Portage</span>
                            </div>
                            <span className="text-green-400 font-bold text-xl">{selectedMountData.carrying}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Capacités spéciales */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-white font-bold text-lg mb-4">Capacités Spéciales</h3>
                      <div className="space-y-2">
                        {selectedMountData.abilities.map((ability, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700/30 rounded">
                            <Sparkles size={16} className="text-purple-400" />
                            <span className="text-gray-300">{ability}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🐎</div>
                  <h3 className="text-white font-bold text-xl mb-2">Aucune monture sélectionnée</h3>
                  <p className="text-gray-400">Sélectionnez une monture dans l'onglet Collection pour voir ses détails</p>
                </div>
              )}
            </div>
          )}

          {/* ONGLET ÉLEVAGE */}
          {activeTab === 'breeding' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🥚</div>
                <h3 className="text-white font-bold text-xl mb-2">Élevage de Montures</h3>
                <p className="text-gray-400 mb-6">Élevez et améliorez vos montures pour obtenir de nouveaux spécimens</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h4 className="text-white font-bold mb-4">Reproduction</h4>
                    <p className="text-gray-300 text-sm mb-4">Associez deux montures pour créer une descendance unique</p>
                    <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                      Commencer l'élevage
                    </button>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h4 className="text-white font-bold mb-4">Amélioration</h4>
                    <p className="text-gray-300 text-sm mb-4">Utilisez des objets spéciaux pour améliorer vos montures</p>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Améliorer une monture
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET ÉQUIPEMENT */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              <h3 className="text-white font-bold text-xl">Équipement de Monture</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {equipment.map((item) => (
                  <div key={item.id} className={`rounded-xl p-6 border ${getRarityColor(item.rarity)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-white font-bold text-lg mb-1">{item.name}</h4>
                        <p className="text-gray-400 text-sm capitalize">{item.type}</p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getRarityColor(item.rarity)}`}>
                          {getRarityName(item.rarity)}
                        </div>
                      </div>
                      {item.equipped ? (
                        <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                          Équipé
                        </span>
                      ) : (
                        <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm">
                          Équiper
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-gray-400 text-sm font-medium">Bonus :</h5>
                      {Object.entries(item.bonuses).map(([stat, value]) => (
                        <div key={stat} className="flex justify-between items-center text-sm">
                          <span className="text-gray-300 capitalize">{stat} :</span>
                          <span className="text-green-400 font-bold">+{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MountPanel;