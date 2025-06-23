/**
 * COMPOSANT TILED MAP RENDERER - PATHFINDING VERS OBSTACLES
 * ✅ GARDE: Tout l'affichage qui fonctionne (intact)
 * ✅ AMÉLIORATION: Debug visuel simplifié - uniquement cases interdites en rouge
 * ✅ NOUVEAU: Couleurs différentes pour zones accessibles vs bloquées
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TiledMap, TiledLayer, ParsedTileset } from '../../types/tiled';
import { loadTiledMap, loadTileset } from '../../utils/tiledLoader';
import { Position } from '../../types/game';

interface TiledMapRendererProps {
  mapPath: string;
  playerPosition: Position;
  isMoving: boolean;
  targetPosition: Position | null;
  onTileClick: (x: number, y: number) => void;
  showGrid: boolean;
  isGamePaused: boolean;
  showDebugOverlay: boolean; // ✅ NOUVEAU: Reçu depuis GameMap
  onMapDataLoaded?: (isWalkable: (x: number, y: number) => boolean) => void;
}

const TiledMapRenderer: React.FC<TiledMapRendererProps> = ({
  mapPath,
  playerPosition,
  isMoving,
  targetPosition,
  onTileClick,
  showGrid,
  isGamePaused,
  showDebugOverlay, // ✅ NOUVEAU: Prop externe
  onMapDataLoaded
}) => {
  // États pour les données Tiled
  const [tiledMap, setTiledMap] = useState<TiledMap | null>(null);
  const [tilesets, setTilesets] = useState<Record<string, ParsedTileset>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // État pour afficher les coordonnées de debug
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Dimensions d'affichage - ZOOM JEU VIDÉO
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

  // Fonction pour trouver la couche Floors
  const getFloorsLayer = useCallback((): TiledLayer | null => {
    if (!tiledMap || !tiledMap.layers) return null;
    
    return tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Floors'
    ) as TiledLayer || null;
  }, [tiledMap]);

  // ✅ FONCTION DE COLLISION: Vérifie si une case est libre (pour le pathfinding)
  const isWalkablePosition = useCallback((x: number, y: number): boolean => {
    if (!tiledMap || !tiledMap.layers) return false;
    
    // Vérification des limites de la map
    if (x < 0 || x >= tiledMap.width || y < 0 || y >= tiledMap.height) {
      return false;
    }
    
    const index = y * tiledMap.width + x;
    
    // Trouver toutes les couches importantes
    const floorsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Floors'
    ) as TiledLayer;
    
    const foundationsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Foundations'
    ) as TiledLayer;
    
    const propsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Props'
    ) as TiledLayer;
    
    // RÈGLE 1: Il DOIT y avoir un sol (Floors)
    if (!floorsLayer || !floorsLayer.data || floorsLayer.data[index] === 0) {
      return false; // Pas de sol = pas praticable
    }
    
    // RÈGLE 2: Il ne doit PAS y avoir de murs/fondations (Foundations)
    if (foundationsLayer && foundationsLayer.data && foundationsLayer.data[index] !== 0) {
      return false; // Mur = pas praticable
    }
    
    // RÈGLE 3: Il ne doit PAS y avoir d'objets bloquants (Props)
    if (propsLayer && propsLayer.data && propsLayer.data[index] !== 0) {
      return false; // Objet = pas praticable
    }
    
    // RÈGLE 4: Les tapis (Carpets) sont OK, ils n'empêchent pas le mouvement
    return true; // Toutes les vérifications passées = praticable !
  }, [tiledMap]);

  // ✅ FONCTION POUR VÉRIFIER SI UNE CASE A DU SOL (pour les zones cliquables)
  const hasFloorAt = useCallback((x: number, y: number): boolean => {
    if (!tiledMap || !tiledMap.layers) return false;
    
    // Vérification des limites de la map
    if (x < 0 || x >= tiledMap.width || y < 0 || y >= tiledMap.height) {
      return false;
    }
    
    const index = y * tiledMap.width + x;
    
    // Trouver la couche Floors
    const floorsLayer = tiledMap.layers.find(layer => 
      layer && typeof layer === 'object' && layer.name === 'Floors'
    ) as TiledLayer;
    
    // Il y a du sol si la tile n'est pas vide (tileId !== 0)
    if (floorsLayer && floorsLayer.data && floorsLayer.data[index] !== 0) {
      return true;
    }
    
    return false;
  }, [tiledMap]);

  // ✅ NOUVELLE FONCTION: Obtient le type d'obstacle sur une case
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
    
    // Vérifier dans l'ordre
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

  // Communiquer les données de collision au système de mouvement
  useEffect(() => {
    if (tiledMap && onMapDataLoaded) {
      console.log('📡 Envoi des données de collision au système de pathfinding');
      onMapDataLoaded(isWalkablePosition);
    }
  }, [tiledMap, isWalkablePosition, onMapDataLoaded]);

  // Fonction pour obtenir l'image d'une tile (TON CODE ORIGINAL - INTACT)
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

  // Fonction unique pour tous les calculs isométriques (TON CODE ORIGINAL - INTACT)
  const calculateIsometricPosition = (gridX: number, gridY: number) => {
    const isoX = (gridX - gridY) * (DISPLAY_TILE_WIDTH / 2);
    const isoY = (gridX + gridY) * (DISPLAY_TILE_HEIGHT / 2);
    return { isoX, isoY };
  };

  // Centrage pour éviter la barre GameUI (TON CODE ORIGINAL - INTACT)
  const getCenterOffset = useCallback(() => {
    if (!tiledMap) return { x: 0, y: 0 };
    
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    const mapCenterGridX = tiledMap.width / 2;
    const mapCenterGridY = tiledMap.height / 2;
    
    const { isoX: mapCenterIsoX, isoY: mapCenterIsoY } = calculateIsometricPosition(mapCenterGridX, mapCenterGridY);
    
    const offsetX = screenCenterX - mapCenterIsoX;
    const offsetY = screenCenterY - mapCenterIsoY - 120; // Remontée de 120px pour éviter l'UI
    
    return { x: offsetX, y: offsetY };
  }, [tiledMap]);

  // Position de référence unique pour tous les éléments (TON CODE ORIGINAL - INTACT)
  const getTileRenderPosition = (gridX: number, gridY: number) => {
    const { isoX, isoY } = calculateIsometricPosition(gridX, gridY);
    const centerOffset = getCenterOffset();
    
    return {
      x: isoX + centerOffset.x,
      y: isoY + centerOffset.y
    };
  };

  // Rendu des couches avec tes textures (TON CODE ORIGINAL - INTACT)
  const renderLayer = (layer: TiledLayer): React.ReactNode[] => {
    if (!layer || !layer.visible || !layer.data || !Array.isArray(layer.data)) {
      return [];
    }
    
    if (!layer.width || !layer.height) {
      return [];
    }

    const tiles: React.ReactNode[] = [];
    
    // Parcourir la grille de façon cohérente
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const index = y * layer.width + x;
        const tileId = layer.data[index];
        
        const tileImage = getTileImage(tileId);
        const position = getTileRenderPosition(x, y);
        
        // Rendu de la tile (même si pas d'image pour les cases vides)
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
            {/* Image de la tile si elle existe */}
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
            
            {/* Grille parfaitement alignée sur les zones cliquables */}
            {layer.name === 'Floors' && tileId !== 0 && showGrid && (
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

  // ✅ ZONES CLIQUABLES AMÉLIORÉES avec debug visuel simplifié
  const renderClickableAreas = (): React.ReactNode[] => {
    if (!tiledMap) return [];
    
    const areas: React.ReactNode[] = [];
    let walkableCount = 0;
    let blockedCount = 0;
    
    // Parcourir TOUTE LA MAP pour créer des zones cliquables
    for (let y = 0; y < tiledMap.height; y++) {
      for (let x = 0; x < tiledMap.width; x++) {
        
        // Créer une zone cliquable sur toute case avec du sol
        if (hasFloorAt(x, y)) {
          const position = getTileRenderPosition(x, y);
          const isWalkable = isWalkablePosition(x, y);
          const obstacleType = getObstacleType(x, y);
          
          if (isWalkable) walkableCount++;
          else blockedCount++;
          
          // ✅ CURSEUR selon l'accessibilité (sans effets visuels de hover)
          const getClickableStyle = () => {
            if (isGamePaused) return 'cursor-not-allowed';
            return 'cursor-pointer'; // Simple curseur pointeur sans couleurs de hover
          };
          
          // ✅ Overlay de debug visuel SIMPLIFIÉ - seulement les cases bloquées en rouge
          const getDebugOverlay = () => {
            if (!showDebugOverlay || isWalkable) return null; // ✅ Ne montre que les cases bloquées
            
            return (
              <div 
                className="absolute inset-0 bg-red-500/40 border border-red-400/70"
                style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
              />
            );
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
                if (!isGamePaused) {
                  console.log(`🎯 Clic sur (${x}, ${y}) - ${obstacleType} - ${isWalkable ? 'Accessible directement' : 'Ira aussi loin que possible'}`);
                  onTileClick(x, y);
                }
              }}
              onMouseEnter={() => setHoveredTile({x, y})}
              onMouseLeave={() => setHoveredTile(null)}
              title={`Destination: (${x}, ${y}) - ${obstacleType} - ${isWalkable ? 'Accessible' : 'Bloqué - ira aussi loin que possible'}${isGamePaused ? ' - PAUSE' : ''}`}
            >
              {/* ✅ Overlay de debug simplifié */}
              {getDebugOverlay()}
            </div>
          );
        }
      }
    }
    
    console.log(`🎯 ${areas.length} zones cliquables créées (${walkableCount} accessibles, ${blockedCount} bloquées)`);
    return areas;
  };

  // Joueur et cible (TON CODE ORIGINAL - INTACT)
  const renderPlayerAndTarget = (): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    
    const playerPosition_render = getTileRenderPosition(playerPosition.x, playerPosition.y);
    
    elements.push(
      <div
        key="player"
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          left: playerPosition_render.x,
          top: playerPosition_render.y + DISPLAY_TILE_HEIGHT,
          width: DISPLAY_TILE_WIDTH,
          height: DISPLAY_TILE_HEIGHT,
          zIndex: 2000 + playerPosition.y * 100 + playerPosition.x
        }}
      >
        <div 
          className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full blur-sm opacity-70 animate-pulse bg-blue-500"
        />
        <div 
          className={`relative text-4xl drop-shadow-lg z-10 transition-transform duration-200 ${isMoving ? 'scale-110' : 'scale-100'}`}
          style={{ color: '#3b82f6', filter: 'drop-shadow(0 0 12px #3b82f6)' }}
        >
          🧙‍♂️
        </div>
      </div>
    );
    
    // ✅ SUPPRIMÉ: Indicateur de cible vert lors des clics
    // Plus d'affichage visuel de la destination
    
    return elements;
  };

  // Recalculer le centrage quand la fenêtre change de taille (TON CODE ORIGINAL - INTACT)
  useEffect(() => {
    const handleResize = () => {
      if (tiledMap) {
        console.log('📐 Redimensionnement détecté - Recentrage automatique');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tiledMap]);

  // Affichage pendant le chargement (TON CODE ORIGINAL - INTACT)
  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4 animate-spin">🌀</div>
          <div className="text-xl">Chargement de la map...</div>
          <div className="text-gray-400 mt-2">Avec pathfinding vers obstacles...</div>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur (TON CODE ORIGINAL - INTACT)
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
        <div className="text-center text-white bg-red-900/80 p-8 rounded-lg border border-red-500">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl mb-2">Erreur de chargement</div>
          <div className="text-gray-300 text-sm">{error}</div>
          <div className="text-gray-400 text-xs mt-4">
            Vérifiez que les fichiers Tiled sont dans public/assets/maps/
          </div>
        </div>
      </div>
    );
  }

  // Affichage final avec debug simplifié
  return (
    <div 
      ref={mapContainerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#2d1810' }}
    >
      {/* Rendu des couches Tiled avec tes textures */}
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
      
      {/* ✅ ZONES CLIQUABLES POUR PATHFINDING VERS OBSTACLES */}
      <div className="absolute inset-0">
        {renderClickableAreas()}
      </div>
      
      {/* Joueur et cible */}
      {renderPlayerAndTarget()}
      
      {/* Informations de debug améliorées */}
      {process.env.NODE_ENV === 'development' && tiledMap && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-[2000] pointer-events-none">
          <div>Map Tiled: {tiledMap.width}x{tiledMap.height}</div>
          <div>🎮 ZOOM JEU VIDÉO: {DISPLAY_TILE_WIDTH}x{DISPLAY_TILE_HEIGHT}</div>
          <div>📐 Écran: {window.innerWidth}x{window.innerHeight}</div>
          <div>Couches: {tiledMap.layers ? tiledMap.layers.length : 0}</div>
          <div>Joueur: ({playerPosition.x}, {playerPosition.y})</div>
          <div>Case joueur: {getObstacleType(playerPosition.x, playerPosition.y)} {isWalkablePosition(playerPosition.x, playerPosition.y) ? '✅' : '❌'}</div>
          {hoveredTile && (
            <div className="text-yellow-400">
              👆 ({hoveredTile.x}, {hoveredTile.y}): {getObstacleType(hoveredTile.x, hoveredTile.y)} {isWalkablePosition(hoveredTile.x, hoveredTile.y) ? '✅ Direct' : '🎯 Vers obstacle'}
            </div>
          )}
          {targetPosition && (
            <div className="text-green-400">🎯 Cible: ({targetPosition.x}, {targetPosition.y})</div>
          )}
          <div className="text-green-400">✅ PATHFINDING VERS OBSTACLES ACTIVÉ</div>
          <div className="text-blue-400">🎯 Grille: {showGrid ? 'ON' : 'OFF'}</div>
          <div className="text-purple-400">🎮 Cases cliquables sans effet visuel de hover</div>
          <div className="text-red-400">🔍 Debug: {showDebugOverlay ? 'ON (cases rouges = bloquées)' : 'OFF'}</div>
        </div>
      )}
    </div>
  );
};

export default TiledMapRenderer;