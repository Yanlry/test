/**
 * PANNEAU D'INVENTAIRE PLEIN ÉCRAN - VERSION AVEC CARRÉ RAISONNABLE
 * ✅ CORRIGÉ: Carré devient juste 2x plus haut (pas énorme)
 * ✅ GARDÉ: Taille normale quand aucun objet cliqué
 * ✅ GARDÉ: Toutes les fonctionnalités existantes
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
 * Composant de slot d'équipement - UNIFORME
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
 * ✅ CORRIGÉ: Composant de prévisualisation RAISONNABLE
 * - Petit quand aucun objet sélectionné
 * - Juste 2x plus haut (pas énorme) quand objet sélectionné
 */
const ItemPreviewReasonable: React.FC<{
  item: InventoryItem | EquippedItem | null;
}> = React.memo(({ item }) => {
  // ✅ SI PAS D'OBJET: Version compacte normale
  if (!item) {
    return (
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl border border-gray-700 p-4 h-full flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="text-center text-gray-400">
          <Eye size={32} className="mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-2">Prévisualisation</h3>
          <p className="text-sm mb-3">Cliquez sur un objet pour voir ses détails</p>
          <div className="flex justify-center space-x-2">
            <Star className="text-yellow-400 opacity-30 animate-pulse" size={16} />
            <Star className="text-yellow-400 opacity-30 animate-pulse" size={20} style={{ animationDelay: '0.5s' }} />
            <Star className="text-yellow-400 opacity-30 animate-pulse" size={16} style={{ animationDelay: '1s' }} />
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

  // ✅ SI OBJET SÉLECTIONNÉ: Version RAISONNABLE (juste 2x plus haut)
  return (
    <div className={`bg-gradient-to-br ${rarityInfo.bgColor} rounded-xl border-2 ${rarityInfo.borderColor} p-4 h-full backdrop-blur-sm shadow-xl flex flex-col overflow-y-auto`}>
      
      {/* ✅ CORRIGÉ: En-tête de taille RAISONNABLE */}
      <div className="text-center mb-4">
        <div className="relative mb-3">
          {/* ✅ Icône plus grande mais PAS énorme */}
          <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 ${rarityInfo.borderColor} flex items-center justify-center shadow-lg`}>
            <span className="text-3xl">{item.icon}</span>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full blur-sm animate-pulse" />
        </div>
        
        {/* ✅ Nom et rareté de taille normale */}
        <h3 className={`text-lg font-bold ${rarityInfo.color} mb-2`}>{item.name}</h3>
        <span className={`px-3 py-1 text-sm rounded-full border ${rarityInfo.borderColor} ${rarityInfo.color} bg-gradient-to-r ${rarityInfo.bgColor}`}>
          {rarityInfo.name}
        </span>
      </div>

      {/* ✅ CORRIGÉ: Contenu de taille RAISONNABLE */}
      <div className="flex-1 space-y-3 text-sm">
        
        {/* Type et quantité - Taille normale */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Type:</span>
            <span className="text-white font-medium capitalize">
              {isInventoryItem(item) ? item.type : 'Équipement'}
            </span>
          </div>
          
          {isInventoryItem(item) && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Quantité:</span>
              <span className="text-orange-400 font-bold text-base">{item.quantity}</span>
            </div>
          )}
        </div>

        {/* Description - Taille normale */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
          <div className="flex items-center mb-2">
            <Info size={16} className="text-blue-400 mr-2" />
            <span className="text-gray-400 text-sm">Description:</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {hasDescription(item) ? item.description : "Aucune description disponible pour cet objet."}
          </p>
        </div>

        {/* Statistiques pour les équipements - Compact mais lisible */}
        {hasStats(item) && (
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
            <div className="flex items-center mb-2">
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

        {/* Effet spécial - Compact */}
        {hasEffect(item) && (
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-3 border border-purple-500/30">
            <div className="flex items-center mb-2">
              <Star size={16} className="text-purple-400 mr-2" />
              <span className="text-purple-400 text-sm font-bold">Effet spécial:</span>
            </div>
            <p className="text-purple-300 text-sm italic">{item.effect}</p>
          </div>
        )}

        {/* ✅ NOUVEAU: Informations supplémentaires COMPACTES */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
          <div className="flex items-center mb-2">
            <Star size={16} className="text-yellow-400 mr-2" />
            <span className="text-gray-400 text-sm">Informations:</span>
          </div>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Durabilité:</span>
              <span className="text-green-400">{Math.floor(Math.random() * 100) + 50}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Niveau requis:</span>
              <span className="text-blue-400">Niv. {Math.floor(Math.random() * 20) + 1}</span>
            </div>
            <div className="flex justify-between">
              <span>Valeur:</span>
              <span className="text-yellow-400">{Math.floor(Math.random() * 1000) + 100} po</span>
            </div>
            {isInventoryItem(item) && item.type === 'consommable' && (
              <div className="flex justify-between">
                <span>Recharge:</span>
                <span className="text-orange-400">{Math.floor(Math.random() * 10) + 1}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ CORRIGÉ: Actions de taille RAISONNABLE */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button className="py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
            Utiliser
          </button>
          <button className="py-2 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
            Détails
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Équiper
          </button>
          <button className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
            Vendre
          </button>
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
    // Layout PLEIN ÉCRAN - Une seule colonne
    <div className="h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      
      <div className="flex-1 overflow-y-auto">
        {/* ✅ CORRIGÉ: Zone équipement avec prévisualisation de taille RAISONNABLE */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-orange-400 font-bold text-lg mb-4 text-center flex items-center justify-center">
            <Sword className="mr-2" size={18} />
            Équipements Portés
          </h3>
          
          {/* ✅ CORRIGÉ: Container avec tailles RAISONNABLES */}
          <div className="flex gap-6">
            
            {/* ✅ GAUCHE: Disposition d'équipement - Garde sa place */}
            <div className="flex-1 max-w-[60%]">
              <div className="relative flex flex-col items-center space-y-3">
                
                {/* Ligne du haut - Chapeau */}
                <div className="flex justify-center">
                  <EquipmentSlot 
                    item={equippedItems.helmet || null} 
                    slotName="Chapeau"
                    onItemClick={handleItemClick}
                  />
                </div>

                {/* Ligne du milieu - Cape, Collier, Personnage, Anneau 1, Anneau 2 */}
                <div className="flex items-center space-x-3">
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
                  
                  {/* Personnage au centre */}
                  <div className="relative mx-2">
                    <div 
                      className="w-20 h-24 rounded-lg border-4 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-xl"
                      style={{ 
                        background: `linear-gradient(145deg, ${character.class.color}10, ${character.class.color}30)`,
                        boxShadow: `0 0 20px ${character.class.color}40`
                      }}
                    >
                      {/* Effet de fond animé */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                      
                      {/* Personnage */}
                      <div className="text-center relative z-10">
                        <div 
                          className="w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center text-xl border-2 border-gray-500 shadow-lg"
                          style={{ 
                            background: `linear-gradient(145deg, ${character.appearance.skinTone}, ${character.appearance.skinTone}CC)` 
                          }}
                        >
                          {character.class.avatar}
                        </div>
                        <p className="text-white text-xs font-bold">{character.name}</p>
                        <p className="text-gray-400 text-xs">Niv.{character.level}</p>
                      </div>
                      
                      {/* Bras gauche et droit */}
                      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full shadow-lg" />
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-gradient-to-l from-amber-600 to-amber-700 rounded-full shadow-lg" />
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

                {/* Ligne du bas - Arme, Armure, Bouclier */}
                <div className="flex items-center space-x-4">
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

                {/* Ligne tout en bas - Gants, Ceinture, Bottes */}
                <div className="flex items-center space-x-4">
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
            
            {/* ✅ DROITE: Prévisualisation de taille RAISONNABLE - Juste un peu plus grande */}
            <div className="w-96 h-full">
              <ItemPreviewReasonable item={selectedItem} />
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

        {/* Grille d'objets avec style MMO - PLUS LARGE */}
        <div className="p-4">
          <div className="mb-3 flex justify-between items-center text-sm">
            <span className="text-gray-400">Objets dans {activeInventoryTab}:</span>
            <span className="text-orange-400 font-bold">{getItemsByType(activeInventoryTab).length}</span>
          </div>

          {/* Plus de colonnes car plus d'espace horizontal */}
          <div className="grid grid-cols-12 gap-2">
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
            
            {/* Cases vides pour remplir la grille */}
            {Array.from({length: Math.max(0, 36 - getItemsByType(activeInventoryTab).length)}).map((_, i) => (
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
  );
};

export default InventoryPanel;