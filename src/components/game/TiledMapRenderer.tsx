/**
 * COMPOSANT TILED MAP RENDERER - VERSION AVEC CLICS SUR COMBATTANTS
 * ✅ NOUVEAU: Les combattants sur la map sont cliquables pour lancer des sorts
 * ✅ SIMPLE: Clic sur joueur = sort de soin, clic sur ennemi = sort d'attaque
 * ✅ MARCHE: Avec la nouvelle fonction handleCombatantClick du GameMap
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TiledMap, TiledLayer, ParsedTileset } from '../../types/tiled';
import { loadTiledMap, loadTileset } from '../../utils/tiledLoader';
import { Position } from '../../types/game';
import { Monster, CombatState, Combatant } from '../../types/combat';
import MonsterComponent from './Monster';

interface TiledMapRendererProps {
  mapPath: string;
  playerPosition: Position;
  isMoving: boolean;
  targetPosition: Position | null;
  onTileClick: (x: number, y: number) => void;
  showGrid: boolean;
  isGamePaused: boolean;
  showDebugOverlay: boolean;
  onMapDataLoaded?: (isWalkable: (x: number, y: number) => boolean) => void;
  
  // Props pour le système Dofus
  explorationMonsters: Monster[]; // Monstres visibles en exploration
  onMonsterMove: (monsterId: string, newPosition: Position) => void;
  onMonsterClick: (monster: Monster) => void;
  combatState: CombatState; // État complet du combat
  
  // ✅ NOUVEAU: Prop pour cliquer sur les combattants
  onCombatantClick?: (combatant: Combatant) => void;
}

const TiledMapRenderer: React.FC<TiledMapRendererProps> = ({
  mapPath,
  playerPosition,
  isMoving,
  targetPosition,
  onTileClick,
  showGrid,
  isGamePaused,
  showDebugOverlay,
  onMapDataLoaded,
  // Props Dofus
  explorationMonsters,
  onMonsterMove,
  onMonsterClick,
  combatState,
  // ✅ NOUVEAU: Fonction pour cliquer sur les combattants
  onCombatantClick
}) => {
  // États pour les données Tiled
  const [tiledMap, setTiledMap] = useState<TiledMap | null>(null);
  const [tilesets, setTilesets] = useState<Record<string, ParsedTileset>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Dimensions d'affichage
  const DISPLAY_TILE_WIDTH = 80;
  const DISPLAY_TILE_HEIGHT = 40;

  // Charger la map Tiled au montage du composant
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Chargement de la map Tiled...');
        
        const mapData = await loadTiledMap(mapPath);
        setTiledMap(mapData);
        
        const loadedTilesets: Record<string, ParsedTileset> = {};
        
        for (const tileset of mapData.tilesets) {
          try {
            const tilesetPath = `/assets/maps/${tileset.source}`;
            const tilesetData = await loadTileset(tilesetPath);
            loadedTilesets[tileset.source] = tilesetData;
          } catch (tilesetError) {
            console.error(`❌ Erreur chargement tileset ${tileset.source}:`, tilesetError);
          }
        }
        
        setTilesets(loadedTilesets);
        setIsLoading(false);
        console.log('✅ Map Tiled chargée avec succès !');
        
      } catch (err) {
        console.error('❌ Erreur lors du chargement de la map:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setIsLoading(false);
      }
    };

    loadMapData();
  }, [mapPath]);

  // Fonctions de collision
  const isWalkablePosition = useCallback((x: number, y: number): boolean => {
    if (!tiledMap || !tiledMap.layers) return false;
    
    if (x < 0 || x >= tiledMap.width || y < 0 || y >= tiledMap.height) {
      return false;
    }
    
    const index = y * tiledMap.width + x;
    
    const floorsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Floors'
    ) as TiledLayer;
    
    const foundationsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Foundations'
    ) as TiledLayer;
    
    const propsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Props'
    ) as TiledLayer;
    
    if (!floorsLayer || !floorsLayer.data || floorsLayer.data[index] === 0) {
      return false;
    }
    
    if (foundationsLayer && foundationsLayer.data && foundationsLayer.data[index] !== 0) {
      return false;
    }
    
    if (propsLayer && propsLayer.data && propsLayer.data[index] !== 0) {
      return false;
    }
    
    return true;
  }, [tiledMap]);

  const hasFloorAt = useCallback((x: number, y: number): boolean => {
    if (!tiledMap || !tiledMap.layers) return false;
    
    if (x < 0 || x >= tiledMap.width || y < 0 || y >= tiledMap.height) {
      return false;
    }
    
    const index = y * tiledMap.width + x;
    
    const floorsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Floors'
    ) as TiledLayer;
    
    if (floorsLayer && floorsLayer.data && floorsLayer.data[index] !== 0) {
      return true;
    }
    
    return false;
  }, [tiledMap]);

  const getObstacleType = useCallback((x: number, y: number): string => {
    if (!tiledMap || !tiledMap.layers) return 'unknown';
    
    if (x < 0 || x >= tiledMap.width || y < 0 || y >= tiledMap.height) {
      return 'out-of-bounds';
    }
    
    const index = y * tiledMap.width + x;
    
    const floorsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Floors'
    ) as TiledLayer;
    
    const foundationsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Foundations'
    ) as TiledLayer;
    
    const propsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Props'
    ) as TiledLayer;
    
    if (!floorsLayer || !floorsLayer.data || floorsLayer.data[index] === 0) {
      return 'no-floor';
    }
    
    if (foundationsLayer && foundationsLayer.data && foundationsLayer.data[index] !== 0) {
      return 'wall';
    }
    
    if (propsLayer && propsLayer.data && propsLayer.data[index] !== 0) {
      return 'props';
    }
    
    return 'walkable';
  }, [tiledMap]);

  // Communiquer les données de collision
  useEffect(() => {
    if (tiledMap && onMapDataLoaded) {
      console.log('📡 Envoi des données de collision au système de pathfinding');
      onMapDataLoaded(isWalkablePosition);
    }
  }, [tiledMap, isWalkablePosition, onMapDataLoaded]);

  // Fonctions de rendu
  const getTileImage = (tileId: number): string | null => {
    if (tileId === 0) return null;
    if (!tiledMap) return null;
    
    for (const tilesetRef of tiledMap.tilesets) {
      const tileset = tilesets[tilesetRef.source];
      if (!tileset) continue;
      
      const localTileId = tileId - tilesetRef.firstgid;
      const tile = tileset.tiles.find(t => t.id === localTileId);
      
      if (tile) {
        return `/assets/maps/${tile.image}`;
      }
    }
    
    return null;
  };

  const calculateIsometricPosition = (gridX: number, gridY: number) => {
    const isoX = (gridX - gridY) * (DISPLAY_TILE_WIDTH / 2);
    const isoY = (gridX + gridY) * (DISPLAY_TILE_HEIGHT / 2);
    return { isoX, isoY };
  };

  const getCenterOffset = useCallback(() => {
    if (!tiledMap) return { x: 0, y: 0 };
    
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    const mapCenterGridX = tiledMap.width / 2;
    const mapCenterGridY = tiledMap.height / 2;
    
    const { isoX: mapCenterIsoX, isoY: mapCenterIsoY } = calculateIsometricPosition(mapCenterGridX, mapCenterGridY);
    
    const offsetX = screenCenterX - mapCenterIsoX;
    const offsetY = screenCenterY - mapCenterIsoY - 120;
    
    return { x: offsetX, y: offsetY };
  }, [tiledMap]);

  const getTileRenderPosition = useCallback((gridX: number, gridY: number) => {
    const { isoX, isoY } = calculateIsometricPosition(gridX, gridY);
    const centerOffset = getCenterOffset();
    
    return {
      x: isoX + centerOffset.x,
      y: isoY + centerOffset.y
    };
  }, [getCenterOffset]);

  // Vérifie si une case est dans la portée de mouvement du joueur en combat
  const isInMovementRange = useCallback((x: number, y: number): boolean => {
    if (combatState.phase !== 'fighting') return false;
    
    const playerCombatant = combatState.combatants.find(c => c.id === 'player');
    if (!playerCombatant || combatState.currentTurnCombatantId !== 'player') return false;
    
    const distance = Math.abs(x - playerCombatant.position.x) + Math.abs(y - playerCombatant.position.y);
    return distance <= playerCombatant.pm;
  }, [combatState]);

  // Vérifie si une case est dans la portée du sort sélectionné
  const isInSpellRange = useCallback((x: number, y: number): boolean => {
    if (combatState.phase !== 'fighting' || !combatState.selectedSpell) return false;
    
    const playerCombatant = combatState.combatants.find(c => c.id === 'player');
    if (!playerCombatant) return false;
    
    const distance = Math.abs(x - playerCombatant.position.x) + Math.abs(y - playerCombatant.position.y);
    const inRange = distance <= combatState.selectedSpell.spell.range;
    
    return inRange;
  }, [combatState]);

  // Vérifie si une case a une cible valide pour le sort
  const getSpellTargetType = useCallback((x: number, y: number): 'valid-enemy' | 'valid-ally' | 'empty' | 'invalid' => {
    if (!combatState.selectedSpell) return 'invalid';
    
    // Chercher un combattant sur cette position
    const target = combatState.combatants.find(c => 
      c.position.x === x && c.position.y === y && c.isAlive
    );
    
    const playerCombatant = combatState.combatants.find(c => c.id === 'player');
    if (!playerCombatant) return 'invalid';
    
    const spell = combatState.selectedSpell.spell;
    
    // Si pas de cible sur cette case
    if (!target) {
      return 'empty';
    }
    
    // Il y a une cible sur cette case
    if (spell.type === 'damage') {
      // Sort d'attaque - doit cibler un ennemi
      if (target.team !== playerCombatant.team) {
        return 'valid-enemy'; // Ennemi valide
      } else {
        return 'invalid'; // Impossible d'attaquer un allié
      }
    }
    
    if (spell.type === 'heal') {
      // Sort de soin - doit cibler un allié
      if (target.team === playerCombatant.team) {
        return 'valid-ally'; // Allié valide (ou soi-même)
      } else {
        return 'invalid'; // Impossible de soigner un ennemi
      }
    }
    
    return 'invalid'; // Cas par défaut
  }, [combatState]);

  // Vérifie si une case est une zone de placement
  const getPlacementZoneType = useCallback((x: number, y: number): 'player' | 'enemy' | null => {
    if (combatState.phase !== 'placement') return null;
    
    const playerZone = combatState.placementZones.find(z => z.team === 'player');
    const enemyZone = combatState.placementZones.find(z => z.team === 'enemy');
    
    if (playerZone?.positions.some(p => p.x === x && p.y === y)) {
      return 'player';
    }
    
    if (enemyZone?.positions.some(p => p.x === x && p.y === y)) {
      return 'enemy';
    }
    
    return null;
  }, [combatState]);

  // Rendu de la grille de combat Dofus
  const renderDofusCombatGrid = (): React.ReactNode[] => {
    if (!tiledMap || combatState.phase === 'exploring') return [];
    
    const tiles: React.ReactNode[] = [];
    
    for (let y = 0; y < tiledMap.height; y++) {
      for (let x = 0; x < tiledMap.width; x++) {
        if (!hasFloorAt(x, y)) continue;
        
        const position = getTileRenderPosition(x, y);
        const placementZone = getPlacementZoneType(x, y);
        const inMovementRange = isInMovementRange(x, y);
        const inSpellRange = isInSpellRange(x, y);
        const spellTargetType = getSpellTargetType(x, y);
        
        // Vérifier si la case est occupée par un combattant
        const occupiedBy = combatState.combatants.find(c => 
          c.position.x === x && c.position.y === y
        );
        
        // Couleurs de base pour la grille tactique
        const isEvenTile = (x + y) % 2 === 0;
        let tileColor = isEvenTile ? 'rgba(180, 180, 180, 0.4)' : 'rgba(140, 140, 140, 0.4)';
        let borderColor = 'rgba(100, 100, 100, 0.6)';
        let extraEffects = null;
        
        // PRIORITÉ 1: Affichage de la portée des sorts
        if (combatState.phase === 'fighting' && combatState.selectedSpell && inSpellRange) {
          if (spellTargetType === 'valid-enemy') {
            tileColor = 'rgba(255, 0, 0, 0.8)'; // Rouge vif pour ennemis
            borderColor = 'rgba(255, 0, 0, 1)';
            extraEffects = (
              <circle
                cx={DISPLAY_TILE_WIDTH/2}
                cy={DISPLAY_TILE_HEIGHT/2}
                r="12"
                fill="rgba(255, 0, 0, 0.7)"
                className="animate-pulse"
              />
            );
          } else if (spellTargetType === 'valid-ally') {
            tileColor = 'rgba(0, 255, 0, 0.8)'; // Vert vif pour alliés
            borderColor = 'rgba(0, 255, 0, 1)';
            extraEffects = (
              <circle
                cx={DISPLAY_TILE_WIDTH/2}
                cy={DISPLAY_TILE_HEIGHT/2}
                r="12"
                fill="rgba(0, 255, 0, 0.7)"
                className="animate-pulse"
              />
            );
          } else if (spellTargetType === 'empty') {
            tileColor = 'rgba(128, 0, 128, 0.6)'; // Violet pour cases vides dans la portée
            borderColor = 'rgba(128, 0, 128, 0.8)';
          }
        }
        
        // PRIORITÉ 2: Zones de placement
        else if (combatState.phase === 'placement' && placementZone) {
          if (placementZone === 'player') {
            tileColor = 'rgba(59, 130, 246, 0.7)'; // Bleu pour le joueur
            borderColor = 'rgba(59, 130, 246, 1)';
            extraEffects = (
              <circle
                cx={DISPLAY_TILE_WIDTH/2}
                cy={DISPLAY_TILE_HEIGHT/2}
                r="8"
                fill="rgba(59, 130, 246, 0.8)"
                className="animate-pulse"
              />
            );
          } else if (placementZone === 'enemy') {
            tileColor = 'rgba(239, 68, 68, 0.7)'; // Rouge pour l'ennemi
            borderColor = 'rgba(239, 68, 68, 1)';
          }
        } 
        
        // PRIORITÉ 3: Zones de mouvement en combat
        else if (combatState.phase === 'fighting') {
          if (occupiedBy?.id === 'player') {
            tileColor = 'rgba(59, 130, 246, 0.7)'; // Bleu intense pour le joueur
            borderColor = 'rgba(59, 130, 246, 1)';
          } else if (occupiedBy && occupiedBy.id !== 'player') {
            tileColor = 'rgba(239, 68, 68, 0.7)'; // Rouge intense pour l'ennemi
            borderColor = 'rgba(239, 68, 68, 1)';
          } else if (inMovementRange && !combatState.selectedSpell) {
            tileColor = isEvenTile ? 'rgba(34, 197, 94, 0.5)' : 'rgba(22, 163, 74, 0.5)'; // Vert pour cases accessibles
            borderColor = 'rgba(34, 197, 94, 0.7)';
            extraEffects = (
              <circle
                cx={DISPLAY_TILE_WIDTH/2}
                cy={DISPLAY_TILE_HEIGHT/2}
                r="4"
                fill="rgba(34, 197, 94, 0.9)"
                className="animate-pulse"
              />
            );
          }
        }
        
        tiles.push(
          <div
            key={`dofus-tile-${x}-${y}`}
            className="absolute pointer-events-none"
            style={{
              left: position.x,
              top: position.y + DISPLAY_TILE_HEIGHT,
              width: DISPLAY_TILE_WIDTH,
              height: DISPLAY_TILE_HEIGHT,
              zIndex: 900 + y * 100 + x
            }}
          >
            <svg
              width={DISPLAY_TILE_WIDTH}
              height={DISPLAY_TILE_HEIGHT}
              className="absolute"
            >
              {/* Case isométrique style Dofus */}
              <path
                d={`M ${DISPLAY_TILE_WIDTH/2} 0 L ${DISPLAY_TILE_WIDTH} ${DISPLAY_TILE_HEIGHT/2} L ${DISPLAY_TILE_WIDTH/2} ${DISPLAY_TILE_HEIGHT} L 0 ${DISPLAY_TILE_HEIGHT/2} Z`}
                fill={tileColor}
                stroke={borderColor}
                strokeWidth="1.5"
              />
              
              {/* Effets visuels spéciaux */}
              {extraEffects}
              
              {/* Texte d'aide pour les zones de placement */}
              {combatState.phase === 'placement' && placementZone === 'player' && !occupiedBy && (
                <text
                  x={DISPLAY_TILE_WIDTH/2}
                  y={DISPLAY_TILE_HEIGHT/2 + 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  fontWeight="bold"
                >
                  📍
                </text>
              )}

              {/* Icônes pour les sorts */}
              {combatState.phase === 'fighting' && combatState.selectedSpell && inSpellRange && (
                <text
                  x={DISPLAY_TILE_WIDTH/2}
                  y={DISPLAY_TILE_HEIGHT/2 + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {spellTargetType === 'valid-enemy' ? '⚔️' : 
                   spellTargetType === 'valid-ally' ? '💚' : 
                   spellTargetType === 'empty' ? '✨' : '❌'}
                </text>
              )}
            </svg>
          </div>
        );
      }
    }
    
    return tiles;
  };

  // Rendu des couches Tiled (CODE ORIGINAL GARDÉ)
  const renderLayer = (layer: TiledLayer): React.ReactNode[] => {
    if (!layer || !layer.visible || !layer.data || !Array.isArray(layer.data)) {
      return [];
    }
    
    if (!layer.width || !layer.height) {
      return [];
    }

    const tiles: React.ReactNode[] = [];
    
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const index = y * layer.width + x;
        const tileId = layer.data[index];
        
        const tileImage = getTileImage(tileId);
        const position = getTileRenderPosition(x, y);
        
        tiles.push(
          <div
            key={`${layer.name}-${x}-${y}`}
            className="absolute"
            style={{
              left: position.x,
              top: position.y,
              width: DISPLAY_TILE_WIDTH,
              height: DISPLAY_TILE_HEIGHT * 2,
              pointerEvents: 'none',
              zIndex: y * 100 + x
            }}
          >
            {tileImage && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${tileImage})`,
                  backgroundSize: `${DISPLAY_TILE_WIDTH}px auto`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center bottom'
                }}
              />
            )}
            
            {/* Grille normale (seulement en exploration) */}
            {layer.name === 'Floors' && tileId !== 0 && showGrid && combatState.phase === 'exploring' && (
              <svg
                width={DISPLAY_TILE_WIDTH}
                height={DISPLAY_TILE_HEIGHT}
                className="absolute"
                style={{
                  left: 0,
                  top: DISPLAY_TILE_HEIGHT,
                  pointerEvents: 'none'
                }}
              >
                <path
                  d={`M ${DISPLAY_TILE_WIDTH/2} 0 L ${DISPLAY_TILE_WIDTH} ${DISPLAY_TILE_HEIGHT/2} L ${DISPLAY_TILE_WIDTH/2} ${DISPLAY_TILE_HEIGHT} L 0 ${DISPLAY_TILE_HEIGHT/2} Z`}
                  fill="none"
                  stroke="#8B7355"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
              </svg>
            )}
          </div>
        );
      }
    }
    
    return tiles;
  };

  // Zones cliquables avec gestion des sorts
  const renderClickableAreas = (): React.ReactNode[] => {
    if (!tiledMap) return [];
    
    const areas: React.ReactNode[] = [];
    
    for (let y = 0; y < tiledMap.height; y++) {
      for (let x = 0; x < tiledMap.width; x++) {
        
        if (hasFloorAt(x, y)) {
          const position = getTileRenderPosition(x, y);
          const isWalkable = isWalkablePosition(x, y);
          const obstacleType = getObstacleType(x, y);
          const placementZone = getPlacementZoneType(x, y);
          const inSpellRange = isInSpellRange(x, y);
          const spellTargetType = getSpellTargetType(x, y);
          
          const getClickableStyle = () => {
            if (isGamePaused && combatState.phase === 'exploring') return 'cursor-not-allowed';
            
            // PRIORITÉ 1: Curseur pour sorts
            if (combatState.phase === 'fighting' && combatState.selectedSpell && inSpellRange) {
              if (spellTargetType === 'valid-enemy' || spellTargetType === 'valid-ally') {
                return 'cursor-crosshair hover:scale-105 transition-transform';
              }
              if (spellTargetType === 'empty') {
                return 'cursor-pointer hover:scale-105 transition-transform';
              }
              return 'cursor-not-allowed';
            }
            
            // PRIORITÉ 2: Curseur pour placement
            if (combatState.phase === 'placement' && placementZone === 'player') {
              return 'cursor-pointer hover:scale-105 transition-transform';
            }
            
            return 'cursor-pointer';
          };
          
          const getDebugOverlay = () => {
            if (!showDebugOverlay || isWalkable) return null;
            
            return (
              <div 
                className="absolute inset-0 bg-red-500/40 border border-red-400/70"
                style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
              />
            );
          };

          // Overlay pour sort sélectionné
          const getSpellOverlay = () => {
            if (combatState.phase !== 'fighting' || !combatState.selectedSpell || !inSpellRange) return null;
            
            let overlayColor = '';
            if (spellTargetType === 'valid-enemy') {
              overlayColor = 'bg-red-500/20 border-2 border-red-400';
            } else if (spellTargetType === 'valid-ally') {
              overlayColor = 'bg-green-500/20 border-2 border-green-400';
            } else if (spellTargetType === 'empty') {
              overlayColor = 'bg-purple-500/20 border-2 border-purple-400';
            }
            
            return (
              <div 
                className={`absolute inset-0 ${overlayColor} animate-pulse`}
                style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
              />
            );
          };

          // Overlay pour zones de placement
          const getPlacementOverlay = () => {
            if (combatState.phase !== 'placement') return null;
            
            if (placementZone === 'player') {
              return (
                <div 
                  className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400 animate-pulse"
                  style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                />
              );
            }
            
            return null;
          };
          
          // Tooltip amélioré
          const getTooltipText = () => {
            if (combatState.selectedSpell && inSpellRange) {
              const spell = combatState.selectedSpell.spell;
              return `${spell.name} - ${
                spellTargetType === 'valid-enemy' ? 'Ennemi valide ⚔️' :
                spellTargetType === 'valid-ally' ? 'Allié valide 💚' :
                spellTargetType === 'empty' ? 'Case vide ✨' : 'Cible invalide ❌'
              }`;
            }
            
            if (combatState.phase === 'placement' && placementZone === 'player') {
              return `(${x}, ${y}) - Zone de placement joueur - Cliquez pour vous placer`;
            }
            
            return `(${x}, ${y}) - ${obstacleType} - ${isWalkable ? 'Accessible' : 'Bloqué'}${isGamePaused ? ' - PAUSE' : ''}`;
          };
          
          areas.push(
            <div
              key={`click-${x}-${y}`}
              className={`absolute transition-all duration-200 ${getClickableStyle()}`}
              style={{
                left: position.x,
                top: position.y + DISPLAY_TILE_HEIGHT,
                width: DISPLAY_TILE_WIDTH,
                height: DISPLAY_TILE_HEIGHT,
                zIndex: 1500 + y * 100 + x,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }}
              onClick={() => {
                if (!isGamePaused || combatState.phase === 'placement' || 
                    (combatState.phase === 'fighting' && combatState.selectedSpell)) {
                  onTileClick(x, y);
                }
              }}
              onMouseEnter={() => setHoveredTile({x, y})}
              onMouseLeave={() => setHoveredTile(null)}
              title={getTooltipText()}
            >
              {getDebugOverlay()}
              {getSpellOverlay()}
              {getPlacementOverlay()}
            </div>
          );
        }
      }
    }
    
    return areas;
  };

  // Rendu du joueur selon le contexte (exploration vs combat)
  const renderPlayer = (): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    
    // En exploration : utiliser playerPosition du hook de mouvement
    // En combat : utiliser la position du combattant joueur
    let currentPlayerPosition = playerPosition;
    let playerCombatant: Combatant | null = null;
    
    if (combatState.phase === 'fighting' || combatState.phase === 'placement') {
      playerCombatant = combatState.combatants.find(c => c.id === 'player') || null;
      if (playerCombatant) {
        currentPlayerPosition = playerCombatant.position;
      }
    }
    
    const playerRenderPosition = getTileRenderPosition(currentPlayerPosition.x, currentPlayerPosition.y);
    
    // ✅ NOUVEAU: Vérifier si on peut cliquer sur le joueur pour un sort
    const canClickForSpell = combatState.phase === 'fighting' && 
                            combatState.selectedSpell && 
                            onCombatantClick && 
                            playerCombatant;

    // ✅ NOUVEAU: Fonction pour gérer le clic sur le joueur
    const handlePlayerClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Empêcher la propagation vers la tile
      
      if (canClickForSpell && playerCombatant && onCombatantClick) {
        console.log(`🎯 Clic sur le joueur sur la map pour lancer un sort`);
        onCombatantClick(playerCombatant);
      }
    };
    
    elements.push(
      <div
        key="player"
        className={`absolute flex items-center justify-center ${canClickForSpell ? 'pointer-events-auto cursor-crosshair hover:scale-110' : 'pointer-events-none'}`}
        style={{
          left: playerRenderPosition.x,
          top: playerRenderPosition.y + DISPLAY_TILE_HEIGHT,
          width: DISPLAY_TILE_WIDTH,
          height: DISPLAY_TILE_HEIGHT,
          zIndex: 2000 + currentPlayerPosition.y * 100 + currentPlayerPosition.x
        }}
        onClick={handlePlayerClick}
        title={canClickForSpell ? `Lancer ${combatState.selectedSpell?.spell.name} sur vous-même` : undefined}
      >
        <div 
          className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full blur-sm opacity-70 animate-pulse bg-blue-500"
        />
        <div 
          className={`relative text-4xl drop-shadow-lg z-10 transition-transform duration-200 ${
            isMoving ? 'scale-110' : 'scale-100'
          } ${canClickForSpell ? 'hover:scale-125' : ''}`}
          style={{ color: '#3b82f6', filter: 'drop-shadow(0 0 12px #3b82f6)' }}
        >
          🧙‍♂️
        </div>

        {/* ✅ NOUVEAU: Indicateur visuel si le joueur peut être ciblé */}
        {canClickForSpell && combatState.selectedSpell && (
          <div className="absolute inset-0 border-2 border-green-400 rounded-full animate-pulse pointer-events-none">
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">💚</span>
            </div>
          </div>
        )}
      </div>
    );
    
    return elements;
  };

  // Rendu conditionnel des entités selon la phase
  const renderEntities = (): React.ReactNode[] => {
    if (!tiledMap) return [];
    
    const entities: React.ReactNode[] = [];
    
    // EN EXPLORATION: Afficher les monstres d'exploration uniquement
    if (combatState.phase === 'exploring') {
      explorationMonsters
        .filter(monster => monster.isAlive)
        .forEach(monster => {
          entities.push(
            <MonsterComponent
              key={monster.id}
              monster={monster}
              onMonsterMove={onMonsterMove}
              onMonsterClick={onMonsterClick}
              isWalkable={isWalkablePosition}
              mapWidth={tiledMap.width}
              mapHeight={tiledMap.height}
              getTileRenderPosition={getTileRenderPosition}
              isInCombat={false} // Pas en combat donc les monstres bougent
            />
          );
        });
    }
    
    // EN COMBAT: Afficher SEULEMENT les combattants actuels (sauf le joueur qui est rendu ailleurs)
    else if (combatState.phase === 'fighting' || combatState.phase === 'placement') {
      combatState.combatants
        .filter(combatant => combatant.id !== 'player' && combatant.isAlive)
        .forEach(combatant => {
          const renderPosition = getTileRenderPosition(combatant.position.x, combatant.position.y);
          
          // ✅ NOUVEAU: Vérifier si on peut cliquer sur ce combattant pour un sort
          const canClickForSpell = combatState.phase === 'fighting' && 
                                  combatState.selectedSpell && 
                                  onCombatantClick;

          // ✅ NOUVEAU: Fonction pour gérer le clic sur le combattant ennemi
          const handleCombatantClick = (e: React.MouseEvent) => {
            e.stopPropagation(); // Empêcher la propagation vers la tile
            
            if (canClickForSpell && onCombatantClick) {
              console.log(`🎯 Clic sur ${combatant.name} sur la map pour lancer un sort`);
              onCombatantClick(combatant);
            }
          };
          
          entities.push(
            <div
              key={combatant.id}
              className={`absolute ${canClickForSpell ? 'cursor-crosshair pointer-events-auto hover:scale-110' : 'cursor-pointer pointer-events-auto hover:scale-110'} z-[2500] transition-transform duration-200`}
              style={{
                left: renderPosition.x,
                top: renderPosition.y,
                width: DISPLAY_TILE_WIDTH,
                height: DISPLAY_TILE_HEIGHT * 2,
                zIndex: 2500 + combatant.position.y * 100 + combatant.position.x
              }}
              onClick={handleCombatantClick}
              title={canClickForSpell ? 
                `Lancer ${combatState.selectedSpell?.spell.name} sur ${combatant.name}` : 
                `${combatant.name} (${combatant.health}/${combatant.maxHealth} PV)`
              }
            >
              {/* Ombre du combattant */}
              <div 
                className="absolute inset-0 rounded-full blur-sm opacity-50 animate-pulse"
                style={{ 
                  background: `radial-gradient(circle, ${combatant.color}40 0%, transparent 70%)`,
                  bottom: '10px'
                }}
              />
              
              {/* Corps du combattant */}
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div 
                  className="text-4xl mb-2 drop-shadow-lg"
                  style={{ 
                    color: combatant.color,
                    filter: `drop-shadow(0 0 8px ${combatant.color})`
                  }}
                >
                  {combatant.icon}
                </div>
                
                <div className="text-white text-xs font-bold bg-gray-900/80 px-2 py-1 rounded border border-gray-600 shadow-lg">
                  {combatant.name}
                </div>
                
                {/* Barre de vie du combattant */}
                <div className="w-12 h-1 bg-gray-800 rounded-full mt-1 border border-gray-600 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                    style={{ 
                      width: `${(combatant.health / combatant.maxHealth) * 100}%` 
                    }}
                  />
                </div>
                
                {/* Indicateur si c'est son tour */}
                {combatState.currentTurnCombatantId === combatant.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-xs font-bold">▶</span>
                  </div>
                )}

                {/* Indicateur si l'ennemi est prêt en phase de placement */}
                {combatState.phase === 'placement' && combatant.isReady && (
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">✓</span>
                  </div>
                )}

                {/* ✅ NOUVEAU: Indicateur visuel si le combattant peut être ciblé */}
                {canClickForSpell && combatState.selectedSpell && (
                  <div className="absolute inset-0 border-2 border-red-400 rounded-lg animate-pulse pointer-events-none">
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">⚔️</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        });
    }
    
    return entities;
  };

  // Recalculer le centrage
  useEffect(() => {
    const handleResize = () => {
      if (tiledMap) {
        console.log('📐 Redimensionnement détecté - Recentrage automatique');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tiledMap]);

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4 animate-spin">🌀</div>
          <div className="text-xl">Chargement de la map...</div>
          <div className="text-gray-400 mt-2">Avec système de combat Dofus...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
        <div className="text-center text-white bg-red-900/80 p-8 rounded-lg border border-red-500">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl mb-2">Erreur de chargement</div>
          <div className="text-gray-300 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // ✅ AFFICHAGE FINAL AVEC COMBATTANTS CLIQUABLES
  return (
    <div 
      ref={mapContainerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#2d1810' }}
    >
      {/* Rendu des couches Tiled avec textures */}
      {tiledMap && tiledMap.layers && Array.isArray(tiledMap.layers) && tiledMap.layers.map((layer) => {
        if (!layer || typeof layer !== 'object') {
          return null;
        }
        
        return (
          <div key={layer.id || Math.random()} className="absolute inset-0">
            {renderLayer(layer)}
          </div>
        );
      })}
      
      {/* Grille de combat Dofus avec portée des sorts */}
      {combatState.phase !== 'exploring' && (
        <div className="absolute inset-0">
          {renderDofusCombatGrid()}
        </div>
      )}
      
      {/* Zones cliquables */}
      <div className="absolute inset-0">
        {renderClickableAreas()}
      </div>
      
      {/* Rendu du joueur selon le contexte (maintenant cliquable en combat) */}
      {renderPlayer()}
      
      {/* Rendu conditionnel des entités (maintenant cliquables en combat) */}
      <div className="absolute inset-0">
        {renderEntities()}
      </div>
      
      {/* Informations de debug améliorées */}
      {process.env.NODE_ENV === 'development' && tiledMap && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-[2000] pointer-events-none">
          <div>Map Tiled: {tiledMap.width}x{tiledMap.height}</div>
          <div>🎮 DOFUS: {DISPLAY_TILE_WIDTH}x{DISPLAY_TILE_HEIGHT}</div>
          <div>Phase: {combatState.phase}</div>
          <div>Joueur: ({playerPosition.x}, {playerPosition.y})</div>
          
          {/* Info de combat */}
          {combatState.phase === 'fighting' && (
            <>
              <div className="text-red-400">
                ⚔️ COMBAT Tour {combatState.turnNumber}
              </div>
              <div className="text-blue-400">
                Combattants: {combatState.combatants.filter(c => c.isAlive).length}
              </div>
              {/* ✅ Info du sort sélectionné avec debug */}
              {combatState.selectedSpell && (
                <div className="text-purple-400">
                  🔮 Sort: {combatState.selectedSpell.spell.name} (Portée: {combatState.selectedSpell.spell.range})
                  <br />Type: {combatState.selectedSpell.spell.type} | Cible: {combatState.selectedSpell.spell.targetType}
                  <br />✅ Combattants cliquables sur la map !
                </div>
              )}
            </>
          )}

          {/* Info de placement */}
          {combatState.phase === 'placement' && (
            <>
              <div className="text-orange-400">
                🎯 PLACEMENT en cours
              </div>
              <div className="text-blue-400">
                Joueur placé: {combatState.combatants.find(c => c.id === 'player')?.startPosition ? 'Oui' : 'Non'}
              </div>
            </>
          )}
          
          {/* Info d'exploration */}
          {combatState.phase === 'exploring' && (
            <div className="text-green-400">
              🐲 Monstres: {explorationMonsters.filter(m => m.isAlive).length}
            </div>
          )}
          
          {hoveredTile && (
            <div className="text-yellow-400">
              👆 ({hoveredTile.x}, {hoveredTile.y}): {getObstacleType(hoveredTile.x, hoveredTile.y)}
              {combatState.phase === 'placement' && getPlacementZoneType(hoveredTile.x, hoveredTile.y) && (
                <span className="ml-1">
                  - Zone {getPlacementZoneType(hoveredTile.x, hoveredTile.y)}
                </span>
              )}
              {combatState.selectedSpell && isInSpellRange(hoveredTile.x, hoveredTile.y) && (
                <span className="ml-1">
                  - Portée: {getSpellTargetType(hoveredTile.x, hoveredTile.y)}
                </span>
              )}
            </div>
          )}
          
          <div className="text-purple-400">
            ⚔️ Système Dofus: {combatState.phase}
          </div>
        </div>
      )}
    </div>
  );
};

export default TiledMapRenderer;