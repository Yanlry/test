/**
 * APPLICATION PRINCIPALE - INTERFACE CLEAN ET MODULAIRE
 * Point d'entrée principal de l'application MMORPG
 * 
 * Ce fichier gère uniquement :
 * - La logique des phases de l'application (login, creation, game)
 * - L'orchestration des composants principaux
 * - Le contexte musical global
 * 
 * Pour modifier :
 * - Les styles de connexion → components/auth/AuthInterface.tsx
 * - La création de personnage → components/character/CharacterCreator.tsx
 * - Le jeu principal → components/GameMap.tsx
 * - La logique métier → hooks/
 */

import React from 'react';
import './App.css';

// Composants principaux
import AuthInterface from './components/auth/AuthInterface';
import CharacterCreator from './components/character/CharacterCreator';
import GameMap from './components/game/GameMap';

// Hooks métier
import { useAuth } from './hooks/useAuth';
import { useCharacterCreation } from './hooks/useCharacterCreation';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';

// Contexte musical
import { MusicProvider } from './context/MusicContext';

/**
 * Composant App principal - Interface propre et organisée
 */
const App: React.FC = () => {
  // Hooks pour la gestion de l'état
  const auth = useAuth();
  const characterCreation = useCharacterCreation();
  
  // Hook pour la musique de fond
  useBackgroundMusic();

  // Gestion de la création de personnage réussie
  const handleCharacterCreated = () => {
    const result = characterCreation.handleCharacterCreation();
    if (result.success && result.character) {
      characterCreation.setCurrentCharacter(result.character);
      auth.startGame();
    }
    return result;
  };

  // Rendu conditionnel selon la phase de l'application
  switch (auth.gamePhase) {
    case 'login':
      return (
        <AuthInterface
          activeTab={auth.activeTab}
          loginData={auth.loginData}
          registerData={auth.registerData}
          onTabChange={auth.setActiveTab}
          onLoginDataChange={auth.setLoginData}
          onRegisterDataChange={auth.setRegisterData}
          onLogin={auth.handleLogin}
          onRegister={auth.handleRegister}
        />
      );

    case 'character-creation':
      if (!auth.currentUser) {
        auth.backToMenu();
        return null;
      }

      return (
        <CharacterCreator
          currentUser={auth.currentUser}
          characterName={characterCreation.characterName}
          selectedClass={characterCreation.selectedClass}
          selectedSpell={characterCreation.selectedSpell}
          characterAppearance={characterCreation.characterAppearance}
          onNameChange={characterCreation.setCharacterName}
          onClassSelect={characterCreation.handleClassSelection}
          onSpellSelect={characterCreation.handleSpellSelection}
          onAppearanceChange={characterCreation.updateAppearance}
          onCreateCharacter={handleCharacterCreated}
          onBackToLogin={auth.backToMenu}
          isCreationValid={characterCreation.isCreationValid}
        />
      );

    case 'game':
      if (!auth.currentUser || !characterCreation.currentCharacter) {
        auth.backToMenu();
        return null;
      }

      return (
        <GameMap 
          character={characterCreation.currentCharacter}
          onBackToMenu={auth.backToMenu}
        />
      );

    default:
      // Phase inconnue, retour au login
      auth.backToMenu();
      return null;
  }
};

/**
 * Composant App avec contexte musical
 * Entoure toute l'application avec le MusicProvider pour la gestion audio
 */
const AppWithMusic: React.FC = () => {
  return (
    <MusicProvider>
      <App />
    </MusicProvider>
  );
};

export default AppWithMusic; 