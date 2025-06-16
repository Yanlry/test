/**
 * HOOK D'AUTHENTIFICATION
 * Pour modifier la logique de connexion et d'inscription, c'est ici
 */

import { useState, useCallback } from 'react';
import { User, LoginCredentials, RegisterData, GamePhase } from '../types/game';

export const useAuth = () => {
  // États pour l'authentification
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('login');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // États des formulaires
  const [loginData, setLoginData] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Fonction de connexion
  const handleLogin = useCallback(async () => {
    try {
      // Vérification des credentials (pour la demo)
      if (loginData.username === '1234' && loginData.password === '1234') {
        const mockUser: User = {
          id: '1',
          username: loginData.username,
          email: 'admin@royaume-eternel.com',
          level: 1,
          characterClass: 'Non défini'
        };
        
        setCurrentUser(mockUser);
        setGamePhase('character-creation');
        console.log('Connexion réussie:', mockUser);
        return { success: true, user: mockUser };
      } else {
        const error = 'Nom d\'utilisateur ou mot de passe incorrect. Utilisez 1234/1234';
        console.error(error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }, [loginData]);

  // Fonction d'inscription
  const handleRegister = useCallback(async () => {
    try {
      // Validation des mots de passe
      if (registerData.password !== registerData.confirmPassword) {
        const error = 'Les mots de passe ne correspondent pas';
        console.error(error);
        return { success: false, error };
      }
      
      // Validation email simple
      if (!registerData.email.includes('@')) {
        const error = 'Adresse email invalide';
        console.error(error);
        return { success: false, error };
      }
      
      // Validation nom d'utilisateur
      if (registerData.username.length < 3) {
        const error = 'Le nom d\'utilisateur doit faire au moins 3 caractères';
        console.error(error);
        return { success: false, error };
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: registerData.username,
        email: registerData.email,
        level: 1,
        characterClass: 'Non défini'
      };
      
      setCurrentUser(newUser);
      setGamePhase('character-creation');
      console.log('Inscription réussie:', newUser);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return { success: false, error: 'Erreur d\'inscription' };
    }
  }, [registerData]);

  // Fonction de déconnexion
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setGamePhase('login');
    setLoginData({ username: '', password: '' });
    setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
    setActiveTab('login');
    console.log('Déconnexion réussie');
  }, []);

  // Fonction pour passer à la phase de jeu
  const startGame = useCallback(() => {
    setGamePhase('game');
  }, []);

  // Fonction pour retourner au menu
  const backToMenu = useCallback(() => {
    setGamePhase('login');
  }, []);

  return {
    // États
    currentUser,
    gamePhase,
    activeTab,
    loginData,
    registerData,
    
    // Actions
    handleLogin,
    handleRegister,
    handleLogout,
    startGame,
    backToMenu,
    setActiveTab,
    setLoginData,
    setRegisterData,
    setGamePhase
  };
};