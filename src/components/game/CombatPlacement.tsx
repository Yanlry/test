/**
 * COMPOSANT DE PLACEMENT TACTIQUE STYLE DOFUS
 * Interface pour choisir les positions de départ avant le combat
 * ✅ CORRIGÉ: Z-index augmenté pour être au premier plan
 */

import React, { useState } from 'react';
import { CombatState, Combatant, PlacementZone } from '../../types/combat';
import { Position } from '../../types/game';
import { Swords, CheckCircle, Clock, Users } from 'lucide-react';

interface CombatPlacementProps {
  combatState: CombatState;
  onPlaceCombatant: (combatantId: string, position: Position) => void;
  onSetReady: (combatantId: string) => void;
  onCancelCombat: () => void;
}

const CombatPlacement: React.FC<CombatPlacementProps> = ({
  combatState,
  onPlaceCombatant,
  onSetReady,
  onCancelCombat
}) => {
  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>('player');
  const [placementTimer, setPlacementTimer] = useState(30); // 30 secondes pour se placer

  // Décompte du timer de placement
  React.useEffect(() => {
    if (combatState.phase !== 'placement') return;

    const interval = setInterval(() => {
      setPlacementTimer(prev => {
        if (prev <= 1) {
          // Auto-placer les combattants non placés
          autoPlaceRemainingCombatants();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [combatState.phase]);

  // Auto-placement des combattants restants
  const autoPlaceRemainingCombatants = () => {
    combatState.combatants.forEach(combatant => {
      if (!combatant.startPosition) {
        const zone = combatState.placementZones.find(z => z.team === combatant.team);
        if (zone) {
          // Prendre la première position libre
          const freePosition = zone.positions.find(pos => 
            !combatState.combatants.some(c => 
              c.startPosition?.x === pos.x && c.startPosition?.y === pos.y
            )
          );
          
          if (freePosition) {
            onPlaceCombatant(combatant.id, freePosition);
            setTimeout(() => onSetReady(combatant.id), 500);
          }
        }
      } else if (!combatant.isReady) {
        onSetReady(combatant.id);
      }
    });
  };

  // Obtenir les informations du combattant sélectionné
  const selectedCombatant = combatState.combatants.find(c => c.id === selectedCombatantId);
  
  // Obtenir la zone de placement pour le combattant sélectionné
  const placementZone = selectedCombatant 
    ? combatState.placementZones.find(z => z.team === selectedCombatant.team)
    : null;

  // Vérifier si une position est libre
  const isPositionFree = (position: Position): boolean => {
    return !combatState.combatants.some(c => 
      c.startPosition?.x === position.x && c.startPosition?.y === position.y
    );
  };

  // Gérer le clic sur une zone de placement
  const handleZoneClick = (position: Position) => {
    if (!selectedCombatant || !placementZone) return;
    
    // Vérifier que c'est bien dans la zone du combattant
    const isValidZone = placementZone.positions.some(p => 
      p.x === position.x && p.y === position.y
    );
    
    if (!isValidZone) {
      console.log('❌ Cette zone ne vous appartient pas !');
      return;
    }

    if (!isPositionFree(position)) {
      console.log('❌ Position occupée !');
      return;
    }

    // Placer le combattant
    onPlaceCombatant(selectedCombatant.id, position);
    console.log(`✅ ${selectedCombatant.name} placé en (${position.x}, ${position.y})`);
  };

  // Calculer le pourcentage de combattants prêts
  const readyCount = combatState.combatants.filter(c => c.isReady).length;
  const totalCount = combatState.combatants.length;
  const readyPercentage = (readyCount / totalCount) * 100;

  return (
    <div className="fixed inset-0 z-[50000] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      {/* Interface de placement tactique */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-orange-500 shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto m-4 relative z-[50001]">
  
        {/* En-tête du placement */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Swords size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Phase de Placement</h1>
                <p className="text-orange-100">Choisissez vos positions de départ</p>
              </div>
            </div>
            
            {/* Timer de placement */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Clock size={24} className="text-white" />
              </div>
              <div className="text-2xl font-bold">{placementTimer}s</div>
              <div className="text-sm text-orange-100">Temps restant</div>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Combattants prêts</span>
              <span>{readyCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                style={{ width: `${readyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Zone principale de placement */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonne de gauche - Liste des combattants */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Users size={20} className="mr-2" />
                Combattants
              </h3>
              
              {combatState.combatants.map((combatant) => (
                <div
                  key={combatant.id}
                  onClick={() => setSelectedCombatantId(combatant.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedCombatantId === combatant.id
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar du combattant */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2"
                      style={{ 
                        borderColor: combatant.color,
                        backgroundColor: `${combatant.color}20`
                      }}
                    >
                      {combatant.icon}
                    </div>
                    
                    {/* Infos du combattant */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{combatant.name}</span>
                        {combatant.isReady && (
                          <CheckCircle size={16} className="text-green-400" />
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Niveau {combatant.level} • {combatant.health}/{combatant.maxHealth} PV
                      </div>
                      <div className="text-xs mt-1">
                        {combatant.startPosition 
                          ? `Placé en (${combatant.startPosition.x}, ${combatant.startPosition.y})`
                          : 'Non placé'
                        }
                      </div>
                    </div>
                    
                    {/* Indicateur d'équipe */}
                    <div 
                      className="w-3 h-8 rounded-full"
                      style={{ backgroundColor: combatant.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Colonne du milieu - Grille de placement */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">Grille de Placement</h3>
              
              {/* Mini-map de placement */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
                <div className="grid grid-cols-8 gap-2 max-w-md mx-auto">
                  {/* Générer une grille 8x8 pour l'exemple */}
                  {Array.from({ length: 64 }, (_, index) => {
                    const x = index % 8;
                    const y = Math.floor(index / 8);
                    const position = { x: x + 6, y: y + 6 }; // Offset pour correspondre à la vraie map
                    
                    // Vérifier si cette case fait partie d'une zone de placement
                    const playerZone = combatState.placementZones.find(z => z.team === 'player');
                    const enemyZone = combatState.placementZones.find(z => z.team === 'enemy');
                    
                    const isPlayerZone = playerZone?.positions.some(p => p.x === position.x && p.y === position.y);
                    const isEnemyZone = enemyZone?.positions.some(p => p.x === position.x && p.y === position.y);
                    
                    // Vérifier si la case est occupée
                    const occupiedBy = combatState.combatants.find(c => 
                      c.startPosition?.x === position.x && c.startPosition?.y === position.y
                    );
                    
                    let cellClass = 'w-8 h-8 rounded border-2 border-gray-600 bg-gray-700 transition-all';
                    let cellStyle = {};
                    
                    if (isPlayerZone) {
                      cellClass = 'w-8 h-8 rounded border-2 border-blue-400 bg-blue-500/30 hover:bg-blue-500/50 cursor-pointer transition-all';
                    } else if (isEnemyZone) {
                      cellClass = 'w-8 h-8 rounded border-2 border-red-400 bg-red-500/30 hover:bg-red-500/50 cursor-pointer transition-all';
                    }
                    
                    if (occupiedBy) {
                      cellClass += ' ring-2 ring-yellow-400';
                    }
                    
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={cellClass}
                        style={cellStyle}
                        onClick={() => (isPlayerZone || isEnemyZone) && handleZoneClick(position)}
                        title={
                          occupiedBy ? `Occupé par ${occupiedBy.name}` :
                          isPlayerZone ? 'Zone joueur - Cliquez pour placer' :
                          isEnemyZone ? 'Zone ennemie' :
                          'Case normale'
                        }
                      >
                        {occupiedBy && (
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            {occupiedBy.icon}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Légende */}
                <div className="flex justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500/50 border border-blue-400 rounded"></div>
                    <span className="text-gray-300">Zone Joueur</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500/50 border border-red-400 rounded"></div>
                    <span className="text-gray-300">Zone Ennemie</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-700 border border-gray-600 rounded"></div>
                    <span className="text-gray-300">Terrain Normal</span>
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-400 font-bold mb-2">Instructions :</h4>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>1. Sélectionnez un combattant dans la liste</li>
                  <li>2. Cliquez sur une case de votre couleur pour le placer</li>
                  <li>3. Une fois placé, cliquez sur "Prêt" pour valider</li>
                  <li>4. Le combat commence quand tous sont prêts !</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={onCancelCombat}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Annuler le Combat
            </button>
            
            <div className="flex space-x-4">
              {selectedCombatant && selectedCombatant.startPosition && !selectedCombatant.isReady && (
                <button
                  onClick={() => selectedCombatant && onSetReady(selectedCombatant.id)}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-bold flex items-center space-x-2"
                >
                  <CheckCircle size={20} />
                  <span>Prêt !</span>
                </button>
              )}
              
              {readyCount === totalCount && (
                <div className="px-8 py-3 bg-orange-600 text-white rounded-lg font-bold flex items-center space-x-2 animate-pulse">
                  <Swords size={20} />
                  <span>Combat en cours...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatPlacement;