/**
 * HOOK DE DÉPLACEMENT AVEC ÉVITEMENT NATUREL DES MURS
 * Modification du coût A* pour éviter de longer les murs
 */

import { useState, useCallback, useEffect } from 'react';
import { Position, MapType } from '../types/game';
import { 
  isInWaterZone, 
  DEFAULT_START_POSITION, 
  TELEPORT_POSITIONS, 
  MOVEMENT_SPEED 
} from '../utils/gameConstants';

// Configuration pour l'évitement des murs
interface WallAvoidanceConfig {
  enabled: boolean;                 // Activer/désactiver l'évitement
  wallProximityPenalty: number;     // Pénalité pour être proche d'un mur (recommandé: 0.5-2.0)
  checkRadius: number;              // Rayon de vérification autour d'une case (recommandé: 1-2)
}

const DEFAULT_WALL_AVOIDANCE: WallAvoidanceConfig = {
  enabled: true,
  wallProximityPenalty: 1.5,
  checkRadius: 1
};

export const useGameMovement = (wallConfig: WallAvoidanceConfig = DEFAULT_WALL_AVOIDANCE) => {
  // États de position et mouvement
  const [playerPosition, setPlayerPosition] = useState<Position>(DEFAULT_START_POSITION);
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [currentMap, setCurrentMap] = useState<MapType>('world');
  
  // États pour le pathfinding
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  /**
   * Calcule le nombre de murs adjacents à une position
   * @param x Coordonnée X
   * @param y Coordonnée Y
   * @returns Nombre de murs adjacents (0-8)
   */
  const countAdjacentWalls = useCallback((x: number, y: number): number => {
    let wallCount = 0;
    const radius = wallConfig.checkRadius;
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue; // Ignorer la case centrale
        
        if (isInWaterZone(x + dx, y + dy)) {
          wallCount++;
        }
      }
    }
    
    return wallCount;
  }, [wallConfig.checkRadius]);

  /**
   * Algorithme A* modifié avec évitement des murs
   * @param start Position de départ
   * @param goal Position d'arrivée
   * @returns Chemin calculé
   */
  const findPathWithWallAvoidance = useCallback((start: Position, goal: Position): Position[] => {
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

    // Calculer le coût d'une case avec pénalité pour proximité des murs
    const getCostForTile = (x: number, y: number): number => {
      if (isInWaterZone(x, y)) {
        return Infinity; // Case bloquée
      }
      
      let cost = 1.0; // Coût de base
      
      if (wallConfig.enabled) {
        const adjacentWalls = countAdjacentWalls(x, y);
        if (adjacentWalls > 0) {
          // Ajouter une pénalité basée sur le nombre de murs adjacents
          const penalty = (adjacentWalls / (wallConfig.checkRadius * 8)) * wallConfig.wallProximityPenalty;
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
        
        console.log(`🎯 Chemin A* avec évitement calculé: ${path.length} cases`);
        return path;
      }
      
      // Examiner les voisins (8 directions)
      const neighbors = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
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
        
        // Coût du mouvement (diagonal = √2, cardinal = 1)
        const movementCost = (dx !== 0 && dy !== 0) ? Math.sqrt(2) : 1;
        const tentativeG = current.g + (movementCost * tileCost);
        
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
    
    console.log('❌ Aucun chemin trouvé avec A* modifié');
    return [];
  }, [wallConfig, countAdjacentWalls]);

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

  // Fonction pour démarrer un déplacement avec évitement des murs
  const moveToPosition = useCallback((target: Position) => {
    console.log(`🚀 Calcul du chemin avec évitement vers (${target.x}, ${target.y})`);
    
    // Calculer le chemin avec l'algorithme A* modifié
    const path = findPathWithWallAvoidance(playerPosition, target);
    
    if (path.length === 0) {
      console.log('❌ Impossible de trouver un chemin vers cette destination');
      return false;
    }
    
    setTargetPosition(target);
    setCurrentPath(path);
    setCurrentPathIndex(0);
    setIsMoving(true);
    
    console.log(`✅ Chemin avec évitement calculé : ${path.length} cases à parcourir`);
    return true;
  }, [playerPosition, findPathWithWallAvoidance]);

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

  // Effect pour gérer l'animation du mouvement (identique à l'original)
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
      remainingSteps: currentPath.length - currentPathIndex,
      wallAvoidanceConfig: wallConfig
    };
  }, [currentMap, playerPosition, isMoving, currentPath.length, currentPathIndex, wallConfig]);

  // Fonction pour ajuster l'évitement des murs en temps réel
  const updateWallAvoidance = useCallback((newConfig: Partial<WallAvoidanceConfig>) => {
    Object.assign(wallConfig, newConfig);
    console.log('🧭 Configuration d\'évitement des murs mise à jour:', wallConfig);
  }, [wallConfig]);

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
    updateWallAvoidance,
    
    // Utilitaires
    isTeleportPosition,
    getCurrentMapInfo,
    countAdjacentWalls,
    
    // Données calculées
    remainingSteps: currentPath.length - currentPathIndex
  };
};