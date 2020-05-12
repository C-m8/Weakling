import {Player, playerInstance} from "../characters/adventurers/player.js";
import {GeneralOverlayScene} from "./generalOverlayScene.js";

export class DialogScene extends GeneralOverlayScene {
    private timedEvent: Phaser.Time.TimerEvent;
    private dialogDisplayGroup: Phaser.GameObjects.Group;
    private closeCallback: Function;
    private dialogTree: any[];
    private player: Player;
    public opts: DialogOptions;
    private speakerName: string;

    constructor() {
        super({key: 'Dialog'});
    }

    public init({dialogTree, opts, closeCallback, prevScene, speakerName}: { dialogTree: DialogTree, opts?: DialogOptions, closeCallback?: Function, prevScene: string, speakerName: string }) {
        this.opts = {
            borderThickness: 3,
            borderColor: 0x907748,
            borderAlpha: 1,

            backgroundColor: 0x303030,
            backgroundAlpha: 1,

            windowWidth: +this.sys.game.config.width - 32 * 2,
            windowHeight: 250,
            windowX: 32,
            windowY: +this.sys.game.config.height - 32 - 250,

            responseTextColor: '#47340c',
            responseTextHoverColor: 'black',

            //closeButtonColor: 'darkgoldenrod',
            //closeButtonHoverColor: 'red',

            textColor: 'black',
            letterAppearanceDelay: 10,
        };
        this.speakerName = speakerName;
        this.dialogTree = dialogTree;
        this.opts = {...this.opts, ...opts};
        this.closeCallback = closeCallback;
        this.player = playerInstance;
        this.parentSceneKey = prevScene;
    }

    public preload() {

    }

    public create() {
        super.create(this.parentSceneKey, this.opts);
        this.dialogDisplayGroup = this.add.group();
        this._showDialog();
        this.events.on('wake', (scene, {dialogTree, opts, closeCallback, prevScene, speakerName}) => {
            this.parentSceneKey = prevScene;
            this.dialogTree = dialogTree;
            this.speakerName = speakerName;
            this.opts = {...this.opts, ...opts};
            this.closeCallback = closeCallback;
            this._showDialog();
        })
    }

    private _showDialog() {
        this._showLine(this.dialogTree[0])
    }

    private _showLine(line) {
        this.dialogDisplayGroup.clear(true, true);
        this._showName();
        this.timedEvent?.remove();
        this._setText(line.text, this.opts.letterAppearanceDelay > 0).then(() => {
            this._setReplies(line.replies)
        });
    }

    private _setReplies(replies) {
        const keyCodes = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
        replies.forEach((reply, index) => {
            const replyX = this.opts.windowX + 25;
            const replyY = this.opts.windowY + this.opts.windowHeight - 10 - 34 * replies.length + 34 * index;
            const replyGameObject = this.add.text(replyX, replyY, `${index + 1}. ${reply.text}`, {
                color: this.opts.responseTextColor,
                wordWrap: {
                    width: this.opts.windowWidth - 50
                }
            }).setScrollFactor(0).setInteractive();
            replyGameObject.on('pointerover', () => replyGameObject.setColor(this.opts.responseTextHoverColor));
            replyGameObject.on('pointerout', () => replyGameObject.setColor(this.opts.responseTextColor));
            replyGameObject.once('pointerdown', () => {
                this._replaySelected(reply);
            });
            this.input.keyboard.once('keyup-' + keyCodes[index + 1], () => {
                keyCodes.forEach(keyCode => this.input.keyboard.off(`keyup-${keyCode}`));
                this._replaySelected(reply)
            });
            this.dialogDisplayGroup.add(replyGameObject);
        })
    }

    private _replaySelected(reply) {
        if (reply.checkCharacteristic !== undefined) {
            const charToCheck = reply.checkCharacteristic.split('.');
            if (this.player.currentCharacteristics[charToCheck[0]][charToCheck[1]] >= reply.checkValue) {
                const nextLine = this.dialogTree.find(line => line.id === reply.successTriggers);
                this._showLine(nextLine);
            } else {
                const nextLine = this.dialogTree.find(line => line.id === reply.failureTriggers);
                this._showLine(nextLine);
            }
        } else if (reply.checkInventory) {
            let allIsThere = true;
            reply.checkValue.forEach(requestedItem => {
                if (!this.player.inventory.find(inventoryItem => inventoryItem.itemId === requestedItem.itemId && inventoryItem.quantity >= requestedItem.quantity)) {
                    allIsThere = false;
                }
            });
            if (allIsThere) {
                if (reply.checkInventory === 'remove') {
                    reply.checkValue.forEach(requestedItem => {
                        const item = this.player.inventory.find(inventoryItem => inventoryItem.itemId === requestedItem.itemId && inventoryItem.quantity >= requestedItem.quantity);
                        this.player.removeItemFromInventory(item, requestedItem.quantity);
                    });
                }
                const nextLine = this.dialogTree.find(line => line.id === reply.successTriggers);
                this._showLine(nextLine);
            } else {
                const nextLine = this.dialogTree.find(line => line.id === reply.failureTriggers);
                this._showLine(nextLine);
            }
        } else {
            if (reply.successTriggers !== undefined) {
                const nextLine = this.dialogTree.find(line => line.id === reply.successTriggers);
                this._showLine(nextLine);
            } else {
                this.closeScene(reply.callbackParam);
            }
        }
    }

    public closeScene(param = 'fastEnd') {
        this.input.keyboard.off('keydown-SPACE');
        ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"].forEach(keyCode => this.input.keyboard.off(`keyup-${keyCode}`));
        this.timedEvent?.remove();
        this.dialogDisplayGroup.clear(true, true);
        super.closeScene();
        if (this.closeCallback) {
            this.closeCallback(param);
        }
    }

    private _setText(text: string, animate: boolean) {
        return new Promise(resolve => {
            const textX = this.opts.windowX + 25;
            const textY = this.opts.windowY + 10;
            const textGameObject = this.add.text(textX, textY, '', {
                color: this.opts.textColor,
                wordWrap: {
                    width: this.opts.windowWidth - 50
                }
            }).setScrollFactor(0);
            this.dialogDisplayGroup.add(textGameObject);

            if (animate) {
                let shownLettersCounter = 0;
                if (this.timedEvent) this.timedEvent.remove();
                let zone = this.add.zone(this.opts.windowX, this.opts.windowY, this.opts.windowWidth, this.opts.windowHeight)
                    .setOrigin(0, 0).setScrollFactor(0).setInteractive();

                this.timedEvent = this.time.addEvent({
                    delay: this.opts.letterAppearanceDelay,
                    callback: () => {
                        textGameObject.setText(text.slice(0, shownLettersCounter));
                        if (text.length === shownLettersCounter) {
                            this.timedEvent.remove();
                            zone.destroy();
                            this.input.keyboard.off('keydown-SPACE');
                            resolve();
                        } else {
                            shownLettersCounter++;
                        }
                    },
                    loop: true
                });

                zone.once('pointerdown', () => {
                    zone.destroy();
                    this.input.keyboard.off('keydown-SPACE');
                    this.timedEvent.remove();
                    textGameObject.setText(text);
                    resolve();
                });
                this.input.keyboard.once('keydown-SPACE', () => {
                    zone.destroy();
                    this.timedEvent.remove();
                    textGameObject.setText(text);
                    resolve();
                });
                this.dialogDisplayGroup.add(zone);
            } else {
                textGameObject.setText(text);
                resolve();
            }
        });
    }

    private _showName() {
        if (this.speakerName) {
            const name = this.add.text(this.opts.windowX+5, this.opts.windowY - 20, this.speakerName).setDepth(this.opts.baseDepth+1);
            const nameBackground = this.add.graphics()
                .fillStyle(this.opts.backgroundColor, this.opts.backgroundAlpha)
                .fillRect(this.opts.windowX, this.opts.windowY - 25, name.width + 10, name.height + 10)
                .lineStyle(this.opts.borderThickness, this.opts.borderColor)
                .strokeRect(this.opts.windowX, this.opts.windowY - 25, name.width + 10, name.height + 10)
                .setScrollFactor(0).setDepth(this.opts.baseDepth);
            this.dialogDisplayGroup.addMultiple([name, nameBackground]);
        }
    }
}
