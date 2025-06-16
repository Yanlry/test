import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Crown, Sword, Shield, Scroll, Volume2, VolumeX, Users, Castle, Swords, Zap, Target, Sparkles, Eye, Star } from 'lucide-react';

/**
 * Types pour l'authentification et les données utilisateur
 */
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

interface AuthInterfaceProps {
  activeTab: 'login' | 'register';
  loginData: LoginCredentials;
  registerData: RegisterData;
  onTabChange: (tab: 'login' | 'register') => void;
  onLoginDataChange: (data: LoginCredentials) => void;
  onRegisterDataChange: (data: RegisterData) => void;
  onLogin: () => Promise<AuthResult>;
  onRegister: () => Promise<AuthResult>;
}

/**
 * Interface pour les particules d'animation
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

/**
 * Interface pour les statistiques du royaume
 */
interface KingdomStats {
  onlineKnights: number;
  registeredWarriors: number;
  activeFortresses: number;
}

/**
 * Types pour les classes de personnages MMO
 */
type CharacterClass = 'knight' | 'archer' | 'mage';

interface ClassInfo {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  description: string;
}

/**
 * Composant de contrôle du volume avec thème sombre
 */
const VolumeToggle: React.FC<{ isVolumeOn: boolean; onToggle: () => void }> = React.memo(({ isVolumeOn, onToggle }) => (
  <button 
    onClick={onToggle}
    className={`p-3 rounded-full border-2 shadow-xl transition-all duration-300 hover:scale-110 ${
      isVolumeOn 
        ? 'bg-gray-900 hover:bg-gray-800 text-orange-400 border-orange-600 hover:shadow-orange-500/20' 
        : 'bg-red-900 hover:bg-red-800 text-red-400 border-red-600 hover:shadow-red-500/20'
    }`}
    title={isVolumeOn ? 'Couper le son' : 'Activer le son'}
  >
    {isVolumeOn ? (
      <Volume2 size={20} className="animate-pulse" />
    ) : (
      <VolumeX size={20} />
    )}
  </button>
));

/**
 * Composant de flamme animée avec effets MMO
 */
const AnimatedFlame: React.FC = React.memo(() => {
  const [flicker, setFlicker] = useState<number>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(Math.random() * 0.4 + 0.8);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div 
        className="w-4 h-8 bg-gradient-to-t from-red-700 via-orange-500 to-yellow-400 rounded-full transition-all duration-150 shadow-lg shadow-orange-500/50"
        style={{ transform: `scaleY(${flicker})` }}
      />
      <div 
        className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gradient-to-t from-orange-400 to-yellow-300 rounded-full"
        style={{ transform: `translateX(-50%) scaleY(${flicker * 1.3})` }}
      />
      <div className="absolute -inset-2 bg-orange-500/20 rounded-full blur-md animate-pulse" />
    </div>
  );
});

/**
 * Composant d'icône de classe de personnage
 */
const ClassIcon: React.FC<{ classType: CharacterClass; isActive?: boolean }> = React.memo(({ classType, isActive = false }) => {
  const classData: Record<CharacterClass, ClassInfo> = useMemo(() => ({
    knight: {
      name: 'Chevalier',
      icon: Shield,
      color: 'blue',
      description: 'Défenseur du royaume'
    },
    archer: {
      name: 'Archer',
      icon: Target,
      color: 'green',
      description: 'Maître de la précision'
    },
    mage: {
      name: 'Mage',
      icon: Sparkles,
      color: 'purple',
      description: 'Tisseur de magie'
    }
  }), []);

  const classInfo = classData[classType];
  const IconComponent = classInfo.icon;

  return (
    <div className={`
      relative group transition-all duration-300 cursor-pointer
      ${isActive ? 'scale-110' : 'hover:scale-105'}
    `}>
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center
        bg-gradient-to-br from-gray-800 to-gray-900
        border-2 transition-all duration-300
        ${isActive 
          ? `border-${classInfo.color}-400 shadow-lg shadow-${classInfo.color}-500/30` 
          : `border-gray-600 hover:border-${classInfo.color}-500`
        }
      `}>
        <IconComponent 
          size={24} 
          className={`
            transition-colors duration-300
            ${isActive 
              ? `text-${classInfo.color}-400` 
              : `text-gray-400 group-hover:text-${classInfo.color}-400`
            }
          `} 
        />
      </div>
      {isActive && (
        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent rounded-full animate-pulse" />
      )}
    </div>
  );
});

/**
 * Composant de statistiques du royaume avec thème MMO
 */
const KingdomStatsPanel: React.FC<{ stats: KingdomStats }> = React.memo(({ stats }) => (
  <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-xl shadow-2xl border border-gray-700 p-6 backdrop-blur-sm">
    <h3 className="text-center text-orange-400 font-bold mb-6 tracking-wider text-lg uppercase">
      État du Royaume
    </h3>
    <div className="space-y-4">
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center gap-3 hover:bg-gray-700/50 transition-colors">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
          <Users className="text-blue-200" size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">{stats.onlineKnights.toLocaleString()}</div>
          <div className="text-sm text-gray-400 font-medium">Héros en Ligne</div>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center gap-3 hover:bg-gray-700/50 transition-colors">
        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-lg">
          <Swords className="text-green-200" size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">{stats.registeredWarriors.toLocaleString()}</div>
          <div className="text-sm text-gray-400 font-medium">Aventuriers Inscrits</div>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center gap-3 hover:bg-gray-700/50 transition-colors">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg">
          <Castle className="text-purple-200" size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">{stats.activeFortresses}</div>
          <div className="text-sm text-gray-400 font-medium">Guildes Actives</div>
        </div>
      </div>
    </div>
  </div>
));

/**
 * Composant principal d'interface d'authentification MMO
 */
const AuthInterface: React.FC<AuthInterfaceProps> = ({
  activeTab,
  loginData,
  registerData,
  onTabChange,
  onLoginDataChange,
  onRegisterDataChange,
  onLogin,
  onRegister
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('knight');
  // État pour gérer le volume - activé par défaut
  const [isVolumeOn, setIsVolumeOn] = useState<boolean>(true);
  
  // Référence pour l'élément audio HTML5 - SOLUTION SIMPLE ET FIABLE
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Données statiques du royaume
  const kingdomStats: KingdomStats = useMemo(() => ({
    onlineKnights: 2547,
    registeredWarriors: 15234,
    activeFortresses: 28
  }), []);

  /**
   * Fonction pour initialiser l'audio - MAINTENANT AVEC TON FICHIER MP3
   */
  const initializeAudio = useCallback((): void => {
    try {
      // On crée un élément audio HTML5 simple et fiable
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/background.mp3'); // Ton fichier MP3
        audioRef.current.loop = true; // Musique en boucle
        audioRef.current.volume = 0.3; // Volume pas trop fort
        
        // Gestion des erreurs de chargement
        audioRef.current.addEventListener('error', (e) => {
          console.error('Erreur de chargement audio:', e);
        });
        
        audioRef.current.addEventListener('canplaythrough', () => {
          console.log('🎵 Audio prêt à être joué');
        });
      }
      
      // On joue la musique si le volume est activé
      if (isVolumeOn && audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.log('Auto-play bloqué par le navigateur:', error);
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation audio:', error);
    }
  }, [isVolumeOn]);

  /**
   * Fonction pour basculer le volume - MAINTENANT SIMPLE ET SANS ERREUR
   */
  const toggleVolume = useCallback((): void => {
    setIsVolumeOn(prev => {
      const newVolumeState = !prev;
      
      // Si l'audio n'est pas encore initialisé, on l'initialise
      if (!audioRef.current) {
        initializeAudio();
      }
      
      // Gestion du volume avec l'élément audio HTML5
      if (audioRef.current) {
        if (newVolumeState) {
          // Volume ON : on joue la musique
          audioRef.current.play().catch((error) => {
            console.log('Impossible de jouer la musique:', error);
          });
          console.log('🎵 Musique activée');
        } else {
          // Volume OFF : on pause la musique
          audioRef.current.pause();
          console.log('🔇 Musique coupée');
        }
      }
      
      return newVolumeState;
    });
  }, [initializeAudio]);

  /**
   * Gestionnaire pour démarrer l'audio au premier clic
   */
  const handleFirstClick = useCallback((): void => {
    // On initialise l'audio au premier clic pour contourner les restrictions navigateur
    if (!audioRef.current) {
      initializeAudio();
      // On supprime l'écouteur après le premier clic
      document.removeEventListener('click', handleFirstClick);
    }
  }, [initializeAudio]);

  /**
   * Effet pour configurer l'écouteur de première interaction
   */
  useEffect(() => {
    // On ajoute un écouteur pour le premier clic
    document.addEventListener('click', handleFirstClick);

    // Nettoyage quand le composant se démonte - SANS ERREUR
    return () => {
      document.removeEventListener('click', handleFirstClick);
      
      // On nettoie l'audio proprement
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // On vide la source
        audioRef.current = null;
      }
    };
  }, [handleFirstClick]);

  /**
   * Gestion de la soumission du formulaire de connexion
   */
  const handleLoginSubmit = useCallback(async (): Promise<void> => {
    try {
      const result = await onLogin();
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  }, [onLogin]);

  /**
   * Gestion de la soumission du formulaire d'inscription
   */
  const handleRegisterSubmit = useCallback(async (): Promise<void> => {
    try {
      const result = await onRegister();
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    }
  }, [onRegister]);

  /**
   * Génération des particules d'animation
   */
  const generateParticles = useCallback((): void => {
    const newParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    generateParticles();
  }, [generateParticles]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Arrière-plan MMO sombre avec dégradés complexes */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(30, 41, 59, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(55, 48, 163, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(139, 69, 19, 0.5) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #374151 50%, #1f2937 75%, #111827 100%)
          `
        }}
      />
      
      {/* Overlay de texture */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, rgba(31, 41, 55, 0.2) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(31, 41, 55, 0.2) 25%, transparent 25%)
          `,
          backgroundSize: '400px 400px, 300px 300px, 60px 60px, 60px 60px'
        }}
      />

      {/* Particules magiques flottantes */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}

      {/* Étoiles scintillantes */}
      {Array.from({ length: 8 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className="absolute text-yellow-400 opacity-60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}

      {/* Bouton volume - MAINTENANT AVEC TON FICHIER MP3 SANS ERREUR */}
      <div className="absolute top-6 left-6 z-50">
        <VolumeToggle isVolumeOn={isVolumeOn} onToggle={toggleVolume} />
      </div>

      {/* Torches magiques avec effets améliorés */}
      <div className="absolute top-12 left-1/6 hidden lg:block">
        <div className="flex flex-col items-center">
          <AnimatedFlame />
          <div className="w-3 h-16 bg-gradient-to-b from-amber-800 via-amber-900 to-gray-800 rounded-sm mt-1 shadow-lg" />
          <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border border-gray-600" />
        </div>
      </div>

      <div className="absolute top-12 right-1/6 hidden lg:block">
        <div className="flex flex-col items-center">
          <AnimatedFlame />
          <div className="w-3 h-16 bg-gradient-to-b from-amber-800 via-amber-900 to-gray-800 rounded-sm mt-1 shadow-lg" />
          <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border border-gray-600" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            
            {/* Section gauche - Statistiques du royaume */}
            <div className="xl:order-1 order-2">
              <KingdomStatsPanel stats={kingdomStats} />
            </div>

            {/* Section centrale - Formulaire principal */}
            <div className="xl:order-2 order-1">
              <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl shadow-2xl border border-gray-700 max-w-lg mx-auto backdrop-blur-sm">
                
                {/* Coins décoratifs avec effet lumineux */}
                <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-orange-500 rounded-tl-lg shadow-lg shadow-orange-500/20" />
                <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-orange-500 rounded-tr-lg shadow-lg shadow-orange-500/20" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-orange-500 rounded-bl-lg shadow-lg shadow-orange-500/20" />
                <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-orange-500 rounded-bl-lg shadow-lg shadow-orange-500/20" />

                <div className="p-8">
                  {/* En-tête MMO */}
                  <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-xl border-4 border-gray-700">
                        <Crown className="text-gray-900" size={36} />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-600/20 rounded-full blur-lg animate-pulse" />
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 mb-2 tracking-wide" style={{ fontFamily: 'serif' }}>
                      Nexus Éternel
                    </h1>
                    <p className="text-gray-400 italic text-lg">Votre légende commence ici...</p>
                    
                    {/* Sélecteur de classe */}
                    <div className="flex justify-center gap-4 mt-6">
                      {(['knight', 'archer', 'mage'] as CharacterClass[]).map((classType) => (
                        <div
                          key={classType}
                          onClick={() => setSelectedClass(classType)}
                        >
                          <ClassIcon classType={classType} isActive={selectedClass === classType} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Onglets avec style MMO */}
                  <div className="flex mb-8 rounded-lg overflow-hidden border-2 border-gray-600 shadow-inner bg-gray-800">
                    <button
                      onClick={() => onTabChange('login')}
                      className={`flex-1 py-4 px-4 text-center transition-all duration-300 font-semibold text-sm ${
                        activeTab === 'login' 
                          ? 'bg-gradient-to-b from-orange-600 to-orange-700 text-orange-100 shadow-lg shadow-orange-500/20' 
                          : 'bg-gradient-to-b from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700'
                      }`}
                    >
                      <Shield className="inline mr-2" size={16} />
                      Entrer au Nexus
                    </button>
                    <div className="w-px bg-gray-600" />
                    <button
                      onClick={() => onTabChange('register')}
                      className={`flex-1 py-4 px-4 text-center transition-all duration-300 font-semibold text-sm ${
                        activeTab === 'register' 
                          ? 'bg-gradient-to-b from-orange-600 to-orange-700 text-orange-100 shadow-lg shadow-orange-500/20' 
                          : 'bg-gradient-to-b from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700'
                      }`}
                    >
                      <Scroll className="inline mr-2" size={16} />
                      Créer un Héros
                    </button>
                  </div>

                  {/* Formulaire de connexion */}
                  {activeTab === 'login' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-orange-400 text-sm font-bold mb-2">
                          Nom du Héros
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={loginData.username}
                            onChange={(e) => onLoginDataChange({...loginData, username: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-medium placeholder-gray-500"
                            placeholder="Votre nom de légende..."
                            onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Sword className="text-orange-500" size={18} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-orange-400 text-sm font-bold mb-2">
                          Code Secret
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={loginData.password}
                            onChange={(e) => onLoginDataChange({...loginData, password: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-medium placeholder-gray-500"
                            placeholder="Votre mot de passe secret..."
                            onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Eye className="text-orange-500" size={18} />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleLoginSubmit}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-700 hover:via-orange-600 hover:to-orange-700 transition-all duration-300 font-bold shadow-xl border-2 border-orange-500 transform hover:scale-105 hover:shadow-orange-500/30"
                      >
                        <Crown className="inline mr-2" size={18} />
                        Entrer dans le Nexus
                      </button>
                      
                      <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-sm font-medium">
                          🎮 Mode Démo : utilisez <span className="text-orange-400 font-bold">demo/demo</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Formulaire d'inscription */}
                  {activeTab === 'register' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-orange-400 text-sm font-bold mb-2">
                            Nom du Héros
                          </label>
                          <input
                            type="text"
                            value={registerData.username}
                            onChange={(e) => onRegisterDataChange({...registerData, username: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-medium placeholder-gray-500"
                            placeholder="Nom de légende..."
                          />
                        </div>
                        <div>
                          <label className="block text-orange-400 text-sm font-bold mb-2">
                            Contact Mystique
                          </label>
                          <input
                            type="email"
                            value={registerData.email}
                            onChange={(e) => onRegisterDataChange({...registerData, email: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-medium placeholder-gray-500"
                            placeholder="Votre email..."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-orange-400 text-sm font-bold mb-2">
                            Code Secret
                          </label>
                          <input
                            type="password"
                            value={registerData.password}
                            onChange={(e) => onRegisterDataChange({...registerData, password: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-medium placeholder-gray-500"
                            placeholder="Mot de passe..."
                          />
                        </div>
                        <div>
                          <label className="block text-orange-400 text-sm font-bold mb-2">
                            Confirmation
                          </label>
                          <input
                            type="password"
                            value={registerData.confirmPassword}
                            onChange={(e) => onRegisterDataChange({...registerData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-medium placeholder-gray-500"
                            placeholder="Confirmer..."
                            onKeyDown={(e) => e.key === 'Enter' && handleRegisterSubmit()}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleRegisterSubmit}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 font-bold shadow-xl border-2 border-blue-500 transform hover:scale-105 hover:shadow-blue-500/30"
                      >
                        <Sparkles className="inline mr-2" size={18} />
                        Forger sa Destinée
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section droite - Guide des classes */}
            <div className="xl:order-3 order-3">
              <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-xl shadow-2xl border border-gray-700 p-6 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <h3 className="text-orange-400 font-bold text-lg tracking-wider uppercase">Classes Héroïques</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="text-blue-400" size={20} />
                      <span className="font-bold text-blue-400">Chevalier</span>
                    </div>
                    <p className="text-gray-400">Maître de la défense et protecteur des innocents. Résistance exceptionnelle.</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="text-green-400" size={20} />
                      <span className="font-bold text-green-400">Archer</span>
                    </div>
                    <p className="text-gray-400">Expert en combat à distance. Précision mortelle et agilité sans égale.</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="text-purple-400" size={20} />
                      <span className="font-bold text-purple-400">Mage</span>
                    </div>
                    <p className="text-gray-400">Tisseur de sorts anciens. Maîtrise des éléments et des arcanes mystiques.</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="text-yellow-400" size={20} />
                      <span className="font-bold text-yellow-400">Système</span>
                    </div>
                    <p className="text-gray-400">Progression hybride disponible. Débloquez de nouvelles capacités en explorant.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthInterface;