/**
 * DONNÉES DES HÉROS PERSONNALISÉS - SYSTÈME DE CONFRÉRIES
 * Fichier complet avec progression détaillée pour chaque héros
 * 9 héros uniques répartis en 3 confréries légendaires
 */

import { CharacterClassData } from '../types/game';

export const characterClasses: CharacterClassData[] = [
  
  // =====================================================
  // 🩸 CONFRÉRIE DU SANG ANCIEN
  // Maîtres du sacrifice, de la malédiction et des arcanes interdites
  // =====================================================
  
  {
    id: 'sombrelame',
    name: 'Sombrelame',
    description: 'Guerrier maudit maniant une lame imprégnée du Néant. Ses coups drainent la vie de ses ennemis tout en alimentant sa propre puissance sombre. Plus il combat, plus les ténèbres en lui grandissent.',
    icon: '⚔️',
    avatar: '🩸',
    color: '#8B0000',
    element: 'Ombre/Terre',
    brotherhood: '🩸 CONFRÉRIE DU SANG ANCIEN',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'sb1', name: 'Entaille Maudite', 
        description: '3PA – 1–2PO – 5% CC. Lancer/tour: 2, Par cible: 1', 
        icon: '🗡️', unlockedAt: 1, type: 'offensive', 
        damage: '20 dégâts Terre', effect: 'Pose Hémorragie (-2% PV/2 tours)', range: '1-2 cases' 
      },
      { 
        id: 'sb2', name: 'Frappe du Néant', 
        description: '4PA – 1–3PO. Relance: 2 tours', 
        icon: '🌑', unlockedAt: 3, type: 'offensive', 
        damage: '22 dégâts Ombre', effect: '50% chance retirer 1PA', range: '1-3 cases', cooldown: '2 tours' 
      },
      { 
        id: 'sb3', name: 'Lame de Sang', 
        description: '2PA – 0PO. Lancer/tour: 2, Par cible: 1', 
        icon: '🩸', unlockedAt: 5, type: 'utility', 
        effect: 'Sacrifie 5% PV → +2 PA (1 tour)', range: 'Soi-même' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'sb4', name: 'Drain Ténébreux', 
        description: '3PA – 2–4PO. Relance: 3 tours', 
        icon: '🌫️', unlockedAt: 7, type: 'offensive', 
        damage: '18 dégâts Ombre', effect: 'Soigne 30% dégâts infligés', range: '2-4 cases', cooldown: '3 tours' 
      },
      { 
        id: 'sb5', name: 'Aura de Corruption', 
        description: '4PA – 0PO. Relance: 4 tours', 
        icon: '☠️', unlockedAt: 9, type: 'utility', 
        effect: 'Zone 2x2: -15% résistance ennemis (3 tours)', range: 'Autour de soi', cooldown: '4 tours' 
      },
      { 
        id: 'sb6', name: 'Charge Sombre', 
        description: '5PA – 2–6PO. Relance: 3 tours', 
        icon: '💨', unlockedAt: 11, type: 'offensive', 
        damage: '35 dégâts Ombre', effect: 'Téléporte + traverse ennemis', range: '2-6 cases', cooldown: '3 tours' 
      },
      { 
        id: 'sb7', name: 'Pacte Sanglant', 
        description: '3PA – 0PO. Relance: 5 tours', 
        icon: '🩸', unlockedAt: 13, type: 'utility', 
        effect: 'Sacrifie 15% PV → +50% dégâts (2 tours)', range: 'Soi-même', cooldown: '5 tours' 
      },
      { 
        id: 'sb8', name: 'Lames Spectrales', 
        description: '6PA – 1–3PO. Relance: 4 tours', 
        icon: '👻', unlockedAt: 15, type: 'offensive', 
        damage: '25 dégâts Ombre x3', effect: 'Attaque 3 ennemis différents', range: '1-3 cases', cooldown: '4 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'sb9', name: 'Régénération Vampirique', 
        description: '4PA – 0PO. Relance: 6 tours', 
        icon: '🧛', unlockedAt: 17, type: 'defensive', 
        effect: 'Tous dégâts infligés soignent à 75% (3 tours)', range: 'Soi-même', cooldown: '6 tours' 
      },
      { 
        id: 'sb10', name: 'Faille Dimensionnelle', 
        description: '7PA – 3–5PO. Relance: 5 tours', 
        icon: '🌀', unlockedAt: 19, type: 'offensive', 
        damage: '45 dégâts Ombre', effect: 'Ignore armure + téléporte cible', range: '3-5 cases', cooldown: '5 tours' 
      },
      { 
        id: 'sb11', name: 'Armure du Néant', 
        description: '5PA – 0PO. Relance: 7 tours', 
        icon: '🛡️', unlockedAt: 21, type: 'defensive', 
        effect: 'Immunité physique + renvoie 50% dégâts (2 tours)', range: 'Soi-même', cooldown: '7 tours' 
      },
      { 
        id: 'sb12', name: 'Exécution Maudite', 
        description: '8PA – 1–2PO. Relance: 6 tours', 
        icon: '💀', unlockedAt: 23, type: 'offensive', 
        damage: '80 dégâts Ombre', effect: 'x3 dégâts si cible <25% PV', range: '1-2 cases', cooldown: '6 tours' 
      },
      { 
        id: 'sb13', name: 'Avatar des Ténèbres', 
        description: '10PA – 0PO. Relance: 10 tours', 
        icon: '👹', unlockedAt: 25, type: 'ultimate', 
        effect: 'Transformation: +100% stats, sorts illimités (3 tours)', range: 'Soi-même', cooldown: '10 tours' 
      }
    ]
  },

  {
    id: 'audauv',
    name: 'Audauv',
    description: 'Magicien du sang maîtrisant la douleur et la régénération. Il puise dans les forces vitales pour tisser ses sorts, transformant la souffrance en pouvoir mystique. Ses rituels sont aussi dangereux pour lui que pour ses ennemis.',
    icon: '🧛',
    avatar: '🩸',
    color: '#DC143C',
    element: 'Eau/Neutre',
    brotherhood: '🩸 CONFRÉRIE DU SANG ANCIEN',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'au1', name: 'Drain Vital', 
        description: '3PA – 2–4PO – 5% CC', 
        icon: '🩸', unlockedAt: 1, type: 'offensive', 
        damage: '15 dégâts Eau', effect: 'Soigne 50% dégâts infligés', range: '2-4 cases' 
      },
      { 
        id: 'au2', name: 'Rituel du Cœur', 
        description: '4PA – 1–3PO. Condition: cible <50% PV', 
        icon: '💀', unlockedAt: 3, type: 'offensive', 
        damage: '25 dégâts Neutre', effect: 'Échoue si cible >50% PV', range: '1-3 cases' 
      },
      { 
        id: 'au3', name: 'Saignement Contrôlé', 
        description: '2PA – 0PO. Relance: 3 tours', 
        icon: '🔴', unlockedAt: 5, type: 'utility', 
        effect: 'Perd 10 PV → +3 PM (2 tours)', range: 'Soi-même', cooldown: '3 tours' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'au4', name: 'Transfusion Mystique', 
        description: '4PA – 2–5PO. Relance: 4 tours', 
        icon: '💉', unlockedAt: 7, type: 'utility', 
        effect: 'Transfère 25% PV vers allié + donne 2PA', range: '2-5 cases', cooldown: '4 tours' 
      },
      { 
        id: 'au5', name: 'Hémorragie Massive', 
        description: '5PA – 2–4PO. Relance: 3 tours', 
        icon: '🩸', unlockedAt: 9, type: 'offensive', 
        damage: '12 dégâts Eau', effect: 'DoT: -8PV/tour (5 tours)', range: '2-4 cases', cooldown: '3 tours' 
      },
      { 
        id: 'au6', name: 'Pulsion Vitale', 
        description: '3PA – 0PO. Relance: 5 tours', 
        icon: '💓', unlockedAt: 11, type: 'defensive', 
        effect: 'Soigne 35% PV max + immunité DoT (2 tours)', range: 'Soi-même', cooldown: '5 tours' 
      },
      { 
        id: 'au7', name: 'Malédiction Sanguine', 
        description: '6PA – 3–5PO. Relance: 4 tours', 
        icon: '☠️', unlockedAt: 13, type: 'offensive', 
        damage: '20 dégâts Neutre', effect: 'Cible perd 2PA/tour (3 tours)', range: '3-5 cases', cooldown: '4 tours' 
      },
      { 
        id: 'au8', name: 'Régénération Vampirique', 
        description: '4PA – 1–6PO. Relance: 5 tours', 
        icon: '🧛', unlockedAt: 15, type: 'defensive', 
        effect: 'Zone 3x3: soigne alliés +15PV/tour (4 tours)', range: '1-6 cases', cooldown: '5 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'au9', name: 'Sacrifice Rituel', 
        description: '8PA – 1–2PO. Relance: 6 tours', 
        icon: '⚱️', unlockedAt: 17, type: 'offensive', 
        damage: '60 dégâts Neutre', effect: 'Sacrifie 25% PV pour doubler dégâts', range: '1-2 cases', cooldown: '6 tours' 
      },
      { 
        id: 'au10', name: 'Lien Sanguin', 
        description: '5PA – 2–8PO. Relance: 7 tours', 
        icon: '🔗', unlockedAt: 19, type: 'utility', 
        effect: 'Lie 2 cibles: dégâts partagés (3 tours)', range: '2-8 cases', cooldown: '7 tours' 
      },
      { 
        id: 'au11', name: 'Fontaine de Vie', 
        description: '7PA – 1–4PO. Relance: 8 tours', 
        icon: '⛲', unlockedAt: 21, type: 'defensive', 
        effect: 'Zone permanente: +20PV/tour pour alliés', range: '1-4 cases', cooldown: '8 tours' 
      },
      { 
        id: 'au12', name: 'Apocalypse Sanguine', 
        description: '9PA – 0PO. Relance: 9 tours', 
        icon: '🌊', unlockedAt: 23, type: 'ultimate', 
        damage: '40 dégâts Eau Zone', effect: 'Toute la carte: DoT + soigne lanceur', range: 'Toute la carte', cooldown: '9 tours' 
      },
      { 
        id: 'au13', name: 'Maître du Sang', 
        description: '12PA – 0PO. Relance: 12 tours', 
        icon: '👑', unlockedAt: 25, type: 'ultimate', 
        effect: 'Contrôle total sur PV alliés/ennemis (2 tours)', range: 'Toute la carte', cooldown: '12 tours' 
      }
    ]
  },

  {
    id: 'mairym',
    name: 'Maîrym',
    description: 'Maître des illusions et des peurs nocturnes. Il manipule la réalité et les esprits, créant des cauchemars vivants qui hantent ses ennemis. Ses illusions sont si parfaites qu\'elles deviennent réelles.',
    icon: '🌒',
    avatar: '👻',
    color: '#483D8B',
    element: 'Air/Neutre',
    brotherhood: '🩸 CONFRÉRIE DU SANG ANCIEN',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'ma1', name: 'Main Spectrale', 
        description: '3PA – 3–5PO. Ignore ligne de vue', 
        icon: '👻', unlockedAt: 1, type: 'offensive', 
        damage: '18 dégâts Air', effect: 'Ignore obstacles', range: '3-5 cases' 
      },
      { 
        id: 'ma2', name: 'Cauchemar', 
        description: '4PA – 1–2PO. Relance: 2 tours', 
        icon: '💭', unlockedAt: 3, type: 'offensive', 
        damage: '10 dégâts Neutre', effect: 'Retire 1PM (2 tours)', range: '1-2 cases', cooldown: '2 tours' 
      },
      { 
        id: 'ma3', name: 'Voile d\'Ombre', 
        description: '2PA – 0PO. Relance: 3 tours', 
        icon: '🌫️', unlockedAt: 5, type: 'utility', 
        effect: 'Invisible (1 tour)', range: 'Soi-même', cooldown: '3 tours' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'ma4', name: 'Terreur Nocturne', 
        description: '4PA – 2–4PO. Relance: 4 tours', 
        icon: '😱', unlockedAt: 7, type: 'offensive', 
        damage: '15 dégâts Neutre', effect: 'Fuite obligatoire (1 tour)', range: '2-4 cases', cooldown: '4 tours' 
      },
      { 
        id: 'ma5', name: 'Illusion Parfaite', 
        description: '5PA – 0PO. Relance: 5 tours', 
        icon: '🎭', unlockedAt: 9, type: 'utility', 
        effect: 'Crée double illusoire (3 tours)', range: 'Soi-même', cooldown: '5 tours' 
      },
      { 
        id: 'ma6', name: 'Manipulation Mentale', 
        description: '6PA – 1–3PO. Relance: 4 tours', 
        icon: '🧠', unlockedAt: 11, type: 'utility', 
        effect: 'Contrôle ennemi (1 tour)', range: '1-3 cases', cooldown: '4 tours' 
      },
      { 
        id: 'ma7', name: 'Labyrinthe Onirique', 
        description: '7PA – 2–6PO. Relance: 6 tours', 
        icon: '🌀', unlockedAt: 13, type: 'utility', 
        effect: 'Zone 3x3: confus + ralenti (2 tours)', range: '2-6 cases', cooldown: '6 tours' 
      },
      { 
        id: 'ma8', name: 'Drain Psychique', 
        description: '5PA – 2–5PO. Relance: 3 tours', 
        icon: '🧠', unlockedAt: 15, type: 'offensive', 
        damage: '25 dégâts Neutre', effect: 'Vole 2PA + 2PM', range: '2-5 cases', cooldown: '3 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'ma9', name: 'Réalité Altérée', 
        description: '8PA – 0PO. Relance: 7 tours', 
        icon: '🌟', unlockedAt: 17, type: 'utility', 
        effect: 'Change terrain en zone 4x4 (permanente)', range: 'Soi-même', cooldown: '7 tours' 
      },
      { 
        id: 'ma10', name: 'Armée d\'Illusions', 
        description: '9PA – 1–5PO. Relance: 8 tours', 
        icon: '👥', unlockedAt: 19, type: 'utility', 
        effect: 'Invoque 3 copies illusoires (4 tours)', range: '1-5 cases', cooldown: '8 tours' 
      },
      { 
        id: 'ma11', name: 'Prison Mentale', 
        description: '7PA – 1–4PO. Relance: 6 tours', 
        icon: '🔒', unlockedAt: 21, type: 'utility', 
        effect: 'Immobilise + silence total (2 tours)', range: '1-4 cases', cooldown: '6 tours' 
      },
      { 
        id: 'ma12', name: 'Cauchemar Éveillé', 
        description: '10PA – 2–6PO. Relance: 9 tours', 
        icon: '👹', unlockedAt: 23, type: 'ultimate', 
        damage: '70 dégâts Neutre', effect: 'DoT: -20PV/tour + peurs (5 tours)', range: '2-6 cases', cooldown: '9 tours' 
      },
      { 
        id: 'ma13', name: 'Seigneur des Illusions', 
        description: '15PA – 0PO. Relance: 12 tours', 
        icon: '🎯', unlockedAt: 25, type: 'ultimate', 
        effect: 'Contrôle réalité: sorts illimités (3 tours)', range: 'Toute la carte', cooldown: '12 tours' 
      }
    ]
  },

  // =====================================================
  // 🌿 CONFRÉRIE DU CYCLE ÉTERNEL
  // Protecteurs du vivant, enfants de la nature et des éléments
  // =====================================================

  {
    id: 'otevel',
    name: 'Ötevel',
    description: 'Druide bestial, ralentit ses ennemis et invoque des créatures. Gardien ancestral qui communique avec tous les êtres vivants, il peut invoquer les forces primales de la nature pour défendre l\'équilibre du monde.',
    icon: '🐾',
    avatar: '🌿',
    color: '#228B22',
    element: 'Terre/Nature',
    brotherhood: '🌿 CONFRÉRIE DU CYCLE ÉTERNEL',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'ot1', name: 'Griffes de Ronce', 
        description: '3PA – 1–2PO. Lancer/cible: 2', 
        icon: '🌿', unlockedAt: 1, type: 'offensive', 
        damage: '20 dégâts Terre', effect: 'Retire 1PM', range: '1-2 cases' 
      },
      { 
        id: 'ot2', name: 'Appel du Loup', 
        description: '4PA – 1–4PO. Relance: 3 tours', 
        icon: '🐺', unlockedAt: 3, type: 'utility', 
        effect: 'Invoque loup (50 PV, 10 dégâts, 4 PM)', range: '1-4 cases', cooldown: '3 tours' 
      },
      { 
        id: 'ot3', name: 'Croissance', 
        description: '2PA – 0PO. Relance: 2 tours', 
        icon: '🌱', unlockedAt: 5, type: 'defensive', 
        effect: 'Soigne 5% PV max', range: 'Soi-même', cooldown: '2 tours' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'ot4', name: 'Mur de Lianes', 
        description: '4PA – 2–5PO. Relance: 4 tours', 
        icon: '🌿', unlockedAt: 7, type: 'defensive', 
        effect: 'Barrière 3 cases: bloque + ralentit', range: '2-5 cases', cooldown: '4 tours' 
      },
      { 
        id: 'ot5', name: 'Communion Animale', 
        description: '3PA – 0PO. Relance: 5 tours', 
        icon: '🦅', unlockedAt: 9, type: 'utility', 
        effect: 'Vision de toute la carte (2 tours)', range: 'Soi-même', cooldown: '5 tours' 
      },
      { 
        id: 'ot6', name: 'Appel de l\'Ours', 
        description: '6PA – 1–3PO. Relance: 4 tours', 
        icon: '🐻', unlockedAt: 11, type: 'utility', 
        effect: 'Invoque ours (100 PV, 20 dégâts, 3 PM)', range: '1-3 cases', cooldown: '4 tours' 
      },
      { 
        id: 'ot7', name: 'Racines Entraveuses', 
        description: '5PA – 2–4PO. Relance: 3 tours', 
        icon: '🌳', unlockedAt: 13, type: 'utility', 
        effect: 'Zone 2x2: immobilise (2 tours)', range: '2-4 cases', cooldown: '3 tours' 
      },
      { 
        id: 'ot8', name: 'Forme Bestiale', 
        description: '4PA – 0PO. Relance: 6 tours', 
        icon: '🐺', unlockedAt: 15, type: 'utility', 
        effect: 'Transformation: +2PM, +30% dégâts (3 tours)', range: 'Soi-même', cooldown: '6 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'ot9', name: 'Essaim d\'Insectes', 
        description: '6PA – 2–6PO. Relance: 5 tours', 
        icon: '🐛', unlockedAt: 17, type: 'offensive', 
        damage: '15 dégâts x4', effect: 'Zone mobile qui suit ennemis', range: '2-6 cases', cooldown: '5 tours' 
      },
      { 
        id: 'ot10', name: 'Maître des Bêtes', 
        description: '8PA – 0PO. Relance: 7 tours', 
        icon: '👑', unlockedAt: 19, type: 'utility', 
        effect: 'Contrôle toutes créatures invoquées +50% (4 tours)', range: 'Toute la carte', cooldown: '7 tours' 
      },
      { 
        id: 'ot11', name: 'Esprit de la Forêt', 
        description: '7PA – 1–5PO. Relance: 8 tours', 
        icon: '🌲', unlockedAt: 21, type: 'utility', 
        effect: 'Invoque Esprit (150 PV, sorts de zone)', range: '1-5 cases', cooldown: '8 tours' 
      },
      { 
        id: 'ot12', name: 'Apocalypse Végétale', 
        description: '10PA – 0PO. Relance: 10 tours', 
        icon: '🌍', unlockedAt: 23, type: 'ultimate', 
        effect: 'Toute la carte devient forêt: régénération alliés', range: 'Toute la carte', cooldown: '10 tours' 
      },
      { 
        id: 'ot13', name: 'Avatar de Gaïa', 
        description: '12PA – 0PO. Relance: 15 tours', 
        icon: '🌎', unlockedAt: 25, type: 'ultimate', 
        effect: 'Fusion avec nature: contrôle élémentaire total', range: 'Soi-même', cooldown: '15 tours' 
      }
    ]
  },

  {
    id: 'nasel',
    name: 'Nasel',
    description: 'Golem de pierre, défenseur impassible du monde. Être élémentaire millénaire façonné dans la roche primordiale, il possède une résistance légendaire et peut manipuler la terre selon sa volonté.',
    icon: '🪨',
    avatar: '🗿',
    color: '#A0522D',
    element: 'Terre',
    brotherhood: '🌿 CONFRÉRIE DU CYCLE ÉTERNEL',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'na1', name: 'Marteau Rocailleux', 
        description: '4PA – 1PO. Repousse de 1 case', 
        icon: '🔨', unlockedAt: 1, type: 'offensive', 
        damage: '30 dégâts Terre', effect: 'Repousse 1 case', range: '1 case' 
      },
      { 
        id: 'na2', name: 'Armure de Pierre', 
        description: '3PA – 0PO. Relance: 2 tours', 
        icon: '🛡️', unlockedAt: 3, type: 'defensive', 
        effect: '+30% Résistance Terre (2 tours)', range: 'Soi-même', cooldown: '2 tours' 
      },
      { 
        id: 'na3', name: 'Saisie Tectonique', 
        description: '5PA – 2PO. Relance: 3 tours', 
        icon: '🌍', unlockedAt: 5, type: 'utility', 
        effect: 'Immobilise (-100% PM / 1 tour)', range: '2 cases', cooldown: '3 tours' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'na4', name: 'Poing de Granit', 
        description: '5PA – 1PO. Relance: 3 tours', 
        icon: '👊', unlockedAt: 7, type: 'offensive', 
        damage: '45 dégâts Terre', effect: 'Ignore 50% armure', range: '1 case', cooldown: '3 tours' 
      },
      { 
        id: 'na5', name: 'Mur de Roche', 
        description: '4PA – 2–4PO. Relance: 4 tours', 
        icon: '🧱', unlockedAt: 9, type: 'defensive', 
        effect: 'Barrière 3 cases (200 PV)', range: '2-4 cases', cooldown: '4 tours' 
      },
      { 
        id: 'na6', name: 'Tremblement', 
        description: '6PA – 0PO. Relance: 5 tours', 
        icon: '💥', unlockedAt: 11, type: 'offensive', 
        damage: '25 dégâts Terre Zone', effect: 'Cercle 3x3: étourdit', range: 'Autour de soi', cooldown: '5 tours' 
      },
      { 
        id: 'na7', name: 'Régénération Minérale', 
        description: '3PA – 0PO. Relance: 4 tours', 
        icon: '💎', unlockedAt: 13, type: 'defensive', 
        effect: 'Soigne 25% PV max + immunité (1 tour)', range: 'Soi-même', cooldown: '4 tours' 
      },
      { 
        id: 'na8', name: 'Colonne de Pierre', 
        description: '5PA – 3–6PO. Relance: 4 tours', 
        icon: '🏛️', unlockedAt: 15, type: 'offensive', 
        damage: '40 dégâts Terre', effect: 'Fait surgir colonne + élève', range: '3-6 cases', cooldown: '4 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'na9', name: 'Forme Titanesque', 
        description: '7PA – 0PO. Relance: 8 tours', 
        icon: '🗿', unlockedAt: 17, type: 'utility', 
        effect: 'Double taille: +100% PV, +50% dégâts (3 tours)', range: 'Soi-même', cooldown: '8 tours' 
      },
      { 
        id: 'na10', name: 'Avalanche', 
        description: '8PA – 2–8PO. Relance: 6 tours', 
        icon: '🏔️', unlockedAt: 19, type: 'offensive', 
        damage: '35 dégâts Terre Zone', effect: 'Ligne: pousse + enterre', range: '2-8 cases', cooldown: '6 tours' 
      },
      { 
        id: 'na11', name: 'Forteresse Vivante', 
        description: '9PA – 0PO. Relance: 10 tours', 
        icon: '🏰', unlockedAt: 21, type: 'defensive', 
        effect: 'Zone 4x4: murs + tourelles défensives', range: 'Autour de soi', cooldown: '10 tours' 
      },
      { 
        id: 'na12', name: 'Faille Tellurique', 
        description: '10PA – 1–10PO. Relance: 8 tours', 
        icon: '⚡', unlockedAt: 23, type: 'ultimate', 
        damage: '80 dégâts Terre', effect: 'Ligne droite: traverse tout', range: '1-10 cases', cooldown: '8 tours' 
      },
      { 
        id: 'na13', name: 'Titan de Terre', 
        description: '15PA – 0PO. Relance: 15 tours', 
        icon: '⛰️', unlockedAt: 25, type: 'ultimate', 
        effect: 'Invoque Titan colossal (500 PV, sorts dévastateurs)', range: 'Soi-même', cooldown: '15 tours' 
      }
    ]
  },

  {
    id: 'alleen',
    name: 'Alleen',
    description: 'Élémentaliste imprévisible aux attaques variées. Maîtresse des quatre éléments, elle peut invoquer feu, glace, foudre et vent dans des combinaisons dévastatrices. Son pouvoir grandit avec le chaos du combat.',
    icon: '🌩️',
    avatar: '⚡',
    color: '#FF6347',
    element: 'Feu/Eau/Air',
    brotherhood: '🌿 CONFRÉRIE DU CYCLE ÉTERNEL',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'al1', name: 'Flamme Vive', 
        description: '3PA – 2–5PO – 10% brûlure. Lancer/tour: 2', 
        icon: '🔥', unlockedAt: 1, type: 'offensive', 
        damage: '25 dégâts Feu', effect: 'Brûlure: -5PV/tour (4 tours)', range: '2-5 cases' 
      },
      { 
        id: 'al2', name: 'Onde de Givre', 
        description: '4PA – 1–3PO. Relance: 2 tours', 
        icon: '❄️', unlockedAt: 3, type: 'offensive', 
        damage: '18 dégâts Eau', effect: 'Retire 2PM (1 tour)', range: '1-3 cases', cooldown: '2 tours' 
      },
      { 
        id: 'al3', name: 'Fulgurance', 
        description: '2PA – 1–2PO. Relance: 3 tours', 
        icon: '⚡', unlockedAt: 5, type: 'utility', 
        effect: 'Téléporte sur case ciblée', range: '1-2 cases', cooldown: '3 tours' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'al4', name: 'Bourrasque', 
        description: '4PA – 2–6PO. Relance: 3 tours', 
        icon: '💨', unlockedAt: 7, type: 'offensive', 
        damage: '20 dégâts Air', effect: 'Pousse 2 cases + retire 1PA', range: '2-6 cases', cooldown: '3 tours' 
      },
      { 
        id: 'al5', name: 'Mur Élémentaire', 
        description: '5PA – 2–4PO. Relance: 4 tours', 
        icon: '🌈', unlockedAt: 9, type: 'defensive', 
        effect: 'Barrière: Feu/Glace/Foudre aléatoire', range: '2-4 cases', cooldown: '4 tours' 
      },
      { 
        id: 'al6', name: 'Combo Élémentaire', 
        description: '6PA – 1–4PO. Relance: 4 tours', 
        icon: '🎆', unlockedAt: 11, type: 'offensive', 
        damage: '30 dégâts mixtes', effect: 'Feu→Glace→Foudre en chaîne', range: '1-4 cases', cooldown: '4 tours' 
      },
      { 
        id: 'al7', name: 'Tornade de Feu', 
        description: '7PA – 2–5PO. Relance: 5 tours', 
        icon: '🌪️', unlockedAt: 13, type: 'offensive', 
        damage: '22 dégâts Feu/Air', effect: 'Zone mobile: suit ennemis (3 tours)', range: '2-5 cases', cooldown: '5 tours' 
      },
      { 
        id: 'al8', name: 'Maîtrise Élémentaire', 
        description: '4PA – 0PO. Relance: 6 tours', 
        icon: '🔮', unlockedAt: 15, type: 'utility', 
        effect: 'Sorts coûtent -2PA, +50% dégâts (3 tours)', range: 'Soi-même', cooldown: '6 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'al9', name: 'Tempête de Glace', 
        description: '8PA – 2–6PO. Relance: 6 tours', 
        icon: '🌨️', unlockedAt: 17, type: 'offensive', 
        damage: '35 dégâts Eau Zone', effect: 'Zone 4x4: ralentit + gèle', range: '2-6 cases', cooldown: '6 tours' 
      },
      { 
        id: 'al10', name: 'Élémentaire Primaire', 
        description: '9PA – 1–5PO. Relance: 8 tours', 
        icon: '👤', unlockedAt: 19, type: 'utility', 
        effect: 'Invoque Élémentaire (100 PV, sort aléatoire)', range: '1-5 cases', cooldown: '8 tours' 
      },
      { 
        id: 'al11', name: 'Fusion Élémentaire', 
        description: '7PA – 0PO. Relance: 7 tours', 
        icon: '⚗️', unlockedAt: 21, type: 'utility', 
        effect: 'Tous sorts fusionnent: effets combinés (2 tours)', range: 'Soi-même', cooldown: '7 tours' 
      },
      { 
        id: 'al12', name: 'Apocalypse Élémentaire', 
        description: '12PA – 0PO. Relance: 10 tours', 
        icon: '🌍', unlockedAt: 23, type: 'ultimate', 
        damage: '50 dégâts x4 éléments', effect: 'Toute la carte: chaos élémentaire', range: 'Toute la carte', cooldown: '10 tours' 
      },
      { 
        id: 'al13', name: 'Avatar Élémentaire', 
        description: '15PA – 0PO. Relance: 15 tours', 
        icon: '🌟', unlockedAt: 25, type: 'ultimate', 
        effect: 'Transformation: contrôle 4 éléments simultanément', range: 'Soi-même', cooldown: '15 tours' 
      }
    ]
  },

  // =====================================================
  // ⚔️ CONFRÉRIE DU SERMENT BRISÉ
  // Guerriers rejetés par leur passé, condamnés à la guerre éternelle
  // =====================================================

  {
    id: 'falkrem',
    name: 'Falkrem',
    description: 'Héros oublié au style brutal et frontal. Ancien champion déchu qui a tout perdu, il combat avec une rage froide et une détermination sans faille. Ses techniques sont sans honneur mais terriblement efficaces.',
    icon: '🛡️',
    avatar: '⚔️',
    color: '#2F4F4F',
    element: 'Neutre',
    brotherhood: '⚔️ CONFRÉRIE DU SERMENT BRISÉ',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'fa1', name: 'Coup Implacable', 
        description: '4PA – 1PO', 
        icon: '⚔️', unlockedAt: 1, type: 'offensive', 
        damage: '30 dégâts Neutre', effect: '+10 si cible <50% PV', range: '1 case' 
      },
      { 
        id: 'fa2', name: 'Charge Brutale', 
        description: '3PA – 1–3PO. Relance: 2 tours', 
        icon: '💨', unlockedAt: 3, type: 'offensive', 
        damage: '20 dégâts', effect: 'Déplace 4 cases + pousse 4 cases', range: '1-3 cases', cooldown: '2 tours' 
      },
      { 
        id: 'fa3', name: 'Provocation', 
        description: '2PA – 1PO. Relance: 3 tours', 
        icon: '😤', unlockedAt: 5, type: 'utility', 
        effect: 'Cible attaque uniquement toi (1 tour)', range: '1 case', cooldown: '3 tours' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'fa4', name: 'Rage Aveugle', 
        description: '3PA – 0PO. Relance: 4 tours', 
        icon: '😡', unlockedAt: 7, type: 'utility', 
        effect: '+100% dégâts, -50% précision (3 tours)', range: 'Soi-même', cooldown: '4 tours' 
      },
      { 
        id: 'fa5', name: 'Frappe Dévastatrice', 
        description: '6PA – 1PO. Relance: 3 tours', 
        icon: '💥', unlockedAt: 9, type: 'offensive', 
        damage: '55 dégâts Neutre', effect: 'Brise armure (-30% def 3 tours)', range: '1 case', cooldown: '3 tours' 
      },
      { 
        id: 'fa6', name: 'Endurance du Vétéran', 
        description: '3PA – 0PO. Relance: 5 tours', 
        icon: '💪', unlockedAt: 11, type: 'defensive', 
        effect: 'Immunité DoT + résistance 50% (3 tours)', range: 'Soi-même', cooldown: '5 tours' 
      },
      { 
        id: 'fa7', name: 'Combo Destructeur', 
        description: '5PA – 1PO. Relance: 4 tours', 
        icon: '🔄', unlockedAt: 13, type: 'offensive', 
        damage: '25 dégâts x3', effect: 'Chaque coup +10 dégâts', range: '1 case', cooldown: '4 tours' 
      },
      { 
        id: 'fa8', name: 'Cri de Guerre', 
        description: '4PA – 0PO. Relance: 6 tours', 
        icon: '📢', unlockedAt: 15, type: 'utility', 
        effect: 'Zone 3x3: alliés +50% dégâts (3 tours)', range: 'Autour de soi', cooldown: '6 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'fa9', name: 'Berserker Ultime', 
        description: '6PA – 0PO. Relance: 8 tours', 
        icon: '👹', unlockedAt: 17, type: 'utility', 
        effect: '+200% dégâts, -75% défense, attaques illimitées (2 tours)', range: 'Soi-même', cooldown: '8 tours' 
      },
      { 
        id: 'fa10', name: 'Onde de Choc', 
        description: '7PA – 0PO. Relance: 5 tours', 
        icon: '🌊', unlockedAt: 19, type: 'offensive', 
        damage: '40 dégâts Neutre Zone', effect: 'Cercle: pousse + étourdit', range: 'Autour de soi', cooldown: '5 tours' 
      },
      { 
        id: 'fa11', name: 'Dernier Souffle', 
        description: '8PA – 0PO. Relance: 10 tours', 
        icon: '💀', unlockedAt: 21, type: 'utility', 
        effect: 'Si <25% PV: tous sorts gratuits (3 tours)', range: 'Soi-même', cooldown: '10 tours' 
      },
      { 
        id: 'fa12', name: 'Légende Oubliée', 
        description: '10PA – 0PO. Relance: 8 tours', 
        icon: '👑', unlockedAt: 23, type: 'ultimate', 
        effect: 'Retrouve gloire: stats x3 (4 tours)', range: 'Soi-même', cooldown: '8 tours' 
      },
      { 
        id: 'fa13', name: 'Champion Éternel', 
        description: '15PA – 0PO. Relance: 15 tours', 
        icon: '⚡', unlockedAt: 25, type: 'ultimate', 
        effect: 'Invincibilité + frappe garantie mortelle', range: 'Soi-même', cooldown: '15 tours' 
      }
    ]
  },

  {
    id: 'idadhgable',
    name: 'Idadhgable',
    description: 'Chevalier brisé, mi-soigneur, mi-justicier. Paladin déchu qui a perdu sa foi mais garde son code d\'honneur. Il mélange lumière corrompue et justice implacable dans ses techniques de combat.',
    icon: '✝️',
    avatar: '🛡️',
    color: '#FFD700',
    element: 'Air/Lumière',
    brotherhood: '⚔️ CONFRÉRIE DU SERMENT BRISÉ',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'id1', name: 'Lumière Rédemptrice', 
        description: '3PA – 1–4PO', 
        icon: '✨', unlockedAt: 1, type: 'offensive', 
        damage: '20 dégâts Air', effect: 'Soigne allié proche de 10 PV', range: '1-4 cases' 
      },
      { 
        id: 'id2', name: 'Sceau de Justice', 
        description: '3PA – 1PO. Relance: 2 tours', 
        icon: '⚖️', unlockedAt: 3, type: 'utility', 
        effect: '50% chance retirer 1PA', range: '1 case', cooldown: '2 tours' 
      },
      { 
        id: 'id3', name: 'Dévotion', 
        description: '3PA – 6PO. Relance: 3 tours', 
        icon: '🙏', unlockedAt: 5, type: 'utility', 
        effect: 'Donne +1PA à allié (2 tours)', range: '6 cases', cooldown: '3 tours' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'id4', name: 'Châtiment Divin', 
        description: '5PA – 1–3PO. Relance: 3 tours', 
        icon: '⚡', unlockedAt: 7, type: 'offensive', 
        damage: '35 dégâts Air', effect: '+50% vs ennemis corrompus', range: '1-3 cases', cooldown: '3 tours' 
      },
      { 
        id: 'id5', name: 'Aura de Protection', 
        description: '4PA – 0PO. Relance: 4 tours', 
        icon: '🔆', unlockedAt: 9, type: 'defensive', 
        effect: 'Zone 2x2: alliés +30% résistance (3 tours)', range: 'Autour de soi', cooldown: '4 tours' 
      },
      { 
        id: 'id6', name: 'Guérison de Groupe', 
        description: '6PA – 2–5PO. Relance: 5 tours', 
        icon: '💚', unlockedAt: 11, type: 'defensive', 
        effect: 'Zone 3x3: soigne tous alliés 25 PV', range: '2-5 cases', cooldown: '5 tours' 
      },
      { 
        id: 'id7', name: 'Jugement Mortel', 
        description: '7PA – 1–2PO. Relance: 4 tours', 
        icon: '⚖️', unlockedAt: 13, type: 'offensive', 
        damage: '50 dégâts Air', effect: 'x2 si ennemi a fait mal à allié', range: '1-2 cases', cooldown: '4 tours' 
      },
      { 
        id: 'id8', name: 'Sacrifice Noble', 
        description: '4PA – 1–8PO. Relance: 6 tours', 
        icon: '💔', unlockedAt: 15, type: 'defensive', 
        effect: 'Prend tous dégâts alliés ciblés (2 tours)', range: '1-8 cases', cooldown: '6 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'id9', name: 'Lumière Corrompue', 
        description: '6PA – 2–4PO. Relance: 5 tours', 
        icon: '🌟', unlockedAt: 17, type: 'offensive', 
        damage: '40 dégâts Air', effect: 'Soigne ou blesse selon alignement', range: '2-4 cases', cooldown: '5 tours' 
      },
      { 
        id: 'id10', name: 'Résurrection Mineure', 
        description: '8PA – 1–5PO. Relance: 8 tours', 
        icon: '✨', unlockedAt: 19, type: 'defensive', 
        effect: 'Ramène allié KO avec 30% PV', range: '1-5 cases', cooldown: '8 tours' 
      },
      { 
        id: 'id11', name: 'Serment Brisé', 
        description: '7PA – 0PO. Relance: 7 tours', 
        icon: '💔', unlockedAt: 21, type: 'utility', 
        effect: 'Sorts sombres + lumineux simultanément (3 tours)', range: 'Soi-même', cooldown: '7 tours' 
      },
      { 
        id: 'id12', name: 'Jugement Final', 
        description: '10PA – 1–6PO. Relance: 9 tours', 
        icon: '👁️', unlockedAt: 23, type: 'ultimate', 
        damage: '100 dégâts Air', effect: 'Analyse âme: bonus selon alignement', range: '1-6 cases', cooldown: '9 tours' 
      },
      { 
        id: 'id13', name: 'Paladin Rédempteur', 
        description: '12PA – 0PO. Relance: 12 tours', 
        icon: '👼', unlockedAt: 25, type: 'ultimate', 
        effect: 'Restaure foi: tous sorts x2 + immunités', range: 'Soi-même', cooldown: '12 tours' 
      }
    ]
  },

  {
    id: 'lamat',
    name: 'Lamât',
    description: 'Vétéran maudit, plus il souffre, plus il devient dangereux. Guerrier scarifié par mille batailles, chaque blessure le rend plus fort. Sa douleur alimente une rage qui consume tout sur son passage.',
    icon: '🩸',
    avatar: '⚡',
    color: '#8B0000',
    element: 'Neutre/Sacré',
    brotherhood: '⚔️ CONFRÉRIE DU SERMENT BRISÉ',
    spells: [
      // Sorts de base (Niveau 1-5)
      { 
        id: 'la1', name: 'Frappe Vengeresse', 
        description: '4PA – 1–2PO. Lancer/tour: 2', 
        icon: '⚔️', unlockedAt: 1, type: 'offensive', 
        damage: '25 dégâts fixes', effect: '+10 si blessé ce tour', range: '1-2 cases' 
      },
      { 
        id: 'la2', name: 'Barrière Sacrée', 
        description: '3PA – 0PO. Relance: 2 tours', 
        icon: '🛡️', unlockedAt: 3, type: 'defensive', 
        effect: 'Bouclier = 30% PV actuels (1 tour)', range: 'Soi-même', cooldown: '2 tours' 
      },
      { 
        id: 'la3', name: 'Kidikié', 
        description: '2PA – 0PO. Relance: 3 tours', 
        icon: '🔄', unlockedAt: 5, type: 'defensive', 
        effect: 'Renvoie 50% dégâts subis (1 tour)', range: 'Soi-même', cooldown: '3 tours' 
      },
      
      // Sorts intermédiaires (Niveau 6-15)
      { 
        id: 'la4', name: 'Soif de Bataille', 
        description: '3PA – 0PO. Relance: 4 tours', 
        icon: '🗡️', unlockedAt: 7, type: 'utility', 
        effect: 'Chaque ennemi tué: +1PA permanent (combat)', range: 'Soi-même', cooldown: '4 tours' 
      },
      { 
        id: 'la5', name: 'Cicatrices de Guerre', 
        description: '4PA – 0PO. Relance: 5 tours', 
        icon: '🩹', unlockedAt: 9, type: 'defensive', 
        effect: 'Chaque 10% PV perdus: +15% dégâts (permanent)', range: 'Soi-même', cooldown: '5 tours' 
      },
      { 
        id: 'la6', name: 'Coup du Désespoir', 
        description: '5PA – 1PO. Relance: 3 tours', 
        icon: '💥', unlockedAt: 11, type: 'offensive', 
        damage: '40 dégâts + % PV manquants', effect: 'Plus de PV manquants = plus de dégâts', range: '1 case', cooldown: '3 tours' 
      },
      { 
        id: 'la7', name: 'Rage du Mourant', 
        description: '4PA – 0PO. Relance: 6 tours', 
        icon: '😡', unlockedAt: 13, type: 'utility', 
        effect: 'Si <25% PV: attaques illimitées (2 tours)', range: 'Soi-même', cooldown: '6 tours' 
      },
      { 
        id: 'la8', name: 'Résilience Légendaire', 
        description: '3PA – 0PO. Relance: 5 tours', 
        icon: '💪', unlockedAt: 15, type: 'defensive', 
        effect: 'Immunité mort subite + 1PV minimum (3 tours)', range: 'Soi-même', cooldown: '5 tours' 
      },
      
      // Sorts avancés (Niveau 16-25)
      { 
        id: 'la9', name: 'Phoenix de Douleur', 
        description: '6PA – 0PO. Relance: 8 tours', 
        icon: '🔥', unlockedAt: 17, type: 'utility', 
        effect: 'Résurrection automatique si tué (1 fois/combat)', range: 'Soi-même', cooldown: '8 tours' 
      },
      { 
        id: 'la10', name: 'Explosion de Rage', 
        description: '7PA – 0PO. Relance: 6 tours', 
        icon: '💥', unlockedAt: 19, type: 'offensive', 
        damage: 'PV manquants x2 Zone', effect: 'Cercle 4x4: dégâts = PV perdus', range: 'Autour de soi', cooldown: '6 tours' 
      },
      { 
        id: 'la11', name: 'Martyr Vengeur', 
        description: '8PA – 0PO. Relance: 9 tours', 
        icon: '✝️', unlockedAt: 21, type: 'defensive', 
        effect: 'Sacrifie PV: alliés gagnent stats équivalentes', range: 'Toute la carte', cooldown: '9 tours' 
      },
      { 
        id: 'la12', name: 'Incarnation de Guerre', 
        description: '10PA – 0PO. Relance: 10 tours', 
        icon: '👹', unlockedAt: 23, type: 'ultimate', 
        effect: 'Dégâts subis = dégâts infligés x2 (3 tours)', range: 'Soi-même', cooldown: '10 tours' 
      },
      { 
        id: 'la13', name: 'Légende Immortelle', 
        description: '15PA – 0PO. Relance: 15 tours', 
        icon: '👑', unlockedAt: 25, type: 'ultimate', 
        effect: 'Devient immortel: 0 PV = puissance maximale', range: 'Soi-même', cooldown: '15 tours' 
      }
    ]
  }
];