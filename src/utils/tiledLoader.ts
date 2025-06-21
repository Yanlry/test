/**
 * CHARGEUR DE DONNÉES TILED - VERSION CORRIGÉE
 * Charge et parse les fichiers .tmj et .tsx de Tiled depuis le dossier public
 */

import { TiledMap, ParsedTileset } from '../types/tiled';

/**
 * Charge une map Tiled depuis un fichier .tmj
 * @param mapPath Chemin vers le fichier .tmj (depuis public/)
 * @returns Promise avec les données de la map
 */
export const loadTiledMap = async (mapPath: string): Promise<TiledMap> => {
  try {
    const response = await fetch(mapPath);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de la map: ${response.status}`);
    }
    const mapData: TiledMap = await response.json();
    console.log('✅ Map Tiled chargée:', mapData);
    return mapData;
  } catch (error) {
    console.error('❌ Erreur lors du chargement de la map Tiled:', error);
    throw error;
  }
};

/**
 * Parse un fichier .tsx (tileset XML) et retourne les données
 * @param tilesetPath Chemin vers le fichier .tsx (depuis public/)
 * @returns Promise avec le tileset parsé
 */
export const loadTileset = async (tilesetPath: string): Promise<ParsedTileset> => {
  try {
    const response = await fetch(tilesetPath);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement du tileset: ${response.status}`);
    }
    const xmlText = await response.text();
    
    // Parse le XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Extraire les données du tileset
    const tilesetElement = xmlDoc.querySelector('tileset');
    if (!tilesetElement) {
      throw new Error('Format de tileset invalide');
    }
    
    const name = tilesetElement.getAttribute('name') || 'Unknown';
    const tilewidth = parseInt(tilesetElement.getAttribute('tilewidth') || '0');
    const tileheight = parseInt(tilesetElement.getAttribute('tileheight') || '0');
    
    // Extraire les tiles
    const tiles = Array.from(xmlDoc.querySelectorAll('tile')).map(tileElement => {
      const id = parseInt(tileElement.getAttribute('id') || '0');
      const imageElement = tileElement.querySelector('image');
      const image = imageElement?.getAttribute('source') || '';
      const imagewidth = parseInt(imageElement?.getAttribute('width') || '0');
      const imageheight = parseInt(imageElement?.getAttribute('height') || '0');
      
      return {
        id,
        image,
        imagewidth,
        imageheight
      };
    });
    
    const tileset: ParsedTileset = {
      name,
      tilewidth,
      tileheight,
      tiles
    };
    
    console.log(`✅ Tileset ${name} chargé:`, tileset);
    return tileset;
  } catch (error) {
    console.error('❌ Erreur lors du chargement du tileset:', error);
    throw error;
  }
};

/**
 * Convertit les coordonnées de grille en position isométrique à l'écran
 * @param gridX Position X dans la grille
 * @param gridY Position Y dans la grille
 * @param tileWidth Largeur d'une tile
 * @param tileHeight Hauteur d'une tile
 * @returns Position en pixels à l'écran
 */
export const gridToIsometric = (
  gridX: number, 
  gridY: number, 
  tileWidth: number, 
  tileHeight: number
) => {
  const isoX = (gridX - gridY) * (tileWidth / 2);
  const isoY = (gridX + gridY) * (tileHeight / 2);
  return { x: isoX, y: isoY };
};

/**
 * Convertit les coordonnées d'écran en position de grille
 * @param screenX Position X à l'écran
 * @param screenY Position Y à l'écran
 * @param tileWidth Largeur d'une tile
 * @param tileHeight Hauteur d'une tile
 * @returns Position dans la grille
 */
export const isometricToGrid = (
  screenX: number, 
  screenY: number, 
  tileWidth: number, 
  tileHeight: number
) => {
  const gridX = Math.floor((screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2);
  const gridY = Math.floor((screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2);
  return { x: gridX, y: gridY };
};