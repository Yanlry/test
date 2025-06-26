/**
 * COMPOSANT MONSTER - CRÉATURE QUI SE DÉPLACE ALÉATOIREMENT
 * ✅ CORRIGÉ: Les monstres ne bougent plus tous en même temps lors des clics
 * Gère l'affichage et la logique de déplacement d'un monstre sur la map
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Monster as MonsterType } from '../../types/combat';
import { Position } from '../../types/game';

interface MonsterProps {
  monster: MonsterType;
  onMonsterMove: (monsterId: string, newPosition: Position) => void;
  onMonsterClick: (monster: MonsterType) => void;
  isWalkable: (x: number, y: number) => boolean;
  mapWidth: number;
  mapHeight: number;
  getTileRenderPosition: (x: number, y: number) => { x: number; y: number };
  isInCombat: boolean;
}

const Monster: React.FC<MonsterProps> = ({
  monster,
  onMonsterMove,
  onMonsterClick,
  isWalkable,
  mapWidth,
  mapHeight,
  getTileRenderPosition,
  isInCombat
}) => {
  // ✅ CORRIGÉ: Utilise useRef au lieu de useState pour lastMoveTime
  // Cela évite les re-renders inutiles
  const lastMoveTimeRef = useRef<number>(Date.now());
  
  // ✅ CORRIGÉ: Utilise useRef pour stocker l'ID de l'intervalle
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Génère une position aléatoire adjacente au monstre
   */
  const getRandomAdjacentPosition = useCallback((): Position | null => {
    // Les 4 directions possibles (haut, bas, gauche, droite)
    const directions = [
      { x: 0, y: -1 }, // Haut
      { x: 0, y: 1 },  // Bas
      { x: -1, y: 0 }, // Gauche
      { x: 1, y: 0 }   // Droite
    ];

    // Mélanger les directions pour plus de variété
    const shuffledDirections = directions.sort(() => Math.random() - 0.5);

    // Essayer chaque direction
    for (const direction of shuffledDirections) {
      const newX = monster.position.x + direction.x;
      const newY = monster.position.y + direction.y;

      // Vérifier les limites de la map
      if (newX >= 0 && newX < mapWidth && newY >= 0 && newY < mapHeight) {
        // Vérifier si la case est praticable
        if (isWalkable(newX, newY)) {
          return { x: newX, y: newY };
        }
      }
    }

    return null; // Aucune position valide trouvée
  }, [monster.position.x, monster.position.y, mapWidth, mapHeight, isWalkable]);

  /**
   * ✅ CORRIGÉ: Fonction de déplacement qui utilise les refs pour éviter les re-renders
   */
  const moveMonster = useCallback(() => {
    // Ne pas bouger si en combat
    if (isInCombat) return;

    const now = Date.now();
    
    // Vérifier si assez de temps s'est écoulé
    if (now - lastMoveTimeRef.current < monster.moveInterval) {
      return;
    }

    // Chance de bouger (50% à chaque intervalle pour plus de réalisme)
    if (Math.random() < 0.5) {
      lastMoveTimeRef.current = now;
      return;
    }

    const newPosition = getRandomAdjacentPosition();
    
    if (newPosition) {
      console.log(`🐕 ${monster.name} se déplace vers (${newPosition.x}, ${newPosition.y})`);
      onMonsterMove(monster.id, newPosition);
    }

    lastMoveTimeRef.current = now;
  }, [
    monster.id,
    monster.name, 
    monster.moveInterval,
    getRandomAdjacentPosition, 
    onMonsterMove,
    isInCombat
  ]);

  // ✅ CORRIGÉ: Effect simplifié qui ne se relance pas à chaque changement de lastMoveTime
  useEffect(() => {
    if (!monster.isAlive || isInCombat) {
      // Nettoyer l'intervalle existant si le monstre meurt ou entre en combat
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Créer un nouvel intervalle seulement si il n'y en a pas déjà un
    if (!intervalRef.current) {
      intervalRef.current = setInterval(moveMonster, 1000); // Vérifier chaque seconde
    }

    // Nettoyer l'intervalle quand le composant se démonte ou change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [monster.isAlive, isInCombat, moveMonster]);

  // ✅ CORRIGÉ: Effect séparé pour nettoyer l'intervalle au démontage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Ne pas afficher le monstre s'il est mort
  if (!monster.isAlive) {
    return null;
  }

  // Calculer la position de rendu
  const renderPosition = getTileRenderPosition(monster.position.x, monster.position.y);

  // Gérer le clic sur le monstre
  const handleMonsterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation vers la tile
    console.log(`🎯 Clic sur ${monster.name} à (${monster.position.x}, ${monster.position.y})`);
    onMonsterClick(monster);
  };

  return (
    <div
      className="absolute cursor-pointer pointer-events-auto z-[2500] hover:scale-110 transition-transform duration-200"
      style={{
        left: renderPosition.x,
        top: renderPosition.y,
        width: 80, // DISPLAY_TILE_WIDTH
        height: 80, // DISPLAY_TILE_HEIGHT * 2
        zIndex: 2500 + monster.position.y * 100 + monster.position.x // Ordre d'affichage isométrique
      }}
      onClick={handleMonsterClick}
      title={`${monster.name} (Niveau ${monster.level}) - ${monster.health}/${monster.maxHealth} PV`}
    >
      {/* Ombre du monstre */}
      <div 
        className="absolute inset-0 rounded-full blur-sm opacity-50 animate-pulse"
        style={{ 
          background: `radial-gradient(circle, ${monster.color}40 0%, transparent 70%)`,
          bottom: '10px'
        }}
      />
      
      {/* Corps principal du monstre */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Icône du monstre */}
        <div 
          className="text-4xl mb-2 drop-shadow-lg animate-bounce"
          style={{ 
            color: monster.color,
            filter: `drop-shadow(0 0 8px ${monster.color})`,
            animationDuration: '2s'
          }}
        >
          {monster.icon}
        </div>
        
        {/* Nom du monstre */}
        <div className="text-white text-xs font-bold bg-gray-900/80 px-2 py-1 rounded border border-gray-600 shadow-lg">
          {monster.name}
        </div>
        
        {/* Barre de vie */}
        <div className="w-12 h-1 bg-gray-800 rounded-full mt-1 border border-gray-600 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
            style={{ 
              width: `${(monster.health / monster.maxHealth) * 100}%` 
            }}
          />
        </div>
        
        {/* Niveau */}
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 shadow-lg"
          style={{ 
            backgroundColor: monster.color,
            borderColor: 'white'
          }}
        >
          {monster.level}
        </div>
        
        {/* Effet de brillance au survol */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Effet de particules autour du monstre */}
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-60 animate-ping"
          style={{
            backgroundColor: monster.color,
            left: `${20 + Math.sin(Date.now() / 1000 + i) * 20}px`,
            top: `${20 + Math.cos(Date.now() / 1000 + i) * 20}px`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
  );
};

export default Monster;