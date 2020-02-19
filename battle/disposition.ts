import {Boar} from "../characters/enemies/boar.js";
import GeneralCharacter from "../characters/generalCharacter.js";
import {effects} from "../actionsAndEffects/effects.js";
import GeneralEnemy from "../characters/enemies/generalEnemy.js";
import {Adventurer} from "../characters/adventurers/adventurer.js";
import {Wizard} from "../characters/enemies/wizard.js";
import {BattleScene} from "./battle.js";

export class Disposition {
    public playerCharacters: Adventurer[];
    public enemyCharacters: GeneralEnemy[];
    public currentCharacter: Adventurer | GeneralEnemy;
    public location: string;
    public currentPhase: 'preparation' | 'battle';
    public turnOrder: (Adventurer | GeneralEnemy)[];
    public scene: BattleScene;
    private battleEnded: boolean;

    constructor(playerCharacters: Adventurer[], enemyCharacters: string[], location: string, scene: BattleScene) {
        this.scene = scene;
        this.playerCharacters = playerCharacters;
        this.enemyCharacters = enemyCharacters.map((char, index) => {
            const enemy = new enemiesList[char];
            enemy.name = `${enemy.name} ${index + 1}`;
            return enemy;
        });
        this.location = location;
        this.battleEnded = false;
    }

    public startRound() {
        this.currentPhase = this.currentPhase !== undefined ? 'battle' : 'preparation';
        console.log(`---------------------------%cSTART ${this.currentPhase} ROUND%c---------------------------`, 'color: red', 'color: auto');
        this.log(`---------------------------START ${this.currentPhase} ROUND---------------------------`);
        [...this.playerCharacters, ...this.enemyCharacters].forEach(char => char.startRound(this.currentPhase));
        this.calculateTurnOrder();
        this.startTurn();
    }

    public endRound() {
        console.log('---------------------------%cEND ROUND%c---------------------------', 'color: red', 'color: auto');
        this.log('---------------------------END ROUND---------------------------');
        [...this.playerCharacters, ...this.enemyCharacters].forEach(char => {
            if (char.isAlive) {
                char.endRound();
            }
        });
        this.startRound();
    }

    private startTurn() {
        this.currentCharacter = this.turnOrder[0];
        console.log(`%cTurn started for ${this.currentCharacter?.name}`, 'color: green');
        this.log(`Turn started for ${this.currentCharacter?.name}`);
        this.startAction();
    }

    private startAction() {
        this.scene.collectActions(this.currentCharacter).then(({action, targets}: { action: Action | 'END TURN', targets: (Adventurer | GeneralEnemy)[] }) => {
            if (action === 'END TURN') {
                this.endTurn();
            } else {
                const results = this.processAction(this.currentCharacter, targets, action);
                this.calculateTurnOrder();
                this.scene.animateAction(results).then(() => {
                    this.shouldContinueBattle();
                    if (!this.battleEnded) {
                        if (!this.currentCharacter.isAlive) {
                            this.endTurn();
                        } else {
                            if (results.attempted === false) {
                                this.endTurn();
                            } else {
                                this.startAction();
                            }
                        }
                    }
                });
            }
        });
    }

    public endTurn() {
        if (this.battleEnded) return;
        console.log(`%c${this.currentCharacter.name}'s turn ended`, 'color: green');
        this.log(`${this.currentCharacter.name}'s turn ended`);
        this.currentCharacter.endTurn();
        this.calculateTurnOrder();
        if (this.turnOrder.length !== 0) {
            this.startTurn();
        } else {
            this.endRound();
        }
    }

    calculateTurnOrder() {
        if (this.currentPhase === 'preparation') {
            this.turnOrder = [...this.playerCharacters]
                .filter(char => !char.actedThisRound && char.isAlive)
                .sort((a, b) => Math.random() - 1)
                .sort((a, b) => b.currentCharacteristics.attributes.initiative - a.currentCharacteristics.attributes.initiative);
        } else {
            this.turnOrder = [...this.playerCharacters, ...this.enemyCharacters]
                .filter(char => !char.actedThisRound && char.isAlive)
                .sort((a, b) => Math.random() - 1)
                .sort((a, b) => b.currentCharacteristics.attributes.initiative - a.currentCharacteristics.attributes.initiative);
        }
        this.scene.drawTurnOrder(this.turnOrder);
    }

    private shouldContinueBattle() {
        //what if everybody are dead?
        if (!this.enemyCharacters.some(char => char.isAlive)) {
            console.log('Adventurer party won the battle');
            this.log('Adventurer party won the battle');
            this.scene.exitBattle(true);
            this.battleEnded = true;
        }
        if (!this.playerCharacters.some(char => char.isAlive)) {
            console.log('Adventurer party lost the battle');
            this.log('Adventurer party lost the battle');
            this.scene.exitBattle(false);
            this.battleEnded = true;
        }
    }

    public processAction(
        source: Adventurer | GeneralEnemy,
        targets: (Adventurer | GeneralEnemy)[],
        action: Action
    ): {
        attempted: boolean;
        succeeded: boolean[];
        triggeredTraps: Effect[],
        source: Adventurer | GeneralEnemy;
        targets: (Adventurer | GeneralEnemy)[];
        action: Action;
    } {
        const targetsNames = targets.map(target => target.name).join(', ');
        console.log(`%c${source.name} %ctries to perform %c${action.actionName} %con %c${targetsNames}`, 'color: red', 'color: auto', 'color: green', 'color: auto', 'color: red');
        this.log(`${source.name} tries to perform ${action.actionName} on ${targetsNames}`);

        let actionResults = {
            attempted: false,
            succeeded: [],
            triggeredTraps: [],
            source: source,
            targets: targets,
            action: action
        };
        if (source.actionPoints[action.type] < action.actionCost) {
            console.log(`Action was not performed because ${source.actionPoints[action.type]} is not enough - ${action.actionCost} is needed.`);
            this.log(`Action was not performed because ${source.actionPoints[action.type]} is not enough - ${action.actionCost} is needed.`);
        } else {
            actionResults.attempted = true;
            source.actionPoints[action.type] = source.actionPoints[action.type] - action.actionCost;
            actionResults.triggeredTraps = this._checkForTriggers(source, action);
            if (action.actionId === 'accessInventory') {
                if (source instanceof Adventurer) {
                    actionResults.succeeded.push(true);
                    this.scene.switchToScene('Inventory', {}, false);
                }
            } else {
                action.effect.forEach(effectDescription => {
                    const effect = {...effects[effectDescription.effectId]};
                    effect.currentLevel = effectDescription.level;
                    effect.durationLeft = effect.baseDuration;
                    effect.source = effectDescription.source;
                    targets.forEach((target, index) => {
                        if (effect.applicationCheck(source, target, action)) {
                            effect.setModifier(source, target, action);
                            target.applyEffect(effect);
                            actionResults.succeeded[index] = true;
                        }
                    });
                });
            }
        }
        return actionResults;
    }

    private _checkForTriggers(source: GeneralCharacter, action: Action) {
        let triggeredTraps = [];
        let sourceEffectsLength = source.currentEffects.length;
        for (let index = 0; index < sourceEffectsLength; index++) {
            let effect = source.currentEffects[index];
            if (effect.type === 'conditional') {
                action.triggers?.forEach(trigger => {
                    if (trigger.conditionId === effect.effectId) {
                        const triggerRoll = Math.random();
                        console.log(`Trigger probability of ${trigger.probability} vs trigger roll of ${triggerRoll}`);
                        this.log(`Trigger probability of ${trigger.probability} vs trigger roll of ${triggerRoll}`);
                        if (triggerRoll < trigger.probability) {
                            console.log('Triggered!', 'applying new effects,', effect.modifier.value);
                            this.log('Triggered! Applying new effects');
                            triggeredTraps.push(effect);
                            source.currentEffects.splice(index, 1);
                            index--;
                            sourceEffectsLength--;
                            if (effect.modifier.type === 'effect') {
                                effect.modifier.value.forEach(effectOfTheTrigger => {
                                    const trapEffect = {...effects[effectOfTheTrigger]};
                                    trapEffect.durationLeft = trapEffect.baseDuration;
                                    trapEffect.source = effect.source;
                                    trapEffect.setModifier();
                                    source.applyEffect(trapEffect);
                                });
                            }
                        } else {
                            console.log('Avoided!');
                            this.log('Avoided!');
                        }
                    }
                });
            }
        }
        return triggeredTraps;
    }

    public log(entree: string) {
        const logElement = document.getElementsByClassName('battle-log')[0];
        // @ts-ignore
        logElement.style.display = 'block';
        const entreeElement = document.createElement('div');
        entreeElement.innerText = entree;
        logElement.appendChild(entreeElement);
    }
}

const enemiesList = {
    wildBoar: Boar,
    wizard: Wizard
};