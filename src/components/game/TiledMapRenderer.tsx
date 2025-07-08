/**
 * COMPOSANT TILED MAP RENDERER - VERSION ULTRA CLEAN
 * ✅ SUPPRIMÉ: Toutes les bordures rouges lors de la sélection de sorts
 * ✅ SUPPRIMÉ: Tous les indicateurs visuels (tour, placement, etc.)
 * ✅ SUPPRIMÉ: Toutes les infos au survol
 * ✅ GARDÉ: Seulement les emojis des monstres et du joueur
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TiledMap, TiledLayer, ParsedTileset } from '../../types/tiled';
import { loadTiledMap, loadTileset } from '../../utils/tiledLoader';
import { Position } from '../../types/game';
import { Monster, CombatState, Combatant, DamageAnimation } from '../../types/combat';
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
  
  // Prop pour cliquer sur les combattants
  onCombatantClick?: (combatant: Combatant) => void;
  
  // Animations de dégâts
  damageAnimations?: DamageAnimation[];
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
  // Fonction pour cliquer sur les combattants
  onCombatantClick,
  // Animations de dégâts
  damageAnimations = []
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

  // ✅ FONCTION POUR RENDRE LES ANIMATIONS DE DÉGÂTS
  const renderDamageAnimations = (): React.ReactNode[] => {
    if (!damageAnimations || damageAnimations.length === 0) return [];
    
    return damageAnimations.map((animation) => {
      const renderPosition = getTileRenderPosition(animation.gridPosition.x, animation.gridPosition.y);
      
      // Calculer l'âge de l'animation (de 0 à 1)
      const age = (Date.now() - animation.timestamp) / animation.duration;
      const progress = Math.min(age, 1);
      
      // Animation : disparition en fondu + léger grossissement
      const opacity = Math.max(0, 1 - progress);
      const scale = 1 + progress * 0.3;
      
      // Couleurs selon le type
      const isHeal = animation.type === 'heal';
      const textColor = isHeal ? '#22c55e' : '#ef4444';
      const shadowColor = isHeal ? '#16a34a' : '#dc2626';
      const emoji = isHeal ? '💚' : '💥';
      const sign = isHeal ? '+' : '-';
      
      return (
        <div
          key={animation.id}
          className="absolute pointer-events-none z-[3000] font-bold select-none"
          style={{
            left: renderPosition.x + DISPLAY_TILE_WIDTH / 2,
            top: renderPosition.y + DISPLAY_TILE_HEIGHT / 2,
            transform: `translate(-50%, -50%) scale(${scale})`,
            opacity: opacity,
            color: textColor,
            textShadow: `3px 3px 6px ${shadowColor}, 0 0 12px ${shadowColor}, 0 0 18px ${shadowColor}`,
            fontSize: '28px',
            fontWeight: '900',
            zIndex: 3000 + animation.gridPosition.y * 100 + animation.gridPosition.x,
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'optimizeLegibility'
          }}
        >
          <div className="flex items-center justify-center space-x-1 bg-black/40 px-3 py-1 rounded-lg border border-white/20 backdrop-blur-sm">
            <span className="text-2xl">{emoji}</span>
            <span className="font-mono font-black tracking-wider">{sign}{animation.damage}</span>
          </div>
        </div>
      );
    });
  };

  // ✅ NOUVEAU: Fonction pour rendre les cercles colorés sur les cases des combattants
  const renderCombatantCircles = (): React.ReactNode[] => {
    if (combatState.phase === 'exploring') return [];
    
    const circles: React.ReactNode[] = [];
    
    // Parcourir tous les combattants vivants
    combatState.combatants
      .filter(combatant => combatant.isAlive)
      .forEach(combatant => {
        const position = getTileRenderPosition(combatant.position.x, combatant.position.y);
        
        // Déterminer la couleur du cercle
        const isPlayer = combatant.id === 'player';
        const circleColor = isPlayer ? '#3b82f6' : '#ef4444'; // Bleu pour joueur, rouge pour ennemi
        const glowColor = isPlayer ? '#60a5fa' : '#f87171';
        
        circles.push(
          <div
            key={`circle-${combatant.id}`}
            className="absolute pointer-events-none"
            style={{
              left: position.x,
              top: position.y + DISPLAY_TILE_HEIGHT,
              width: DISPLAY_TILE_WIDTH,
              height: DISPLAY_TILE_HEIGHT,
              zIndex: 950 + combatant.position.y * 100 + combatant.position.x
            }}
          >
            <svg
              width={DISPLAY_TILE_WIDTH}
              height={DISPLAY_TILE_HEIGHT}
              className="absolute"
            >
              {/* Cercle coloré au centre de la case isométrique */}
              <circle
                cx={DISPLAY_TILE_WIDTH / 2}
                cy={DISPLAY_TILE_HEIGHT / 2}
                r="12"
                fill={circleColor}
                stroke={glowColor}
                strokeWidth="2"
                className="animate-pulse"
                style={{
                  filter: `drop-shadow(0 0 8px ${glowColor})`,
                }}
              />
            </svg>
          </div>
        );
      });
    
    return circles;
  };

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
        let tileColor = isEvenTile ? 'rgba(180, 180, 180, 0.3)' : 'rgba(140, 140, 140, 0.3)';
        let borderColor = 'rgba(100, 100, 100, 0.5)';
        let extraEffects = null;
        
        // PRIORITÉ 1: Affichage de la portée des sorts (plus subtil)
        if (combatState.phase === 'fighting' && combatState.selectedSpell && inSpellRange) {
          if (spellTargetType === 'valid-enemy') {
            tileColor = 'rgba(255, 0, 0, 0.4)'; // Rouge moins intense
            borderColor = 'rgba(255, 0, 0, 0.6)';
          } else if (spellTargetType === 'valid-ally') {
            tileColor = 'rgba(0, 255, 0, 0.4)'; // Vert moins intense
            borderColor = 'rgba(0, 255, 0, 0.6)';
          } else if (spellTargetType === 'empty') {
            tileColor = 'rgba(128, 0, 128, 0.3)'; // Violet plus subtil
            borderColor = 'rgba(128, 0, 128, 0.5)';
          }
        }
        
        // PRIORITÉ 2: Zones de placement
        else if (combatState.phase === 'placement' && placementZone) {
          if (placementZone === 'player') {
            tileColor = 'rgba(59, 130, 246, 0.6)';
            borderColor = 'rgba(59, 130, 246, 0.8)';
            extraEffects = (
              <circle
                cx={DISPLAY_TILE_WIDTH/2}
                cy={DISPLAY_TILE_HEIGHT/2}
                r="6"
                fill="rgba(59, 130, 246, 0.8)"
                className="animate-pulse"
              />
            );
          } else if (placementZone === 'enemy') {
            tileColor = 'rgba(239, 68, 68, 0.6)';
            borderColor = 'rgba(239, 68, 68, 0.8)';
          }
        } 
        
        // PRIORITÉ 3: Zones de mouvement en combat (plus subtiles)
        else if (combatState.phase === 'fighting') {
          if (inMovementRange && !combatState.selectedSpell) {
            tileColor = isEvenTile ? 'rgba(34, 197, 94, 0.3)' : 'rgba(22, 163, 74, 0.3)';
            borderColor = 'rgba(34, 197, 94, 0.5)';
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
              {/* Case isométrique plus subtile */}
              <path
                d={`M ${DISPLAY_TILE_WIDTH/2} 0 L ${DISPLAY_TILE_WIDTH} ${DISPLAY_TILE_HEIGHT/2} L ${DISPLAY_TILE_WIDTH/2} ${DISPLAY_TILE_HEIGHT} L 0 ${DISPLAY_TILE_HEIGHT/2} Z`}
                fill={tileColor}
                stroke={borderColor}
                strokeWidth="1"
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
                return 'cursor-crosshair';
              }
              if (spellTargetType === 'empty') {
                return 'cursor-pointer';
              }
              return 'cursor-not-allowed';
            }
            
            // PRIORITÉ 2: Curseur pour placement
            if (combatState.phase === 'placement' && placementZone === 'player') {
              return 'cursor-pointer';
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
            </div>
          );
        }
      }
    }
    
    return areas;
  };

  // ✅ RENDU DU JOUEUR SIMPLIFIÉ (pas de tooltip ni d'indicateurs)
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
    
    // Vérifier si on peut cliquer sur le joueur pour un sort
    const canClickForSpell = combatState.phase === 'fighting' && 
                            combatState.selectedSpell && 
                            onCombatantClick && 
                            playerCombatant;

    // Fonction pour gérer le clic sur le joueur
    const handlePlayerClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (canClickForSpell && playerCombatant && onCombatantClick) {
        console.log(`🎯 Clic sur le joueur sur la map pour lancer un sort`);
        onCombatantClick(playerCombatant);
      }
    };
    
    elements.push(
      <div
        key="player"
        className={`absolute flex items-center justify-center ${canClickForSpell ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-auto'}`}
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
        {/* ✅ SIMPLIFIÉ: Juste l'emoji du joueur, sans effets visuels compliqués */}
        <div 
          className={`relative text-4xl drop-shadow-lg z-10 transition-all duration-300 ${
            isMoving ? 'scale-110' : 'scale-100'
          }`}
          style={{ 
            color: '#3b82f6', 
            filter: 'drop-shadow(0 0 12px #3b82f6)' 
          }}
        >
          🧙‍♂️
        </div>

        {/* ✅ SUPPRIMÉ: Toutes les infos au survol et indicateurs visuels */}
      </div>
    );
    
    return elements;
  };

  // ✅ RENDU DES ENTITÉS ULTRA SIMPLIFIÉ - SEULEMENT LES EMOJIS
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
              isInCombat={false}
            />
          );
        });
    }
    
    // EN COMBAT: Afficher SEULEMENT l'emoji des combattants ennemis
    else if (combatState.phase === 'fighting' || combatState.phase === 'placement') {
      combatState.combatants
        .filter(combatant => combatant.id !== 'player' && combatant.isAlive)
        .forEach(combatant => {
          const renderPosition = getTileRenderPosition(combatant.position.x, combatant.position.y);
          
          // Vérifier si on peut cliquer sur ce combattant pour un sort
          const canClickForSpell = combatState.phase === 'fighting' && 
                                  combatState.selectedSpell && 
                                  onCombatantClick;

          // Fonction pour gérer le clic sur le combattant ennemi
          const handleCombatantClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            
            if (canClickForSpell && onCombatantClick) {
              console.log(`🎯 Clic sur ${combatant.name} sur la map pour lancer un sort`);
              onCombatantClick(combatant);
            }
          };
          
          entities.push(
            <div
              key={combatant.id}
              className={`absolute ${canClickForSpell ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-auto cursor-pointer'} z-[2500] transition-all duration-300`}
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
              {/* ✅ ULTRA SIMPLIFIÉ: SEULEMENT l'emoji, rien d'autre ! */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div 
                  className="text-4xl drop-shadow-lg transition-all duration-300 scale-100"
                  style={{ 
                    color: combatant.color,
                    filter: `drop-shadow(0 0 8px ${combatant.color})`
                  }}
                >
                  {combatant.icon}
                </div>
                
                {/* 
                ✅ TOUT SUPPRIMÉ:
                - Les infos au survol (nom + PV + barre de vie)
                - L'indicateur de tour (triangle jaune ▶)
                - L'indicateur "prêt" en placement (✓ vert)
                - L'indicateur visuel pour les sorts (bordure rouge + ⚔️)
                - Tous les effets hover et animations complexes
                
                Il ne reste que l'emoji du monstre !
                */}
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
          <div className="text-gray-400 mt-2">Version ultra clean...</div>
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

  // ✅ AFFICHAGE FINAL ULTRA CLEAN - SEULEMENT LES EMOJIS
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
      
      {/* Grille de combat Dofus avec portée des sorts (plus subtile) */}
      {combatState.phase !== 'exploring' && (
        <div className="absolute inset-0">
          {renderDofusCombatGrid()}
        </div>
      )}

      {/* ✅ NOUVEAU: Cercles colorés sur les cases des combattants */}
      {combatState.phase !== 'exploring' && (
        <div className="absolute inset-0">
          {renderCombatantCircles()}
        </div>
      )}
      
      {/* Zones cliquables */}
      <div className="absolute inset-0">
        {renderClickableAreas()}
      </div>
      
      {/* ✅ RENDU DU JOUEUR ULTRA SIMPLIFIÉ */}
      {renderPlayer()}
      
      {/* ✅ RENDU DES ENTITÉS ULTRA SIMPLIFIÉ - SEULEMENT LES EMOJIS */}
      <div className="absolute inset-0">
        {renderEntities()}
      </div>

      {/* Rendu des animations de dégâts */}
      <div className="absolute inset-0">
        {renderDamageAnimations()}
      </div>
      
      {/* Informations de debug améliorées */}
      {process.env.NODE_ENV === 'development' && tiledMap && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-[2000] pointer-events-none">
          <div>Map Tiled: {tiledMap.width}x{tiledMap.height}</div>
          <div>🎮 VERSION ULTRA CLEAN: {DISPLAY_TILE_WIDTH}x{DISPLAY_TILE_HEIGHT}</div>
          <div>Phase: {combatState.phase}</div>
          <div>Joueur: ({playerPosition.x}, {playerPosition.y})</div>
          
          {/* Info des animations */}
          {damageAnimations.length > 0 && (
            <div className="text-orange-400">
              💥 Animations: {damageAnimations.length}
            </div>
          )}
          
          {/* Info de combat */}
          {combatState.phase === 'fighting' && (
            <>
              <div className="text-red-400">
                ⚔️ COMBAT ULTRA CLEAN Tour {combatState.turnNumber}
              </div>
              <div className="text-blue-400">
                Combattants: {combatState.combatants.filter(c => c.isAlive).length}
              </div>
              {/* Info du sort sélectionné */}
              {combatState.selectedSpell && (
                <div className="text-purple-400">
                  🔮 Sort: {combatState.selectedSpell.spell.name}
                  <br />✅ PLUS DE BORDURES ROUGES !
                </div>
              )}
            </>
          )}

          {/* Info de placement */}
          {combatState.phase === 'placement' && (
            <>
              <div className="text-orange-400">
                🎯 PLACEMENT CLEAN
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
              👆 Case: ({hoveredTile.x}, {hoveredTile.y}): {getObstacleType(hoveredTile.x, hoveredTile.y)}
            </div>
          )}
          
          <div className="text-green-400">
            ✨ ÉMOJIS SEULEMENT - SANS BORDURES !
          </div>
        </div>
      )}
    </div>
  );
};

export default TiledMapRenderer;