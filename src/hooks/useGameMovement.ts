/**
 * HOOK DE DÉPLACEMENT CORRIGÉ - AVANCE TOUJOURS VERS L'OBSTACLE
 * ✅ NOUVEAU: Le personnage avance toujours vers la destination, même bloquée
 * ✅ CORRIGÉ: Calcule le chemin jusqu'au point le plus proche de l'obstacle
 * ✅ AMÉLIORATION: Meilleure gestion des destinations inaccessibles
 */

import { useState, useCallback, useEffect } from 'react';
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
   * ✅ NOUVELLE FONCTION: Trouve la case la plus proche VERS une destination
   * Différent de findClosestWalkablePosition - cherche dans la direction de la cible
   */
  const findBestReachableTarget = useCallback((targetX: number, targetY: number): Position | null => {
    console.log(`🎯 Recherche de la meilleure destination vers (${targetX}, ${targetY})...`);
    
    // Si la destination est déjà accessible, la retourner
    if (isValidPosition(targetX, targetY)) {
      console.log(`✅ Destination (${targetX}, ${targetY}) directement accessible`);
      return { x: targetX, y: targetY };
    }

    // ✅ NOUVEAU: Algorithme de recherche directionnel
    // Au lieu de chercher en spirale, on cherche en ligne droite vers la cible
    const dx = targetX - playerPosition.x;
    const dy = targetY - playerPosition.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    
    if (distance === 0) {
      return null; // Déjà sur place
    }

    // Normaliser la direction
    const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
    
    // Chercher en avançant vers la cible
    let bestPosition: Position | null = null;
    let currentX = playerPosition.x;
    let currentY = playerPosition.y;
    
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
   * ✅ FONCTION DE FALLBACK: Recherche en spirale (ancienne méthode)
   */
  const findClosestWalkablePositionSpiral = useCallback((targetX: number, targetY: number): Position | null => {
    console.log(`🌀 Recherche en spirale autour de (${targetX}, ${targetY})...`);

    // Recherche en spirale pour trouver la case praticable la plus proche
    let bestDistance = Infinity;
    let bestPosition: Position | null = null;

    // Recherche dans un rayon croissant
    for (let radius = 1; radius <= 3; radius++) { // Limité à rayon 3 pour performance
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          // Ne vérifier que les cases à la distance exacte du rayon actuel
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

          const checkX = targetX + dx;
          const checkY = targetY + dy;

          // Vérifier si cette position est praticable
          if (isValidPosition(checkX, checkY)) {
            // Calculer la distance depuis la position du joueur
            const distanceFromPlayer = Math.abs(checkX - playerPosition.x) + Math.abs(checkY - playerPosition.y);
            
            if (distanceFromPlayer < bestDistance && distanceFromPlayer > 0) { // > 0 pour éviter la position actuelle
              bestDistance = distanceFromPlayer;
              bestPosition = { x: checkX, y: checkY };
            }
          }
        }
      }

      // Si on a trouvé une position praticable, la retourner
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
        if (dx === 0 && dy === 0) continue; // Ignorer la case centrale
        
        if (isPositionBlocked(x + dx, y + dy)) {
          obstacleCount++;
        }
      }
    }
    
    return obstacleCount;
  }, [avoidanceConfig.checkRadius, isPositionBlocked]);

  /**
   * ✅ ALGORITHME A* AMÉLIORÉ: Trouve toujours un chemin vers la meilleure destination
   */
  const findPathForIsometricMap = useCallback((start: Position, requestedGoal: Position): Position[] => {
    console.log(`🧭 === CALCUL DE CHEMIN A* INTELLIGENT ===`);
    console.log(`📍 Départ: (${start.x}, ${start.y})`);
    console.log(`🎯 Destination demandée: (${requestedGoal.x}, ${requestedGoal.y})`);
    
    // ✅ NOUVEAU: Trouve la meilleure destination accessible dans la direction de la cible
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
      g: number;      // Coût depuis le début
      h: number;      // Heuristique vers la fin
      f: number;      // Coût total (g + h)
      parent: AStarNode | null;
    }

    // Fonction heuristique (distance de Manhattan)
    const heuristic = (a: Position, b: Position): number => {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    };

    // Calculer le coût d'une case avec pénalité pour proximité des obstacles
    const getCostForTile = (x: number, y: number): number => {
      if (isPositionBlocked(x, y)) {
        return Infinity; // Case bloquée
      }
      
      let cost = 1.0; // Coût de base
      
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
      // Trouver le nœud avec le plus petit f
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }
      
      const current = openSet.splice(currentIndex, 1)[0];
      const currentKey = `${current.x},${current.y}`;
      closedSet.add(currentKey);
      
      // Vérifier si on a atteint le but
      if (current.x === actualGoal.x && current.y === actualGoal.y) {
        const path: Position[] = [];
        let node: AStarNode | null = current;
        
        while (node !== null) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        
        console.log(`✅ Chemin trouvé: ${path.length} cases`);
        console.log(`🛤️ Chemin complet:`, path);
        return path;
      }
      
      // Examiner les 4 directions principales
      const neighbors = [
        [0, -1], // Haut
        [1, 0],  // Droite
        [0, 1],  // Bas
        [-1, 0]  // Gauche
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
          continue; // Case bloquée
        }
        
        const tentativeG = current.g + tileCost;
        
        // Vérifier si ce voisin est déjà dans l'open set
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

  /**
   * ✅ FONCTION DE DÉPLACEMENT AMÉLIORÉE: Force toujours un mouvement
   */
  const moveToPosition = useCallback((target: Position) => {
    console.log(`🚀 === DEMANDE DE DÉPLACEMENT VERS OBSTACLE ===`);
    console.log(`📍 Position actuelle: (${playerPosition.x}, ${playerPosition.y})`);
    console.log(`🎯 Destination demandée: (${target.x}, ${target.y})`);
    
    // ✅ NOUVEAU: Calcule toujours un chemin, même vers une destination bloquée
    const path = findPathForIsometricMap(playerPosition, target);
    
    if (path.length === 0) {
      console.log('ℹ️ Aucun mouvement possible ou déjà à destination');
      return false;
    }
    
    // La vraie destination sera la dernière case du chemin calculé
    const actualTarget = path[path.length - 1];
    
    setTargetPosition(actualTarget);
    setCurrentPath(path);
    setCurrentPathIndex(0);
    setIsMoving(true);
    
    console.log(`✅ Mouvement lancé: ${path.length} cases à parcourir`);
    console.log(`🎯 Destination finale: (${actualTarget.x}, ${actualTarget.y})`);
    
    // ✅ NOUVEAU: Indique si on va exactement où demandé ou près de l'obstacle
    if (actualTarget.x !== target.x || actualTarget.y !== target.y) {
      console.log(`🚧 Obstacle détecté - Arrêt prévu devant l'obstacle en (${actualTarget.x}, ${actualTarget.y})`);
    }
    
    return true;
  }, [playerPosition, findPathForIsometricMap]);

  /**
   * ✅ GESTION DU CLIC AMÉLIORÉE: Force toujours un mouvement vers l'obstacle
   */
  const handleTileClick = useCallback((x: number, y: number) => {
    console.log(`🎯 === GESTION DU CLIC VERS OBSTACLE ===`);
    console.log(`📍 Case cliquée: (${x}, ${y})`);
    console.log(`🏃 Position actuelle du joueur: (${playerPosition.x}, ${playerPosition.y})`);
    
    // Ne rien faire si on clique sur la position actuelle
    if (x === playerPosition.x && y === playerPosition.y) {
      console.log(`ℹ️ Clic sur la position actuelle, ignoré`);
      return;
    }
    
    // ✅ NOUVEAU: Force TOUJOURS un mouvement, même vers des obstacles
    console.log(`✅ Clic accepté - calcul du chemin vers l'obstacle...`);
    const moveSuccess = moveToPosition({ x, y });
    
    if (moveSuccess) {
      console.log(`🎮 Mouvement initié vers (${x}, ${y})`);
    } else {
      console.log(`❌ Impossible de se déplacer vers (${x}, ${y})`);
    }
  }, [playerPosition, moveToPosition]);

  // Effect pour gérer l'animation du mouvement (INCHANGÉ)
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
          }, 500);
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

  // Fonction pour téléporter directement
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
      remainingSteps: currentPath.length - currentPathIndex,
      mapDimensions: `${MAP_WIDTH}x${MAP_HEIGHT}`,
      isIsometric: true
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