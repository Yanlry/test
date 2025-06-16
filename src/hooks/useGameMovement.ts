/**
 * HOOK DE DÉPLACEMENT ET PATHFINDING
 * Pour modifier la logique de mouvement du joueur et changement de map, c'est ici
 */

import { useState, useCallback, useEffect } from 'react';
import { Position, MapType } from '../types/game';
import { findPath } from '../utils/pathfinding';
import { 
  isInWaterZone, 
  DEFAULT_START_POSITION, 
  TELEPORT_POSITIONS, 
  MOVEMENT_SPEED 
} from '../utils/gameConstants';

export const useGameMovement = () => {
  // États de position et mouvement
  const [playerPosition, setPlayerPosition] = useState<Position>(DEFAULT_START_POSITION);
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [currentMap, setCurrentMap] = useState<MapType>('world');
  
  // États pour le pathfinding
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  // Fonction pour vérifier si une position est un portail
  const isTeleportPosition = useCallback((x: number, y: number): boolean => {
    return (currentMap === 'world' && x === TELEPORT_POSITIONS.WORLD_TO_NEW.x && y === TELEPORT_POSITIONS.WORLD_TO_NEW.y) || 
           (currentMap === 'new' && x === TELEPORT_POSITIONS.NEW_TO_WORLD.x && y === TELEPORT_POSITIONS.NEW_TO_WORLD.y);
  }, [currentMap]);

  // Fonction pour changer de map
  const changeMap = useCallback((newMap: MapType, newPosition?: Position) => {
    setCurrentMap(newMap);
    if (newPosition) {
      setPlayerPosition(newPosition);
    }
    
    // Arrêter le mouvement
    setIsMoving(false);
    setTargetPosition(null);
    setCurrentPath([]);
    setCurrentPathIndex(0);
    
    console.log(`📍 Téléportation vers: ${newMap === 'world' ? 'Monde principal' : 'Nouvelle zone'}`);
  }, []);

  // Fonction pour démarrer un déplacement avec pathfinding
  const moveToPosition = useCallback((target: Position) => {
    console.log(`🚀 Calcul du chemin vers (${target.x}, ${target.y})`);
    
    // Calculer le chemin avec l'algorithme A*
    const path = findPath(playerPosition, target, isInWaterZone);
    
    if (path.length === 0) {
      console.log('❌ Impossible de trouver un chemin vers cette destination');
      return false;
    }
    
    setTargetPosition(target);
    setCurrentPath(path);
    setCurrentPathIndex(0);
    setIsMoving(true);
    
    console.log(`✅ Chemin calculé : ${path.length} cases à parcourir`);
    return true;
  }, [playerPosition]);

  // Fonction pour gérer le clic sur une tuile
  const handleTileClick = useCallback((x: number, y: number) => {
    console.log(`Case cliquée: (${x}, ${y})`);
    
    // Ne rien faire si on clique sur la position actuelle
    if (x === playerPosition.x && y === playerPosition.y) {
      return;
    }
    
    // Vérifier si la case est bloquée
    if (isInWaterZone(x, y)) {
      console.log(`🌊 Déplacement impossible ! La case (${x}, ${y}) est dans l'eau.`);
      return;
    }
    
    // Lancer le mouvement
    moveToPosition({ x, y });
  }, [playerPosition, moveToPosition]);

  // Effect pour gérer l'animation du mouvement
  useEffect(() => {
    if (!isMoving || currentPath.length === 0) return;

    const moveStep = () => {
      // Vérifier si on a atteint la fin du chemin
      if (currentPathIndex >= currentPath.length) {
        setIsMoving(false);
        setTargetPosition(null);
        setCurrentPath([]);
        setCurrentPathIndex(0);
        
        // Vérifier si on est arrivé sur un portail
        if (isTeleportPosition(playerPosition.x, playerPosition.y)) {
          setTimeout(() => {
            if (currentMap === 'world' && 
                playerPosition.x === TELEPORT_POSITIONS.WORLD_TO_NEW.x && 
                playerPosition.y === TELEPORT_POSITIONS.WORLD_TO_NEW.y) {
              // Téléportation vers la nouvelle map
              changeMap('new', TELEPORT_POSITIONS.NEW_SPAWN_FROM_WORLD);
            } else if (currentMap === 'new' && 
                       playerPosition.x === TELEPORT_POSITIONS.NEW_TO_WORLD.x && 
                       playerPosition.y === TELEPORT_POSITIONS.NEW_TO_WORLD.y) {
              // Retour vers la map principale
              changeMap('world', TELEPORT_POSITIONS.WORLD_SPAWN_FROM_NEW);
            }
          }, 500); // Attendre 500ms avant de téléporter
        }
        
        return;
      }
      
      // Passer à la case suivante du chemin
      const nextPosition = currentPath[currentPathIndex];
      setPlayerPosition(nextPosition);
      setCurrentPathIndex(prev => prev + 1);
    };

    // Timer pour le mouvement
    const moveTimer = setTimeout(moveStep, MOVEMENT_SPEED);
    
    return () => clearTimeout(moveTimer);
  }, [currentPathIndex, currentPath, isMoving, playerPosition, currentMap, isTeleportPosition, changeMap]);

  // Fonction pour arrêter le mouvement
  const stopMovement = useCallback(() => {
    setIsMoving(false);
    setTargetPosition(null);
    setCurrentPath([]);
    setCurrentPathIndex(0);
  }, []);

  // Fonction pour téléporter directement (pour debug ou admin)
  const teleportTo = useCallback((position: Position, map?: MapType) => {
    stopMovement();
    setPlayerPosition(position);
    if (map && map !== currentMap) {
      setCurrentMap(map);
    }
    console.log(`⚡ Téléportation vers (${position.x}, ${position.y}) sur ${map || currentMap}`);
  }, [currentMap, stopMovement]);

  // Fonction pour obtenir les informations de la map actuelle
  const getCurrentMapInfo = useCallback(() => {
    return {
      name: currentMap === 'world' ? 'Monde Principal' : 'Nouvelle Zone',
      type: currentMap,
      playerPosition,
      isPlayerMoving: isMoving,
      remainingSteps: currentPath.length - currentPathIndex
    };
  }, [currentMap, playerPosition, isMoving, currentPath.length, currentPathIndex]);

  return {
    // États
    playerPosition,
    targetPosition,
    isMoving,
    currentMap,
    currentPath,
    currentPathIndex,
    
    // Actions
    handleTileClick,
    moveToPosition,
    changeMap,
    stopMovement,
    teleportTo,
    
    // Utilitaires
    isTeleportPosition,
    getCurrentMapInfo,
    
    // Données calculées
    remainingSteps: currentPath.length - currentPathIndex
  };
};