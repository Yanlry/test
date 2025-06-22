/**
 * FICHIER DES SORTS - sorts.ts
 * Contient tous les sorts du jeu (16 sorts pour 2 lignes de 8)
 * À placer dans le dossier : src/utils/sorts.ts
 */

// Interface pour définir la structure d'un sort
export interface Sort {
    id: number;
    name: string;
    icon: string;
    manaCost: number;
    cooldown: number;
    description?: string;
    type?: 'attaque' | 'defense' | 'support' | 'magie';
    niveau?: number;
  }
  
  // 🎯 LIGNE 1 - 8 premiers sorts (touches 1-8)
  export const LIGNE_1_SORTS: Sort[] = [
    {
      id: 1,
      name: 'Coup de Dague',
      icon: '🗡️',
      manaCost: 10,
      cooldown: 0,
      description: 'Attaque rapide au corps à corps',
      type: 'attaque',
      niveau: 1
    },
    {
      id: 2,
      name: 'Furtivité',
      icon: '👤',
      manaCost: 20,
      cooldown: 3,
      description: 'Devient invisible pendant 5 secondes',
      type: 'support',
      niveau: 2
    },
    {
      id: 3,
      name: 'Poison',
      icon: '☠️',
      manaCost: 15,
      cooldown: 1,
      description: 'Empoisonne la cible pendant 10 secondes',
      type: 'attaque',
      niveau: 3
    },
    {
      id: 4,
      name: 'Téléportation',
      icon: '✨',
      manaCost: 50,
      cooldown: 10,
      description: 'Se téléporte instantanément vers la cible',
      type: 'support',
      niveau: 5
    },
    {
      id: 5,
      name: 'Guérison',
      icon: '💚',
      manaCost: 25,
      cooldown: 2,
      description: 'Restaure des points de vie',
      type: 'support',
      niveau: 2
    },
    {
      id: 6,
      name: 'Bouclier',
      icon: '🛡️',
      manaCost: 30,
      cooldown: 5,
      description: 'Protège contre les attaques pendant 15 secondes',
      type: 'defense',
      niveau: 4
    },
    {
      id: 7,
      name: 'Fireball',
      icon: '🔥',
      manaCost: 35,
      cooldown: 3,
      description: 'Lance une boule de feu explosive',
      type: 'magie',
      niveau: 6
    },
    {
      id: 8,
      name: 'Gel',
      icon: '❄️',
      manaCost: 40,
      cooldown: 4,
      description: 'Gèle la cible pendant 8 secondes',
      type: 'magie',
      niveau: 7
    }
  ];
  
  // 🎯 LIGNE 2 - 8 sorts suivants (touches Shift+1-8)
  export const LIGNE_2_SORTS: Sort[] = [
    {
      id: 9,
      name: 'Éclair',
      icon: '⚡',
      manaCost: 30,
      cooldown: 2,
      description: 'Attaque électrique à distance',
      type: 'magie',
      niveau: 5
    },
    {
      id: 10,
      name: 'Invocation',
      icon: '👹',
      manaCost: 60,
      cooldown: 15,
      description: 'Invoque un familier pour 30 secondes',
      type: 'magie',
      niveau: 8
    },
    {
      id: 11,
      name: 'Bénédiction',
      icon: '✨',
      manaCost: 45,
      cooldown: 8,
      description: 'Augmente toutes les stats pendant 60 secondes',
      type: 'support',
      niveau: 6
    },
    {
      id: 12,
      name: 'Malédiction',
      icon: '💀',
      manaCost: 40,
      cooldown: 6,
      description: 'Réduit les stats de l\'ennemi pendant 45 secondes',
      type: 'attaque',
      niveau: 7
    },
    {
      id: 13,
      name: 'Métamorphose',
      icon: '🐺',
      manaCost: 55,
      cooldown: 20,
      description: 'Se transforme en loup pendant 45 secondes',
      type: 'support',
      niveau: 9
    },
    {
      id: 14,
      name: 'Résurrection',
      icon: '🔮',
      manaCost: 80,
      cooldown: 60,
      description: 'Ressuscite un allié tombé au combat',
      type: 'support',
      niveau: 10
    },
    {
      id: 15,
      name: 'Tempête',
      icon: '🌪️',
      manaCost: 70,
      cooldown: 25,
      description: 'Invoque une tempête dévastatrice dans une zone',
      type: 'magie',
      niveau: 12
    },
    {
      id: 16,
      name: 'Divination',
      icon: '🔍',
      manaCost: 35,
      cooldown: 5,
      description: 'Révèle les ennemis cachés et leurs faiblesses',
      type: 'support',
      niveau: 4
    }
  ];
  
  // 🎯 TOUS LES SORTS COMBINÉS (pour faciliter l'usage)
  export const TOUS_LES_SORTS: Sort[] = [
    ...LIGNE_1_SORTS,  // Sorts 1-8
    ...LIGNE_2_SORTS   // Sorts 9-16
  ];
  
  // 🎯 FONCTIONS UTILITAIRES
  // Fonction pour obtenir un sort par son ID
  export const obtenirSortParId = (id: number): Sort | undefined => {
    return TOUS_LES_SORTS.find(sort => sort.id === id);
  };
  
  // Fonction pour obtenir les sorts par type
  export const obtenirSortsParType = (type: Sort['type']): Sort[] => {
    return TOUS_LES_SORTS.filter(sort => sort.type === type);
  };
  
  // Fonction pour obtenir les sorts par niveau maximum
  export const obtenirSortsParNiveau = (niveauMax: number): Sort[] => {
    return TOUS_LES_SORTS.filter(sort => (sort.niveau || 1) <= niveauMax);
  };
  
  // 🎯 EXPORT PAR DÉFAUT
  export default TOUS_LES_SORTS;