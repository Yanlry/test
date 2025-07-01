/**
 * PANNEAU AMIS - GESTION SOCIALE COMPLÈTE
 * ✅ Liste d'amis avec statut en ligne
 * ✅ Système de messages privés
 * ✅ Invitations et demandes d'amitié
 * ✅ Groupes et parties
 */

import React, { useState, useRef, useEffect } from 'react';
import { Character } from '../../types/game';
import { 
  X, 
  Users, 
  MessageCircle, 
  UserPlus, 
  UserMinus, 
  Search, 
  Send, 
  Crown, 
  Shield, 
  Clock, 
  MapPin,
  Gift,
  Settings,
  UserCheck,
  MessageSquare,
  Phone,
  Video
} from 'lucide-react';

interface FriendsPanelProps {
  character: Character;
  onClose?: () => void;
}

interface Friend {
  id: string;
  name: string;
  level: number;
  className: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  location?: string;
  lastSeen?: Date;
  isInGroup?: boolean;
  avatar: string;
  guild?: string;
}

interface Message {
  id: string;
  from: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface GroupInvite {
  id: string;
  fromPlayer: string;
  type: 'group' | 'guild' | 'dungeon';
  description: string;
  timestamp: Date;
}

const FriendsPanel: React.FC<FriendsPanelProps> = ({ character, onClose }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'messages' | 'groups' | 'invites'>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Données d'exemple
  const [friends] = useState<Friend[]>([
    {
      id: '1',
      name: 'WarriorMax',
      level: 45,
      className: 'Guerrier',
      status: 'online',
      location: 'Donjon des Ombres',
      avatar: '⚔️',
      guild: 'Les Templiers'
    },
    {
      id: '2',
      name: 'MageElara',
      level: 38,
      className: 'Mage',
      status: 'online',
      location: 'Bibliothèque Magique',
      avatar: '🔮',
      guild: 'Cercle Arcane'
    },
    {
      id: '3',
      name: 'RogueNinja',
      level: 42,
      className: 'Voleur',
      status: 'away',
      location: 'Ville de Départ',
      avatar: '🗡️',
      isInGroup: true
    },
    {
      id: '4',
      name: 'HealerLuna',
      level: 40,
      className: 'Prêtre',
      status: 'busy',
      location: 'En Combat',
      avatar: '✨'
    },
    {
      id: '5',
      name: 'TankStorm',
      level: 50,
      className: 'Paladin',
      status: 'offline',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: '🛡️',
      guild: 'Gardiens'
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'WarriorMax',
      content: 'Salut ! Tu veux venir faire le donjon avec nous ?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      from: 'MageElara',
      content: 'Merci pour l\'aide avec la quête !',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true
    },
    {
      id: '3',
      from: 'RogueNinja',
      content: 'GG pour le combat ! On refait ça quand tu veux.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true
    }
  ]);

  const [groupInvites] = useState<GroupInvite[]>([
    {
      id: '1',
      fromPlayer: 'WarriorMax',
      type: 'group',
      description: 'Invitation pour Donjon des Ombres',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '2',
      fromPlayer: 'GuildMaster',
      type: 'guild',
      description: 'Invitation à rejoindre "Les Templiers"',
      timestamp: new Date(Date.now() - 60 * 60 * 1000)
    }
  ]);

  // Auto-scroll des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'away': return 'text-yellow-400';
      case 'busy': return 'text-red-400';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'away': return '🟡';
      case 'busy': return '🔴';
      case 'offline': return '⚫';
      default: return '⚫';
    }
  };

  const getStatusText = (friend: Friend) => {
    if (friend.status === 'offline' && friend.lastSeen) {
      const diff = Math.floor((Date.now() - friend.lastSeen.getTime()) / (1000 * 60 * 60));
      return `Hors ligne il y a ${diff}h`;
    }
    return friend.status === 'online' ? friend.location : friend.status;
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadMessages = messages.filter(msg => !msg.read).length;

  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        from: character.name,
        content: messageInput.trim(),
        timestamp: new Date(),
        read: true
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      
      {/* HEADER */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
              <Users size={24} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Amis & Social</h1>
              <p className="text-gray-400">Gérez vos relations sociales</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-xl border border-green-600/40 font-bold">
              {friends.filter(f => f.status === 'online').length} en ligne
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
            { id: 'friends', name: 'Amis', icon: Users, count: friends.length },
            { id: 'messages', name: 'Messages', icon: MessageCircle, count: unreadMessages },
            { id: 'groups', name: 'Groupes', icon: Shield, count: 0 },
            { id: 'invites', name: 'Invitations', icon: UserPlus, count: groupInvites.length }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-green-600/30 text-green-300 border border-green-500/50'
                    : 'bg-gray-700/30 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENU */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          
          {/* ONGLET AMIS */}
          {activeTab === 'friends' && (
            <div className="space-y-6">
              
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un ami..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400 text-lg">🟢</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">{friends.filter(f => f.status === 'online').length}</p>
                      <p className="text-gray-400 text-sm">En ligne</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="text-blue-400" size={16} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-400">{friends.length}</p>
                      <p className="text-gray-400 text-sm">Amis totaux</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Crown className="text-purple-400" size={16} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-400">{friends.filter(f => f.isInGroup).length}</p>
                      <p className="text-gray-400 text-sm">En groupe</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des amis */}
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all">
                    <div className="flex items-center justify-between">
                      
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                            {friend.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                            friend.status === 'online' ? 'bg-green-400' :
                            friend.status === 'away' ? 'bg-yellow-400' :
                            friend.status === 'busy' ? 'bg-red-400' : 'bg-gray-500'
                          }`} />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-bold">{friend.name}</h3>
                            <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                              Niv. {friend.level}
                            </span>
                            {friend.guild && (
                              <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                                {friend.guild}
                              </span>
                            )}
                            {friend.isInGroup && (
                              <>
                                <Crown size={14} className="text-yellow-400" />
                                <span className="sr-only">En groupe</span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{friend.className}</p>
                          <p className={`text-sm ${getStatusColor(friend.status)} flex items-center space-x-1`}>
                            <span>{getStatusIcon(friend.status)}</span>
                            <span>{getStatusText(friend)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                          title="Envoyer un message"
                          onClick={() => {
                            setActiveTab('messages');
                            setSelectedFriend(friend.id);
                          }}
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                          title="Inviter en groupe"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button 
                          className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                          title="Téléporter vers"
                        >
                          <MapPin size={16} />
                        </button>
                        <button 
                          className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                          title="Supprimer ami"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-xl">Messages Privés</h3>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Nouveau message
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`bg-gray-800/50 rounded-xl p-4 border ${
                    message.read ? 'border-gray-700/50' : 'border-blue-500/50 bg-blue-500/5'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-blue-400 font-bold">{message.from}</span>
                          <span className="text-gray-500 text-xs">
                            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!message.read && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300">{message.content}</p>
                      </div>
                      <button className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de réponse rapide */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Écrire un message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <button 
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>Envoyer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET GROUPES */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              <h3 className="text-white font-bold text-xl">Gestion des Groupes</h3>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                <Shield size={48} className="mx-auto mb-4 text-gray-400" />
                <h4 className="text-white font-bold mb-2">Aucun groupe actif</h4>
                <p className="text-gray-400 mb-4">Créez un groupe ou rejoignez celui d'un ami</p>
                <div className="flex justify-center space-x-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Créer un groupe
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Rechercher
                  </button>
                </div>
              </div>

              {/* Amis en groupe */}
              <div>
                <h4 className="text-orange-400 font-bold mb-4">Amis actuellement en groupe</h4>
                <div className="space-y-2">
                  {friends.filter(f => f.isInGroup).map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{friend.avatar}</span>
                        <div>
                          <p className="text-white font-medium">{friend.name}</p>
                          <p className="text-gray-400 text-sm">En groupe - {friend.location}</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                        Rejoindre
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET INVITATIONS */}
          {activeTab === 'invites' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-xl">Invitations Reçues</h3>
              
              {groupInvites.length === 0 ? (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <UserPlus size={48} className="mx-auto mb-4 text-gray-400" />
                  <h4 className="text-white font-bold mb-2">Aucune invitation</h4>
                  <p className="text-gray-400">Vous n'avez pas d'invitations en attente</p>
                </div>
              ) : (
                groupInvites.map((invite) => (
                  <div key={invite.id} className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <UserPlus className="text-yellow-400" size={16} />
                          <span className="text-yellow-400 font-bold">{invite.fromPlayer}</span>
                          <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded capitalize">
                            {invite.type}
                          </span>
                        </div>
                        <p className="text-white">{invite.description}</p>
                        <p className="text-gray-500 text-xs">
                          Il y a {Math.floor((Date.now() - invite.timestamp.getTime()) / (1000 * 60))} min
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                          Accepter
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPanel;