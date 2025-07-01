/**
 * PANNEAU CARTE - CARTE DU MONDE
 * ✅ Carte interactive complète
 * ✅ Points d'intérêt et téléportation
 * ✅ Système de marqueurs personnalisés
 * ✅ Zones découvertes et exploration
 */

import React, { useState } from 'react';
import { Character } from '../../types/game';
import { Position } from '../../types/game';
import { 
  X, 
  Map, 
  MapPin, 
  Star, 
  Compass, 
  Search, 
  Filter,
  Plus,
  Target,
  Home,
  Crown,
  Skull,
  Sword,
  Shield,
  Coins,
  Gift,
  Users,
  Flag,
  Eye,
  EyeOff,
  Layers,
  Maximize,
  Minimize,
  Navigation,
  Bookmark
} from 'lucide-react';

interface MapPanelProps {
  character: Character;
  playerPosition: Position;
  onClose?: () => void;
  onTeleport?: (position: Position) => void;
}

interface MapLocation {
  id: string;
  name: string;
  type: 'city' | 'dungeon' | 'boss' | 'resource' | 'player' | 'guild' | 'quest' | 'shop';
  position: Position;
  level?: number;
  description: string;
  isDiscovered: boolean;
  canTeleport: boolean;
  icon: string;
  color: string;
  isActive?: boolean;
}

interface MapMarker {
  id: string;
  name: string;
  position: Position;
  color: string;
  icon: string;
  note: string;
  createdBy: string;
  createdAt: Date;
}

const MapPanel: React.FC<MapPanelProps> = ({ 
  character, 
  playerPosition, 
  onClose, 
  onTeleport 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState({
    cities: true,
    dungeons: true,
    bosses: true,
    resources: true,
    players: true,
    markers: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'markers' | 'discovered'>('map');

  // Données de carte d'exemple
  const [locations] = useState<MapLocation[]>([
    {
      id: 'spawn',
      name: 'Ville de Départ',
      type: 'city',
      position: { x: 10, y: 10 },
      description: 'La ville principale où commencent tous les aventuriers',
      isDiscovered: true,
      canTeleport: true,
      icon: '🏘️',
      color: '#4CAF50'
    },
    {
      id: 'forest-temple',
      name: 'Temple de la Forêt',
      type: 'dungeon',
      position: { x: 25, y: 15 },
      level: 10,
      description: 'Un ancien temple envahi par la végétation',
      isDiscovered: true,
      canTeleport: true,
      icon: '🏛️',
      color: '#8BC34A'
    },
    {
      id: 'dragon-lair',
      name: 'Antre du Dragon',
      type: 'boss',
      position: { x: 45, y: 30 },
      level: 50,
      description: 'Le repaire du redoutable Dragon Ancien',
      isDiscovered: false,
      canTeleport: false,
      icon: '🐲',
      color: '#F44336'
    },
    {
      id: 'magic-city',
      name: 'Cité Magique',
      type: 'city',
      position: { x: 35, y: 20 },
      description: 'Une ville flottante gouvernée par les mages',
      isDiscovered: true,
      canTeleport: true,
      icon: '🌟',
      color: '#9C27B0'
    },
    {
      id: 'iron-mines',
      name: 'Mines de Fer',
      type: 'resource',
      position: { x: 20, y: 35 },
      description: 'Riches gisements de minerais précieux',
      isDiscovered: true,
      canTeleport: false,
      icon: '⛏️',
      color: '#795548'
    },
    {
      id: 'pirates-bay',
      name: 'Baie des Pirates',
      type: 'city',
      position: { x: 5, y: 40 },
      description: 'Port marchand contrôlé par les pirates',
      isDiscovered: true,
      canTeleport: true,
      icon: '🏴‍☠️',
      color: '#607D8B'
    },
    {
      id: 'shadow-dungeon',
      name: 'Donjon des Ombres',
      type: 'dungeon',
      position: { x: 40, y: 45 },
      level: 35,
      description: 'Un labyrinthe sombre peuplé de créatures d\'ombre',
      isDiscovered: true,
      canTeleport: true,
      icon: '🌑',
      color: '#424242'
    }
  ]);

  const [customMarkers] = useState<MapMarker[]>([
    {
      id: '1',
      name: 'Boss Rare',
      position: { x: 30, y: 25 },
      color: '#FF5722',
      icon: '💀',
      note: 'Boss rare qui spawn toutes les 2h',
      createdBy: 'Vous',
      createdAt: new Date('2024-05-20')
    },
    {
      id: '2',
      name: 'Coffre Caché',
      position: { x: 15, y: 30 },
      color: '#FFC107',
      icon: '📦',
      note: 'Coffre au trésor trouvé derrière la cascade',
      createdBy: 'Ami1',
      createdAt: new Date('2024-05-18')
    }
  ]);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    showLayers[`${location.type}s` as keyof typeof showLayers] !== false &&
    location.isDiscovered
  );

  const selectedLocationData = selectedLocation ? 
    locations.find(l => l.id === selectedLocation) : null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'city': return Home;
      case 'dungeon': return Shield;
      case 'boss': return Skull;
      case 'resource': return Coins;
      case 'guild': return Crown;
      default: return MapPin;
    }
  };

  const handleTeleport = (position: Position) => {
    if (onTeleport) {
      onTeleport(position);
      console.log(`🚀 Téléportation vers (${position.x}, ${position.y})`);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      
      {/* HEADER */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/30">
              <Map size={24} className="text-teal-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Carte du Monde</h1>
              <p className="text-gray-400">Explorez et naviguez dans le monde</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600/20 text-teal-400 px-4 py-2 rounded-xl border border-teal-600/40 font-bold">
              {locations.filter(l => l.isDiscovered).length}/{locations.length} découvertes
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 hover:bg-gray-700 rounded-xl transition-colors text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500"
              title={isFullscreen ? 'Réduire' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-700 rounded-xl transition-colors text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {[
              { id: 'map', name: 'Carte', icon: Map },
              { id: 'markers', name: 'Marqueurs', icon: Bookmark },
              { id: 'discovered', name: 'Découvertes', icon: Eye }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-teal-600/30 text-teal-300 border border-teal-500/50'
                      : 'bg-gray-700/30 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Contrôles de la carte */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher un lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none text-sm"
              />
            </div>
            
            <button 
              className="p-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-gray-600/50 hover:text-white transition-colors"
              title="Filtres"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="flex-1 overflow-y-auto">
        
        {/* ONGLET CARTE */}
        {activeTab === 'map' && (
          <div className="flex h-full">
            
            {/* CARTE PRINCIPALE */}
            <div className="flex-1 relative bg-gradient-to-br from-green-900/20 to-blue-900/20 border-r border-gray-700">
              
              {/* Position du joueur */}
              <div 
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10 transform -translate-x-2 -translate-y-2"
                style={{ 
                  left: `${(playerPosition.x / 50) * 100}%`, 
                  top: `${(playerPosition.y / 50) * 100}%` 
                }}
                title="Votre position"
              >
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
              </div>

              {/* Locations */}
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={`absolute w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg cursor-pointer transition-all hover:scale-125 transform -translate-x-3 -translate-y-3 z-20 ${
                    selectedLocation === location.id ? 'ring-4 ring-yellow-400 scale-150' : ''
                  }`}
                  style={{ 
                    left: `${(location.position.x / 50) * 100}%`, 
                    top: `${(location.position.y / 50) * 100}%`,
                    backgroundColor: location.color
                  }}
                  onClick={() => setSelectedLocation(location.id)}
                  title={location.name}
                >
                  <span className="text-white text-xs">{location.icon}</span>
                </div>
              ))}

              {/* Marqueurs personnalisés */}
              {showLayers.markers && customMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="absolute w-4 h-4 flex items-center justify-center rounded border border-white shadow cursor-pointer hover:scale-125 transition-all transform -translate-x-2 -translate-y-2 z-15"
                  style={{ 
                    left: `${(marker.position.x / 50) * 100}%`, 
                    top: `${(marker.position.y / 50) * 100}%`,
                    backgroundColor: marker.color
                  }}
                  title={`${marker.name} - ${marker.note}`}
                >
                  <span className="text-white text-xs">{marker.icon}</span>
                </div>
              ))}

              {/* Grille de coordonnées */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={`v-${i}`} className="absolute border-l border-gray-500" style={{ left: `${i * 10}%`, height: '100%' }} />
                ))}
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={`h-${i}`} className="absolute border-t border-gray-500" style={{ top: `${i * 10}%`, width: '100%' }} />
                ))}
              </div>
            </div>

            {/* PANNEAU LATÉRAL */}
            <div className="w-80 bg-gray-800/50 p-4 space-y-4">
              
              {/* Contrôles des calques */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3 flex items-center">
                  <Layers size={16} className="mr-2" />
                  Calques
                </h3>
                <div className="space-y-2">
                  {Object.entries(showLayers).map(([layer, visible]) => (
                    <label key={layer} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={(e) => setShowLayers(prev => ({ ...prev, [layer]: e.target.checked }))}
                        className="rounded border-gray-600 bg-gray-700 text-teal-600"
                      />
                      <span className="text-gray-300 text-sm capitalize">{layer}</span>
                      {visible ? <Eye size={14} className="text-teal-400" /> : <EyeOff size={14} className="text-gray-500" />}
                    </label>
                  ))}
                </div>
              </div>

              {/* Informations du lieu sélectionné */}
              {selectedLocationData ? (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg flex items-center">
                        <span className="mr-2">{selectedLocationData.icon}</span>
                        {selectedLocationData.name}
                      </h3>
                      {selectedLocationData.level && (
                        <span className="text-orange-400 text-sm">Niveau recommandé: {selectedLocationData.level}</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded text-white bg-${selectedLocationData.type === 'city' ? 'green' : selectedLocationData.type === 'dungeon' ? 'blue' : 'red'}-600`}>
                      {selectedLocationData.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{selectedLocationData.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>Position: ({selectedLocationData.position.x}, {selectedLocationData.position.y})</span>
                  </div>

                  {selectedLocationData.canTeleport ? (
                    <button 
                      onClick={() => handleTeleport(selectedLocationData.position)}
                      className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Navigation size={16} />
                      <span>Se téléporter</span>
                    </button>
                  ) : (
                    <div className="w-full px-4 py-2 bg-gray-600 text-gray-400 rounded-lg text-center">
                      Téléportation indisponible
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <MapPin size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400">Cliquez sur un lieu pour voir les détails</p>
                </div>
              )}

              {/* Position actuelle */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2 flex items-center">
                  <Compass size={16} className="mr-2 text-blue-400" />
                  Position Actuelle
                </h3>
                <div className="text-gray-300 text-sm">
                  <p>Coordonnées: ({playerPosition.x}, {playerPosition.y})</p>
                  <p>Zone: Plaines Centrales</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET MARQUEURS */}
        {activeTab === 'markers' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-xl">Marqueurs Personnalisés</h3>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
                <Plus size={16} />
                <span>Ajouter un marqueur</span>
              </button>
            </div>

            {customMarkers.map((marker) => (
              <div key={marker.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-white"
                      style={{ backgroundColor: marker.color }}
                    >
                      {marker.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{marker.name}</h4>
                      <p className="text-gray-300 text-sm">{marker.note}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>Position: ({marker.position.x}, {marker.position.y})</span>
                        <span>Par: {marker.createdBy}</span>
                        <span>{marker.createdAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors">
                      <Navigation size={14} />
                    </button>
                    <button className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET DÉCOUVERTES */}
        {activeTab === 'discovered' && (
          <div className="p-6 space-y-4">
            <h3 className="text-white font-bold text-xl">Lieux Découverts</h3>
            
            <div className="grid gap-4">
              {locations.filter(l => l.isDiscovered).map((location) => {
                const TypeIcon = getTypeIcon(location.type);
                return (
                  <div key={location.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white border"
                          style={{ backgroundColor: location.color }}
                        >
                          {location.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-bold flex items-center space-x-2">
                            <span>{location.name}</span>
                            {location.level && (
                              <span className="text-orange-400 text-sm">Niv. {location.level}</span>
                            )}
                          </h4>
                          <p className="text-gray-400 text-sm">{location.description}</p>
                          <span className="text-xs text-gray-500">({location.position.x}, {location.position.y})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TypeIcon size={16} className="text-gray-400" />
                        {location.canTeleport && (
                          <button 
                            onClick={() => handleTeleport(location.position)}
                            className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors text-sm"
                          >
                            Aller
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPanel;