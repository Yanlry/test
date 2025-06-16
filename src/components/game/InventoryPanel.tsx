/**
 * PANNEAU D'INVENTAIRE (SIDEBAR DROITE) - STYLE MMO SOMBRE
 * Pour modifier l'apparence de l'inventaire et des équipements, c'est ici
 */

import React from 'react';
import { Character, InventoryItem, EquippedItem } from '../../types/game';
import { DEFAULT_EQUIPPED_ITEMS, DEFAULT_INVENTORY_ITEMS } from '../../utils/gameConstants';
import { X, Package, Sword, Shield } from 'lucide-react';

// Type local pour les onglets d'inventaire
type InventoryTab = 'equipement' | 'consommable' | 'ressource';

interface InventoryPanelProps {
  character: Character;
  activeInventoryTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
  onClose?: () => void; // Nouveau prop pour fermer le panel
}

/**
 * Composant de slot d'équipement
 */
const EquipmentSlot: React.FC<{
  item?: InventoryItem | EquippedItem | null;
  slotName: string;
  className?: string;
}> = React.memo(({ item, slotName, className = "" }) => (
  <div 
    className={`w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-600 flex items-center justify-center cursor-pointer transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 group ${className}`}
    title={item?.name || `${slotName} vide`}
  >
    {item ? (
      <div className="relative">
        <span className="text-2xl group-hover:scale-110 transition-transform">
          {item.icon}
        </span>
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    ) : (
      <div className="text-gray-600 text-lg">❌</div>
    )}
    <div className="absolute -bottom-1 -right-1 text-xs bg-gray-700 text-gray-300 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
      {slotName}
    </div>
  </div>
));

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  character,
  activeInventoryTab,
  onTabChange,
  onClose
}) => {
  // Pour l'instant, on utilise les données par défaut
  const equippedItems = DEFAULT_EQUIPPED_ITEMS;
  const inventoryItems = DEFAULT_INVENTORY_ITEMS;

  // Fonction pour filtrer les objets par type avec les nouveaux noms de types
  const getItemsByType = (type: InventoryTab): InventoryItem[] => {
    return inventoryItems.filter(item => item.type === type);
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
    <div className="h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-l border-gray-700 flex flex-col backdrop-blur-sm">
      
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
        {/* Zone équipement style MMO avancé */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-orange-400 font-bold text-lg mb-4 text-center flex items-center justify-center">
            <Sword className="mr-2" size={18} />
            Équipements Portés
          </h3>
          
          {/* Disposition d'équipement en forme de croix avec personnage au centre */}
          <div className="relative flex flex-col items-center space-y-3">
            
            {/* Ligne du haut - Chapeau */}
            <div className="flex justify-center">
              <EquipmentSlot 
                item={equippedItems.helmet || null} 
                slotName="Chapeau"
              />
            </div>

            {/* Ligne du milieu - Cape, Collier, Personnage, Anneau 1, Anneau 2 */}
            <div className="flex items-center space-x-3">
              <EquipmentSlot 
                item={equippedItems.cape || null} 
                slotName="Cape"
              />
              <EquipmentSlot 
                item={equippedItems.necklace || null} 
                slotName="Collier"
              />
              
              {/* Personnage au centre avec les mains tendues */}
              <div className="relative">
                <div 
                  className="w-20 h-24 rounded-lg border-4 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-xl"
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
                      className="w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center text-2xl border-2 border-gray-500 shadow-lg"
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
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full shadow-lg" />
                  
                  {/* Bras droit tendu */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-gradient-to-l from-amber-600 to-amber-700 rounded-full shadow-lg" />
                </div>
              </div>

              <EquipmentSlot 
                item={equippedItems.ring1 || null} 
                slotName="Anneau 1"
              />
              <EquipmentSlot 
                item={equippedItems.ring2 || null} 
                slotName="Anneau 2"
              />
            </div>

            {/* Ligne du bas - Arme, Armure, Bouclier */}
            <div className="flex items-center space-x-4">
              <EquipmentSlot 
                item={equippedItems.weapon || null} 
                slotName="Arme"
              />
              <EquipmentSlot 
                item={equippedItems.chest || null} 
                slotName="Armure"
              />
              <EquipmentSlot 
                item={equippedItems.shield || null} 
                slotName="Bouclier"
              />
            </div>

            {/* Ligne tout en bas - Gants, Ceinture, Bottes */}
            <div className="flex items-center space-x-4">
              <EquipmentSlot 
                item={equippedItems.gloves || null} 
                slotName="Gants"
              />
              <EquipmentSlot 
                item={equippedItems.belt || null} 
                slotName="Ceinture"
              />
              <EquipmentSlot 
                item={equippedItems.boots || null} 
                slotName="Bottes"
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

        {/* Grille d'objets avec style MMO */}
        <div className="p-4">
          <div className="mb-3 flex justify-between items-center text-sm">
            <span className="text-gray-400">Objets dans {activeInventoryTab}:</span>
            <span className="text-orange-400 font-bold">{getItemsByType(activeInventoryTab).length}</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {getItemsByType(activeInventoryTab).map(item => (
              <div
                key={item.id}
                className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-lg border border-gray-600/50 hover:border-orange-500/50 transition-all cursor-pointer flex flex-col items-center justify-center p-2 group shadow-lg hover:shadow-orange-500/20"
                title={`${item.name} (${item.quantity})`}
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-white text-xs text-center font-bold bg-gray-700/80 px-2 py-1 rounded">{item.quantity}</span>
              </div>
            ))}
            
            {/* Cases vides pour remplir la grille avec style */}
            {Array.from({length: Math.max(0, 15 - getItemsByType(activeInventoryTab).length)}).map((_, i) => (
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