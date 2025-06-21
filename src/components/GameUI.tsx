/**
 * COMPOSANT GAME UI - INTERFACE UTILISATEUR COMME DOFUS
 * ✅ CORRIGÉ: z-index élevé pour passer au-dessus de la map
 * ✅ CORRIGÉ: Plus de barre blanche en bas
 * ✅ CORRIGÉ: Interface toujours visible au premier plan
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Zap, Settings, Users, MessageCircle } from 'lucide-react';

interface GameUIProps {
  currentHP: number;
  maxHP: number;
  currentMP: number;
  maxMP: number;
  spells?: Array<{
    id: number;
    name: string;
    icon: string;
    manaCost: number;
    cooldown: number;
  }>;
  onSpellClick?: (spellId: number) => void;
}

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: Date;
  type: 'general' | 'guild' | 'whisper' | 'system';
}

const GameUI: React.FC<GameUIProps> = ({
  currentHP,
  maxHP,
  currentMP,
  maxMP,
  spells = [],
  onSpellClick
}) => {
  // États pour le chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      username: 'System',
      message: 'Bienvenue dans le jeu !',
      timestamp: new Date(),
      type: 'system'
    },
    {
      id: 2,
      username: 'Joueur1',
      message: 'Salut tout le monde !',
      timestamp: new Date(),
      type: 'general'
    },
    {
      id: 3,
      username: 'MageNoir',
      message: 'Quelqu\'un pour un donjon ?',
      timestamp: new Date(),
      type: 'general'
    }
  ]);
  
  const [chatInput, setChatInput] = useState('');
  const [activeChannel, setActiveChannel] = useState<'general' | 'guild' | 'whisper'>('general');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll du chat vers le bas
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Fonction pour envoyer un message
  const sendMessage = () => {
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now(),
        username: 'Vous',
        message: chatInput.trim(),
        timestamp: new Date(),
        type: activeChannel
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    }
  };

  // Fonction pour gérer l'appui sur Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Calculer les pourcentages pour les barres
  const hpPercentage = (currentHP / maxHP) * 100;
  const mpPercentage = (currentMP / maxMP) * 100;

  // Couleurs des canaux de chat
  const getChannelColor = (type: ChatMessage['type']) => {
    switch (type) {
      case 'general': return 'text-white';
      case 'guild': return 'text-green-400';
      case 'whisper': return 'text-purple-400';
      case 'system': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  // Sorts par défaut si non fournis
  const defaultSpells = [
    { id: 1, name: 'Coup de Dague', icon: '🗡️', manaCost: 10, cooldown: 0 },
    { id: 2, name: 'Furtivité', icon: '👤', manaCost: 20, cooldown: 0 },
    { id: 3, name: 'Poison', icon: '☠️', manaCost: 15, cooldown: 0 },
    { id: 4, name: 'Téléportation', icon: '✨', manaCost: 50, cooldown: 0 },
    { id: 5, name: 'Guérison', icon: '💚', manaCost: 25, cooldown: 0 },
    { id: 6, name: 'Bouclier', icon: '🛡️', manaCost: 30, cooldown: 0 },
    { id: 7, name: 'Fireball', icon: '🔥', manaCost: 35, cooldown: 0 },
    { id: 8, name: 'Gel', icon: '❄️', manaCost: 40, cooldown: 0 }
  ];

  const displaySpells = spells.length > 0 ? spells : defaultSpells;

  return (
    // ✅ CORRIGÉ: z-index très élevé (9999) pour être au-dessus de TOUT
    <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
      
      {/* FOND SEMI-TRANSPARENT POUR L'UI - CORRIGÉ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      
      {/* ✅ STRUCTURE CORRIGÉE : Toute la largeur avec proportions exactes */}
      <div className="relative flex w-full p-4 gap-4 pointer-events-auto">
        
        {/* ========== CHAT INSTANTANÉ À GAUCHE (2/5 de la largeur) ========== */}
        <div className="w-2/5">
          <div className={`bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm transition-all duration-300 shadow-2xl ${
            isChatExpanded ? 'h-64' : 'h-32'
          }`}>
            
            {/* En-tête du chat */}
            <div className="flex items-center justify-between p-2 border-b border-gray-600">
              <div className="flex items-center space-x-2">
                <MessageCircle size={16} className="text-blue-400" />
                <span className="text-white text-sm font-medium">Chat</span>
                <Users size={14} className="text-gray-400" />
                <span className="text-gray-400 text-xs">12 en ligne</span>
              </div>
              
              <button
                onClick={() => setIsChatExpanded(!isChatExpanded)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isChatExpanded ? '▼' : '▲'}
              </button>
            </div>
            
            {/* Onglets des canaux */}
            <div className="flex border-b border-gray-700">
              {[
                { key: 'general', label: 'Général', color: 'text-white' },
                { key: 'guild', label: 'Guilde', color: 'text-green-400' },
                { key: 'whisper', label: 'Privé', color: 'text-purple-400' }
              ].map(channel => (
                <button
                  key={channel.key}
                  onClick={() => setActiveChannel(channel.key as any)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    activeChannel === channel.key
                      ? `${channel.color} border-b-2 border-current`
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {channel.label}
                </button>
              ))}
            </div>
            
            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ height: isChatExpanded ? '160px' : '60px' }}>
              {chatMessages
                .filter(msg => msg.type === activeChannel || msg.type === 'system')
                .slice(-10)
                .map((msg) => (
                <div key={msg.id} className="flex items-start space-x-2 text-xs">
                  <span className="text-gray-500 font-mono">
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`font-medium ${getChannelColor(msg.type)}`}>
                    {msg.username}:
                  </span>
                  <span className="text-gray-200 break-words">{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            {/* Zone de saisie */}
            <div className="flex items-center p-2 border-t border-gray-700">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${activeChannel}...`}
                className="flex-1 bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                maxLength={200}
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim()}
                className="ml-2 p-1 text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* ========== BARRES DE VIE/MP AU CENTRE (1/5 de la largeur) ========== */}
        <div className="w-1/5 flex flex-col justify-end space-y-2">
          
          {/* Barre de Vie */}
          <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg p-3 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="text-red-500" size={20} />
              <span className="text-white text-sm font-medium">
                {currentHP} / {maxHP}
              </span>
              <span className="text-red-400 text-sm font-bold ml-auto">{Math.round(hpPercentage)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full border border-gray-600">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
              />
            </div>
          </div>
          
          {/* Barre de Mana */}
          <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg p-3 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="text-blue-500" size={20} />
              <span className="text-white text-sm font-medium">
                {currentMP} / {maxMP}
              </span>
              <span className="text-blue-400 text-sm font-bold ml-auto">{Math.round(mpPercentage)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full border border-gray-600">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, mpPercentage))}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* ========== BARRE DE SORTS À DROITE (2/5 de la largeur) ========== */}
        <div className="w-2/5 flex justify-end">
          <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg p-3 backdrop-blur-sm w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-medium">Sorts</h3>
              <Settings size={16} className="text-gray-400" />
            </div>
            
            {/* Grille de sorts 4x2 */}
            <div className="grid grid-cols-4 gap-2">
              {displaySpells.slice(0, 8).map((spell, index) => (
                <button
                  key={spell.id}
                  onClick={() => onSpellClick?.(spell.id)}
                  className="relative w-12 h-12 bg-gray-800 border-2 border-gray-600 rounded-lg hover:border-orange-400 transition-all duration-200 flex items-center justify-center group"
                  title={`${spell.name} (${spell.manaCost} MP)`}
                >
                  {/* Icône du sort */}
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {spell.icon}
                  </span>
                  
                  {/* Raccourci clavier (1-8) */}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center border border-gray-500">
                    {index + 1}
                  </span>
                  
                  {/* Coût en mana */}
                  <span className="absolute -top-1 -left-1 bg-blue-600 text-white text-xs px-1 rounded">
                    {spell.manaCost}
                  </span>
                  
                  {/* Tooltip au survol */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {spell.name}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Indicateur de raccourcis */}
            <div className="mt-2 text-xs text-gray-400 text-center">
              Touches 1-8 pour lancer
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default GameUI;