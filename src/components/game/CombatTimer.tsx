/**
 * COMPOSANT TIMER DE COMBAT
 * ✅ AFFICHE: Le temps restant pour le tour actuel (45 secondes)
 * ✅ VISUEL: Change de couleur selon le temps restant
 * ✅ SIMPLE: Reçoit juste le temps restant et l'affiche
 */

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CombatTimerProps {
  timeLeft: number; // Temps restant en secondes
  maxTime: number;  // Temps total (45 secondes)
  isActive: boolean; // Si le timer est actif (en combat)
  currentPlayerName?: string; // Nom du joueur dont c'est le tour
}

const CombatTimer: React.FC<CombatTimerProps> = ({
  timeLeft,
  maxTime,
  isActive,
  currentPlayerName = "Joueur"
}) => {
  // Ne pas afficher si pas actif
  if (!isActive) {
    return null;
  }

  // Calculer le pourcentage de temps restant
  const percentage = (timeLeft / maxTime) * 100;

  // Déterminer la couleur selon le temps restant
  const getTimerColor = () => {
    if (timeLeft > 30) {
      return 'text-green-400 border-green-400'; // Vert si plus de 30s
    } else if (timeLeft > 15) {
      return 'text-yellow-400 border-yellow-400'; // Jaune si plus de 15s
    } else if (timeLeft > 5) {
      return 'text-orange-400 border-orange-400'; // Orange si plus de 5s
    } else {
      return 'text-red-400 border-red-400'; // Rouge si moins de 5s
    }
  };

  // Déterminer la couleur de la barre de progression
  const getProgressColor = () => {
    if (timeLeft > 30) {
      return 'bg-green-500'; // Vert si plus de 30s
    } else if (timeLeft > 15) {
      return 'bg-yellow-500'; // Jaune si plus de 15s
    } else if (timeLeft > 5) {
      return 'bg-orange-500'; // Orange si plus de 5s
    } else {
      return 'bg-red-500'; // Rouge si moins de 5s
    }
  };

  // Formatter le temps (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-20 right-4 z-[6000] pointer-events-auto">
      <div className={`
        bg-gray-900/95 border-2 rounded-lg backdrop-blur-sm shadow-xl p-4 min-w-[200px]
        ${getTimerColor()}
        ${timeLeft <= 5 ? 'animate-pulse' : ''}
      `}>
        
        {/* En-tête avec icône */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {timeLeft <= 5 ? (
              <AlertTriangle size={16} className="animate-bounce" />
            ) : (
              <Clock size={16} />
            )}
            <span className="text-white text-sm font-medium">
              Tour de {currentPlayerName}
            </span>
          </div>
        </div>

        {/* Affichage du temps restant */}
        <div className="text-center">
          <div className={`text-2xl font-bold mb-2 ${getTimerColor().split(' ')[0]}`}>
            {formatTime(timeLeft)}
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Texte d'aide */}
          <div className="text-gray-300 text-xs mt-2">
            {timeLeft <= 5 ? (
              <span className="animate-pulse font-bold">⚠️ TEMPS PRESQUE ÉCOULÉ !</span>
            ) : timeLeft <= 15 ? (
              <span>Dépêchez-vous !</span>
            ) : (
              <span>Temps restant</span>
            )}
          </div>
        </div>

        {/* Message spécial si temps très faible */}
        {timeLeft <= 3 && (
          <div className="mt-2 text-center">
            <span className="text-red-400 text-xs font-bold animate-bounce">
              Le tour va passer automatiquement !
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatTimer;