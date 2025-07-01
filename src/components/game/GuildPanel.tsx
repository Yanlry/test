/**
 * PANNEAU GUILDE - GESTION DE GUILDE
 * ✅ Informations de guilde complètes
 * ✅ Liste des membres avec rangs
 * ✅ Système de permissions
 * ✅ Activités et événements
 */

import React, { useState } from 'react';
import { Character } from '../../types/game';
import { 
  X, 
  Shield, 
  Crown, 
  Users, 
  Calendar, 
  Trophy, 
  Coins, 
  Settings, 
  Award,
  Star,
  Sword,
  Clock,
  MapPin,
  MessageSquare,
  Gift,
  Target,
  TrendingUp,
  Edit,
  UserPlus,
  UserMinus
} from 'lucide-react';

interface GuildPanelProps {
  character: Character;
  onClose?: () => void;
}

interface GuildMember {
  id: string;
  name: string;
  level: number;
  className: string;
  rank: 'master' | 'officer' | 'member' | 'recruit';
  status: 'online' | 'offline';
  contribution: number;
  joinDate: Date;
  lastActivity: Date;
  avatar: string;
}

interface GuildEvent {
  id: string;
  title: string;
  description: string;
  type: 'raid' | 'pvp' | 'social' | 'dungeon';
  date: Date;
  participants: string[];
  maxParticipants: number;
  organizer: string;
}

interface GuildQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: string;
  deadline: Date;
}

const GuildPanel: React.FC<GuildPanelProps> = ({ character, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events' | 'quests' | 'treasury'>('overview');

  // Données d'exemple de guilde
  const guildInfo = {
    name: 'Les Templiers du Soleil',
    description: 'Une guilde honorable dédiée à la protection des faibles et à la quête de justice.',
    level: 15,
    experience: 45780,
    maxExperience: 50000,
    memberCount: 45,
    maxMembers: 50,
    founded: new Date('2024-01-15'),
    treasury: 125000,
    banner: '🏰',
    motto: 'Honneur et Courage'
  };

  const [members] = useState<GuildMember[]>([
    {
      id: '1',
      name: 'GrandMaster',
      level: 60,
      className: 'Paladin',
      rank: 'master',
      status: 'online',
      contribution: 15000,
      joinDate: new Date('2024-01-15'),
      lastActivity: new Date(),
      avatar: '👑'
    },
    {
      id: '2',
      name: 'LadyKnight',
      level: 55,
      className: 'Guerrier',
      rank: 'officer',
      status: 'online',
      contribution: 12500,
      joinDate: new Date('2024-02-01'),
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      avatar: '⚔️'
    },
    {
      id: '3',
      name: 'SageWizard',
      level: 52,
      className: 'Mage',
      rank: 'officer',
      status: 'offline',
      contribution: 11000,
      joinDate: new Date('2024-02-10'),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: '🧙‍♂️'
    },
    {
      id: '4',
      name: 'HolyPriest',
      level: 48,
      className: 'Prêtre',
      rank: 'member',
      status: 'online',
      contribution: 8500,
      joinDate: new Date('2024-03-01'),
      lastActivity: new Date(Date.now() - 10 * 60 * 1000),
      avatar: '✨'
    },
    {
      id: '5',
      name: 'NewRecruit',
      level: 25,
      className: 'Voleur',
      rank: 'recruit',
      status: 'offline',
      contribution: 1200,
      joinDate: new Date('2024-05-01'),
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      avatar: '🗡️'
    }
  ]);

  const [events] = useState<GuildEvent[]>([
    {
      id: '1',
      title: 'Raid du Dragon Ancien',
      description: 'Raid hebdomadaire pour farmer les équipements légendaires',
      type: 'raid',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      participants: ['GrandMaster', 'LadyKnight', 'SageWizard'],
      maxParticipants: 8,
      organizer: 'GrandMaster'
    },
    {
      id: '2',
      title: 'Tournoi PvP Interne',
      description: 'Compétition amicale entre membres',
      type: 'pvp',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      participants: ['LadyKnight'],
      maxParticipants: 16,
      organizer: 'LadyKnight'
    }
  ]);

  const [guildQuests] = useState<GuildQuest[]>([
    {
      id: '1',
      title: 'Collection de Ressources',
      description: 'Collecter 1000 minerais rares pour améliorer le donjon de guilde',
      progress: 650,
      maxProgress: 1000,
      reward: '5000 PO + Amélioration donjon',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Victoires en Groupe',
      description: 'Remporter 50 combats en groupe avec des membres de guilde',
      progress: 32,
      maxProgress: 50,
      reward: 'Titre de guilde + Bannière spéciale',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  ]);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'master': return 'text-yellow-400 bg-yellow-400/20';
      case 'officer': return 'text-purple-400 bg-purple-400/20';
      case 'member': return 'text-blue-400 bg-blue-400/20';
      case 'recruit': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getRankName = (rank: string) => {
    switch (rank) {
      case 'master': return 'Maître';
      case 'officer': return 'Officier';
      case 'member': return 'Membre';
      case 'recruit': return 'Recrue';
      default: return 'Inconnu';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'raid': return 'text-red-400 bg-red-400/20';
      case 'pvp': return 'text-orange-400 bg-orange-400/20';
      case 'social': return 'text-green-400 bg-green-400/20';
      case 'dungeon': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      
      {/* HEADER */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
              <Shield size={24} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{guildInfo.name}</h1>
              <p className="text-gray-400">{guildInfo.motto}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-red-600/20 text-red-400 px-4 py-2 rounded-xl border border-red-600/40 font-bold">
              Niveau {guildInfo.level}
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
            { id: 'overview', name: 'Vue d\'ensemble', icon: Shield },
            { id: 'members', name: 'Membres', icon: Users },
            { id: 'events', name: 'Événements', icon: Calendar },
            { id: 'quests', name: 'Quêtes', icon: Target },
            { id: 'treasury', name: 'Trésorerie', icon: Coins }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-red-600/30 text-red-300 border border-red-500/50'
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
          
          {/* ONGLET VUE D'ENSEMBLE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Statistiques de guilde */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="text-blue-400" size={24} />
                    <h3 className="text-white font-bold">Membres</h3>
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {guildInfo.memberCount}/{guildInfo.maxMembers}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(guildInfo.memberCount / guildInfo.maxMembers) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="text-green-400" size={24} />
                    <h3 className="text-white font-bold">Expérience</h3>
                  </div>
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {guildInfo.experience.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(guildInfo.experience / guildInfo.maxExperience) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Coins className="text-yellow-400" size={24} />
                    <h3 className="text-white font-bold">Trésorerie</h3>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {guildInfo.treasury.toLocaleString()} PO
                  </div>
                </div>
              </div>

              {/* Description et informations */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-white font-bold text-xl mb-4">À propos de la guilde</h3>
                <p className="text-gray-300 mb-4">{guildInfo.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Fondée le :</span>
                    <span className="text-white ml-2">{guildInfo.founded.toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Niveau de guilde :</span>
                    <span className="text-white ml-2">{guildInfo.level}</span>
                  </div>
                </div>
              </div>

              {/* Membres en ligne */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-white font-bold text-xl mb-4">Membres en ligne</h3>
                <div className="space-y-3">
                  {members.filter(m => m.status === 'online').map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{member.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getRankColor(member.rank)}`}>
                            {getRankName(member.rank)}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">{member.className} - Niv. {member.level}</span>
                      </div>
                      <div className="w-3 h-3 bg-green-400 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET MEMBRES */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-xl">Membres de la guilde</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center space-x-1">
                    <UserPlus size={14} />
                    <span>Inviter</span>
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm flex items-center space-x-1">
                    <Settings size={14} />
                    <span>Gérer</span>
                  </button>
                </div>
              </div>
              
              {members.map((member) => (
                <div key={member.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                          member.status === 'online' ? 'bg-green-400' : 'bg-gray-500'
                        }`} />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-bold">{member.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${getRankColor(member.rank)}`}>
                            {getRankName(member.rank)}
                          </span>
                          <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                            Niv. {member.level}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{member.className}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Rejoint: {member.joinDate.toLocaleDateString('fr-FR')}</span>
                          <span>Contribution: {member.contribution.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                              title="Message privé">
                        <MessageSquare size={16} />
                      </button>
                      <button className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                              title="Inviter en groupe">
                        <UserPlus size={16} />
                      </button>
                      {member.rank !== 'master' && (
                        <button className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                                title="Exclure">
                          <UserMinus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ONGLET ÉVÉNEMENTS */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-xl">Événements de guilde</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Créer un événement</span>
                </button>
              </div>
              
              {events.map((event) => (
                <div key={event.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-white font-bold text-lg">{event.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${getEventTypeColor(event.type)}`}>
                          {event.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-2">{event.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{event.date.toLocaleDateString('fr-FR')} à {event.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{event.participants.length}/{event.maxParticipants}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Crown size={14} />
                          <span>{event.organizer}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Participer
                    </button>
                  </div>
                  
                  {/* Participants */}
                  <div className="border-t border-gray-700/50 pt-4">
                    <h5 className="text-gray-400 text-sm mb-2">Participants confirmés :</h5>
                    <div className="flex flex-wrap gap-2">
                      {event.participants.map((participant, index) => (
                        <span key={index} className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-sm">
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ONGLET QUÊTES */}
          {activeTab === 'quests' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-xl">Quêtes de guilde</h3>
              
              {guildQuests.map((quest) => (
                <div key={quest.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg mb-2">{quest.title}</h4>
                      <p className="text-gray-300 mb-4">{quest.description}</p>
                      
                      {/* Barre de progression */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Progression</span>
                          <span className="text-white font-bold">{quest.progress}/{quest.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Gift className="text-yellow-400" size={16} />
                          <span className="text-yellow-400">{quest.reward}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Clock size={14} />
                          <span>Échéance: {quest.deadline.toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ONGLET TRÉSORERIE */}
          {activeTab === 'treasury' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-white font-bold text-xl mb-4">Trésorerie de guilde</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Coins className="text-yellow-400" size={20} />
                      <span className="text-gray-400">Fonds disponibles</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400 mb-4">
                      {guildInfo.treasury.toLocaleString()} PO
                    </div>
                    
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Contribuer à la guilde
                      </button>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Historique des transactions
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-bold mb-3">Dernières contributions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                        <span className="text-gray-300">GrandMaster</span>
                        <span className="text-green-400">+5,000 PO</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                        <span className="text-gray-300">LadyKnight</span>
                        <span className="text-green-400">+3,500 PO</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                        <span className="text-gray-300">SageWizard</span>
                        <span className="text-green-400">+2,800 PO</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuildPanel;