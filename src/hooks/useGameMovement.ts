/**
 * HOOK DE DÉPLACEMENT CORRIGÉ - COMPATIBLE COMBAT
 * ✅ CORRIGÉ: isMoving se remet correctement à false après déplacement
 * ✅ CORRIGÉ: États de mouvement complètement nettoyés
 * ✅ NOUVEAU: Fonctions de debug pour diagnostiquer les blocages
 * ✅ NOUVEAU: Force la réinitialisation en cas de problème
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Position, MapType } from '../types/game';
import { 
  MAP_WIDTH,
  MAP_HEIGHT,
  DEFAULT_START_POSITION, 
  TELEPORT_POSITIONS, 
  MOVEMENT_SPEED 
} from '../utils/gameConstants';

// Configuration pour l'évitement des obstacles
interface ObstacleAvoidanceConfig {
  enabled: boolean;
  obstaclePenalty: number;
  checkRadius: number;
}

const DEFAULT_OBSTACLE_AVOIDANCE: ObstacleAvoidanceConfig = {
  enabled: true,
  obstaclePenalty: 1.5,
  checkRadius: 1
};

export const useGameMovement = (avoidanceConfig: ObstacleAvoidanceConfig = DEFAULT_OBSTACLE_AVOIDANCE) => {
  // États de position et mouvement
  const [playerPosition, setPlayerPosition] = useState<Position>(DEFAULT_START_POSITION);
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [currentMap, setCurrentMap] = useState<MapType>('world');
  
  // États pour le pathfinding
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  // État pour stocker la fonction de praticabilité de Tiled
  const [tiledWalkableFunction, setTiledWalkableFunction] = useState<((x: number, y: number) => boolean) | null>(null);

  // ✅ NOUVEAU: Référence pour le timer de mouvement
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * ✅ NOUVELLE FONCTION: Nettoie complètement l'état de mouvement
   */
  const resetMovementState = useCallback(() => {
    console.log('🧹 === NETTOYAGE COMPLET DE L\'ÉTAT DE MOUVEMENT ===');
    
    // Nettoyer le timer
    if (moveTimerRef.current) {
      clearTimeout(moveTimerRef.current);
      moveTimerRef.current = null;
    }
    
    // Réinitialiser tous les états
    setIsMoving(false);
    setTargetPosition(null);
    setCurrentPath([]);
    setCurrentPathIndex(0);
    
    console.log('✅ État de mouvement nettoyé - Combat autorisé');
  }, []);

  /**
   * ✅ NOUVELLE FONCTION: Debug de l'état actuel
   */
  const debugMovementState = useCallback(() => {
    console.log(`
🔍 === DEBUG ÉTAT DE MOUVEMENT ===
├─ isMoving: ${isMoving}
├─ targetPosition: ${targetPosition ? `(${targetPosition.x}, ${targetPosition.y})` : 'null'}
├─ currentPath.length: ${currentPath.length}
├─ currentPathIndex: ${currentPathIndex}
├─ playerPosition: (${playerPosition.x}, ${playerPosition.y})
└─ Timer actif: ${moveTimerRef.current ? 'OUI' : 'NON'}`);
  }, [isMoving, targetPosition, currentPath.length, currentPathIndex, playerPosition]);

  /**
   * Fonction pour recevoir les données de praticabilité de Tiled
   */
  const setWalkableFunction = useCallback((walkableFunction: (x: number, y: number) => boolean) => {
    console.log('📡 Hook de mouvement: réception des données de praticabilité Tiled');
    setTiledWalkableFunction(() => walkableFunction);
  }, []);

  /**
   * Utilise les vraies données de praticabilité de Tiled
   */
  const isValidPosition = useCallback((x: number, y: number): boolean => {
    // Vérifier les limites de la map 16x16
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
      return false;
    }
    
    // Utiliser les vraies données de Tiled si disponibles
    if (tiledWalkableFunction) {
      const isWalkable = tiledWalkableFunction(x, y);
      return isWalkable;
    }
    
    // Fallback si les données Tiled ne sont pas encore chargées
    return true;
  }, [tiledWalkableFunction]);

  /**
   * Vérifie si une position est bloquée selon les vraies données Tiled
   */
  const isPositionBlocked = useCallback((x: number, y: number): boolean => {
    return !isValidPosition(x, y);
  }, [isValidPosition]);

  /**
   * ✅ FONCTION: Trouve la case la plus proche VERS une destination
   */
  const findBestReachableTarget = useCallback((targetX: number, targetY: number): Position | null => {
    console.log(`🎯 Recherche de la meilleure destination vers (${targetX}, ${targetY})...`);
    
    // Si la destination est déjà accessible, la retourner
    if (isValidPosition(targetX, targetY)) {
      console.log(`✅ Destination (${targetX}, ${targetY}) directement accessible`);
      return { x: targetX, y: targetY };
    }

    // Algorithme de recherche directionnel
    const dx = targetX - playerPosition.x;
    const dy = targetY - playerPosition.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    
    if (distance === 0) {
      return null; // Déjà sur place
    }

    // Chercher en avançant vers la cible
    let bestPosition: Position | null = null;
    
    // Avancer vers la cible case par case
    for (let step = 1; step <= distance; step++) {
      // Calculer la prochaine position vers la cible
      const nextX = playerPosition.x + Math.round((dx * step) / distance);
      const nextY = playerPosition.y + Math.round((dy * step) / distance);
      
      // Vérifier si cette position est accessible
      if (isValidPosition(nextX, nextY)) {
        bestPosition = { x: nextX, y: nextY };
        console.log(`✅ Position accessible trouvée: (${nextX}, ${nextY}) vers la cible`);
      } else {
        // On a trouvé un obstacle, retourner la dernière position valide
        break;
      }
    }
    
    // Si aucune position n'a été trouvée avec l'approche directionnelle,
    // utiliser l'ancienne méthode en spirale comme fallback
    if (!bestPosition) {
      console.log(`🔍 Recherche en spirale comme fallback...`);
      return findClosestWalkablePositionSpiral(targetX, targetY);
    }
    
    console.log(`🎯 Meilleure destination trouvée: (${bestPosition.x}, ${bestPosition.y})`);
    return bestPosition;
  }, [isValidPosition, playerPosition]);

  /**
   * FONCTION DE FALLBACK: Recherche en spirale
   */
  const findClosestWalkablePositionSpiral = useCallback((targetX: number, targetY: number): Position | null => {
    console.log(`🌀 Recherche en spirale autour de (${targetX}, ${targetY})...`);

    let bestDistance = Infinity;
    let bestPosition: Position | null = null;

    // Recherche dans un rayon croissant
    for (let radius = 1; radius <= 3; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

          const checkX = targetX + dx;
          const checkY = targetY + dy;

          if (isValidPosition(checkX, checkY)) {
            const distanceFromPlayer = Math.abs(checkX - playerPosition.x) + Math.abs(checkY - playerPosition.y);
            
            if (distanceFromPlayer < bestDistance && distanceFromPlayer > 0) {
              bestDistance = distanceFromPlayer;
              bestPosition = { x: checkX, y: checkY };
            }
          }
        }
      }

      if (bestPosition) {
        return bestPosition;
      }
    }

    console.log(`❌ Aucune position praticable trouvée en spirale`);
    return null;
  }, [isValidPosition, playerPosition]);

  /**
   * Calcule le nombre d'obstacles adjacents à une position
   */
  const countAdjacentObstacles = useCallback((x: number, y: number): number => {
    let obstacleCount = 0;
    const radius = avoidanceConfig.checkRadius;
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        if (isPositionBlocked(x + dx, y + dy)) {
          obstacleCount++;
        }
      }
    }
    
    return obstacleCount;
  }, [avoidanceConfig.checkRadius, isPositionBlocked]);

  /**
   * ALGORITHME A* AMÉLIORÉ
   */
  const findPathForIsometricMap = useCallback((start: Position, requestedGoal: Position): Position[] => {
    console.log(`🧭 === CALCUL DE CHEMIN A* ===`);
    console.log(`📍 Départ: (${start.x}, ${start.y})`);
    console.log(`🎯 Destination demandée: (${requestedGoal.x}, ${requestedGoal.y})`);
    
    const actualGoal = findBestReachableTarget(requestedGoal.x, requestedGoal.y);
    
    if (!actualGoal) {
      console.log(`ℹ️ Aucune destination accessible trouvée`);
      return [];
    }

    if (actualGoal.x === start.x && actualGoal.y === start.y) {
      console.log(`ℹ️ Déjà à la destination`);
      return [];
    }

    console.log(`🎯 Destination finale: (${actualGoal.x}, ${actualGoal.y})`);
    
    interface AStarNode {
      x: number;
      y: number;
      g: number;
      h: number;
      f: number;
      parent: AStarNode | null;
    }

    const heuristic = (a: Position, b: Position): number => {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    };

    const getCostForTile = (x: number, y: number): number => {
      if (isPositionBlocked(x, y)) {
        return Infinity;
      }
      
      let cost = 1.0;
      
      if (avoidanceConfig.enabled) {
        const adjacentObstacles = countAdjacentObstacles(x, y);
        if (adjacentObstacles > 0) {
          const penalty = (adjacentObstacles / (avoidanceConfig.checkRadius * 8)) * avoidanceConfig.obstaclePenalty;
          cost += penalty;
        }
      }
      
      return cost;
    };

    const openSet: AStarNode[] = [];
    const closedSet: Set<string> = new Set();
    
    const startNode: AStarNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: heuristic(start, actualGoal),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    
    openSet.push(startNode);
    
    while (openSet.length > 0) {
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }
      
      const current = openSet.splice(currentIndex, 1)[0];
      const currentKey = `${current.x},${current.y}`;
      closedSet.add(currentKey);
      
      if (current.x === actualGoal.x && current.y === actualGoal.y) {
        const path: Position[] = [];
        let node: AStarNode | null = current;
        
        while (node !== null) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        
        console.log(`✅ Chemin trouvé: ${path.length} cases`);
        return path;
      }
      
      const neighbors = [
        [0, -1], [1, 0], [0, 1], [-1, 0]
      ];
      
      for (const [dx, dy] of neighbors) {
        const neighborX = current.x + dx;
        const neighborY = current.y + dy;
        const neighborKey = `${neighborX},${neighborY}`;
        
        if (closedSet.has(neighborKey)) {
          continue;
        }
        
        const tileCost = getCostForTile(neighborX, neighborY);
        if (tileCost === Infinity) {
          continue;
        }
        
        const tentativeG = current.g + tileCost;
        
        let existingNode = openSet.find(node => node.x === neighborX && node.y === neighborY);
        
        if (!existingNode) {
          existingNode = {
            x: neighborX,
            y: neighborY,
            g: tentativeG,
            h: heuristic({ x: neighborX, y: neighborY }, actualGoal),
            f: 0,
            parent: current
          };
          existingNode.f = existingNode.g + existingNode.h;
          openSet.push(existingNode);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = current;
        }
      }
    }
    
    console.log('❌ Aucun chemin trouvé vers la destination accessible');
    return [];
  }, [avoidanceConfig, countAdjacentObstacles, isPositionBlocked, findBestReachableTarget]);

  // Fonction pour vérifier si une position est un portail
  const isTeleportPosition = useCallback((x: number, y: number): boolean => {
    return (currentMap === 'world' && x === TELEPORT_POSITIONS.WORLD_TO_NEW.x && y === TELEPORT_POSITIONS.WORLD_TO_NEW.y) || 
           (currentMap === 'new' && x === TELEPORT_POSITIONS.NEW_TO_WORLD.x && y === TELEPORT_POSITIONS.NEW_TO_WORLD.y);
  }, [currentMap]);

  // Fonction pour changer de map
  const changeMap = useCallback((newMap: MapType, newPosition?: Position) => {
    // ✅ CORRIGÉ: Nettoyer l'état de mouvement lors du changement de map
    resetMovementState();
    
    setCurrentMap(newMap);
    if (newPosition) {
      setPlayerPosition(newPosition);
    }
    
    console.log(`📍 Téléportation vers: ${newMap === 'world' ? 'Monde principal' : 'Nouvelle zone'}`);
  }, [resetMovementState]);

  /**
   * ✅ FONCTION DE DÉPLACEMENT CORRIGÉE
   */
  const moveToPosition = useCallback((target: Position) => {
    console.log(`🚀 === DEMANDE DE DÉPLACEMENT ===`);
    console.log(`📍 Position actuelle: (${playerPosition.x}, ${playerPosition.y})`);
    console.log(`🎯 Destination demandée: (${target.x}, ${target.y})`);
    
    // ✅ NOUVEAU: Force le nettoyage avant nouveau mouvement
    resetMovementState();
    
    const path = findPathForIsometricMap(playerPosition, target);
    
    if (path.length === 0) {
      console.log('ℹ️ Aucun mouvement possible ou déjà à destination');
      return false;
    }
    
    const actualTarget = path[path.length - 1];
    
    setTargetPosition(actualTarget);
    setCurrentPath(path);
    setCurrentPathIndex(0);
    setIsMoving(true);
    
    console.log(`✅ Mouvement lancé: ${path.length} cases à parcourir`);
    console.log(`🎯 Destination finale: (${actualTarget.x}, ${actualTarget.y})`);
    
    if (actualTarget.x !== target.x || actualTarget.y !== target.y) {
      console.log(`🚧 Obstacle détecté - Arrêt prévu devant l'obstacle en (${actualTarget.x}, ${actualTarget.y})`);
    }
    
    return true;
  }, [playerPosition, findPathForIsometricMap, resetMovementState]);

  /**
   * ✅ GESTION DU CLIC CORRIGÉE
   */
  const handleTileClick = useCallback((x: number, y: number) => {
    console.log(`🎯 === GESTION DU CLIC ===`);
    console.log(`📍 Case cliquée: (${x}, ${y})`);
    console.log(`🏃 Position actuelle du joueur: (${playerPosition.x}, ${playerPosition.y})`);
    
    // Debug de l'état avant clic
    debugMovementState();
    
    // Ne rien faire si on clique sur la position actuelle
    if (x === playerPosition.x && y === playerPosition.y) {
      console.log(`ℹ️ Clic sur la position actuelle, ignoré`);
      return;
    }
    
    console.log(`✅ Clic accepté - calcul du chemin...`);
    const moveSuccess = moveToPosition({ x, y });
    
    if (moveSuccess) {
      console.log(`🎮 Mouvement initié vers (${x}, ${y})`);
    } else {
      console.log(`❌ Impossible de se déplacer vers (${x}, ${y})`);
    }
  }, [playerPosition, moveToPosition, debugMovementState]);

  // ✅ EFFET DE MOUVEMENT CORRIGÉ AVEC NETTOYAGE FORCÉ
  useEffect(() => {
    if (!isMoving || currentPath.length === 0) {
      // ✅ NOUVEAU: S'assurer que l'état est clean quand pas en mouvement
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
        moveTimerRef.current = null;
      }
      return;
    }

    const moveStep = () => {
      // ✅ CORRIGÉ: Vérification plus robuste de fin de chemin
      if (currentPathIndex >= currentPath.length) {
        console.log('🏁 === FIN DU MOUVEMENT ===');
        console.log(`📍 Position finale: (${playerPosition.x}, ${playerPosition.y})`);
        
        // ✅ CORRIGÉ: Nettoyage complet et forcé
        resetMovementState();
        
        // Vérifier téléportation après nettoyage
        if (isTeleportPosition(playerPosition.x, playerPosition.y)) {
          setTimeout(() => {
            if (currentMap === 'world' && 
                playerPosition.x === TELEPORT_POSITIONS.WORLD_TO_NEW.x && 
                playerPosition.y === TELEPORT_POSITIONS.WORLD_TO_NEW.y) {
              changeMap('new', TELEPORT_POSITIONS.NEW_SPAWN_FROM_WORLD);
            } else if (currentMap === 'new' && 
                       playerPosition.x === TELEPORT_POSITIONS.NEW_TO_WORLD.x && 
                       playerPosition.y === TELEPORT_POSITIONS.NEW_TO_WORLD.y) {
              changeMap('world', TELEPORT_POSITIONS.WORLD_SPAWN_FROM_NEW);
            }
          }, 500);
        }
        
        console.log('✅ États nettoyés - Combat autorisé');
        return;
      }
      
      // Passer à la case suivante du chemin
      const nextPosition = currentPath[currentPathIndex];
      console.log(`👣 Mouvement: étape ${currentPathIndex + 1}/${currentPath.length} vers (${nextPosition.x}, ${nextPosition.y})`);
      
      setPlayerPosition(nextPosition);
      setCurrentPathIndex(prev => prev + 1);
    };

    // ✅ CORRIGÉ: Stocker la référence du timer
    moveTimerRef.current = setTimeout(moveStep, MOVEMENT_SPEED);
    
    return () => {
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
        moveTimerRef.current = null;
      }
    };
  }, [currentPathIndex, currentPath, isMoving, playerPosition, currentMap, isTeleportPosition, changeMap, resetMovementState]);

  // ✅ FONCTION D'ARRÊT CORRIGÉE
  const stopMovement = useCallback(() => {
    console.log('🛑 === ARRÊT FORCÉ DU MOUVEMENT ===');
    resetMovementState();
  }, [resetMovementState]);

  // Fonction pour téléporter directement
  const teleportTo = useCallback((position: Position, map?: MapType) => {
    console.log('⚡ === TÉLÉPORTATION ===');
    resetMovementState(); // ✅ CORRIGÉ: Nettoyer avant téléportation
    
    setPlayerPosition(position);
    if (map && map !== currentMap) {
      setCurrentMap(map);
    }
    
    console.log(`⚡ Téléportation vers (${position.x}, ${position.y}) sur ${map || currentMap}`);
  }, [currentMap, resetMovementState]);

  // Fonction pour obtenir les informations de la map actuelle
  const getCurrentMapInfo = useCallback(() => {
    return {
      name: currentMap === 'world' ? 'Monde Principal' : 'Nouvelle Zone',
      type: currentMap,
      playerPosition,
      isPlayerMoving: isMoving,
      remainingSteps: currentPath.length - currentPathIndex,
      mapDimensions: `${MAP_WIDTH}x${MAP_HEIGHT}`,
      isIsometric: true
    };
  }, [currentMap, playerPosition, isMoving, currentPath.length, currentPathIndex]);

  // ✅ NOUVEAU: Effet de nettoyage au démontage
  useEffect(() => {
    return () => {
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
        moveTimerRef.current = null;
      }
    };
  }, []);

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
    
    // ✅ NOUVELLES FONCTIONS DE DEBUG
    resetMovementState,
    debugMovementState,
    
    // Fonction pour recevoir les données de praticabilité
    setWalkableFunction,
    
    // Utilitaires
    isTeleportPosition,
    getCurrentMapInfo,
    isValidPosition,
    isPositionBlocked,
    
    // Données calculées
    remainingSteps: currentPath.length - currentPathIndex
  };
};