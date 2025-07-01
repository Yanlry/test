/**
 * PANNEAU QUÊTES - JOURNAL DE QUÊTES
 * ✅ Journal de quêtes complet
 * ✅ Suivi des objectifs et progression
 * ✅ Récompenses et historique
 * ✅ Quêtes par catégories
 */

import React, { useState } from 'react';
import { Character } from '../../types/game';
import { 
  X, 
  Scroll, 
  Star, 
  CheckCircle, 
  Clock, 
  Flag, 
  Target,
  Gift,
  Coins,
  Award,
  MapPin,
  Users,
  Crown,
  Sword,
  Shield,
  Search,
  Filter,
  Plus,
  Eye,
  Calendar,
  TrendingUp,
  BookOpen,
  Zap
} from 'lucide-react';

interface QuestsPanelProps {
  character: Character;
  onClose?: () => void;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'main' | 'side' | 'daily' | 'weekly' | 'guild' | 'pvp' | 'dungeon';
  status: 'active' | 'completed' | 'failed' | 'available';
  priority: 'low' | 'medium' | 'high' | 'critical';
  level: number;
  experience: number;
  goldReward: number;
  itemRewards: string[];
  objectives: QuestObjective[];
  giver: string;
  location: string;
  timeLimit?: Date;
  prerequisites?: string[];
  completedAt?: Date;
  startedAt?: Date;
}

interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'talk' | 'explore' | 'craft' | 'deliver';
  target: string;
  currentCount: number;
  requiredCount: number;
  isCompleted: boolean;
}

const QuestsPanel: React.FC<QuestsPanelProps> = ({ character, onClose }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'available' | 'daily'>('active');
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Données de quêtes d'exemple
  const [quests] = useState<Quest[]>([
    {
      id: '1',
      title: 'La Menace des Gobelins',
      description: 'Les gobelins attaquent les marchands sur la route commerciale. Éliminez-les pour sécuriser le passage.',
      category: 'main',
      status: 'active',
      priority: 'high',
      level: 5,
      experience: 500,
      goldReward: 250,
      itemRewards: ['Épée de Fer', 'Potion de Soin'],
      objectives: [
        {
          id: '1a',
          description: 'Éliminer des gobelins',
          type: 'kill',
          target: 'Gobelin',
          currentCount: 8,
          requiredCount: 10,
          isCompleted: false
        },
        {
          id: '1b',
          description: 'Parler au Chef des Marchands',
          type: 'talk',
          target: 'Marchand-Chef',
          currentCount: 0,
          requiredCount: 1,
          isCompleted: false
        }
      ],
      giver: 'Capitaine Marcus',
      location: 'Ville de Départ',
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Collecte Quotidienne',
      description: 'Récoltez des herbes médicinales pour l\'alchimiste.',
      category: 'daily',
      status: 'active',
      priority: 'medium',
      level: 1,
      experience: 100,
      goldReward: 50,
      itemRewards: ['Potion de Mana'],
      objectives: [
        {
          id: '2a',
          description: 'Récolter des herbes curatives',
          type: 'collect',
          target: 'Herbe Curative',
          currentCount: 3,
          requiredCount: 5,
          isCompleted: false
        }
      ],
      giver: 'Alchimiste Vera',
      location: 'Ville de Départ',
      timeLimit: new Date(Date.now() + 20 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Exploration du Temple',
      description: 'Explorez l\'ancien temple de la forêt et découvrez ses secrets.',
      category: 'side',
      status: 'active',
      priority: 'low',
      level: 15,
      experience: 750,
      goldReward: 400,
      itemRewards: ['Amulette Ancienne', 'Parchemin de Sort'],
      objectives: [
        {
          id: '3a',
          description: 'Explorer le Temple de la Forêt',
          type: 'explore',
          target: 'Temple de la Forêt',
          currentCount: 0,
          requiredCount: 1,
          isCompleted: false
        },
        {
          id: '3b',
          description: 'Trouver l\'artefact ancien',
          type: 'collect',
          target: 'Artefact Ancien',
          currentCount: 0,
          requiredCount: 1,
          isCompleted: false
        }
      ],
      giver: 'Érudit Aldric',
      location: 'Cité Magique',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      title: 'Le Héros Légendaire',
      description: 'Votre première grande aventure vous a menée à la gloire. Félicitations !',
      category: 'main',
      status: 'completed',
      priority: 'critical',
      level: 1,
      experience: 200,
      goldReward: 100,
      itemRewards: ['Titre: Aventurier'],
      objectives: [
        {
          id: '4a',
          description: 'Atteindre le niveau 5',
          type: 'explore',
          target: 'Niveau 5',
          currentCount: 1,
          requiredCount: 1,
          isCompleted: true
        }
      ],
      giver: 'Maître d\'Armes',
      location: 'Ville de Départ',
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '5',
      title: 'Défi du Dragon',
      description: 'Affrontez le légendaire Dragon Ancien dans son repaire. Cette quête nécessite un groupe.',
      category: 'dungeon',
      status: 'available',
      priority: 'critical',
      level: 50,
      experience: 5000,
      goldReward: 2500,
      itemRewards: ['Épée Dragonique', 'Armure de Dragon', 'Titre: Tueur de Dragons'],
      objectives: [
        {
          id: '5a',
          description: 'Vaincre le Dragon Ancien',
          type: 'kill',
          target: 'Dragon Ancien',
          currentCount: 0,
          requiredCount: 1,
          isCompleted: false
        }
      ],
      giver: 'Roi Alderon',
      location: 'Château Royal',
      prerequisites: ['Atteindre le niveau 50', 'Compléter "La Menace des Gobelins"']
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'main': return 'text-yellow-400 bg-yellow-400/20 border-yellow-500/50';
      case 'side': return 'text-blue-400 bg-blue-400/20 border-blue-500/50';
      case 'daily': return 'text-green-400 bg-green-400/20 border-green-500/50';
      case 'weekly': return 'text-purple-400 bg-purple-400/20 border-purple-500/50';
      case 'guild': return 'text-red-400 bg-red-400/20 border-red-500/50';
      case 'pvp': return 'text-orange-400 bg-orange-400/20 border-orange-500/50';
      case 'dungeon': return 'text-cyan-400 bg-cyan-400/20 border-cyan-500/50';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-500/50';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'main': return 'Principale';
      case 'side': return 'Secondaire';
      case 'daily': return 'Quotidienne';
      case 'weekly': return 'Hebdomadaire';
      case 'guild': return 'Guilde';
      case 'pvp': return 'JcJ';
      case 'dungeon': return 'Donjon';
      default: return 'Autre';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getObjectiveIcon = (type: string) => {
    switch (type) {
      case 'kill': return <Sword size={14} className="text-red-400" />;
      case 'collect': return <Gift size={14} className="text-blue-400" />;
      case 'talk': return <Users size={14} className="text-green-400" />;
      case 'explore': return <MapPin size={14} className="text-purple-400" />;
      case 'craft': return <Shield size={14} className="text-orange-400" />;
      case 'deliver': return <Flag size={14} className="text-cyan-400" />;
      default: return <Target size={14} className="text-gray-400" />;
    }
  };

  const filteredQuests = quests.filter(quest => {
    const matchesTab = activeTab === 'active' ? quest.status === 'active' :
                      activeTab === 'completed' ? quest.status === 'completed' :
                      activeTab === 'available' ? quest.status === 'available' :
                      activeTab === 'daily' ? quest.category === 'daily' : true;
    
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || quest.category === categoryFilter;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const selectedQuestData = selectedQuest ? quests.find(q => q.id === selectedQuest) : null;

  const getTimeRemaining = (timeLimit: Date) => {
    const now = new Date();
    const diff = timeLimit.getTime() - now.getTime();
    if (diff <= 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const questStats = {
    active: quests.filter(q => q.status === 'active').length,
    completed: quests.filter(q => q.status === 'completed').length,
    available: quests.filter(q => q.status === 'available').length,
    daily: quests.filter(q => q.category === 'daily').length
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      
      {/* HEADER */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Scroll size={24} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Journal de Quêtes</h1>
              <p className="text-gray-400">Suivez vos aventures et objectifs</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-600/40 font-bold">
              {questStats.active} actives
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
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {[
              { id: 'active', name: 'Actives', icon: Clock, count: questStats.active },
              { id: 'completed', name: 'Terminées', icon: CheckCircle, count: questStats.completed },
              { id: 'available', name: 'Disponibles', icon: Flag, count: questStats.available },
              { id: 'daily', name: 'Quotidiennes', icon: Calendar, count: questStats.daily }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                      : 'bg-gray-700/30 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filtres */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher une quête..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none text-sm"
            >
              <option value="all">Toutes catégories</option>
              <option value="main">Principales</option>
              <option value="side">Secondaires</option>
              <option value="daily">Quotidiennes</option>
              <option value="guild">Guilde</option>
              <option value="dungeon">Donjons</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          
          {/* LISTE DES QUÊTES */}
          <div className="flex-1 p-4 space-y-3 border-r border-gray-700">
            {filteredQuests.map((quest) => (
              <div 
                key={quest.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  quest.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                  quest.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                } ${selectedQuest === quest.id ? 'ring-2 ring-indigo-400 border-indigo-500' : ''}`}
                onClick={() => setSelectedQuest(quest.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-bold">{quest.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(quest.category)}`}>
                        {getCategoryName(quest.category)}
                      </span>
                      {quest.priority === 'critical' && (
                        <Star size={14} className="text-yellow-400" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{quest.description}</p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                      Niv. {quest.level}
                    </span>
                    {quest.status === 'completed' && (
                      <CheckCircle size={16} className="text-green-400" />
                    )}
                    {quest.timeLimit && quest.status === 'active' && (
                      <span className="text-xs text-orange-400 flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{getTimeRemaining(quest.timeLimit)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progression des objectifs */}
                {quest.status === 'active' && (
                  <div className="space-y-1">
                    {quest.objectives.slice(0, 2).map((objective) => (
                      <div key={objective.id} className="flex items-center space-x-2 text-xs">
                        {getObjectiveIcon(objective.type)}
                        <span className={objective.isCompleted ? 'text-green-400 line-through' : 'text-gray-300'}>
                          {objective.description}
                        </span>
                        <span className={objective.isCompleted ? 'text-green-400' : 'text-yellow-400'}>
                          ({objective.currentCount}/{objective.requiredCount})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Informations supplémentaires */}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>Donneur: {quest.giver}</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <TrendingUp size={12} />
                      <span>{quest.experience} XP</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Coins size={12} />
                      <span>{quest.goldReward} PO</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredQuests.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-500" />
                <h3 className="text-white font-bold text-xl mb-2">Aucune quête trouvée</h3>
                <p className="text-gray-400">Modifiez vos filtres ou explorez le monde pour découvrir de nouvelles aventures</p>
              </div>
            )}
          </div>

          {/* DÉTAILS DE LA QUÊTE SÉLECTIONNÉE */}
          <div className="w-96 p-6">
            {selectedQuestData ? (
              <div className="space-y-6">
                
                {/* En-tête de la quête */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-white font-bold text-xl">{selectedQuestData.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(selectedQuestData.category)}`}>
                      {getCategoryName(selectedQuestData.category)}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{selectedQuestData.description}</p>
                </div>

                {/* Informations générales */}
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Niveau requis:</span>
                    <span className="text-white font-bold">{selectedQuestData.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Donneur:</span>
                    <span className="text-blue-400">{selectedQuestData.giver}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Lieu:</span>
                    <span className="text-purple-400">{selectedQuestData.location}</span>
                  </div>
                  {selectedQuestData.timeLimit && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Temps restant:</span>
                      <span className="text-orange-400">{getTimeRemaining(selectedQuestData.timeLimit)}</span>
                    </div>
                  )}
                </div>

                {/* Objectifs */}
                <div>
                  <h3 className="text-white font-bold mb-3 flex items-center">
                    <Target size={16} className="mr-2" />
                    Objectifs
                  </h3>
                  <div className="space-y-2">
                    {selectedQuestData.objectives.map((objective) => (
                      <div key={objective.id} className={`p-3 rounded-lg border ${
                        objective.isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-700/30 border-gray-600/30'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {getObjectiveIcon(objective.type)}
                          <span className={`font-medium ${objective.isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                            {objective.description}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${objective.isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}
                              style={{ width: `${(objective.currentCount / objective.requiredCount) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${objective.isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                            {objective.currentCount}/{objective.requiredCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Récompenses */}
                <div>
                  <h3 className="text-white font-bold mb-3 flex items-center">
                    <Gift size={16} className="mr-2" />
                    Récompenses
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center space-x-2">
                        <TrendingUp size={14} />
                        <span>Expérience:</span>
                      </span>
                      <span className="text-blue-400 font-bold">{selectedQuestData.experience.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center space-x-2">
                        <Coins size={14} />
                        <span>Or:</span>
                      </span>
                      <span className="text-yellow-400 font-bold">{selectedQuestData.goldReward.toLocaleString()} PO</span>
                    </div>
                    {selectedQuestData.itemRewards.length > 0 && (
                      <div>
                        <span className="text-gray-400 block mb-2">Objets:</span>
                        <div className="space-y-1">
                          {selectedQuestData.itemRewards.map((item, index) => (
                            <div key={index} className="bg-gray-700/30 px-2 py-1 rounded text-sm text-green-400">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prérequis */}
                {selectedQuestData.prerequisites && selectedQuestData.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-3 flex items-center">
                      <Flag size={16} className="mr-2" />
                      Prérequis
                    </h3>
                    <div className="space-y-1">
                      {selectedQuestData.prerequisites.map((prereq, index) => (
                        <div key={index} className="bg-gray-700/30 px-3 py-2 rounded text-sm text-orange-400">
                          {prereq}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedQuestData.status === 'available' && (
                  <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold">
                    Accepter la quête
                  </button>
                )}
                
                {selectedQuestData.status === 'active' && (
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Suivre la quête
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/40">
                      Abandonner
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Scroll size={48} className="mx-auto mb-4 text-gray-500" />
                <h3 className="text-white font-bold text-xl mb-2">Aucune quête sélectionnée</h3>
                <p className="text-gray-400">Cliquez sur une quête pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestsPanel;