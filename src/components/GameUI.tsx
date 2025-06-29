/**
 * GAME UI - VERSION AVEC CHAT OPTIMISÉ ET MOLETTE DE CANAUX
 * ✅ Molette cliquable pour sélectionner les canaux
 * ✅ Plus d'espace pour voir les messages
 * ✅ Menu déroulant élégant pour les canaux
 * ✨ Interface maximisée pour le chat
 * 🔧 Messages plus compacts et lisibles
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, ShoppingCart, Settings, Users, MessageCircle, Package, Swords, Footprints, Globe, Shield, Mail, User, SkipForward, X, ChevronDown, Map, Scroll, Star, Crown, UserCheck } from 'lucide-react';

// ===== TYPES ET INTERFACES =====

interface EquipmentBonuses {
  paBonus: number;
  pmBonus: number;
  hpBonus: number;
  mpBonus: number;
}

interface GameUIProps {
  // Stats de base (obligatoires)
  currentHP: number;
  maxHP: number;
  currentMP: number;
  maxMP: number;
  
  // ✅ COMPATIBILITÉ: PA/PM directement utilisables
  currentPA?: number;
  maxPA?: number;
  currentPM?: number;
  maxPM?: number;
  
  // ✅ NOUVEAU: Système moderne avec séparation base/équipement
  basePACurrentTurn?: number;
  basePAMaxPerTurn?: number;
  basePMCurrentTurn?: number;
  basePMMaxPerTurn?: number;
  equipmentBonuses?: EquipmentBonuses;
  
  // Autres props
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
  selectedSpellId?: number | null;
  isInCombat?: boolean;
  onEndTurn?: () => void;
  onAbandonCombat?: () => void;
  
  // ✨ NOUVEAU: Callbacks pour les menus
  onStatsClick?: () => void;
  onSpellsClick?: () => void;
  onFriendsClick?: () => void;
  onGuildClick?: () => void;
  onMountClick?: () => void;
  onMapClick?: () => void;
  onQuestsClick?: () => void;
}

interface MenuBarItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick?: () => void;
  color: string;
  description: string;
}

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: Date;
  type: 'general' | 'guild' | 'whisper' | 'system' | 'commerce';
}

// ===== DONNÉES DES SORTS =====

const TOUS_LES_SORTS = [
  { 
    id: 1, 
    name: 'Coup de Dague', 
    icon: '🗡️', 
    paCost: 3, 
    description: 'Attaque rapide (15-25 dégâts)', 
    type: 'damage',
    targetType: 'enemy',
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
    targetType: 'enemy',
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
    targetType: 'enemy',
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
    targetType: 'self',
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
    targetType: 'enemy',
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
    targetType: 'self',
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
    targetType: 'enemy',
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
    targetType: 'enemy',
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
    targetType: 'self',
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
    targetType: 'enemy',
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
    targetType: 'enemy',
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
    targetType: 'self',
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
    targetType: 'self',
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
    targetType: 'enemy',
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
    targetType: 'self',
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
    targetType: 'enemy',
    minDamage: 80,
    maxDamage: 100,
    range: 8
  }
];

// ===== COMPOSANT PRINCIPAL =====

const GameUI: React.FC<GameUIProps> = ({
  currentHP = 450,
  maxHP = 600,
  currentMP = 280,
  maxMP = 350,
  currentPA,
  maxPA,
  currentPM,
  maxPM,
  basePACurrentTurn = 6,
  basePAMaxPerTurn = 6,
  basePMCurrentTurn = 3,
  basePMMaxPerTurn = 3,
  equipmentBonuses = { paBonus: 4, pmBonus: 2, hpBonus: 0, mpBonus: 0 },
  spells = [],
  onSpellClick,
  onInventoryClick,
  onCharacterClick,
  selectedSpellId = null,
  isInCombat = false,
  onEndTurn,
  onAbandonCombat,
  // ✨ NOUVEAU: Callbacks pour les menus
  onStatsClick,
  onSpellsClick,
  onFriendsClick,
  onGuildClick,
  onMountClick,
  onMapClick,
  onQuestsClick
}) => {
  
  // ===== LOGIQUE DE CALCUL =====
  
  const isLegacyMode = currentPA !== undefined && maxPA !== undefined;
  const finalPACurrent = isLegacyMode ? currentPA : (basePACurrentTurn + equipmentBonuses.paBonus);
  const finalPAMax = isLegacyMode ? maxPA : (basePAMaxPerTurn + equipmentBonuses.paBonus);
  const finalPMCurrent = isLegacyMode ? (currentPM || 5) : (basePMCurrentTurn + equipmentBonuses.pmBonus);
  const finalPMMax = isLegacyMode ? (maxPM || 5) : (basePMMaxPerTurn + equipmentBonuses.pmBonus);
  
  // ===== CONFIGURATION DE LA BARRE DE MENU =====
  
  const menuBarItems: MenuBarItem[] = [
    {
      id: 'stats',
      name: 'Statistiques',
      icon: User,
      onClick: onStatsClick || onCharacterClick,
      color: 'from-blue-500 to-cyan-500',
      description: 'Statistiques et caractéristiques'
    },
    {
      id: 'inventory',
      name: 'Inventaire',
      icon: Package,
      onClick: onInventoryClick,
      color: 'from-amber-500 to-orange-500',
      description: 'Sac et équipements'
    },
    {
      id: 'spells',
      name: 'Sorts',
      icon: Star,
      onClick: onSpellsClick,
      color: 'from-purple-500 to-violet-500',
      description: 'Livre de sorts'
    },
    {
      id: 'friends',
      name: 'Amis',
      icon: UserCheck,
      onClick: onFriendsClick,
      color: 'from-emerald-500 to-green-500',
      description: 'Liste d\'amis'
    },
    {
      id: 'guild',
      name: 'Guilde',
      icon: Shield,
      onClick: onGuildClick,
      color: 'from-red-500 to-rose-500',
      description: 'Informations de guilde'
    },
    {
      id: 'mount',
      name: 'Monture',
      icon: Crown,
      onClick: onMountClick,
      color: 'from-yellow-500 to-amber-500',
      description: 'Gestion des montures'
    },
    {
      id: 'map',
      name: 'Carte',
      icon: Map,
      onClick: onMapClick,
      color: 'from-teal-500 to-cyan-500',
      description: 'Carte du monde'
    },
    {
      id: 'quests',
      name: 'Quêtes',
      icon: Scroll,
      onClick: onQuestsClick,
      color: 'from-indigo-500 to-purple-500',
      description: 'Journal de quêtes'
    }
  ];
  
  // ===== ÉTAT LOCAL =====
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      username: 'System',
      message: 'Chat optimisé ! Plus d\'espace pour voir les messages.',
      timestamp: new Date(),
      type: 'system'
    },
    {
      id: 2,
      username: 'Joueur1',
      message: 'Salut tout le monde ! Comment ça va ?',
      timestamp: new Date(),
      type: 'general'
    },
    {
      id: 3,
      username: 'Marchand',
      message: 'Vends épée +5, 1000 or ! Contactez-moi en privé.',
      timestamp: new Date(),
      type: 'commerce'
    },
    {
      id: 4,
      username: 'ChefGuilde',
      message: 'Raid prévu ce soir à 20h, soyez là !',
      timestamp: new Date(),
      type: 'guild'
    },
    {
      id: 5,
      username: 'Joueur2',
      message: 'Quelqu\'un pour m\'aider avec cette quête ?',
      timestamp: new Date(),
      type: 'general'
    },
    {
      id: 6,
      username: 'Ninja',
      message: 'Viens joindre le combat à côté de la fontaine !',
      timestamp: new Date(),
      type: 'general'
    },
    {
      id: 7,
      username: 'Mage',
      message: 'Super équipement trouvé dans ce donjon',
      timestamp: new Date(),
      type: 'general'
    },
    {
      id: 8,
      username: 'Guerrier',
      message: 'Qui veut former un groupe pour le boss ?',
      timestamp: new Date(),
      type: 'general'
    }
  ]);
  
  const [chatInput, setChatInput] = useState('');
  const [activeChannel, setActiveChannel] = useState<'general' | 'guild' | 'commerce' | 'whisper'>('general');
  // 🎯 NOUVEAU: État pour afficher/masquer le menu des canaux
  const [showChannelMenu, setShowChannelMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ===== EFFETS =====
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ===== FONCTIONS UTILITAIRES =====
  
  const sendMessage = (): void => {
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

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const getChannelColor = (type: ChatMessage['type']): string => {
    const colorMap = {
      general: 'text-slate-100',
      guild: 'text-emerald-300',
      whisper: 'text-purple-300',
      system: 'text-amber-300',
      commerce: 'text-orange-300'
    };
    return colorMap[type] || 'text-slate-100';
  };

  const getChannelIcon = (channel: string) => {
    const iconMap = { general: Globe, guild: Shield, commerce: ShoppingCart, whisper: Mail };
    return iconMap[channel as keyof typeof iconMap] || Globe;
  };

  const getChannelName = (channel: string): string => {
    const nameMap = {
      general: 'Général',
      guild: 'Guilde',
      commerce: 'Commerce',
      whisper: 'Privé'
    };
    return nameMap[channel as keyof typeof nameMap] || 'Général';
  };

  // 🎯 NOUVELLE FONCTION: Sélectionner un canal et fermer le menu
  const selectChannel = (channel: 'general' | 'guild' | 'commerce' | 'whisper'): void => {
    setActiveChannel(channel);
    setShowChannelMenu(false);
  };

  // ===== FONCTIONS POUR LES SORTS =====
  
  const getSpellBorderColor = (spell: any, currentPA: number, isSelected: boolean): string => {
    if (isSelected) {
      return 'border-amber-400 bg-gradient-to-br from-amber-500/30 to-yellow-500/20 shadow-lg shadow-amber-400/40 ring-2 ring-amber-400/50';
    }
    if (spell.paCost > currentPA) {
      return 'border-red-500/60 bg-gradient-to-br from-red-900/20 to-red-800/10 shadow-inner';
    }
    if (spell.paCost >= 5) {
      return 'border-violet-400/70 bg-gradient-to-br from-violet-600/20 to-purple-500/15 hover:shadow-lg hover:shadow-violet-400/30 hover:border-violet-300';
    } else if (spell.paCost >= 3) {
      return 'border-orange-400/70 bg-gradient-to-br from-orange-600/20 to-amber-500/15 hover:shadow-lg hover:shadow-orange-400/30 hover:border-orange-300';
    } else {
      return 'border-emerald-400/70 bg-gradient-to-br from-emerald-600/20 to-green-500/15 hover:shadow-lg hover:shadow-emerald-400/30 hover:border-emerald-300';
    }
  };

  const getSpellTypeIcon = (spell: any): string => {
    if (spell.type === 'heal') return '💚';
    if (spell.type === 'buff') return '🛡️';
    return spell.icon;
  };

  const canCastSpell = (spell: any, currentPA: number): boolean => {
    return currentPA >= spell.paCost;
  };

  const handleSpellClick = (spellId: number): void => {
    console.log(`🔮 GameUI: Clic sur sort ${spellId} (PA: ${finalPACurrent})`);
    onSpellClick?.(spellId);
  };

  // ===== RENDU =====
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
      
      {/* Fond dégradé discret */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/50 to-transparent pointer-events-none" />
      
      {/* Effet de lueur subtil */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-600/8 via-purple-600/4 to-transparent pointer-events-none" />
      
      {/* 🎮 MODULE COMBAT SUPPLÉMENTAIRE (visible uniquement en combat) */}
      {isInCombat && (
        <div className="relative w-full pointer-events-auto px-3 pb-2">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/90 border border-slate-600/60 rounded-lg backdrop-blur-md shadow-lg px-4 py-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onAbandonCombat}
                  className="group px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 shadow-md hover:shadow-red-500/30 transform hover:scale-105"
                  title="Abandonner le combat"
                >
                  <X size={12} className="group-hover:rotate-90 transition-transform" />
                  <span>Fuir</span>
                </button>
                
                <button
                  onClick={onEndTurn}
                  className="group px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 shadow-md hover:shadow-amber-500/30 transform hover:scale-105 animate-pulse"
                  title="Terminer votre tour"
                >
                  <SkipForward size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  <span>Fin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ✨ INTERFACE PRINCIPALE - MODULES HARMONISÉS */}
      <div className="relative flex w-full p-3 gap-3 pointer-events-auto items-end h-48">
        
        {/* ===== MODULE CHAT OPTIMISÉ - SANS EN-TÊTE ===== */}
        <div className="w-[35%] h-full">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/85 border border-slate-600/50 rounded-lg backdrop-blur-md shadow-xl h-full flex flex-col">
            
            {/* 🎯 ZONE DE MESSAGES MAXIMISÉE ET PLUS COMPACTE */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {chatMessages
                .filter(msg => msg.type === activeChannel || msg.type === 'system')
                .slice(-25) // Encore plus de messages visibles
                .map((msg) => (
                <div key={msg.id} className="group hover:bg-slate-700/15 rounded px-1.5 py-1 transition-colors">
                  <div className="flex items-start space-x-1.5">
                    {/* Timestamp plus petit */}
                    <span className="text-slate-500 font-mono text-xs mt-0.5 min-w-fit opacity-70">
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1 min-w-0">
                      {/* Username et message sur la même ligne avec texte plus petit */}
                      <div className="flex items-baseline space-x-1">
                        <span className={`font-medium text-xs ${getChannelColor(msg.type)} flex-shrink-0`}>
                          {msg.username}:
                        </span>
                        <span className="text-slate-300 text-xs break-words leading-tight">{msg.message}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            {/* 🎯 ZONE DE SAISIE AVEC INDICATEUR DE CANAL ACTIF */}
            <div className="flex items-center p-2.5 border-t border-slate-700/40 bg-gradient-to-r from-slate-800/25 to-slate-700/15 rounded-b-lg space-x-2">
              {/* Bouton de paramètres pour ouvrir le menu des canaux */}
              <button
                onClick={() => setShowChannelMenu(!showChannelMenu)}
                className="group bg-gradient-to-br from-slate-900/90 to-slate-800/85 border border-slate-600/50 rounded-lg backdrop-blur-md shadow-xl p-2.5 transition-all duration-200 hover:border-slate-400/70 hover:shadow-lg"
                title="Sélectionner un canal de chat"
              >
                <Settings 
                  size={12} 
                  className={`text-slate-300 group-hover:text-slate-100 transition-all duration-200 ${showChannelMenu ? 'rotate-45' : 'group-hover:rotate-12'}`} 
                />
              </button>
              
              {/* 🎯 MENU DÉROULANT DES CANAUX */}
              {showChannelMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-gradient-to-br from-slate-900/95 to-slate-800/90 border border-slate-600/60 rounded-lg backdrop-blur-md shadow-xl p-2 min-w-[150px] z-50">
                  <div className="space-y-1">
                    {(['general', 'guild', 'commerce', 'whisper'] as const).map((channel) => {
                      const Icon = getChannelIcon(channel);
                      const isActive = activeChannel === channel;
                      
                      return (
                        <button
                          key={channel}
                          onClick={() => selectChannel(channel)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500/25 to-cyan-500/15 border border-cyan-400/40 text-cyan-300'
                              : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/40'
                          }`}
                        >
                          <Icon size={14} />
                          <span className="text-sm font-medium">{getChannelName(channel)}</span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${getChannelName(activeChannel).toLowerCase()}...`}
                  className="w-full bg-slate-800/60 text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-600/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25 placeholder-slate-400 transition-all duration-200"
                  maxLength={200}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">
                  {chatInput.length}/200
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim()}
                className="p-2 text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 transition-colors rounded-lg hover:bg-cyan-400/10 disabled:hover:bg-transparent"
                title="Envoyer le message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* ===== MODULE STATS - IDENTIQUE À L'ORIGINAL ===== */}
        <div className="w-[20%] h-full">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/85 border border-slate-600/50 rounded-lg backdrop-blur-md shadow-xl h-full flex flex-col">
            
            {/* Zone des stats optimisée */}
            <div className="flex-1 flex items-center justify-center p-3">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-600/25 rounded-lg p-3 shadow-inner w-full">
                <div className="flex justify-between items-center">
                  
                  {/* PA affiné */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <div className="relative p-1.5 bg-gradient-to-br from-orange-500/15 to-red-500/8 rounded border border-orange-500/25">
                      <Swords className="text-orange-400" size={12} />
                    </div>
                    <div className="text-center">
                      <div className="flex items-baseline space-x-0.5">
                        <span className="text-white text-sm font-bold">{finalPACurrent}</span>
                        <span className="text-slate-400 text-xs">/{finalPAMax}</span>
                      </div>
                      {!isLegacyMode && equipmentBonuses.paBonus > 0 && (
                        <span className="text-emerald-400 text-xs">+{equipmentBonuses.paBonus}</span>
                      )}
                    </div>
                    <span className="text-orange-300 text-xs font-medium">PA</span>
                  </div>
                  
                  {/* Cœur avec PV affiné */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full blur animate-pulse" />
                    <Heart className="relative text-red-500 fill-red-500 drop-shadow-md" size={56} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-black tracking-wide drop-shadow-md">
                      {currentHP}
                    </span>
                  </div>
                  
                  {/* PM affiné */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <div className="relative p-1.5 bg-gradient-to-br from-emerald-500/15 to-green-500/8 rounded border border-emerald-500/25">
                      <Footprints className="text-emerald-400" size={12} />
                    </div>
                    <div className="text-center">
                      <div className="flex items-baseline space-x-0.5">
                        <span className="text-white text-sm font-bold">{finalPMCurrent}</span>
                        <span className="text-slate-400 text-xs">/{finalPMMax}</span>
                      </div>
                      {!isLegacyMode && equipmentBonuses.pmBonus > 0 && (
                        <span className="text-emerald-400 text-xs">+{equipmentBonuses.pmBonus}</span>
                      )}
                    </div>
                    <span className="text-emerald-300 text-xs font-medium">PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ===== MODULE COMBINÉ - BARRE DE MENU + SORTS ===== */}
        <div className="w-[45%] h-full flex flex-col space-y-2">
          
          {/* 🎮 BARRE DE MENU STYLE DOFUS */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/85 border border-slate-600/50 rounded-lg backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-evenly p-2">
              {menuBarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="group relative"
                    title={item.description}
                  >
                    {/* Cercle avec gradient */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} p-0.5 transition-all duration-200 hover:scale-110 hover:shadow-lg transform-gpu`}>
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800/90 to-slate-700/80 flex items-center justify-center border border-slate-600/30">
                        <IconComponent size={16} className="text-white group-hover:text-orange-200 transition-colors" />
                      </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg backdrop-blur-sm">
                      <div className="font-medium text-slate-100">{item.name}</div>
                      <div className="text-slate-300">{item.description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* ===== BARRE DE SORTS ===== */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/85 border border-slate-600/50 rounded-lg backdrop-blur-md shadow-xl flex-1">
            
            <div className="flex flex-col justify-center p-2.5 space-y-2 h-full">
              
              {/* Ligne 1 - Sorts 1-8 affinés */}
              <div className="grid grid-cols-8 gap-1.5">
                {TOUS_LES_SORTS.slice(0, 8).map((spell) => {
                  const canCast = canCastSpell(spell, finalPACurrent);
                  const isSelected = selectedSpellId === spell.id;
                  const borderColor = getSpellBorderColor(spell, finalPACurrent, isSelected);
                  
                  return (
                    <button
                      key={spell.id}
                      onClick={() => handleSpellClick(spell.id)}
                      disabled={!canCast && !isSelected}
                      className={`relative w-10 h-10 border rounded-lg transition-all duration-300 flex items-center justify-center group ${borderColor} ${
                        canCast || isSelected
                          ? 'hover:scale-110 cursor-pointer transform-gpu' 
                          : 'opacity-40 cursor-not-allowed grayscale'
                      } ${isSelected ? 'animate-pulse scale-105' : ''}`}
                      title={`${spell.name} (${spell.paCost} PA) - ${spell.description}${isSelected ? ' - SÉLECTIONNÉ' : ''}`}
                    >
                      <span className={`text-lg transition-all duration-200 ${(canCast || isSelected) ? 'group-hover:scale-125' : ''} ${isSelected ? 'text-yellow-300 drop-shadow-md' : ''}`}>
                        {getSpellTypeIcon(spell)}
                      </span>
                      
                      {/* Coût en PA affiné */}
                      <span className={`absolute -top-1 -left-1 text-white text-xs px-1 py-0.5 rounded font-bold shadow-md ${
                        isSelected ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black' : 
                        canCast ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-red-700 to-red-800'
                      }`}>
                        {spell.paCost}
                      </span>
                      
                      {/* Indicateur de type affiné */}
                      {spell.type === 'heal' && (
                        <span className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs px-0.5 py-0.5 rounded font-bold shadow-md">
                          +
                        </span>
                      )}
                      
                      {/* Indicateur de sélection affiné */}
                      {isSelected && (
                        <div className="absolute inset-0 border border-amber-400 rounded-lg animate-pulse">
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-black text-xs font-black">✓</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Tooltip affiné */}
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg backdrop-blur-sm">
                        <div className="font-medium text-slate-100">{spell.name}</div>
                        <div className="text-orange-300">{spell.paCost} PA • {spell.description}</div>
                        {isSelected && <div className="text-amber-400 font-bold">✨ SÉLECTIONNÉ</div>}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Ligne 2 - Sorts 9-16 affinés */}
              <div className="grid grid-cols-8 gap-1.5">
                {TOUS_LES_SORTS.slice(8, 16).map((spell) => {
                  const canCast = canCastSpell(spell, finalPACurrent);
                  const isSelected = selectedSpellId === spell.id;
                  const borderColor = getSpellBorderColor(spell, finalPACurrent, isSelected);
                  
                  return (
                    <button
                      key={spell.id}
                      onClick={() => handleSpellClick(spell.id)}
                      disabled={!canCast && !isSelected}
                      className={`relative w-10 h-10 border rounded-lg transition-all duration-300 flex items-center justify-center group ${borderColor} ${
                        canCast || isSelected
                          ? 'hover:scale-110 cursor-pointer transform-gpu' 
                          : 'opacity-40 cursor-not-allowed grayscale'
                      } ${isSelected ? 'animate-pulse scale-105' : ''}`}
                      title={`${spell.name} (${spell.paCost} PA) - ${spell.description}${isSelected ? ' - SÉLECTIONNÉ' : ''}`}
                    >
                      <span className={`text-lg transition-all duration-200 ${(canCast || isSelected) ? 'group-hover:scale-125' : ''} ${isSelected ? 'text-yellow-300 drop-shadow-md' : ''}`}>
                        {getSpellTypeIcon(spell)}
                      </span>
                      
                      <span className={`absolute -top-1 -left-1 text-white text-xs px-1 py-0.5 rounded font-bold shadow-md ${
                        isSelected ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black' : 
                        canCast ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-red-700 to-red-800'
                      }`}>
                        {spell.paCost}
                      </span>
                      
                      {spell.type === 'heal' && (
                        <span className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs px-0.5 py-0.5 rounded font-bold shadow-md">
                          +
                        </span>
                      )}
                      
                      {isSelected && (
                        <div className="absolute inset-0 border border-amber-400 rounded-lg animate-pulse">
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-black text-xs font-black">✓</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg backdrop-blur-sm">
                        <div className="font-medium text-slate-100">{spell.name}</div>
                        <div className="text-orange-300">{spell.paCost} PA • {spell.description}</div>
                        {isSelected && <div className="text-amber-400 font-bold">✨ SÉLECTIONNÉ</div>}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
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