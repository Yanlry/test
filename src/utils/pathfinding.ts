/**
 * ALGORITHMES DE PATHFINDING
 * Pour modifier la logique de déplacement et recherche de chemin, c'est ici
 */

import { Position, PathNode } from '../types/game';

/**
 * Calcule la distance Manhattan entre deux points (pour l'heuristique A*)
 */
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

/**
 * Vérifie si une position est dans les limites de la carte
 */
export const isValidPosition = (x: number, y: number): boolean => {
  return x >= 0 && x < 40 && y >= 0 && y < 30;
};

/**
 * Algorithme A* pour trouver le chemin le plus court
 * @param start Position de départ
 * @param end Position d'arrivée
 * @param isBlocked Fonction qui vérifie si une case est bloquée
 * @returns Tableau des positions du chemin (sans la position de départ)
 */
export const findPath = (
  start: Position, 
  end: Position, 
  isBlocked: (x: number, y: number) => boolean
): Position[] => {
  // Si la destination est bloquée, impossible d'y aller
  if (isBlocked(end.x, end.y)) {
    console.log('❌ Destination impossible : case bloquée');
    return [];
  }

  const openList: PathNode[] = []; // Cases à explorer
  const closedList: PathNode[] = []; // Cases déjà explorées

  // Point de départ
  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: calculateDistance(start, end),
    f: calculateDistance(start, end),
    parent: null
  };

  openList.push(startNode);

  while (openList.length > 0) {
    // Trouver le nœud avec le plus petit score F
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }

    const currentNode = openList[currentIndex];
    
    // Retirer le nœud courant de la liste ouverte et l'ajouter à la liste fermée
    openList.splice(currentIndex, 1);
    closedList.push(currentNode);

    // Si on a atteint la destination
    if (currentNode.x === end.x && currentNode.y === end.y) {
      const path: Position[] = [];
      let node: PathNode | null = currentNode;
      
      // Reconstituer le chemin en remontant les parents
      while (node !== null) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      
      console.log(`🎯 Chemin trouvé ! ${path.length} cases`);
      // Retourner le chemin sans la position de départ
      return path.slice(1);
    }

    // Explorer les 4 directions (haut, bas, gauche, droite)
    const neighbors = [
      { x: currentNode.x + 1, y: currentNode.y }, // Droite
      { x: currentNode.x - 1, y: currentNode.y }, // Gauche
      { x: currentNode.x, y: currentNode.y + 1 }, // Bas
      { x: currentNode.x, y: currentNode.y - 1 }  // Haut
    ];

    for (const neighbor of neighbors) {
      // Vérifier si la case voisine est valide
      if (!isValidPosition(neighbor.x, neighbor.y) || 
          isBlocked(neighbor.x, neighbor.y) ||
          closedList.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
        continue;
      }

      const g = currentNode.g + 1; // Distance depuis le départ
      const h = calculateDistance(neighbor, end); // Distance estimée vers l'arrivée
      const f = g + h; // Score total

      // Vérifier si ce voisin est déjà dans la liste ouverte avec un meilleur score
      const existingNode = openList.find(node => node.x === neighbor.x && node.y === neighbor.y);
      if (existingNode && existingNode.f <= f) {
        continue;
      }

      // Créer un nouveau nœud pour ce voisin
      const neighborNode: PathNode = {
        x: neighbor.x,
        y: neighbor.y,
        g: g,
        h: h,
        f: f,
        parent: currentNode
      };

      // L'ajouter à la liste ouverte s'il n'y est pas déjà
      if (!existingNode) {
        openList.push(neighborNode);
      } else {
        // Mettre à jour le nœud existant s'il a un meilleur score
        existingNode.g = g;
        existingNode.h = h;
        existingNode.f = f;
        existingNode.parent = currentNode;
      }
    }
  }

  console.log('❌ Aucun chemin trouvé vers la destination');
  return []; // Aucun chemin trouvé
};