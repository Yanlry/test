export const CombatLogger = {
    // Envoyer un log d'attaque
    logAttack: (attacker: string, target: string, damage: number, spellName?: string) => {
      if (window.addCombatMessage) {
        const message = spellName 
          ? `${attacker} lance ${spellName} sur ${target}` 
          : `${attacker} attaque ${target}`;
        window.addCombatMessage(message, attacker, damage);
      }
    },
  
    // Envoyer un log de soin
    logHeal: (healer: string, target: string, healAmount: number, spellName?: string) => {
      if (window.addCombatMessage) {
        const message = spellName 
          ? `${healer} lance ${spellName} sur ${target}` 
          : `${healer} soigne ${target}`;
        window.addCombatMessage(message, healer, undefined, healAmount);
      }
    },
  
    // Envoyer un log d'événement général
    logEvent: (message: string, actor: string = 'System') => {
      if (window.addCombatMessage) {
        window.addCombatMessage(message, actor);
      }
    },
  
    // Vérifier si le système est prêt
    isReady: () => {
      return typeof window.addCombatMessage === 'function';
    }
  };