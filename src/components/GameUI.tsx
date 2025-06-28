/**
 * GAME UI - VERSION CORRIGÉE AVEC LAYOUT DEMANDÉ
 * ✅ Timeline SÉPARÉE au-dessus du GameUI (pas dedans)
 * ✅ Boutons combat remplacent "Joueur" dans le module central
 * ✅ Stats vie/PA/PM bien visibles comme avant
 * ✅ Barre de sorts propre (sans timeline intégrée)
 * ✅ Interface props corrigée (plus d'erreur TypeScript)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, ShoppingCart, Settings, Users, MessageCircle, Package, Swords, Footprints, Globe, Shield, Mail, User, SkipForward, X } from 'lucide-react';

// ===== TYPES ET INTERFACES =====

interface EquipmentBonuses {
  paBonus: number;
  pmBonus: number;
  hpBonus: number;
  mpBonus: number;
}

// ✅ Interface corrigée sans les props qui causaient l'erreur
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
  currentHP,
  maxHP,
  currentMP,
  maxMP,
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
  onAbandonCombat
}) => {
  
  // ===== LOGIQUE DE CALCUL =====
  
  const isLegacyMode = currentPA !== undefined && maxPA !== undefined;
  const finalPACurrent = isLegacyMode ? currentPA : (basePACurrentTurn + equipmentBonuses.paBonus);
  const finalPAMax = isLegacyMode ? maxPA : (basePAMaxPerTurn + equipmentBonuses.paBonus);
  const finalPMCurrent = isLegacyMode ? (currentPM || 5) : (basePMCurrentTurn + equipmentBonuses.pmBonus);
  const finalPMMax = isLegacyMode ? (maxPM || 5) : (basePMMaxPerTurn + equipmentBonuses.pmBonus);
  
  // ===== ÉTAT LOCAL =====
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      username: 'System',
      message: 'Interface corrigée ! Timeline séparée.',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  
  const [chatInput, setChatInput] = useState('');
  const [activeChannel, setActiveChannel] = useState<'general' | 'guild' | 'commerce' | 'whisper'>('general');
  const [chatHeight, setChatHeight] = useState<'normal' | 'medium' | 'large'>('normal');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ===== EFFETS =====
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ===== FONCTIONS UTILITAIRES =====
  
  const toggleChatHeight = (): void => {
    setChatHeight(current => {
      if (current === 'normal') return 'medium';
      if (current === 'medium') return 'large';
      return 'normal';
    });
  };

  const getChatHeightClass = (): string => {
    const heightMap = {
      normal: 'h-full',
      medium: 'h-64', 
      large: 'h-80'
    };
    return heightMap[chatHeight];
  };

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
      general: 'text-white',
      guild: 'text-green-400',
      whisper: 'text-purple-400',
      system: 'text-yellow-400',
      commerce: 'text-orange-400'
    };
    return colorMap[type] || 'text-white';
  };

  // ===== FONCTIONS POUR LES SORTS =====
  
  const getSpellBorderColor = (spell: any, currentPA: number, isSelected: boolean): string => {
    if (isSelected) {
      return 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30';
    }
    if (spell.paCost > currentPA) {
      return 'border-red-500 bg-red-500/10';
    }
    if (spell.paCost >= 5) {
      return 'border-purple-500 bg-purple-500/10 hover:bg-purple-500/20';
    } else if (spell.paCost >= 3) {
      return 'border-orange-500 bg-orange-500/10 hover:bg-orange-500/20';
    } else {
      return 'border-green-500 bg-green-500/10 hover:bg-green-500/20';
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
      
      {/* Fond semi-transparent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      
      {/* ✅ INTERFACE PRINCIPALE */}
      <div className="relative flex w-full p-3 gap-3 pointer-events-auto items-end h-48">
        
        {/* ===== BOUTONS DE CHAT ===== */}
        <div className="flex flex-col space-y-2">
          {(['general', 'guild', 'commerce', 'whisper'] as const).map((channel) => {
            const iconMap = { general: Globe, guild: Shield, commerce: ShoppingCart, whisper: Mail };
            const Icon = iconMap[channel];
            const activeStyle = activeChannel === channel 
              ? 'bg-blue-400/20 border-blue-400 text-blue-400'
              : 'bg-gray-900/95 border-gray-600 text-gray-400 hover:text-white hover:border-white';
            
            return (
              <button
                key={channel}
                onClick={() => setActiveChannel(channel)}
                className={`p-2 rounded-lg border-2 backdrop-blur-sm transition-all duration-200 ${activeStyle}`}
                title={`Chat ${channel}`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
        
        {/* ===== CHAT ===== */}
        <div className="w-[35%] h-full">
          <div className="h-full flex flex-col justify-end">
            <div className={`bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-lg ${getChatHeightClass()} flex flex-col transition-all duration-300`}>
              
              {/* En-tête du chat */}
              <div className="flex items-center justify-between p-2 border-b border-gray-600 min-h-[32px]">
                <div className="flex items-center space-x-2">
                  <MessageCircle size={14} className="text-blue-400" />
                  <span className="text-white text-sm font-medium">Chat {activeChannel}</span>
                  <Users size={12} className="text-gray-400" />
                  <span className="text-gray-400 text-xs">12</span>
                </div>
                <button
                  onClick={toggleChatHeight}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  title={`Taille: ${chatHeight}`}
                >
                  {chatHeight === 'normal' ? '▲' : chatHeight === 'medium' ? '▲▲' : '▼'}
                </button>
              </div>
              
              {/* Messages */}
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
        
        {/* ===== MODULE CENTRAL - STATS JOUEUR AVEC BOUTONS COMBAT ===== */}
        <div className="w-[20%] h-full">
          <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-lg h-full flex flex-col">
            
            {/* ✅ BOUTONS COMBAT À LA PLACE DE "JOUEUR" */}
            <div className="flex items-center justify-center p-2 border-b border-gray-600 min-h-[32px]">
              {isInCombat ? (
                <div className="flex space-x-1">
                  <button
                    onClick={onAbandonCombat}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1"
                    title="Abandonner le combat"
                  >
                    <X size={10} />
                    <span>Fuir</span>
                  </button>
                  
                  <button
                    onClick={onEndTurn}
                    className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold transition-colors flex items-center space-x-1"
                    title="Terminer votre tour"
                  >
                    <SkipForward size={10} />
                    <span>Fin</span>
                  </button>
                </div>
              ) : (
                <span className="text-white text-sm font-medium">Joueur</span>
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-center space-y-4 p-3">
              
              {/* Boutons Personnage et Inventaire */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex space-x-1">
                  <button
                    onClick={onCharacterClick}
                    className="flex-1 flex items-center justify-center space-x-1 text-white hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-200 rounded p-1"
                    title="Panneau personnage"
                  >
                    <User size={14} />
                    <span className="text-xs font-medium">Stats</span>
                  </button>
                  
                  <button
                    onClick={onInventoryClick}
                    className="flex-1 flex items-center justify-center space-x-1 text-white hover:text-orange-400 hover:bg-orange-400/10 transition-all duration-200 rounded p-1"
                    title="Inventaire"
                  >
                    <Package size={14} />
                    <span className="text-xs font-medium">Sac</span>
                  </button>
                </div>
              </div>
              
              {/* ✅ Module vie et stats - COMME AVANT */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  
                  {/* PA */}
                  <div className="flex flex-col items-center">
                    <Swords className="text-orange-500" size={14} />
                    <div className="text-center">
                      <span className="text-white text-xs font-bold">{finalPACurrent}</span>
                      {!isLegacyMode && equipmentBonuses.paBonus > 0 && (
                        <span className="text-green-400 text-xs">+{equipmentBonuses.paBonus}</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">PA</span>
                  </div>
                  
                  {/* Cœur avec PV */}
                  <div className="relative mx-1">
                    <Heart className="text-red-500 fill-red-500" size={46} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-base font-bold">
                      {currentHP}
                    </span>
                  </div>
                  
                  {/* PM */}
                  <div className="flex flex-col items-center">
                    <Footprints className="text-green-500" size={14} />
                    <div className="text-center">
                      <span className="text-white text-xs font-bold">{finalPMCurrent}</span>
                      {!isLegacyMode && equipmentBonuses.pmBonus > 0 && (
                        <span className="text-green-400 text-xs">+{equipmentBonuses.pmBonus}</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ===== BARRE DE SORTS (SANS TIMELINE) ===== */}
        <div className="w-[45%] h-full">
          <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-lg w-full h-full flex flex-col">
            
            {/* En-tête */}
            <div className="flex items-center justify-between p-2 border-b border-gray-600 min-h-[32px]">
              <h3 className="text-white text-sm font-medium">Sorts</h3>
              <div className="flex items-center space-x-2">
                <Swords size={12} className="text-orange-400" />
                <span className="text-orange-400 text-xs font-bold">{finalPACurrent}/{finalPAMax} PA</span>
                {!isLegacyMode && equipmentBonuses.paBonus > 0 && (
                  <span className="text-green-400 text-xs">(+{equipmentBonuses.paBonus})</span>
                )}
                <Settings size={14} className="text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center p-3">
              
              {/* Ligne 1 - Sorts 1-8 */}
              <div className="grid grid-cols-8 gap-2 mb-2">
                {TOUS_LES_SORTS.slice(0, 8).map((spell) => {
                  const canCast = canCastSpell(spell, finalPACurrent);
                  const isSelected = selectedSpellId === spell.id;
                  const borderColor = getSpellBorderColor(spell, finalPACurrent, isSelected);
                  
                  return (
                    <button
                      key={spell.id}
                      onClick={() => handleSpellClick(spell.id)}
                      disabled={!canCast && !isSelected}
                      className={`relative w-12 h-12 border-2 rounded-lg transition-all duration-200 flex items-center justify-center group ${borderColor} ${
                        canCast || isSelected
                          ? 'hover:scale-110 cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed grayscale'
                      } ${isSelected ? 'animate-pulse' : ''}`}
                      title={`${spell.name} (${spell.paCost} PA) - ${spell.description}${isSelected ? ' - SÉLECTIONNÉ' : ''}`}
                    >
                      <span className={`text-xl transition-transform ${(canCast || isSelected) ? 'group-hover:scale-110' : ''} ${isSelected ? 'text-yellow-300' : ''}`}>
                        {getSpellTypeIcon(spell)}
                      </span>
                      
                      {/* Coût en PA */}
                      <span className={`absolute -top-1 -left-1 text-white text-xs px-1 rounded font-bold ${
                        isSelected ? 'bg-yellow-600' : 
                        canCast ? 'bg-orange-600' : 'bg-red-600'
                      }`}>
                        {spell.paCost}
                      </span>
                      
                      {/* Indicateur de type */}
                      {spell.type === 'heal' && (
                        <span className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs px-1 rounded">
                          +
                        </span>
                      )}
                      
                      {/* Indicateur de sélection */}
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg animate-pulse">
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-black text-xs font-bold">✓</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {spell.name} ({spell.paCost} PA)
                        {isSelected && <div className="text-yellow-400">SÉLECTIONNÉ</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Ligne 2 - Sorts 9-16 */}
              <div className="grid grid-cols-8 gap-2">
                {TOUS_LES_SORTS.slice(8, 16).map((spell) => {
                  const canCast = canCastSpell(spell, finalPACurrent);
                  const isSelected = selectedSpellId === spell.id;
                  const borderColor = getSpellBorderColor(spell, finalPACurrent, isSelected);
                  
                  return (
                    <button
                      key={spell.id}
                      onClick={() => handleSpellClick(spell.id)}
                      disabled={!canCast && !isSelected}
                      className={`relative w-12 h-12 border-2 rounded-lg transition-all duration-200 flex items-center justify-center group ${borderColor} ${
                        canCast || isSelected
                          ? 'hover:scale-110 cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed grayscale'
                      } ${isSelected ? 'animate-pulse' : ''}`}
                      title={`${spell.name} (${spell.paCost} PA) - ${spell.description}${isSelected ? ' - SÉLECTIONNÉ' : ''}`}
                    >
                      <span className={`text-xl transition-transform ${(canCast || isSelected) ? 'group-hover:scale-110' : ''} ${isSelected ? 'text-yellow-300' : ''}`}>
                        {getSpellTypeIcon(spell)}
                      </span>
                      
                      {/* Coût en PA */}
                      <span className={`absolute -top-1 -left-1 text-white text-xs px-1 rounded font-bold ${
                        isSelected ? 'bg-yellow-600' : 
                        canCast ? 'bg-orange-600' : 'bg-red-600'
                      }`}>
                        {spell.paCost}
                      </span>
                      
                      {/* Indicateur de type */}
                      {spell.type === 'heal' && (
                        <span className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs px-1 rounded">
                          +
                        </span>
                      )}
                      
                      {/* Indicateur de sélection */}
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg animate-pulse">
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-black text-xs font-bold">✓</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {spell.name} ({spell.paCost} PA)
                        {isSelected && <div className="text-yellow-400">SÉLECTIONNÉ</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Message d'aide */}
              {isInCombat && (
                <div className="mt-2 text-center">
                  {selectedSpellId ? (
                    <p className="text-yellow-400 text-xs animate-pulse">
                      Sort sélectionné ! Utilisez la timeline au-dessus pour cibler
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs">
                      Cliquez sur un sort pour le sélectionner • Timeline de combat au-dessus
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default GameUI;