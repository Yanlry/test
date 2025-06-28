/**
 * COMBAT TIMELINE AVEC TIMER INTÉGRÉ - VERSION FINALE
 * ✅ Timer intégré : Affiche le temps restant à côté du combattant actuel
 * ✅ Barre rouge : Se remplit progressivement selon le temps écoulé
 * ✅ Compact : Plus besoin du composant CombatTimer séparé
 * ✅ Visual : Change de couleur selon le temps restant
 */

import React from 'react';
import { Heart, Shield, Target, Skull, Crown, Clock, AlertTriangle } from 'lucide-react';

// Import des vrais types du système de combat
import { Combatant, CombatState } from '../../types/combat';

// ✅ NOUVEAU: Interface mise à jour avec les props du timer
interface CombatTimelineProps {
  combatState: CombatState;
  onTargetSelect: (combatant: Combatant) => void;
  // Props du timer intégré
  timeLeft: number; // Temps restant en secondes
  maxTime: number;  // Temps total (45 secondes)
  isTimerActive: boolean; // Si le timer est actif
}

// ===== COMPOSANT TIMELINE AVEC TIMER =====

const CombatTimeline: React.FC<CombatTimelineProps> = ({
  combatState,
  onTargetSelect,
  timeLeft,
  maxTime,
  isTimerActive
}) => {
  
  // ===== FONCTIONS UTILITAIRES =====
  
  const getHealthPercentage = (combatant: Combatant): number => {
    return (combatant.health / combatant.maxHealth) * 100;
  };

  const getHealthBarColor = (percentage: number): string => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // ✅ NOUVEAU: Fonctions pour le timer
  const getTimerPercentage = (): number => {
    return (timeLeft / maxTime) * 100;
  };

  const getTimerColor = (): string => {
    if (timeLeft > 30) {
      return 'text-green-400'; // Vert si plus de 30s
    } else if (timeLeft > 15) {
      return 'text-yellow-400'; // Jaune si plus de 15s
    } else if (timeLeft > 5) {
      return 'text-orange-400'; // Orange si plus de 5s
    } else {
      return 'text-red-400'; // Rouge si moins de 5s
    }
  };

  const getTimerBarColor = (): string => {
    if (timeLeft > 30) {
      return 'bg-green-500';
    } else if (timeLeft > 15) {
      return 'bg-yellow-500';
    } else if (timeLeft > 5) {
      return 'bg-orange-500';
    } else {
      return 'bg-red-500';
    }
  };

  const formatTime = (seconds: number): string => {
    return `${seconds}s`;
  };

  const canTargetCombatant = (combatant: Combatant): boolean => {
    if (!combatState.selectedSpell) return false;
    if (!combatant.isAlive) return false;
    
    const spell = combatState.selectedSpell.spell;
    
    // Sorts de soins : seulement les alliés vivants
    if (spell.type === 'heal') {
      return combatant.team === 'player';
    }
    
    // Sorts de dégâts : seulement les ennemis vivants
    if (spell.type === 'damage') {
      return combatant.team === 'enemy';
    }
    
    return true;
  };

  const getCombatantBorderClass = (combatant: Combatant): string => {
    const isCurrentTurn = combatState.currentTurnCombatantId === combatant.id;
    const canTarget = canTargetCombatant(combatant);
    
    if (isCurrentTurn) {
      // ✅ NOUVEAU: Couleur spéciale si temps faible pour le joueur actuel
      if (isTimerActive && timeLeft <= 5) {
        return 'border-red-400 bg-red-400/30 shadow-lg shadow-red-400/50 animate-pulse';
      }
      return 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30';
    }
    
    if (canTarget && combatState.selectedSpell) {
      const spell = combatState.selectedSpell.spell;
      if (spell.type === 'heal') {
        return 'border-green-400 bg-green-400/20 hover:bg-green-400/30 cursor-pointer';
      } else {
        return 'border-red-400 bg-red-400/20 hover:bg-red-400/30 cursor-pointer';
      }
    }
    
    if (combatant.team === 'player') {
      return 'border-blue-400 bg-blue-400/10';
    } else {
      return 'border-red-600 bg-red-600/10';
    }
  };

  const handleCombatantClick = (combatant: Combatant): void => {
    if (canTargetCombatant(combatant)) {
      console.log(`🎯 Timeline: Cible sélectionnée - ${combatant.name}`);
      onTargetSelect(combatant);
    }
  };

  // ===== RENDU =====
  
  // N'afficher que pendant les phases de combat
  if (combatState.phase !== 'fighting') {
    return null;
  }

  return (
    <div className="fixed bottom-52 right-3 z-[9998] pointer-events-auto">
      <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg backdrop-blur-sm shadow-lg p-3 max-w-md">
        
        {/* En-tête de la timeline */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-medium flex items-center space-x-2">
            <Target size={14} className="text-orange-400" />
            <span>Timeline de Combat</span>
            {/* ✅ NOUVEAU: Indicateur de timer global */}
            {isTimerActive && (
              <div className="flex items-center space-x-1">
                {timeLeft <= 5 ? (
                  <AlertTriangle size={12} className="text-red-400 animate-bounce" />
                ) : (
                  <Clock size={12} className="text-gray-400" />
                )}
              </div>
            )}
          </h3>
          {combatState.selectedSpell && (
            <div className="text-xs text-purple-400 bg-purple-400/20 px-2 py-1 rounded">
              {combatState.selectedSpell.spell.name}
            </div>
          )}
        </div>

        {/* Liste des combattants */}
        <div className="space-y-2">
          {combatState.combatants
            .filter(c => c.isAlive)
            .map((combatant) => {
              const healthPercentage = getHealthPercentage(combatant);
              const healthBarColor = getHealthBarColor(healthPercentage);
              const borderClass = getCombatantBorderClass(combatant);
              const isCurrentTurn = combatState.currentTurnCombatantId === combatant.id;
              const canTarget = canTargetCombatant(combatant);

              return (
                <div
                  key={combatant.id}
                  onClick={() => handleCombatantClick(combatant)}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 ${borderClass} ${
                    canTarget ? 'hover:scale-105' : ''
                  } ${isCurrentTurn && isTimerActive && timeLeft <= 5 ? 'animate-pulse' : ''}`}
                  title={
                    canTarget 
                      ? `Cibler ${combatant.name}` 
                      : `${combatant.name} (${combatant.team === 'player' ? 'Allié' : 'Ennemi'})`
                  }
                >
                  <div className="flex items-center space-x-2">
                    
                    {/* Icône du combattant */}
                    <div className="relative">
                      {combatant.team === 'player' ? (
                        <Crown size={20} className="text-blue-400" />
                      ) : (
                        <Skull size={20} className="text-red-400" />
                      )}
                      {isCurrentTurn && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                      )}
                    </div>

                    {/* Informations du combattant */}
                    <div className="flex-1 min-w-0">
                      
                      {/* Nom et stats principales */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium truncate ${
                            combatant.team === 'player' ? 'text-blue-300' : 'text-red-300'
                          }`}>
                            {combatant.name}
                            {isCurrentTurn && <span className="text-yellow-400 ml-1">◄</span>}
                          </span>
                          
                          {/* ✅ NOUVEAU: Timer intégré à côté du nom pour le joueur actuel */}
                          {isCurrentTurn && isTimerActive && (
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold ${
                              timeLeft <= 5 ? 'bg-red-900/50 animate-pulse' : 
                              timeLeft <= 15 ? 'bg-orange-900/50' : 'bg-gray-800/50'
                            }`}>
                              {timeLeft <= 5 ? (
                                <AlertTriangle size={10} className="text-red-400" />
                              ) : (
                                <Clock size={10} className={getTimerColor()} />
                              )}
                              <span className={getTimerColor()}>
                                {formatTime(timeLeft)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs">
                          {/* PA/PM */}
                          <span className="text-orange-400 font-bold">
                            {combatant.pa}PA
                          </span>
                          <span className="text-green-400 font-bold">
                            {combatant.pm}PM
                          </span>
                        </div>
                      </div>

                      {/* Barre de vie */}
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">PV</span>
                          <span className="text-white font-mono">
                            {combatant.health}/{combatant.maxHealth}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${healthBarColor}`}
                            style={{ width: `${Math.max(0, healthPercentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* ✅ NOUVEAU: Barre de timer pour le joueur actuel */}
                      {isCurrentTurn && isTimerActive && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400">Temps</span>
                            <span className={`font-mono font-bold ${getTimerColor()}`}>
                              {timeLeft}s / {maxTime}s
                            </span>
                          </div>
                          {/* Barre qui se remplit selon le temps écoulé (inverse du temps restant) */}
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${getTimerBarColor()} ${
                                timeLeft <= 5 ? 'animate-pulse' : ''
                              }`}
                              style={{ width: `${100 - getTimerPercentage()}%` }}
                            />
                          </div>
                          {/* Message d'urgence */}
                          {timeLeft <= 5 && (
                            <div className="text-center mt-1">
                              <span className="text-red-400 text-xs font-bold animate-bounce">
                                ⚠️ Temps presque écoulé !
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Indicateur de ciblage */}
                    {canTarget && combatState.selectedSpell && (
                      <div className="flex flex-col items-center">
                        <Target size={16} className="text-yellow-400 animate-bounce" />
                        <span className="text-xs text-yellow-400 font-bold">CIBLE</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default CombatTimeline;