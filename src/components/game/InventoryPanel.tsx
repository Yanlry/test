/**
 * PANNEAU D'INVENTAIRE (SIDEBAR DROITE) - STYLE MMO SOMBRE ÉLARGI ET ESPACÉ
 * Pour modifier l'apparence de l'inventaire et des équipements, c'est ici
 */

import React, { useState } from 'react';
import { Character, InventoryItem, EquippedItem } from '../../types/game';
import { DEFAULT_EQUIPPED_ITEMS, DEFAULT_INVENTORY_ITEMS } from '../../utils/gameConstants';
import { X, Package, Sword, Shield, Eye, Star, Info } from 'lucide-react';

// Type local pour les onglets d'inventaire
type InventoryTab = 'equipement' | 'consommable' | 'ressource';

interface InventoryPanelProps {
  character: Character;
  activeInventoryTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
  onClose?: () => void;
}

/**
 * Type guards pour différencier InventoryItem et EquippedItem
 */
const isInventoryItem = (item: InventoryItem | EquippedItem): item is InventoryItem => {
  return 'type' in item && 'quantity' in item;
};

const hasStats = (item: InventoryItem | EquippedItem): item is InventoryItem & { stats: Record<string, number> } => {
  return 'stats' in item && item.stats !== undefined;
};

const hasEffect = (item: InventoryItem | EquippedItem): item is InventoryItem & { effect: string } => {
  return 'effect' in item && item.effect !== undefined;
};

const hasDescription = (item: InventoryItem | EquippedItem): item is InventoryItem & { description: string } => {
  return 'description' in item && item.description !== undefined;
};

const hasId = (item: InventoryItem | EquippedItem): item is InventoryItem => {
  return 'id' in item;
};

/**
 * Composant de slot d'équipement - ÉLARGI
 */
const EquipmentSlot: React.FC<{
  item?: InventoryItem | EquippedItem | null;
  slotName: string;
  className?: string;
  onItemClick?: (item: InventoryItem | EquippedItem) => void;
}> = React.memo(({ item, slotName, className = "", onItemClick }) => (
  <div 
    className={`w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-600 flex items-center justify-center cursor-pointer transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 group ${className}`}
    title={item?.name || `${slotName} vide`}
    onClick={() => item && onItemClick?.(item)}
  >
    {item ? (
      <div className="relative">
        <span className="text-3xl group-hover:scale-110 transition-transform">
          {item.icon}
        </span>
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    ) : (
      <div className="text-gray-600 text-xl">❌</div>
    )}
    <div className="absolute -bottom-1 -right-1 text-xs bg-gray-700 text-gray-300 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
      {slotName}
    </div>
  </div>
));

/**
 * Composant de prévisualisation d'objet - CARRÉ CONVENABLE POUR 2/3 DE L'ÉCRAN
 */
const ItemPreview: React.FC<{
  item: InventoryItem | EquippedItem | null;
}> = React.memo(({ item }) => {
  if (!item) {
    return (
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl border border-gray-700 p-6 h-full flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="text-center text-gray-400">
          <Eye size={64} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-3">Prévisualisation</h3>
          <p className="text-base mb-6">Cliquez sur un objet pour voir ses détails</p>
          <div className="flex justify-center space-x-3">
            <Star className="text-yellow-400 opacity-30 animate-pulse" size={20} />
            <Star className="text-yellow-400 opacity-30 animate-pulse" size={24} style={{ animationDelay: '0.5s' }} />
            <Star className="text-yellow-400 opacity-30 animate-pulse" size={20} style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Déterminer la rareté et la couleur
  const getRarityInfo = (item: InventoryItem | EquippedItem) => {
    const itemType = isInventoryItem(item) ? item.type : 'equipement';
    
    const rarity = 'rarity' in item ? item.rarity : 
                   itemType === 'equipement' ? 'legendary' : 
                   itemType === 'consommable' ? 'common' : 'uncommon';
    
    const rarityConfig = {
      'common': { name: 'Commun', color: 'text-gray-400', bgColor: 'from-gray-600/20 to-gray-700/20', borderColor: 'border-gray-500' },
      'uncommon': { name: 'Peu commun', color: 'text-green-400', bgColor: 'from-green-600/20 to-green-700/20', borderColor: 'border-green-500' },
      'rare': { name: 'Rare', color: 'text-blue-400', bgColor: 'from-blue-600/20 to-blue-700/20', borderColor: 'border-blue-500' },
      'epic': { name: 'Épique', color: 'text-purple-400', bgColor: 'from-purple-600/20 to-purple-700/20', borderColor: 'border-purple-500' },
      'legendary': { name: 'Légendaire', color: 'text-orange-400', bgColor: 'from-orange-600/20 to-orange-700/20', borderColor: 'border-orange-500' }
    };

    return rarityConfig[rarity as keyof typeof rarityConfig] || rarityConfig.common;
  };

  const rarityInfo = getRarityInfo(item);

  return (
    <div className={`bg-gradient-to-br ${rarityInfo.bgColor} rounded-xl border-2 ${rarityInfo.borderColor} p-6 h-full backdrop-blur-sm shadow-2xl`}>
      <div className="flex flex-col h-full">
        
        {/* En-tête avec icône et nom - PLUS GRAND */}
        <div className="text-center mb-6">
          <div className="relative mb-4">
            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 ${rarityInfo.borderColor} flex items-center justify-center shadow-xl`}>
              <span className="text-4xl">{item.icon}</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full blur-sm animate-pulse" />
          </div>
          
          <h3 className={`text-2xl font-bold ${rarityInfo.color} mb-2`}>{item.name}</h3>
          <span className={`px-3 py-1 text-sm rounded-full border ${rarityInfo.borderColor} ${rarityInfo.color} bg-gradient-to-r ${rarityInfo.bgColor}`}>
            {rarityInfo.name}
          </span>
        </div>

        {/* Statistiques et détails - BIEN ESPACÉ */}
        <div className="flex-1 space-y-4">
          
          {/* Type et quantité */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Type:</span>
              <span className="text-white font-medium capitalize text-base">
                {isInventoryItem(item) ? item.type : 'Équipement'}
              </span>
            </div>
            
            {isInventoryItem(item) && (
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-400">Quantité:</span>
                <span className="text-orange-400 font-bold text-lg">{item.quantity}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center mb-2">
              <Info size={16} className="text-blue-400 mr-2" />
              <span className="text-gray-400 text-sm">Description:</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {hasDescription(item) ? item.description : "Aucune description disponible pour cet objet."}
            </p>
          </div>

          {/* Statistiques pour les équipements */}
          {hasStats(item) && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center mb-3">
                <Sword size={16} className="text-orange-400 mr-2" />
                <span className="text-gray-400 text-sm">Statistiques:</span>
              </div>
              <div className="space-y-2">
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between items-center">
                    <span className="text-gray-400 capitalize text-sm">{stat}:</span>
                    <span className="text-green-400 font-bold text-base">+{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Effet ou capacité spéciale */}
          {hasEffect(item) && (
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center mb-2">
                <Star size={16} className="text-purple-400 mr-2" />
                <span className="text-purple-400 text-sm font-bold">Effet spécial:</span>
              </div>
              <p className="text-purple-300 text-sm italic">{item.effect}</p>
            </div>
          )}
        </div>

        {/* Actions possibles - PLUS GRANDES */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <button className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
              Utiliser
            </button>
            <button className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
              Détails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  character,
  activeInventoryTab,
  onTabChange,
  onClose
}) => {
  // État pour l'objet sélectionné
  const [selectedItem, setSelectedItem] = useState<InventoryItem | EquippedItem | null>(null);

  // Pour l'instant, on utilise les données par défaut
  const equippedItems = DEFAULT_EQUIPPED_ITEMS;
  const inventoryItems = DEFAULT_INVENTORY_ITEMS;

  // Fonction pour filtrer les objets par type
  const getItemsByType = (type: InventoryTab): InventoryItem[] => {
    return inventoryItems.filter(item => item.type === type);
  };

  // Fonction pour gérer le clic sur un objet
  const handleItemClick = (item: InventoryItem | EquippedItem) => {
    setSelectedItem(item);
  };

  // Configuration des onglets avec style MMO
  const tabs = [
    { id: 'equipement' as InventoryTab, name: 'Équipement', icon: Sword, color: 'text-orange-400' },
    { id: 'consommable' as InventoryTab, name: 'Consommables', icon: Package, color: 'text-green-400' },
    { id: 'ressource' as InventoryTab, name: 'Ressources', icon: Shield, color: 'text-blue-400' }
  ];

  // Calcul de l'utilisation de l'inventaire
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const maxCapacity = 100;
  const usagePercentage = (totalItems / maxCapacity) * 100;

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-l border-gray-700 flex backdrop-blur-sm">
      
      {/* Panneau principal d'inventaire - AJUSTÉ POUR 2/3 DE L'ÉCRAN */}
      <div className="flex-1 flex flex-col border-r border-gray-700 min-w-0">
        
        {/* Header avec bouton de fermeture */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
          <h2 className="text-xl font-bold text-orange-400 flex items-center">
            <Package className="mr-2" size={20} />
            Inventaire
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Zone équipement style MMO avancé - ÉLARGIE */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-orange-400 font-bold text-lg mb-6 text-center flex items-center justify-center">
              <Sword className="mr-2" size={18} />
              Équipements Portés
            </h3>
            
            {/* Disposition d'équipement en forme de croix avec personnage au centre - ESPACÉE */}
            <div className="relative flex flex-col items-center space-y-4">
              
              {/* Ligne du haut - Chapeau */}
              <div className="flex justify-center">
                <EquipmentSlot 
                  item={equippedItems.helmet || null} 
                  slotName="Chapeau"
                  onItemClick={handleItemClick}
                />
              </div>

              {/* Ligne du milieu - Cape, Collier, Personnage, Anneau 1, Anneau 2 - PLUS ESPACÉE */}
              <div className="flex items-center space-x-4">
                <EquipmentSlot 
                  item={equippedItems.cape || null} 
                  slotName="Cape"
                  onItemClick={handleItemClick}
                />
                <EquipmentSlot 
                  item={equippedItems.necklace || null} 
                  slotName="Collier"
                  onItemClick={handleItemClick}
                />
                
                {/* Personnage au centre avec les mains tendues - PLUS GRAND */}
                <div className="relative mx-2">
                  <div 
                    className="w-24 h-28 rounded-lg border-4 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-xl"
                    style={{ 
                      background: `linear-gradient(145deg, ${character.class.color}10, ${character.class.color}30)`,
                      boxShadow: `0 0 30px ${character.class.color}40`
                    }}
                  >
                    {/* Effet de fond animé */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                    
                    {/* Personnage */}
                    <div className="text-center relative z-10">
                      <div 
                        className="w-14 h-14 rounded-full mx-auto mb-1 flex items-center justify-center text-2xl border-2 border-gray-500 shadow-lg"
                        style={{ 
                          background: `linear-gradient(145deg, ${character.appearance.skinTone}, ${character.appearance.skinTone}CC)` 
                        }}
                      >
                        {character.class.avatar}
                      </div>
                      <p className="text-white text-xs font-bold">{character.name}</p>
                      <p className="text-gray-400 text-xs">Niv.{character.level}</p>
                    </div>
                    
                    {/* Bras gauche tendu */}
                    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-5 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full shadow-lg" />
                    
                    {/* Bras droit tendu */}
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-5 h-1 bg-gradient-to-l from-amber-600 to-amber-700 rounded-full shadow-lg" />
                  </div>
                </div>

                <EquipmentSlot 
                  item={equippedItems.ring1 || null} 
                  slotName="Anneau 1"
                  onItemClick={handleItemClick}
                />
                <EquipmentSlot 
                  item={equippedItems.ring2 || null} 
                  slotName="Anneau 2"
                  onItemClick={handleItemClick}
                />
              </div>

              {/* Ligne du bas - Arme, Armure, Bouclier - PLUS ESPACÉE */}
              <div className="flex items-center space-x-5">
                <EquipmentSlot 
                  item={equippedItems.weapon || null} 
                  slotName="Arme"
                  onItemClick={handleItemClick}
                />
                <EquipmentSlot 
                  item={equippedItems.chest || null} 
                  slotName="Armure"
                  onItemClick={handleItemClick}
                />
                <EquipmentSlot 
                  item={equippedItems.shield || null} 
                  slotName="Bouclier"
                  onItemClick={handleItemClick}
                />
              </div>

              {/* Ligne tout en bas - Gants, Ceinture, Bottes - PLUS ESPACÉE */}
              <div className="flex items-center space-x-5">
                <EquipmentSlot 
                  item={equippedItems.gloves || null} 
                  slotName="Gants"
                  onItemClick={handleItemClick}
                />
                <EquipmentSlot 
                  item={equippedItems.belt || null} 
                  slotName="Ceinture"
                  onItemClick={handleItemClick}
                />
                <EquipmentSlot 
                  item={equippedItems.boots || null} 
                  slotName="Bottes"
                  onItemClick={handleItemClick}
                />
              </div>
            </div>
          </div>

          {/* Onglets pour les objets avec style MMO */}
          <div className="border-b border-gray-700 bg-gray-800/30">
            <div className="flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 py-3 px-2 text-center transition-all duration-300 text-sm font-medium border-b-2 ${
                      activeInventoryTab === tab.id 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500 shadow-lg shadow-orange-500/20' 
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 border-transparent'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <IconComponent size={18} />
                      <span className="text-xs">{tab.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grille d'objets avec style MMO - PLUS DE COLONNES */}
          <div className="p-4">
            <div className="mb-3 flex justify-between items-center text-sm">
              <span className="text-gray-400">Objets dans {activeInventoryTab}:</span>
              <span className="text-orange-400 font-bold">{getItemsByType(activeInventoryTab).length}</span>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {getItemsByType(activeInventoryTab).map(item => (
                <div
                  key={item.id}
                  className={`aspect-square bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center p-2 group shadow-lg hover:shadow-orange-500/20 ${
                    selectedItem && hasId(selectedItem) && hasId(item) && selectedItem.id === item.id
                      ? 'border-orange-500 bg-orange-500/20' 
                      : 'border-gray-600/50 hover:border-orange-500/50'
                  }`}
                  title={`${item.name} (${item.quantity})`}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-white text-xs text-center font-bold bg-gray-700/80 px-1 py-0.5 rounded">{item.quantity}</span>
                </div>
              ))}
              
              {/* Cases vides pour remplir la grille avec style */}
              {Array.from({length: Math.max(0, 24 - getItemsByType(activeInventoryTab).length)}).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-colors"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer avec statistiques d'inventaire */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-center text-sm">
            <div className="flex justify-between items-center text-gray-400 mb-2">
              <span>Capacité d'inventaire:</span>
              <span className="text-orange-400 font-bold">{totalItems}/{maxCapacity}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  usagePercentage > 90 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                  usagePercentage > 70 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                  'bg-gradient-to-r from-green-600 to-green-500'
                } shadow-lg`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {usagePercentage > 90 ? '⚠️ Inventaire presque plein' :
               usagePercentage > 70 ? '📦 Inventaire se remplit' :
               '✅ Espace disponible'}
            </p>
          </div>
        </div>
      </div>

      {/* Panneau de prévisualisation - CARRÉ CONVENABLE ET BIEN PROPORTIONNÉ */}
      <div className="w-96 p-4">
        <ItemPreview item={selectedItem} />
      </div>
    </div>
  );
};

export default InventoryPanel;