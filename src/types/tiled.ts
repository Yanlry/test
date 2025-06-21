/**
 * TYPES TYPESCRIPT POUR TILED
 * Définit la structure des données exportées par Tiled
 */

// Structure d'une couche (layer) dans Tiled
export interface TiledLayer {
    id: number;
    name: string;
    type: string;
    width: number;
    height: number;
    data: number[];  // IDs des tiles en format CSV
    opacity: number;
    visible: boolean;
    x: number;
    y: number;
  }
  
  // Structure d'un tileset dans Tiled
  export interface TiledTileset {
    firstgid: number;  // Premier ID global des tiles de ce tileset
    source: string;    // Chemin vers le fichier .tsx
  }
  
  // Structure principale d'une map Tiled (.tmj)
  export interface TiledMap {
    width: number;          // Largeur en tiles
    height: number;         // Hauteur en tiles
    tilewidth: number;      // Largeur d'une tile en pixels
    tileheight: number;     // Hauteur d'une tile en pixels
    orientation: string;    // "isometric"
    layers: TiledLayer[];   // Toutes les couches de la map
    tilesets: TiledTileset[]; // Tous les tilesets utilisés
    infinite: boolean;
    nextlayerid: number;
    nextobjectid: number;
    renderorder: string;
    version: string;
  }
  
  // Structure d'une tile individuelle dans un tileset
  export interface TilesetTile {
    id: number;
    image: string;    // Chemin vers l'image de la tile
    imagewidth: number;
    imageheight: number;
  }
  
  // Structure d'un tileset .tsx parsé
  export interface ParsedTileset {
    name: string;
    tilewidth: number;
    tileheight: number;
    tiles: TilesetTile[];
  }
  
  // Position isométrique calculée
  export interface IsometricPosition {
    x: number;
    y: number;
    z: number;  // Pour la profondeur
  }