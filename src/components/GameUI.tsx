/**
 * COMPOSANT GAME UI - VERSION AVEC SORTS FONCTIONNELS
 * ✅ CORRIGÉ: Les sorts coûtent maintenant des PA (Points d'Action)
 * ✅ NOUVEAU: Sorts avec effets réels (dégâts, soins, buffs)
 * ✅ NOUVEAU: Système de sorts adapté au combat Dofus
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, ShoppingCart, Settings, Users, MessageCircle, Package, Swords, Footprints, Globe, Shield, Mail, User } from 'lucide-react';

// ✅ NOUVEAU: Liste de sorts avec coûts en PA et effets réels
const TOUS_LES_SORTS = [
  { 
    id: 1, 
    name: 'Coup de Dague', 
    icon: '🗡️', 
    paCost: 3, 
    description: 'Attaque rapide (15-25 dégâts)', 
    type: 'damage',
    minDamage: 15,
    maxDamage: 25,
    range: 1
  },
  { 
    id: 2, 
    name: 'Attaque Puissante', 
    icon: '⚔️', 
    paCost: 4, 
    description: 'Attaque forte (25-35 dégâts)', 
    type: 'damage',
    minDamage: 25,
    maxDamage: 35,
    range: 1
  },
  { 
    id: 3, 
    name: 'Poison', 
    icon: '☠️', 
    paCost: 2, 
    description: 'Empoisonne (10-15 dégâts)', 
    type: 'damage',
    minDamage: 10,
    maxDamage: 15,
    range: 2
  },
  { 
    id: 4, 
    name: 'Soin Mineur', 
    icon: '💚', 
    paCost: 3, 
    description: 'Soigne 20-30 PV', 
    type: 'heal',
    minHeal: 20,
    maxHeal: 30,
    range: 3
  },
  { 
    id: 5, 
    name: 'Fireball', 
    icon: '🔥', 
    paCost: 4, 
    description: 'Boule de feu (30-40 dégâts)', 
    type: 'damage',
    minDamage: 30,
    maxDamage: 40,
    range: 4
  },
  { 
    id: 6, 
    name: 'Soin Majeur', 
    icon: '✨', 
    paCost: 5, 
    description: 'Soigne 40-50 PV', 
    type: 'heal',
    minHeal: 40,
    maxHeal: 50,
    range: 2
  },
  { 
    id: 7, 
    name: 'Éclair', 
    icon: '⚡', 
    paCost: 5, 
    description: 'Attaque électrique (35-45 dégâts)', 
    type: 'damage',
    minDamage: 35,
    maxDamage: 45,
    range: 5
  },
  { 
    id: 8, 
    name: 'Gel', 
    icon: '❄️', 
    paCost: 3, 
    description: 'Gèle l\'ennemi (20-25 dégâts)', 
    type: 'damage',
    minDamage: 20,
    maxDamage: 25,
    range: 3
  },
  { 
    id: 9, 
    name: 'Régénération', 
    icon: '🌟', 
    paCost: 4, 
    description: 'Régénère 30-40 PV', 
    type: 'heal',
    minHeal: 30,
    maxHeal: 40,
    range: 1
  },
  { 
    id: 10, 
    name: 'Explosion', 
    icon: '💥', 
    paCost: 6, 
    description: 'Explosion (50-60 dégâts)', 
    type: 'damage',
    minDamage: 50,
    maxDamage: 60,
    range: 2
  },
  { 
    id: 11, 
    name: 'Météore', 
    icon: '☄️', 
    paCost: 6, 
    description: 'Météore dévastateur (60-80 dégâts)', 
    type: 'damage',
    minDamage: 60,
    maxDamage: 80,
    range: 6
  },
  { 
    id: 12, 
    name: 'Protection', 
    icon: '🛡️', 
    paCost: 2, 
    description: 'Augmente la défense', 
    type: 'buff',
    effect: 'defense',
    value: 10,
    range: 1
  },
  { 
    id: 13, 
    name: 'Bénédiction', 
    icon: '🙏', 
    paCost: 3, 
    description: 'Soigne 35-45 PV', 
    type: 'heal',
    minHeal: 35,
    maxHeal: 45,
    range: 4
  },
  { 
    id: 14, 
    name: 'Nova', 
    icon: '🌠', 
    paCost: 5, 
    description: 'Attaque en zone (40-50 dégâts)', 
    type: 'damage',
    minDamage: 40,
    maxDamage: 50,
    range: 3
  },
  { 
    id: 15, 
    name: 'Résurrection', 
    icon: '🔮', 
    paCost: 6, 
    description: 'Restaure tous les PV', 
    type: 'heal',
    minHeal: 999,
    maxHeal: 999,
    range: 1
  },
  { 
    id: 16, 
    name: 'Apocalypse', 
    icon: '💀', 
    paCost: 6, 
    description: 'Sort ultime (80-100 dégâts)', 
    type: 'damage',
    minDamage: 80,
    maxDamage: 100,
    range: 8
  }
];

interface GameUIProps {
  currentHP: number;
  maxHP: number;
  currentMP: number;
  maxMP: number;
  currentPA?: number;
  maxPA?: number;
  currentPM?: number;
  maxPM?: number;
  spells?: Array<{
    id: number;
    name: string;
    icon: string;
    manaCost: number;
    cooldown: number;
  }>;
  onSpellClick?: (spellId: number) => void;
  onInventoryClick?: () => void;
  onCharacterClick?: () => void;
}

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: Date;
  type: 'general' | 'guild' | 'whisper' | 'system' | 'commerce';
}

const GameUI: React.FC<GameUIProps> = ({
  currentHP,
  maxHP,
  currentMP,
  maxMP,
  currentPA = 10,
  maxPA = 10,
  currentPM = 5,
  maxPM = 5,
  spells = [],
  onSpellClick,
  onInventoryClick,
  onCharacterClick
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
    },
    {
      id: 4,
      username: 'Archer42',
      message: 'J\'ai trouvé un équipement rare !',
      timestamp: new Date(),
      type: 'general'
    },
    {
      id: 5,
      username: 'Healer',
      message: 'Besoin d\'aide pour une quête',
      timestamp: new Date(),
      type: 'general'
    },
    {
      id: 6,
      username: 'GuildMaster',
      message: 'Réunion de guilde à 20h',
      timestamp: new Date(),
      type: 'guild'
    }
  ]);
  
  const [chatInput, setChatInput] = useState('');
  const [activeChannel, setActiveChannel] = useState<'general' | 'guild' | 'commerce' | 'whisper'>('general');
  
  // État pour la hauteur du chat (3 tailles possibles)
  const [chatHeight, setChatHeight] = useState<'normal' | 'medium' | 'large'>('normal');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll du chat vers le bas
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Fonction pour changer la hauteur du chat
  const toggleChatHeight = () => {
    setChatHeight(current => {
      if (current === 'normal') return 'medium';  // Normal → Moyen
      if (current === 'medium') return 'large';   // Moyen → Grand
      return 'normal';                            // Grand → Normal (cycle)
    });
  };

  // Fonction qui retourne SEULEMENT la hauteur du chat interne
  const getChatHeightClass = () => {
    switch (chatHeight) {
      case 'normal': 
        return 'h-full'; // Hauteur normale (192px) - remplit tout le conteneur
      case 'medium': 
        return 'h-64'; // Hauteur moyenne (256px)
      case 'large': 
        return 'h-80'; // Grande hauteur (320px)
      default: 
        return 'h-full';
    }
  };

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

  // ✅ NOUVEAU: Fonction pour obtenir la couleur du sort selon son coût
  const getSpellBorderColor = (paCost: number, currentPA: number) => {
    if (paCost > currentPA) {
      return 'border-red-500'; // Rouge si pas assez de PA
    } else if (paCost >= 5) {
      return 'border-purple-500'; // Violet pour sorts puissants
    } else if (paCost >= 3) {
      return 'border-orange-500'; // Orange pour sorts moyens
    } else {
      return 'border-green-500'; // Vert pour sorts peu coûteux
    }
  };

  // ✅ NOUVEAU: Fonction pour obtenir l'icône du type de sort
  const getSpellTypeIcon = (spell: any) => {
    if (spell.type === 'heal') return '💚';
    if (spell.type === 'buff') return '🛡️';
    return spell.icon;
  };

  // Utilisation forcée des sorts avec PA
  const displaySpells = TOUS_LES_SORTS;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
      
      {/* FOND SEMI-TRANSPARENT POUR L'UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      
      {/* Hauteur parfaite conservée à h-48 */}
      <div className="relative flex w-full p-3 gap-3 pointer-events-auto items-end h-48">
        
        {/* ========== BOUTONS DE CATÉGORIES À GAUCHE ========== */}
        <div className="flex flex-col space-y-2">
          {/* Bouton Général */}
          <button
            onClick={() => setActiveChannel('general')}
            className={`p-2 rounded-lg border-2 backdrop-blur-sm transition-all duration-200 ${
              activeChannel === 'general'
                ? 'bg-white/20 border-white text-white'
                : 'bg-gray-900/95 border-gray-600 text-gray-400 hover:text-white hover:border-white'
            }`}
            title="Chat Général"
          >
            <Globe size={16} />
          </button>
          
          {/* Bouton Guilde */}
          <button
            onClick={() => setActiveChannel('guild')}
            className={`p-2 rounded-lg border-2 backdrop-blur-sm transition-all duration-200 ${
              activeChannel === 'guild'
                ? 'bg-green-400/20 border-green-400 text-green-400'
                : 'bg-gray-900/95 border-gray-600 text-gray-400 hover:text-green-400 hover:border-green-400'
            }`}
            title="Chat Guilde"
          >
            <Shield size={16} />
          </button>
             {/* Bouton Commerce & Recrutement */}
             <button
            onClick={() => setActiveChannel('commerce')}
            className={`p-2 rounded-lg border-2 backdrop-blur-sm transition-all duration-200 ${
              activeChannel === 'commerce'
                ? 'bg-orange-400/20 border-orange-400 text-orange-400'
                : 'bg-gray-900/95 border-gray-600 text-gray-400 hover:text-orange-400 hover:border-orange-400'
            }`}
            title="Commerce & Recrutement"
          >
            <ShoppingCart size={16} />
          </button>

          {/* Bouton Privé */}
          <button
            onClick={() => setActiveChannel('whisper')}
            className={`p-2 rounded-lg border-2 backdrop-blur-sm transition-all duration-200 ${
              activeChannel === 'whisper'
                ? 'bg-purple-400/20 border-purple-400 text-purple-400'
                : 'bg-gray-900/95 border-gray-600 text-gray-400 hover:text-purple-400 hover:border-purple-400'
            }`}
            title="Messages Privés"
          >
            <Mail size={16} />
          </button>
        </div>
        
        {/* CHAT ANCRÉ EN BAS COMME LES AUTRES MODULES */}
        <div className="w-[35%] h-full">
          {/* Conteneur qui garde le chat ancré en bas */}
          <div className="h-full flex flex-col justify-end">
            {/* Le vrai chat avec hauteur variable qui grandit vers le haut */}
            <div className={`bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-lg ${getChatHeightClass()} flex flex-col transition-all duration-300`}>
              
              {/* En-tête du chat avec flèche */}
              <div className="flex items-center justify-between p-2 border-b border-gray-600 min-h-[32px]">
                <div className="flex items-center space-x-2">
                  <MessageCircle size={14} className="text-blue-400" />
                  <span className="text-white text-sm font-medium">
                    Chat {activeChannel === 'general' ? 'Général' : activeChannel === 'guild' ? 'Guilde' : 'Privé'}
                  </span>
                  <Users size={12} className="text-gray-400" />
                  <span className="text-gray-400 text-xs">12</span>
                </div>
                
                {/* Flèche qui change selon la hauteur */}
                <button
                  onClick={toggleChatHeight}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  title={`Agrandir le chat (${chatHeight === 'normal' ? 'normal' : chatHeight === 'medium' ? 'moyen' : 'grand'})`}
                >
                  {chatHeight === 'normal' ? '▲' : chatHeight === 'medium' ? '▲▲' : '▼'}
                </button>
              </div>
              
              {/* Zone des messages */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {chatMessages
                  .filter(msg => msg.type === activeChannel || msg.type === 'system')
                  .slice(-20)
                  .map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-1 text-xs">
                    <span className="text-gray-500 font-mono text-xs">
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
              <div className="flex items-center p-2 border-t border-gray-700 min-h-[40px]">
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
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* MODULE CENTRAL - RESTE EXACTEMENT PAREIL */}
        <div className="w-[20%] h-full">
          <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-lg h-full flex flex-col">
            
            <div className="flex items-center justify-center p-2 border-b border-gray-600 min-h-[32px]">
              <span className="text-white text-sm font-medium">Joueur</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center space-y-4 p-3">
              
              {/* BOUTONS PERSONNAGE ET INVENTAIRE SUR LA MÊME LIGNE */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg ">
                <div className="flex space-x-1">
                  {/* Bouton Personnage - Plus compact */}
                  <button
                    onClick={onCharacterClick}
                    className="flex-1 flex items-center justify-center space-x-1 text-white hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-200 rounded p-1"
                    title="Ouvrir le panneau personnage"
                  >
                    <User size={14} />
                    <span className="text-xs font-medium">Statistiques</span>
                  </button>
                  
                  {/* Bouton Inventaire - Plus compact */}
                  <button
                    onClick={onInventoryClick}
                    className="flex-1 flex items-center justify-center space-x-1 text-white hover:text-orange-400 hover:bg-orange-400/10 transition-all duration-200 rounded p-1"
                    title="Ouvrir l'inventaire"
                  >
                    <Package size={14} />
                    <span className="text-xs font-medium">Inventaire</span>
                  </button>
                </div>
              </div>
              
              {/* MODULE VIE COMPACT - Centré dans l'espace disponible */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  {/* Points d'Action (PA) - Compact */}
                  <div className="flex flex-col items-center">
                    <Swords className="text-orange-500" size={14} />
                    <span className="text-white text-xs font-bold">{currentPA} PA</span>
                  </div>
                  
                  {/* VIE DANS LE CŒUR AU CENTRE */}
                  <div className="relative mx-1">
                    <Heart className="text-red-500 fill-red-500" size={46} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-base font-bold">
                      {currentHP}
                    </span>
                  </div>
                  
                  {/* Points de Mouvement (PM) - Compact */}
                  <div className="flex flex-col items-center">
                    <Footprints className="text-green-500" size={14} />
                    <span className="text-white text-xs font-bold">{currentPM} PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ✅ BARRE DE SORTS MODIFIÉE POUR UTILISER DES PA */}
        <div className="w-[45%] h-full">
          <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-lg w-full h-full flex flex-col">
            
            <div className="flex items-center justify-between p-2 border-b border-gray-600 min-h-[32px]">
              <h3 className="text-white text-sm font-medium">Sorts</h3>
              <div className="flex items-center space-x-2">
                <Swords size={12} className="text-orange-400" />
                <span className="text-orange-400 text-xs font-bold">{currentPA}/{maxPA} PA</span>
                <Settings size={14} className="text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center p-3">
              
              {/* LIGNE 1 - Sorts 1-8 */}
              <div className="grid grid-cols-8 gap-2 mb-2">
                {displaySpells.slice(0, 8).map((spell) => {
                  const canCast = currentPA >= spell.paCost;
                  return (
                    <button
                      key={spell.id}
                      onClick={() => onSpellClick?.(spell.id)}
                      disabled={!canCast}
                      className={`relative w-12 h-12 bg-gray-800 border-2 rounded-lg transition-all duration-200 flex items-center justify-center group ${
                        canCast 
                          ? `${getSpellBorderColor(spell.paCost, currentPA)} hover:scale-110` 
                          : 'border-red-500 opacity-50 cursor-not-allowed'
                      }`}
                      title={`${spell.name} (${spell.paCost} PA)${spell.description ? ' - ' + spell.description : ''}`}
                    >
                      <span className={`text-xl transition-transform ${canCast ? 'group-hover:scale-110' : ''}`}>
                        {getSpellTypeIcon(spell)}
                      </span>
                      
                      {/* ✅ Coût en PA (orange) */}
                      <span className={`absolute -top-1 -left-1 text-white text-xs px-1 rounded ${
                        canCast ? 'bg-orange-600' : 'bg-red-600'
                      }`}>
                        {spell.paCost}
                      </span>
                      
                      {/* ✅ Indicateur de type de sort */}
                      {spell.type === 'heal' && (
                        <span className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs px-1 rounded">
                          +
                        </span>
                      )}
                      
                      {/* Tooltip au survol */}
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {spell.name} ({spell.paCost} PA)
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* LIGNE 2 - Sorts 9-16 */}
              <div className="grid grid-cols-8 gap-2">
                {displaySpells.slice(8, 16).map((spell) => {
                  const canCast = currentPA >= spell.paCost;
                  return (
                    <button
                      key={spell.id}
                      onClick={() => onSpellClick?.(spell.id)}
                      disabled={!canCast}
                      className={`relative w-12 h-12 bg-gray-800 border-2 rounded-lg transition-all duration-200 flex items-center justify-center group ${
                        canCast 
                          ? `${getSpellBorderColor(spell.paCost, currentPA)} hover:scale-110` 
                          : 'border-red-500 opacity-50 cursor-not-allowed'
                      }`}
                      title={`${spell.name} (${spell.paCost} PA)${spell.description ? ' - ' + spell.description : ''}`}
                    >
                      <span className={`text-xl transition-transform ${canCast ? 'group-hover:scale-110' : ''}`}>
                        {getSpellTypeIcon(spell)}
                      </span>
                      
                      {/* Coût en PA (orange) */}
                      <span className={`absolute -top-1 -left-1 text-white text-xs px-1 rounded ${
                        canCast ? 'bg-orange-600' : 'bg-red-600'
                      }`}>
                        {spell.paCost}
                      </span>
                      
                      {/* Indicateur de type de sort */}
                      {spell.type === 'heal' && (
                        <span className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs px-1 rounded">
                          +
                        </span>
                      )}
                      
                      {/* Tooltip au survol */}
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {spell.name} ({spell.paCost} PA)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default GameUI;