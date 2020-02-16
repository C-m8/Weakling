export class PlayerActions {
    constructor() {
        this.actions = [{
                actionId: 'healingTouch',
                phase: ['preparation', 'battle'],
                type: 'magical',
                actionName: 'Healing touch',
                actionDescription: 'Primitive spell, which nevertheless does the trick - restores some health',
                effect: [{
                        effectId: 'heal',
                        source: 'healingTouch',
                        level: 1
                    }],
                target: 'party',
                actionCost: 1,
                noticeable: 0,
                animation: 'meleeAttack',
            }, {
                actionId: 'dustStorm',
                phase: ['battle'],
                type: 'magical',
                actionName: 'Dust storm',
                actionDescription: 'One of a few aggressive spells Kobolds can master - used mostly to blind the enemy to run away',
                effect: [{
                        effectId: 'physicalDamage',
                        source: 'dustStorm',
                        level: 1
                    }, {
                        effectId: 'agilityDown',
                        source: 'dustStorm',
                        level: 1
                    }],
                target: 'allEnemies',
                actionCost: 1,
                noticeable: 0,
                animation: 'meleeAttack',
            }, {
                actionId: 'warmUp',
                phase: ['preparation', 'battle'],
                type: 'physical',
                actionName: 'Warm up',
                actionDescription: 'Sets you in your best physical shape for the upcoming battle',
                effect: [{
                        effectId: 'strengthUp',
                        source: 'warmUp',
                        level: 1
                    }, {
                        effectId: 'agilityUp',
                        source: 'warmUp',
                        level: 1
                    }],
                target: 'self',
                actionCost: 0.5,
                noticeable: 0,
                animation: 'castBuff',
            }, {
                actionId: 'adjustArmor',
                phase: ['preparation', 'battle'],
                type: 'physical',
                actionName: 'Adjust armor',
                actionDescription: 'Making sure that your gear is in perfect shape and does not get in a way',
                effect: [{
                        effectId: 'armorUp',
                        source: 'adjustArmor',
                        level: 1
                    }, {
                        effectId: 'dodgeUp',
                        source: 'adjustArmor',
                        level: 1
                    }],
                target: 'self',
                actionCost: 0.5,
                noticeable: 0,
                animation: 'castBuff',
            }, {
                actionId: 'setTrap',
                phase: ['preparation'],
                type: 'physical',
                actionName: 'Set a trap',
                actionDescription: 'Sets a trap on the most likely way of the selected opponent',
                effect: [{
                        effectId: 'trapped',
                        source: 'setTrap',
                        level: 1
                    }],
                target: 'enemy',
                actionCost: 0.5,
                noticeable: 0.1,
                animation: 'meleeAttack',
            }, {
                actionId: 'meleeAttack',
                phase: ['battle'],
                type: 'physical',
                actionName: 'Melee attack',
                actionDescription: 'Hits the opponent with equipped melee weapon',
                effect: [{
                        effectId: 'physicalDamage',
                        source: 'meleeAttack',
                        level: 1
                    }],
                target: 'enemy',
                actionCost: 1,
                noticeable: 1,
                animation: 'meleeAttack',
            }, {
                actionId: 'drainingSoil',
                phase: ['preparation'],
                type: 'magical',
                actionName: 'Draining soil',
                actionDescription: 'Puts the curse on the most likely way of the selected opponent',
                effect: [{
                        effectId: 'cursedSoil',
                        source: 'drainingSoil',
                        level: 1
                    }],
                target: 'enemy',
                actionCost: 0.5,
                noticeable: 0,
                special: 'If the trap is on the way, trap gets cursed, both effects are +10%, if trap is placed on cursed land - gets cursed himself',
                animation: 'meleeAttack',
            }, {
                actionId: 'fireProtection',
                phase: ['preparation', 'battle'],
                type: 'magical',
                actionName: 'Fire protection',
                actionDescription: 'Creates the sphere of protection against the fire around the target',
                effect: [{
                        effectId: 'fireResistanceUp',
                        source: 'fireProtection',
                        level: 1
                    }],
                target: 'self',
                actionCost: 1.5,
                noticeable: 0,
                animation: 'castBuff',
            }, {
                actionId: 'swiftMind',
                phase: ['preparation', 'battle'],
                type: 'magical',
                actionName: 'Swift mind',
                actionDescription: 'You think faster, allowing you to consider more options and quicker react on what is happening',
                effect: [{
                        effectId: 'intelligenceUp',
                        source: 'swiftMind',
                        level: 1
                    }, {
                        effectId: 'initiativeUp',
                        source: 'swiftMind',
                        level: 1
                    }],
                target: 'self',
                actionCost: 0.5,
                noticeable: 0,
                animation: 'castBuff',
            }, {
                actionId: 'drinkWeakHealthPotion',
                phase: ['preparation', 'battle'],
                type: 'misc',
                actionName: 'Drink weak health potion',
                requires: 'weakHealthPotion',
                actionDescription: 'Drink weak health potion to restore some hp ',
                effect: [{
                        effectId: 'health',
                        source: '',
                        level: 10
                    }, {
                        effectId: 'saturation',
                        source: '',
                        level: 1
                    }],
                target: 'self',
                actionCost: 0.5,
                noticeable: 0,
                animation: 'castBuff',
            }, {
                actionId: 'inspectEnemy',
                phase: ['preparation', 'battle'],
                type: 'misc',
                actionName: 'Inspect enemy',
                actionDescription: 'Spend some time learning about your enemy to make better decisions later',
                effect: [{
                        effectId: 'intelligence',
                        source: '',
                        level: 1
                    }],
                target: 'enemy',
                actionCost: 0.5,
                noticeable: 0,
                animation: 'castBuff',
            }, {
                actionId: 'meditate',
                phase: ['preparation'],
                type: 'misc',
                actionName: 'Meditate',
                actionDescription: 'Clear your mind, balance and expand your energies',
                effect: [{
                        effectId: 'restoreManna',
                        source: 'meditate',
                        level: 1
                    }, {
                        effectId: 'restoreEnergy',
                        source: 'meditate',
                        level: 1
                    }],
                target: 'self',
                actionCost: 1,
                noticeable: 0,
                animation: 'castBuff',
            }, {
                actionId: 'accessInventory',
                phase: ['preparation', 'battle'],
                type: 'misc',
                actionName: 'Access inventory',
                actionDescription: 'Sometimes even in the heat of the battle you absolutely have to do it',
                effect: [{
                        effectId: 'openInventory',
                        source: 'accessInventory',
                        level: 1
                    }],
                target: 'self',
                actionCost: 0.5,
                noticeable: 0,
                animation: 'castBuff',
            },];
    }
    getActionById(actionId) {
        return { ...this.actions.find(action => action.actionId === actionId) };
    }
}
//# sourceMappingURL=playerActions.js.map