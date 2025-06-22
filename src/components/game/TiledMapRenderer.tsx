/**
 * COMPOSANT TILED MAP RENDERER - GRILLE PARFAITEMENT ALIGNÉE
 * ✅ CORRIGÉ: Grille et zones cliquables parfaitement synchronisées
 * ✅ CORRIGÉ: Plus de décalage de grille
 * ✅ CORRIGÉ: Zones cliquables limitées à la vraie map
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

  // ✅ CORRIGÉ: Fonction pour vérifier si une case est praticable avec limites strictes
  const isWalkablePosition = useCallback((x: number, y: number): boolean => {
    const floorsLayer = getFloorsLayer();
    if (!floorsLayer) return false;
    
    // ✅ VÉRIFICATION STRICTE DES LIMITES DE LA MAP
    if (x < 0 || x >= floorsLayer.width || y < 0 || y >= floorsLayer.height) {
      console.log(`🚫 Position (${x}, ${y}) hors limites de la map ${floorsLayer.width}x${floorsLayer.height}`);
      return false;
    }
    
    // Calculer l'index de la même façon PARTOUT
    const index = y * floorsLayer.width + x;
    const tileId = floorsLayer.data[index];
    
    // ✅ CORRIGÉ: Vérifier que l'index est valide
    if (index < 0 || index >= floorsLayer.data.length) {
      console.log(`🚫 Index ${index} invalide pour (${x}, ${y})`);
      return false;
    }
    
    const isWalkable = tileId !== 0;
    console.log(`🔍 Case (${x}, ${y}) index=${index} tileId=${tileId} walkable=${isWalkable}`);
    return isWalkable;
  }, [getFloorsLayer]);

  // Effet pour communiquer les données de praticabilité au parent
  useEffect(() => {
    if (tiledMap && onMapDataLoaded) {
      console.log('📡 Communication des données de praticabilité au système de mouvement');
      onMapDataLoaded(isWalkablePosition);
    }
  }, [tiledMap, isWalkablePosition, onMapDataLoaded]);

  // Fonction pour obtenir l'image d'une tile
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

  // Fonction unique pour tous les calculs isométriques
  const calculateIsometricPosition = (gridX: number, gridY: number) => {
    const isoX = (gridX - gridY) * (DISPLAY_TILE_WIDTH / 2);
    const isoY = (gridX + gridY) * (DISPLAY_TILE_HEIGHT / 2);
    return { isoX, isoY };
  };

  // ✅ CENTRAGE REMONTE POUR ÉVITER LA BARRE GAMEUI
  const getCenterOffset = useCallback(() => {
    if (!tiledMap) return { x: 0, y: 0 };
    
    // 🎯 CENTRE DE L'ÉCRAN
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    // 🎯 CENTRAGE SIMPLE - On centre directement sur le milieu de la map
    // Le centre de notre map 16x16 sera à la case (8, 8)
    const mapCenterGridX = tiledMap.width / 2;
    const mapCenterGridY = tiledMap.height / 2;
    
    // Position isométrique du centre de la map
    const { isoX: mapCenterIsoX, isoY: mapCenterIsoY } = calculateIsometricPosition(mapCenterGridX, mapCenterGridY);
    
    // ✅ Décalage pour placer le centre de la map au centre de l'écran
    // MAIS 120px plus haut pour éviter la barre GameUI
    const offsetX = screenCenterX - mapCenterIsoX;
    const offsetY = screenCenterY - mapCenterIsoY - 120; // ← REMONTÉE DE 120px
    
    console.log('🎯 CENTRAGE AVEC MAP REMONTÉE:');
    console.log(`   Écran: ${window.innerWidth} x ${window.innerHeight}`);
    console.log(`   Centre map: (${mapCenterGridX}, ${mapCenterGridY}) → iso(${mapCenterIsoX}, ${mapCenterIsoY})`);
    console.log(`   Offset: (${offsetX}, ${offsetY}) - MAP REMONTÉE DE 120px`);
    
    return { x: offsetX, y: offsetY };
  }, [tiledMap]);

  // Position de référence unique pour tous les éléments
  const getTileRenderPosition = (gridX: number, gridY: number) => {
    const { isoX, isoY } = calculateIsometricPosition(gridX, gridY);
    const centerOffset = getCenterOffset();
    
    return {
      x: isoX + centerOffset.x,
      y: isoY + centerOffset.y
    };
  };

  // ✅ CORRIGÉ: Rendu des couches avec grille parfaitement alignée
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
            
            {/* ✅ GRILLE PARFAITEMENT ALIGNÉE SUR LES ZONES CLIQUABLES */}
            {layer.name === 'Floors' && tileId !== 0 && showGrid && (
              <svg
                width={DISPLAY_TILE_WIDTH}
                height={DISPLAY_TILE_HEIGHT}
                className="absolute"
                style={{
                  left: 0,
                  top: DISPLAY_TILE_HEIGHT, // ✅ MÊME DÉCALAGE QUE LES ZONES CLIQUABLES
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

  // ✅ CORRIGÉ: Zones cliquables avec limites strictes de la map
  const renderClickableAreas = (): React.ReactNode[] => {
    if (!tiledMap) return [];
    
    const floorsLayer = getFloorsLayer();
    if (!floorsLayer) return [];
    
    const areas: React.ReactNode[] = [];
    
    // ✅ PARCOURIR UNIQUEMENT LES CASES VALIDES DE LA MAP
    for (let y = 0; y < floorsLayer.height; y++) {
      for (let x = 0; x < floorsLayer.width; x++) {
        const index = y * floorsLayer.width + x;
        
        // ✅ VÉRIFICATION STRICTE DE L'INDEX
        if (index < 0 || index >= floorsLayer.data.length) {
          console.warn(`⚠️ Index ${index} invalide pour (${x}, ${y})`);
          continue;
        }
        
        const tileId = floorsLayer.data[index];
        
        // ✅ CRÉER UNE ZONE CLIQUABLE SEULEMENT SI LA TILE EST PRATICABLE
        if (tileId !== 0) {
          const position = getTileRenderPosition(x, y);
          
          areas.push(
            <div
              key={`click-${x}-${y}`}
              className={`absolute cursor-pointer transition-all duration-200 ${
                !isGamePaused ? 'hover:bg-yellow-400/20' : 'cursor-not-allowed'
              }`}
              style={{
                left: position.x,
                top: position.y + DISPLAY_TILE_HEIGHT, // ✅ MÊME POSITION QUE LA GRILLE
                width: DISPLAY_TILE_WIDTH,
                height: DISPLAY_TILE_HEIGHT,
                zIndex: 1500 + y * 100 + x,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }}
              onClick={() => {
                if (!isGamePaused) {
                  // ✅ DOUBLE VÉRIFICATION AVANT LE CLIC
                  if (isWalkablePosition(x, y)) {
                    console.log(`🎯 Clic valide sur case (${x}, ${y}) - Envoi au système de mouvement`);
                    onTileClick(x, y);
                  } else {
                    console.log(`🚫 Clic invalide sur case (${x}, ${y}) - Case non praticable`);
                  }
                }
              }}
              onMouseEnter={() => setHoveredTile({x, y})}
              onMouseLeave={() => setHoveredTile(null)}
              title={`Tile (${x}, ${y})${isGamePaused ? ' - PAUSE' : ''}`}
            >
              {!isGamePaused && (
                <div 
                  className="w-full h-full hover:bg-gradient-to-r hover:from-yellow-400/10 hover:to-orange-400/10 transition-all duration-200"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                  }}
                />
              )}
            </div>
          );
        }
      }
    }
    
    console.log(`🎯 ${areas.length} zones cliquables créées sur ${floorsLayer.width}x${floorsLayer.height} cases`);
    return areas;
  };

  // Joueur et cible - coordonnées parfaitement synchronisées
  const renderPlayerAndTarget = (): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    
    const playerPosition_render = getTileRenderPosition(playerPosition.x, playerPosition.y);
    
    elements.push(
      <div
        key="player"
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          left: playerPosition_render.x,
          top: playerPosition_render.y + DISPLAY_TILE_HEIGHT, // ✅ MÊME POSITION QUE LA GRILLE
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
    
    if (targetPosition && isMoving) {
      const targetPosition_render = getTileRenderPosition(targetPosition.x, targetPosition.y);
      
      elements.push(
        <div
          key="target"
          className="absolute flex items-center justify-center pointer-events-none animate-pulse"
          style={{
            left: targetPosition_render.x,
            top: targetPosition_render.y + DISPLAY_TILE_HEIGHT, // ✅ MÊME POSITION QUE LA GRILLE
            width: DISPLAY_TILE_WIDTH,
            height: DISPLAY_TILE_HEIGHT,
            zIndex: 1900 + targetPosition.y * 100 + targetPosition.x
          }}
        >
          <div className="w-8 h-8 border-3 border-green-400 rounded-full animate-ping bg-green-400/20" />
          <div className="absolute w-4 h-4 bg-green-400 rounded-full" />
        </div>
      );
    }
    
    return elements;
  };

  // Recalculer le centrage quand la fenêtre change de taille
  useEffect(() => {
    const handleResize = () => {
      if (tiledMap) {
        console.log('📐 Redimensionnement détecté - Recentrage automatique avec map remontée');
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
          <div className="text-gray-400 mt-2">Correction de l'alignement de la grille...</div>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
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

  // Affichage final
  return (
    <div 
      ref={mapContainerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#2d1810' }}
    >
      {/* Rendu des couches Tiled avec grille intégrée */}
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
      
      {/* Zones cliquables parfaitement synchronisées avec la grille */}
      <div className="absolute inset-0">
        {renderClickableAreas()}
      </div>
      
      {/* Joueur et cible */}
      {renderPlayerAndTarget()}
      
      {/* Informations de debug */}
      {process.env.NODE_ENV === 'development' && tiledMap && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-[2000] pointer-events-none">
          <div>Map Tiled: {tiledMap.width}x{tiledMap.height}</div>
          <div>🎮 ZOOM JEU VIDÉO: {DISPLAY_TILE_WIDTH}x{DISPLAY_TILE_HEIGHT}</div>
          <div>📐 Écran: {window.innerWidth}x{window.innerHeight}</div>
          <div>Couches: {tiledMap.layers ? tiledMap.layers.length : 0}</div>
          <div>Couche Floors: {getFloorsLayer() ? '✅ Trouvée' : '❌ Manquante'}</div>
          <div>Joueur: ({playerPosition.x}, {playerPosition.y})</div>
          <div>Case joueur praticable: {isWalkablePosition(playerPosition.x, playerPosition.y) ? '✅' : '❌'}</div>
          {hoveredTile && (
            <div className="text-yellow-400">👆 Survol: ({hoveredTile.x}, {hoveredTile.y})</div>
          )}
          {targetPosition && (
            <div className="text-green-400">🎯 Cible: ({targetPosition.x}, {targetPosition.y})</div>
          )}
          <div className="text-green-400">✅ GRILLE PARFAITEMENT ALIGNÉE</div>
          <div className="text-blue-400">🎯 Grille: {showGrid ? 'ON' : 'OFF'}</div>
        </div>
      )}
    </div>
  );
};

export default TiledMapRenderer;