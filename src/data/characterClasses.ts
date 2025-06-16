/**
 * DONNÉES DES CLASSES DE PERSONNAGES
 * Pour modifier les classes, leurs sorts et descriptions, c'est ici
 */

import { CharacterClass } from '../types/game';

export const characterClasses: CharacterClass[] = [
  {
    id: 'warrior',
    name: 'Guerrier',
    description: 'Maître du combat rapproché, le Guerrier excelle dans l\'art de la guerre. Avec sa force brute et sa résistance légendaire, il protège ses alliés tout en écrasant ses ennemis.',
    icon: '⚔️',
    avatar: '🛡️',
    color: '#DC2626',
    element: 'Terre',
    spells: [
      { id: 'w1', name: 'Coup d\'Épée', description: 'Attaque de base avec votre arme', icon: '⚔️', unlockedAt: 1, type: 'offensive', damage: '20-30', range: '1 case' },
      { id: 'w2', name: 'Charge', description: 'Fonce vers l\'ennemi en ligne droite', icon: '💨', unlockedAt: 3, type: 'offensive', damage: '35-45', range: '2-4 cases' },
      { id: 'w3', name: 'Bouclier', description: 'Augmente votre défense temporairement', icon: '🛡️', unlockedAt: 6, type: 'defensive', effect: '+50% Défense', cooldown: '3 tours' },
      { id: 'w4', name: 'Cri de Guerre', description: 'Boost les alliés et intimide les ennemis', icon: '📢', unlockedAt: 9, type: 'utility', effect: 'Zone +25% dégâts', range: '3x3' },
      { id: 'w5', name: 'Lame Tournoyante', description: 'Attaque circulaire autour du personnage', icon: '🌪️', unlockedAt: 15, type: 'offensive', damage: '40-55 x4', range: 'Cercle' },
      { id: 'w6', name: 'Provocation', description: 'Force les ennemis à vous attaquer', icon: '😤', unlockedAt: 20, type: 'defensive', effect: 'Taunt obligatoire', cooldown: '4 tours' },
      { id: 'w7', name: 'Régénération', description: 'Récupère des PV à chaque tour', icon: '💚', unlockedAt: 25, type: 'defensive', effect: '+15 PV/tour', cooldown: '5 tours' },
      { id: 'w8', name: 'Frappe Critique', description: 'Coup puissant avec chance de critique', icon: '💥', unlockedAt: 35, type: 'offensive', damage: '80-120', effect: '30% critique' },
      { id: 'w9', name: 'Mur de Boucliers', description: 'Crée une barrière protectrice', icon: '🔲', unlockedAt: 50, type: 'defensive', effect: 'Bloque passage', cooldown: '6 tours' },
      { id: 'w10', name: 'Berserk', description: 'Mode rage : +dégâts mais -défense', icon: '😡', unlockedAt: 70, type: 'utility', effect: '+100% dégâts, -50% défense', cooldown: '8 tours' },
      { id: 'w11', name: 'Earthquake', description: 'Frappe le sol créant des fissures', icon: '🌍', unlockedAt: 90, type: 'ultimate', damage: '150-200 Zone', range: '5x5' },
      { id: 'w12', name: 'Avatar de Guerre', description: 'Transformation ultime du guerrier', icon: '👹', unlockedAt: 100, type: 'ultimate', effect: 'Stats x2, immunités', cooldown: '10 tours' }
    ]
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'Manipulateur des forces mystiques, le Mage contrôle les éléments avec une précision mortelle. Sa magie dévastatrice peut changer le cours d\'une bataille.',
    icon: '🔮',
    avatar: '🧙‍♂️',
    color: '#3B82F6',
    element: 'Feu/Glace',
    spells: [
      { id: 'm1', name: 'Projectile Magique', description: 'Tir de base d\'énergie magique', icon: '✨', unlockedAt: 1, type: 'offensive', damage: '15-25', range: '1-6 cases' },
      { id: 'm2', name: 'Boule de Feu', description: 'Projectile explosif enflammé', icon: '🔥', unlockedAt: 3, type: 'offensive', damage: '30-40', range: '1-5 cases' },
      { id: 'm3', name: 'Armure Magique', description: 'Protection contre les sorts', icon: '🔮', unlockedAt: 6, type: 'defensive', effect: '+30% Résistance magique', cooldown: '3 tours' },
      { id: 'm4', name: 'Éclair Glacé', description: 'Rayon de glace qui ralentit', icon: '❄️', unlockedAt: 9, type: 'offensive', damage: '25-35', effect: 'Ralentissement' },
      { id: 'm5', name: 'Téléportation', description: 'Déplacement instantané', icon: '🌀', unlockedAt: 15, type: 'utility', effect: 'Téléport 8 cases', cooldown: '4 tours' },
      { id: 'm6', name: 'Mur de Flammes', description: 'Barrière de feu qui brûle', icon: '🔥', unlockedAt: 20, type: 'defensive', damage: '20 DoT', effect: 'Bloque + brûle' },
      { id: 'm7', name: 'Invisibilité', description: 'Devient invisible temporairement', icon: '👻', unlockedAt: 25, type: 'utility', effect: 'Invisible 3 tours', cooldown: '5 tours' },
      { id: 'm8', name: 'Chaîne d\'Éclairs', description: 'Éclair qui rebondit entre ennemis', icon: '⚡', unlockedAt: 35, type: 'offensive', damage: '45-60 x3', range: 'Chaîne' },
      { id: 'm9', name: 'Blizzard', description: 'Tempête de glace sur zone', icon: '🌨️', unlockedAt: 50, type: 'offensive', damage: '35-50 Zone', range: '4x4' },
      { id: 'm10', name: 'Drain de Vie', description: 'Vol de points de vie', icon: '🩸', unlockedAt: 70, type: 'offensive', damage: '60-80', effect: 'Soigne 50%' },
      { id: 'm11', name: 'Météore', description: 'Projectile cosmique dévastateur', icon: '☄️', unlockedAt: 90, type: 'ultimate', damage: '200-300', range: '6 cases' },
      { id: 'm12', name: 'Archimage', description: 'Maîtrise absolue des éléments', icon: '🌟', unlockedAt: 100, type: 'ultimate', effect: 'Tous sorts x2, -50% cooldown', cooldown: '10 tours' }
    ]
  },
  {
    id: 'archer',
    name: 'Archer',
    description: 'Expert du tir de précision, l\'Archer domine le champ de bataille à distance. Ses flèches trouvent toujours leur cible, même dans les conditions les plus difficiles.',
    icon: '🏹',
    avatar: '🏹',
    color: '#10B981',
    element: 'Air',
    spells: [
      { id: 'a1', name: 'Tir', description: 'Tir de flèche basique', icon: '🏹', unlockedAt: 1, type: 'offensive', damage: '18-28', range: '1-8 cases' },
      { id: 'a2', name: 'Tir Perçant', description: 'Flèche qui traverse les ennemis', icon: '🎯', unlockedAt: 3, type: 'offensive', damage: '25-35', range: 'Ligne' },
      { id: 'a3', name: 'Concentration', description: 'Augmente la précision et les critiques', icon: '🎯', unlockedAt: 6, type: 'utility', effect: '+50% Critique', cooldown: '3 tours' },
      { id: 'a4', name: 'Flèche Empoisonnée', description: 'Flèche qui empoisonne la cible', icon: '☠️', unlockedAt: 9, type: 'offensive', damage: '20-30', effect: 'Poison 3 tours' },
      { id: 'a5', name: 'Saut Acrobatique', description: 'Bond défensif avec dégâts à l\'atterrissage', icon: '🦘', unlockedAt: 15, type: 'utility', damage: '15-25', effect: 'Esquive +90%' },
      { id: 'a6', name: 'Pluie de Flèches', description: 'Bombardement de flèches sur zone', icon: '🌧️', unlockedAt: 20, type: 'offensive', damage: '20-30 x6', range: '3x3' },
      { id: 'a7', name: 'Camouflage', description: 'Se fond dans l\'environnement', icon: '🌿', unlockedAt: 25, type: 'defensive', effect: 'Invisible + +25% dégâts', cooldown: '4 tours' },
      { id: 'a8', name: 'Flèche Explosive', description: 'Projectile qui explose à l\'impact', icon: '💥', unlockedAt: 35, type: 'offensive', damage: '70-90', range: 'Explosion 2x2' },
      { id: 'a9', name: 'Tornade', description: 'Crée un tourbillon d\'air', icon: '🌪️', unlockedAt: 50, type: 'offensive', damage: '40-60', effect: 'Pousse ennemis' },
      { id: 'a10', name: 'Maître Archer', description: 'Tirs multiples simultanés', icon: '🏹', unlockedAt: 70, type: 'offensive', damage: '35-50 x4', range: '4 cibles' },
      { id: 'a11', name: 'Flèche Divine', description: 'Projectile guidé infaillible', icon: '🌟', unlockedAt: 90, type: 'ultimate', damage: '180-250', effect: 'Frappe assurée' },
      { id: 'a12', name: 'Tempête d\'Acier', description: 'Déluge de projectiles dévastateur', icon: '⚡', unlockedAt: 100, type: 'ultimate', damage: '50-70 x10', range: 'Tout l\'écran' }
    ]
  },
  {
    id: 'rogue',
    name: 'Voleur',
    description: 'Maître de l\'ombre et de la discrétion, le Voleur frappe vite et fort avant de disparaître. Ses techniques d\'assassinat sont légendaires.',
    icon: '🗡️',
    avatar: '🥷',
    color: '#8B5CF6',
    element: 'Ombre',
    spells: [
      { id: 'r1', name: 'Coup de Dague', description: 'Attaque rapide au corps à corps', icon: '🗡️', unlockedAt: 1, type: 'offensive', damage: '22-32', range: '1 case' },
      { id: 'r2', name: 'Attaque Sournoise', description: 'Frappe critique depuis l\'ombre', icon: '🔪', unlockedAt: 3, type: 'offensive', damage: '35-50', effect: '+100% si invisible' },
      { id: 'r3', name: 'Furtivité', description: 'Devient temporairement invisible', icon: '🌫️', unlockedAt: 6, type: 'utility', effect: 'Invisible 2 tours', cooldown: '4 tours' },
      { id: 'r4', name: 'Poison', description: 'Empoisonne l\'arme pour plusieurs coups', icon: '☠️', unlockedAt: 9, type: 'utility', effect: '10 dmg/tour x5', cooldown: '3 tours' },
      { id: 'r5', name: 'Pas de l\'Ombre', description: 'Téléportation courte derrière l\'ennemi', icon: '👤', unlockedAt: 15, type: 'utility', damage: '25-35', effect: 'Téléport + attaque' },
      { id: 'r6', name: 'Lancer de Dagues', description: 'Projectiles multiples à distance', icon: '🗡️', unlockedAt: 20, type: 'offensive', damage: '18-25 x3', range: '1-4 cases' },
      { id: 'r7', name: 'Vol', description: 'Dérobe des objets ou de la vie', icon: '💰', unlockedAt: 25, type: 'utility', effect: 'Vole 30 PV + objets', range: '1 case' },
      { id: 'r8', name: 'Exécution', description: 'Coup mortel sur cible affaiblie', icon: '💀', unlockedAt: 35, type: 'offensive', damage: '150-200', effect: 'x3 si cible <25% PV' },
      { id: 'r9', name: 'Clone d\'Ombre', description: 'Crée un double qui combat', icon: '👥', unlockedAt: 50, type: 'utility', effect: 'Clone 5 tours', cooldown: '7 tours' },
      { id: 'r10', name: 'Maître Assassin', description: 'Mode furtif ultime', icon: '🥷', unlockedAt: 70, type: 'utility', effect: 'Critique garanti 4 tours', cooldown: '8 tours' },
      { id: 'r11', name: 'Lames Ténébreuses', description: 'Invoque des épées d\'ombre', icon: '⚫', unlockedAt: 90, type: 'ultimate', damage: '80-120 x5', range: 'Zone' },
      { id: 'r12', name: 'Seigneur des Ombres', description: 'Fusion avec les ténèbres', icon: '🌑', unlockedAt: 100, type: 'ultimate', effect: 'Immunité + critique x3', cooldown: '10 tours' }
    ]
  },
  {
    id: 'priest',
    name: 'Prêtre',
    description: 'Serviteur des forces divines, le Prêtre maîtrise la magie de lumière. Il soigne ses alliés et peut purifier les forces obscures.',
    icon: '✨',
    avatar: '⛪',
    color: '#F59E0B',
    element: 'Lumière',
    spells: [
      { id: 'p1', name: 'Soin Léger', description: 'Restaure une petite quantité de PV', icon: '💚', unlockedAt: 1, type: 'defensive', effect: '+25-35 PV', range: '1-3 cases' },
      { id: 'p2', name: 'Rayon Sacré', description: 'Laser de lumière pure', icon: '✨', unlockedAt: 3, type: 'offensive', damage: '20-30', effect: '+50% vs morts-vivants' },
      { id: 'p3', name: 'Bénédiction', description: 'Améliore les capacités d\'un allié', icon: '🙏', unlockedAt: 6, type: 'utility', effect: '+25% toutes stats', cooldown: '3 tours' },
      { id: 'p4', name: 'Protection Divine', description: 'Bouclier magique protecteur', icon: '🛡️', unlockedAt: 9, type: 'defensive', effect: 'Absorbe 100 dégâts', cooldown: '4 tours' },
      { id: 'p5', name: 'Soin de Zone', description: 'Guérit tous les alliés proches', icon: '💚', unlockedAt: 15, type: 'defensive', effect: '+40-60 PV Zone', range: '3x3' },
      { id: 'p6', name: 'Purification', description: 'Retire tous les effets négatifs', icon: '✨', unlockedAt: 20, type: 'utility', effect: 'Supprime debuffs', range: '2x2' },
      { id: 'p7', name: 'Sanctuaire', description: 'Zone de guérison continue', icon: '⛪', unlockedAt: 25, type: 'defensive', effect: '+15 PV/tour 5 tours', range: '2x2' },
      { id: 'p8', name: 'Colère Divine', description: 'Explosion de lumière sacrée', icon: '⚡', unlockedAt: 35, type: 'offensive', damage: '60-90', range: 'Croix' },
      { id: 'p9', name: 'Résurrection', description: 'Ramène un allié à la vie', icon: '✨', unlockedAt: 50, type: 'utility', effect: 'Renaissance 50% PV', cooldown: '8 tours' },
      { id: 'p10', name: 'Martyr', description: 'Transfère ses PV aux alliés', icon: '💖', unlockedAt: 70, type: 'defensive', effect: 'Donne 80% PV actuels', cooldown: '6 tours' },
      { id: 'p11', name: 'Jugement', description: 'Condamnation divine dévastatrice', icon: '⚖️', unlockedAt: 90, type: 'ultimate', damage: '200-300', effect: 'Ignore armure' },
      { id: 'p12', name: 'Avatar Divin', description: 'Transformation en être de lumière', icon: '👼', unlockedAt: 100, type: 'ultimate', effect: 'Sorts illimités + immunité', cooldown: '10 tours' }
    ]
  }
];