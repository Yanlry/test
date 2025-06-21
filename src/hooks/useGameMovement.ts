/**
 * HOOK DE DÉPLACEMENT POUR MAP ISOMÉTRIQUE TILED
 * ✅ CORRIGÉ: Utilise maintenant les VRAIES données de praticabilité de Tiled
 * ✅ CORRIGÉ: Plus de cases "fantômes" praticables
 * ✅ CORRIGÉ: Le joueur ne va que sur les vraies tuiles
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

  // ✅ NOUVEAU: État pour stocker la fonction de praticabilité de Tiled
  const [tiledWalkableFunction, setTiledWalkableFunction] = useState<((x: number, y: number) => boolean) | null>(null);

  /**
   * ✅ NOUVEAU: Fonction pour recevoir les données de praticabilité de Tiled
   * @param walkableFunction Fonction qui vérifie si une case est praticable selon Tiled
   */
  const setWalkableFunction = useCallback((walkableFunction: (x: number, y: number) => boolean) => {
    console.log('📡 Hook de mouvement: réception des données de praticabilité Tiled');
    setTiledWalkableFunction(() => walkableFunction);
  }, []);

  /**
   * ✅ CORRIGÉ: Utilise maintenant les VRAIES données de praticabilité de Tiled
   * @param x Coordonnée X (0 à 15)
   * @param y Coordonnée Y (0 à 15)
   * @returns true si la case est praticable selon Tiled
   */
  const isValidPosition = useCallback((x: number, y: number): boolean => {
    // Vérifier les limites de la map 16x16
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
      return false;
    }
    
    // ✅ UTILISER les vraies données de Tiled si disponibles
    if (tiledWalkableFunction) {
      const isWalkable = tiledWalkableFunction(x, y);
      console.log(`🔍 Vérification praticabilité (${x}, ${y}): ${isWalkable ? '✅ Praticable' : '❌ Bloquée'}`);
      return isWalkable;
    }
    
    // Fallback si les données Tiled ne sont pas encore chargées
    console.log(`⚠️ Données Tiled non disponibles, fallback pour (${x}, ${y})`);
    return true;
  }, [tiledWalkableFunction]);

  /**
   * ✅ CORRIGÉ: Vérifie si une position est bloquée selon les vraies données Tiled
   * @param x Coordonnée X
   * @param y Coordonnée Y
   * @returns true si la case est bloquée
   */
  const isPositionBlocked = useCallback((x: number, y: number): boolean => {
    return !isValidPosition(x, y);
  }, [isValidPosition]);

  /**
   * Calcule le nombre d'obstacles adjacents à une position
   * @param x Coordonnée X
   * @param y Coordonnée Y
   * @returns Nombre d'obstacles adjacents
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
   * ✅ CORRIGÉ: Algorithme A* utilisant les vraies données de praticabilité Tiled
   * @param start Position de départ
   * @param goal Position d'arrivée
   * @returns Chemin calculé
   */
  const findPathForIsometricMap = useCallback((start: Position, goal: Position): Position[] => {
    console.log(`🧭 === CALCUL DE CHEMIN A* ===`);
    console.log(`📍 Départ: (${start.x}, ${start.y})`);
    console.log(`🎯 Destination: (${goal.x}, ${goal.y})`);
    
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
        console.log(`🚫 Case (${x}, ${y}) bloquée`);
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
      h: heuristic(start, goal),
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
      if (current.x === goal.x && current.y === goal.y) {
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
            h: heuristic({ x: neighborX, y: neighborY }, goal),
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
    
    console.log('❌ Aucun chemin trouvé vers la destination');
    return [];
  }, [avoidanceConfig, countAdjacentObstacles, isPositionBlocked]);

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

  // ✅ CORRIGÉ: Fonction pour démarrer un déplacement avec vraie validation
  const moveToPosition = useCallback((target: Position) => {
    console.log(`🚀 === DEMANDE DE DÉPLACEMENT ===`);
    console.log(`📍 Position actuelle: (${playerPosition.x}, ${playerPosition.y})`);
    console.log(`🎯 Destination demandée: (${target.x}, ${target.y})`);
    
    // Calculer le chemin avec l'algorithme A* utilisant les vraies données Tiled
    const path = findPathForIsometricMap(playerPosition, target);
    
    if (path.length === 0) {
      console.log('❌ Impossible de trouver un chemin vers cette destination');
      return false;
    }
    
    setTargetPosition(target);
    setCurrentPath(path);
    setCurrentPathIndex(0);
    setIsMoving(true);
    
    console.log(`✅ Mouvement lancé: ${path.length} cases à parcourir`);
    return true;
  }, [playerPosition, findPathForIsometricMap]);

  // ✅ CORRIGÉ: Fonction pour gérer le clic avec vraie validation
  const handleTileClick = useCallback((x: number, y: number) => {
    console.log(`🎯 === GESTION DU CLIC ===`);
    console.log(`📍 Case cliquée: (${x}, ${y})`);
    console.log(`🏃 Position actuelle du joueur: (${playerPosition.x}, ${playerPosition.y})`);
    
    // Ne rien faire si on clique sur la position actuelle
    if (x === playerPosition.x && y === playerPosition.y) {
      console.log(`ℹ️ Clic sur la position actuelle, ignoré`);
      return;
    }
    
    // Vérifier si la case est praticable selon les vraies données Tiled
    if (!isValidPosition(x, y)) {
      console.log(`🚫 Case (${x}, ${y}) non praticable selon Tiled`);
      return;
    }
    
    console.log(`✅ Case (${x}, ${y}) praticable, lancement du mouvement`);
    // Lancer le mouvement
    moveToPosition({ x, y });
  }, [playerPosition, moveToPosition, isValidPosition]);

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
    
    // ✅ NOUVEAU: Fonction pour recevoir les données de praticabilité
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