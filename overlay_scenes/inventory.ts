import {Player, playerInstance} from "../characters/adventurers/player.js";
import {GeneralOverlayScene} from "./generalOverlayScene.js";
import Sprite = Phaser.GameObjects.Sprite;
import Item from "../entities/item.js";
import {GAME_H, GAME_W, INVENTORY_ITEM_DESCRIPTION_H, INVENTORY_ITEM_DESCRIPTION_W} from "../config/constants.js";
import {LOCATION_SCENES} from "../index.js";

export class InventoryScene extends GeneralOverlayScene {
    private player: Player;
    private closeCallback: Function;
    private inventoryDisplayGroup: Phaser.GameObjects.Group;
    private droppedItems: Item[];

    constructor() {
        super({key: 'Inventory'});
    }

    public init({opts, closeCallback, prevScene}: { opts?: OverlaySceneOptions, closeCallback?: Function, prevScene: string }) {
        this.player = playerInstance;
        this.opts = {backgroundAlpha: 0.8};
        this.opts = {...this.opts, ...opts};
        this.closeCallback = closeCallback;
        this.parentSceneKey = prevScene;
    }

    public preload() {

    }

    public create() {
        super.create(this.parentSceneKey, this.opts);
        this.inventoryDisplayGroup = this.add.group();
        this.droppedItems = [];
        this.showInventory();
        this.events.on('wake', (scene, {opts, closeCallback, prevScene}) => {
            this.parentSceneKey = prevScene;
            this.opts = {...this.opts, ...opts};
            this.closeCallback = closeCallback;
            this.droppedItems = [];
            this.showInventory();
        });
        this.input.keyboard.on('keyup-' + 'I', () => this.closeScene());
    }

    public showInventory() {
        this._drawInventory();
        this._enableDragAndDrop();
    }

    private _enableDragAndDrop() {
        if (!this.input.eventNames().includes('drop')) {
            this.input.on('drop', (pointer, object, target) => {
                const currentItemSlotName = object.name.split('image')[0];
                const targetSlotName = target.name;
                const movedItem = this.player.inventory.find(item => item.currentSlot === currentItemSlotName);
                if (movedItem.slot.includes(targetSlotName) || targetSlotName.includes('backpack') || (movedItem.slot.includes('quickSlot') && targetSlotName.includes('quickSlot'))) {
                    this._placeItemInSlot(currentItemSlotName, targetSlotName);
                } else {
                    const originalSlot = this.inventoryDisplayGroup.getChildren().find(slot => slot.name === currentItemSlotName) as Sprite;
                    this.tweens.add({
                        targets: object,
                        x: originalSlot.x + 32,
                        y: originalSlot.y + 32,
                        ease: 'Back.easeOut',
                        duration: 500,
                    });
                }
            });
        }
    }

    private _placeItemInSlot(currentItemSlotName, targetSlotName) {
        // TODO: optimize these cycles!!!
        const displayObjects = this.inventoryDisplayGroup.getChildren();
        const targetSlot = displayObjects.find(slot => slot.name === targetSlotName) as Sprite;
        const targetSlotX = targetSlot.x;
        const targetSlotY = targetSlot.y;
        const movedItem = this.player.inventory.find(item => item.currentSlot === currentItemSlotName);
        const movedItemImage = displayObjects.find(item => item.name === currentItemSlotName + 'image');
        const itemInTargetSlot = this.player.inventory.find(item => item.currentSlot === targetSlotName);

        if (itemInTargetSlot !== undefined) {
            let slotNameToCompare = currentItemSlotName;
            if (currentItemSlotName.includes('quickSlot')) slotNameToCompare = 'quickSlot'
            if (currentItemSlotName.includes('backpack')) slotNameToCompare = 'backpack'
            if (!itemInTargetSlot.slot.includes(slotNameToCompare)) {
                this._moveItemToBackpack(itemInTargetSlot);
            } else {
                const itemInTargetSlotImage = displayObjects.find(item => item.name === targetSlotName + 'image');
                const originalSlot = displayObjects.find(slot => slot.name === currentItemSlotName) as Sprite;
                const originalSlotX = originalSlot.x;
                const originalSlotY = originalSlot.y;
                this.tweens.add({
                    targets: itemInTargetSlotImage,
                    x: originalSlotX + 32,
                    y: originalSlotY + 32,
                    ease: 'Back.easeOut',
                    duration: 500
                });
                this.player.putItemInSlot(itemInTargetSlot, currentItemSlotName);
                itemInTargetSlotImage.setName(currentItemSlotName + 'image')
            }
        }
        this.tweens.add({
            targets: movedItemImage,
            x: targetSlotX + 32,
            y: targetSlotY + 32,
            ease: 'Back.easeOut',
            duration: 500
        });
        this.player.putItemInSlot(movedItem, targetSlotName);
        movedItemImage.setName(targetSlotName + 'image');
        if (targetSlotName === 'belt' || currentItemSlotName === 'belt') {
            if (targetSlotName === 'belt') {
                this._adjustQuickSlots(movedItem.specifics.quickSlots || 0, itemInTargetSlot?.specifics.quickSlots || 0);
            } else {
                if (itemInTargetSlot) {
                    this._adjustQuickSlots(itemInTargetSlot.specifics.quickSlots || 0, movedItem.specifics.quickSlots);
                } else {
                    this._adjustQuickSlots(0, movedItem.specifics.quickSlots);
                }
            }
        }
    }

    private _drawInventory() {
        this.inventoryDisplayGroup.clear(true, true);
        this._drawDoll();
        this._drawQuickSlots();
        this._drawBackpack();
        this._drawEquippedItems();
        this._drawCharacteristics();
    }

    private _drawDoll() {
        /*        const drawZone = (zone) => {
                    this.inventoryDisplayGroup.add(this.add.graphics()
                        .fillStyle(0xff0000, 1)
                        .fillRect(zone.x + zone.input.hitArea.x, zone.y + zone.input.hitArea.y, zone.input.hitArea.width, zone.input.hitArea.height));
                };*/

        this.inventoryDisplayGroup.create(this.opts.windowX + 16, this.opts.windowY + 20, 'doll')
            .setOrigin(0, 0).setScale(0.75).setScrollFactor(0).setDepth(this.opts.baseDepth);
        const rightHand = this.add.zone(this.opts.windowX + 16, this.opts.windowY + 20 + 58, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('rightHand');
        const leftHand = this.add.zone(this.opts.windowX + 281, this.opts.windowY + 246, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('leftHand');
        const belt = this.add.zone(this.opts.windowX + 202, this.opts.windowY + 246, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('belt');
        const head = this.add.zone(this.opts.windowX + 202, this.opts.windowY + 20, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('head');
        const neck = this.add.zone(this.opts.windowX + 202, this.opts.windowY + 90, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('neck');
        const backpack = this.add.zone(this.opts.windowX + 357, this.opts.windowY + 20, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('bag');
        const ringLeft = this.add.zone(this.opts.windowX + 357, this.opts.windowY + 246, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('ringLeft');
        const ringRight = this.add.zone(this.opts.windowX + 86, this.opts.windowY + 20 + 58, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('ringRight');
        const body = this.add.zone(this.opts.windowX + 202, this.opts.windowY + 246 - 77, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('body');
        const cape = this.add.zone(this.opts.windowX + 287, this.opts.windowY + 246 + 80, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('cape');
        const gloves = this.add.zone(this.opts.windowX + 16, this.opts.windowY + 78 + 80, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('gloves');
        const tail = this.add.zone(this.opts.windowX + 94, this.opts.windowY + 246 + 86, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('tail');
        const pants = this.add.zone(this.opts.windowX + 208, this.opts.windowY + 246 + 82, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('pants');
        const boots = this.add.zone(this.opts.windowX + 210, this.opts.windowY + 246 + 162, 66, 66)
            .setOrigin(0, 0).setScrollFactor(0).setInteractive({dropZone: true}).setName('boots');

        const slotNameText = this.add.text(0, 0, '', {
            font: '16px monospace',
            color: '#000000',
            backgroundColor: '#f0d191',
            padding: {left: 2}
        }).setScrollFactor(0).setDepth(this.opts.baseDepth + 1).setVisible(false);

        const slots = [rightHand, leftHand, belt, head, neck, backpack, ringLeft, ringRight, body, cape, gloves, tail, pants, boots];
        slots.forEach(slot => {
            slot.on('pointerover', () => {
                slotNameText.setText(slot.name[0].toUpperCase() + slot.name.slice(1)).setPosition(slot.getBottomLeft().x, slot.getBottomLeft().y).setVisible(true);
            }).on('pointerout', () => {
                slotNameText.setVisible(false);
            });
        });
        this.inventoryDisplayGroup.addMultiple(slots);
    }

    private _drawQuickSlots() {
        const additionalQuickSlotsNumber = this.player.inventory.find(item => item.currentSlot === "belt")?.specifics.quickSlots || 0;
        this._adjustQuickSlots(additionalQuickSlotsNumber, -1);
    }

    private _moveItemToBackpack(item: Item) {
        let itemMoved = false;
        for (let k = 0; k < 5; k++) {
            if (!itemMoved) {
                for (let j = 0; j < 5; j++) {
                    const testedSlot = `backpack${k}_${j}`;
                    if (!this.player.inventory.find(item => item.currentSlot === testedSlot)) {
                        this._placeItemInSlot(item.currentSlot, testedSlot);
                        itemMoved = true;
                        break;
                    }
                }
            }
        }
    }

    private _adjustQuickSlots(newQuickSlotsNumber, oldQuickSlotsNumber) {
        // todo: solve inventory overflow!!!
        const displayObjects = this.inventoryDisplayGroup.getChildren();
        if (newQuickSlotsNumber < oldQuickSlotsNumber) {
            for (let i = oldQuickSlotsNumber; i > newQuickSlotsNumber; i--) {
                const itemToBeMoved = this.player.inventory.find(item => item.currentSlot === `quickSlot${i}`);
                if (itemToBeMoved) {
                    this._moveItemToBackpack(itemToBeMoved);
                }
                displayObjects.find(obj => obj.name === `quickSlot${i}`).destroy(true);
            }
        }
        if (newQuickSlotsNumber > oldQuickSlotsNumber) {
            for (let i = oldQuickSlotsNumber + 1; i < newQuickSlotsNumber + 1; i++) {
                const quickSlot = this.inventoryDisplayGroup
                    .create(this.opts.windowX + 16 + 64 * i, this.opts.windowY + this.opts.windowHeight - 64 - 16, 'inventory-slot')
                    .setOrigin(0, 0).setDisplaySize(64, 64).setName(`quickSlot${i}`).setScrollFactor(0).setDepth(this.opts.baseDepth)
                    .setInteractive({dropZone: true});

                const slotNameText = this.add.text(quickSlot.getBottomLeft().x, quickSlot.getBottomLeft().y, `Quick Slot ${i + 1}`, {
                    font: '16px monospace',
                    color: '#000000',
                    backgroundColor: '#f0d191',
                    padding: {left: 2}
                }).setScrollFactor(0).setDepth(this.opts.baseDepth + 1).setVisible(false);

                quickSlot.on('pointerover', () => {
                    slotNameText.setVisible(true);
                }).on('pointerout', () => {
                    slotNameText.setVisible(false);
                });
            }
        }
    }

    private _drawBackpack() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const slotX = this.opts.windowX + this.opts.windowWidth - 20 - 64 * 5 + 64 * i;
                const slotY = this.opts.windowY + 20 + 64 * j;
                this.inventoryDisplayGroup
                    .create(slotX, slotY, 'inventory-slot')
                    .setOrigin(0, 0).setDisplaySize(64, 64).setName(`backpack${i}_${j}`).setScrollFactor(0).setDepth(this.opts.baseDepth)
                    .setInteractive({dropZone: true});
            }
        }
    }

    private _drawEquippedItems() {
        const scene = this;
        const displayObjects = this.inventoryDisplayGroup.getChildren();
        this.player.inventory.forEach(item => {
            const slotImage = displayObjects.find(slot => slot.name === item.currentSlot) as Sprite;
            const container = this.add.container(slotImage.x + 32, slotImage.y + 32);
            const image = this.add.image(0, 0, item.sprite.key, item.sprite.frame).setDisplaySize(64, 64);
            container.add([image]);
            if (item.quantity > 1) {
                const quantityText = this.add.text(32, 32, item.quantity.toString(), {
                    font: '14px monospace',
                    color: '#000000',
                    backgroundColor: '#f0d191',
                    padding: {
                        left: 2,
                    },
                }).setOrigin(1, 1).setDepth(this.opts.baseDepth);
                container.add([quantityText]);
            }
            container.setSize(64, 64)
                .setScrollFactor(0)
                .setName(item.currentSlot + 'image').setDepth(this.opts.baseDepth + 1)
                .setInteractive();
            this.input.setDraggable(container);

            container.on('dragstart', function (pointer, dragX, dragY) {
                scene._highlightValidSlots(item.slot, true);
            });
            container.on('drag', function (pointer, dragX, dragY) {
                this.x = dragX;
                this.y = dragY;
                this.setDepth(scene.opts.baseDepth + 2);
            });
            container.on('dragend', function (pointer, something1, something2, dropped) {
                this.setDepth(scene.opts.baseDepth + 1);
                if (!dropped) {
                    scene.tweens.add({
                        targets: this,
                        x: this.input.dragStartX,
                        y: this.input.dragStartY,
                        ease: 'Back.easeOut',
                        duration: 500,
                    });
                }
                scene._drawCharacteristics();
                scene._highlightValidSlots(item.slot, false);
            });

            container.on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) {
                    this._showItemDescriptionAndActions(container, item);
                }
            });

            this.inventoryDisplayGroup.add(container);
        })
    }

    private _highlightValidSlots(slotNames: string[], showHighlight: boolean) {
        const displayObjects = this.inventoryDisplayGroup.getChildren();
        let slotsToHighlight = [];
        slotNames.filter(nameOfSlotToHighlight => nameOfSlotToHighlight !== 'backpack')
            .forEach(nameOfSlotToHighlight => {
                slotsToHighlight = [...slotsToHighlight, ...displayObjects.filter(slot => slot.name.includes(nameOfSlotToHighlight) && !slot.name.includes('image'))]
            });

        if (showHighlight) {
            slotsToHighlight.forEach(slotZone => {
                this.inventoryDisplayGroup.add(
                    this.add.graphics()
                        .lineStyle(3, 0xff0000)
                        .strokeRect(slotZone.x, slotZone.y, 66, 66).setName('highlightFrame')
                );
            })
        } else {
            displayObjects.filter(obj => obj.name === 'highlightFrame').forEach(obj => {
                obj.destroy(true);
            })
        }
    }

    private _drawCharacteristics() {
        const textX = this.opts.windowX + this.opts.windowWidth - 20 - 64 * 5;
        const textY = this.opts.windowY + 20 + 64 * 5 + 20;
        const text = `${this.player.name}
HP: ${this.player.currentCharacteristics.parameters.currentHealth}/${this.player.currentCharacteristics.parameters.health}
MP: ${this.player.currentCharacteristics.parameters.currentManna}/${this.player.currentCharacteristics.parameters.manna}
EN: ${this.player.currentCharacteristics.parameters.currentEnergy}/${this.player.currentCharacteristics.parameters.energy}
Strength: ${this.player.currentCharacteristics.attributes.strength}
Agility: ${this.player.currentCharacteristics.attributes.agility}
Intelligence: ${this.player.currentCharacteristics.attributes.intelligence}
Armor: ${this.player.currentCharacteristics.defences.armor}
Dodge: ${this.player.currentCharacteristics.defences.dodge}
Resistance: 🔥${this.player.currentCharacteristics.defences.fireResistance}❄${this.player.currentCharacteristics.defences.coldResistance}⚡${this.player.currentCharacteristics.defences.electricityResistance}☣${this.player.currentCharacteristics.defences.acidResistance}☠${this.player.currentCharacteristics.defences.poisonResistance}✨${this.player.currentCharacteristics.defences.magicResistance}
Initiative: ${this.player.currentCharacteristics.attributes.initiative}
Damage: ${this.player.getAttackDamage()}

Actions: ${this.player.getAvailableActions().join(', ')}
`;
        const textObject = this.inventoryDisplayGroup.getChildren().find(child => child.name === 'characteristicsText') as Phaser.GameObjects.Text;
        if (textObject) {
            textObject.setText(text);
        } else {
            const characteristicsText = this.add.text(textX, textY, text, {
                font: '14px monospace',
                color: '#000000',
                wordWrap: {
                    width: 32 * 10,
                },
            }).setScrollFactor(0).setDepth(this.opts.baseDepth).setName('characteristicsText');
            this.inventoryDisplayGroup.add(characteristicsText);
        }
    }

    private _showItemDescriptionAndActions(container: Phaser.GameObjects.Container, item: Item) {
        const outerZone = this.add.zone(0, 0, GAME_W, GAME_H).setOrigin(0, 0).setDepth(this.opts.baseDepth + 1).setInteractive();
        const containerX = container.x < GAME_W / 2 ? container.x + 32 : container.x - 32 - INVENTORY_ITEM_DESCRIPTION_W;
        const containerY = container.y < GAME_H / 2 ? container.y - 32 : container.y + 32 - INVENTORY_ITEM_DESCRIPTION_H;
        const descriptionContainer = this.add.container(containerX, containerY).setDepth(this.opts.baseDepth + 2);
        this.inventoryDisplayGroup.add(descriptionContainer);
        outerZone.once('pointerdown', (pointer, eventX, eventY, event) => {
            event.stopPropagation();
            outerZone.destroy(true);
            descriptionContainer.destroy(true);
        });
        const background = this.add.graphics()
            .fillStyle(this.opts.backgroundColor, 1)
            .fillRect(0, 0, INVENTORY_ITEM_DESCRIPTION_W, INVENTORY_ITEM_DESCRIPTION_H)
            .lineStyle(2, 0x000000)
            .strokeRect(0, 0, INVENTORY_ITEM_DESCRIPTION_W, INVENTORY_ITEM_DESCRIPTION_H);
        descriptionContainer.add(background);

        const textStyle = {
            font: '14px monospace',
            color: '#000000',
            wordWrap: {
                width: INVENTORY_ITEM_DESCRIPTION_W,
            },
        };

        const dropItemButton = this.add.image(INVENTORY_ITEM_DESCRIPTION_W - 32-5, 5, 'icon-item-set', 205).setOrigin(0,0);
        dropItemButton.setInteractive({useHandCursor: true});
        dropItemButton.once('pointerdown', (pointer, eventX, eventY, event) => {
            this._dropItem(item);
            event.stopPropagation();
            outerZone.destroy(true);
            descriptionContainer.destroy(true);
        });
        descriptionContainer.add(dropItemButton);

        const name = this.add.text(5, 5, item.displayName, textStyle).setOrigin(0, 0);
        descriptionContainer.add(name);
        name.setFontStyle('bold');
        const description = this.add.text(5, name.getBottomLeft().y + 15, item.description, textStyle).setOrigin(0, 0);
        descriptionContainer.add(description);

        let lastTextPosition = description.getBottomLeft().y;

        if (JSON.stringify(item.slot) !== JSON.stringify(['backpack'])) {
            const slots = this.add.text(5, description.getBottomLeft().y + 10, `Equip at: ${item.slot.filter(slot => slot !== 'backpack').join(', ')}`, textStyle).setOrigin(0, 0);
            descriptionContainer.add(slots);
            lastTextPosition = slots.getBottomLeft().y;
        }

        if (item.specifics?.damage) {
            const damage = this.add.text(5, lastTextPosition + 10, `Damage: ${item.specifics.damage}`, textStyle).setOrigin(0, 0);
            descriptionContainer.add(damage);
            lastTextPosition = damage.getBottomLeft().y;
        }
        if (item.specifics?.additionalActions) {
            const actions = this.add.text(5, lastTextPosition + 10, `Provides actions: ${item.specifics.additionalActions.join(', ')}`, textStyle).setOrigin(0, 0);
            descriptionContainer.add(actions);
            lastTextPosition = actions.getBottomLeft().y;
        }
        if (item.specifics?.additionalCharacteristics) {
            const charText = item.specifics.additionalCharacteristics.map(char => {
                let name = Object.keys(char)[0];
                let value = Object.values(char)[0];
                name = name.split('.')[1];
                name = name[0].toUpperCase() + name.slice(1);
                return `${name}: ${value}`
            }).join('\n');
            const characteristics = this.add.text(5, lastTextPosition + 10, `Characteristics:\n${charText}`, textStyle).setOrigin(0, 0);
            descriptionContainer.add(characteristics);
            lastTextPosition = characteristics.getBottomLeft().y;
        }
        const price = this.add.text(5, lastTextPosition + 10, `Sell price, for 1: ${item.sellPrice} copper\nBuy price, for 1: ${item.buyPrice} copper`, textStyle).setOrigin(0, 0);
        descriptionContainer.add(price);
        lastTextPosition = price.getBottomLeft().y;

        if (item.itemId === 'mirror-of-travel') {
            const travelButton = this.add.text(5, lastTextPosition + 10, `Fast travel`, textStyle).setOrigin(0, 0);
            travelButton.setInteractive({useHandCursor: true});
            descriptionContainer.add(travelButton);
            lastTextPosition = travelButton.getBottomLeft().y;

            travelButton.once('pointerdown', () => {
                const outerZone = this.add.zone(0, 0, GAME_W, GAME_H).setOrigin(0, 0).setDepth(this.opts.baseDepth + 1).setInteractive();
                const locationsDialogContainer = this.add.container(0, 0).setDepth(this.opts.baseDepth + 3);
                this.inventoryDisplayGroup.add(locationsDialogContainer);

                outerZone.once('pointerdown', (pointer, eventX, eventY, event) => {
                    event.stopPropagation();
                    outerZone.destroy(true);
                    locationsDialogContainer.destroy(true);
                });

                const background = this.add.graphics();
                locationsDialogContainer.add(background);

                let lastButtonPosition = 5;
                LOCATION_SCENES.forEach(location => {
                    const locationName = location.name.split('Scene')[0];
                    const locationButton = this.add.text(5, lastButtonPosition + 10, locationName, textStyle).setOrigin(0, 0);
                    locationButton.setInteractive({useHandCursor: true});
                    locationsDialogContainer.add(locationButton);
                    lastButtonPosition = locationButton.getBottomLeft().y;

                    locationButton.once('pointerdown', () => {
                        this.closeScene({switchToScene: locationName});
                    })
                })
                locationsDialogContainer.setPosition(GAME_W / 2 - INVENTORY_ITEM_DESCRIPTION_W / 2, GAME_H / 2 - lastButtonPosition / 2);
                background.fillStyle(this.opts.backgroundColor, 1)
                    .fillRect(0, 0, INVENTORY_ITEM_DESCRIPTION_W, lastButtonPosition + 15)
                    .lineStyle(2, 0x000000)
                    .strokeRect(0, 0, INVENTORY_ITEM_DESCRIPTION_W, lastButtonPosition + 15);

            })
        }
    }

    private _dropItem(item: Item) {
        this.player.removeItemFromInventory(item, item.quantity);
        const droppedItemImage = this.inventoryDisplayGroup.getChildren().find(image => image.name === item.currentSlot + 'image');
        droppedItemImage.destroy(true);
        if (item.currentSlot === 'belt') {
            this._adjustQuickSlots(0, item?.specifics.quickSlots || 0);
        }
        this._drawCharacteristics();
        this.droppedItems.push(item);
    }

    public closeScene(switchParam?) {
        super.closeScene({...switchParam, droppedItems: this.droppedItems});
    }
}
