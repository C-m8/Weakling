import { GeneralItemManipulatorScene } from "./generalItemManipulator.js";
import { backpackSlotNames, dollSlotNames, quickSlotNames } from "../../data/items/itemSlots.js";
export class InventoryScene extends GeneralItemManipulatorScene {
    constructor() {
        super({ key: 'Inventory' });
    }
    init({ opts, closeCallback, prevScene }) {
        super.init({ opts, closeCallback, prevScene });
    }
    preload() {
    }
    create() {
        var _a;
        super.create();
        this.numberOfQuickSlots = ((_a = this.player.getItemInSlot("belt")) === null || _a === void 0 ? void 0 : _a.specifics.quickSlots) || 1;
        this._showInventory();
        this.input.keyboard.on('keyup-' + 'I', () => this.closeScene());
    }
    _showInventory() {
        this._drawDoll();
        this._drawQuickSlots();
        this._drawBackpack();
        this._createItemsMap(this.player.getAllItems(), (fromSlot, toSlot, itemR, swappingIsFinished) => {
            console.log(`Item %c${itemR.item.itemId}%c was moved from %c${fromSlot}%c to %c${toSlot}%c, swapping is finished: %c${swappingIsFinished}`, `color: aqua`, `color: while`, `color: red`, `color: while`, `color: red`, `color: while`, `color: ${swappingIsFinished ? 'green' : 'red'}`);
            if (this.player.getItemInSlot(fromSlot) === itemR.item) {
                this.player.removeItemFromInventory(this.player.getItemInSlot(fromSlot), this.player.getItemInSlot(fromSlot).quantity);
            }
            if (this.player.getItemInSlot(toSlot)) {
                this.player.removeItemFromInventory(this.player.getItemInSlot(toSlot), this.player.getItemInSlot(toSlot).quantity);
            }
            const playerInventorySlots = [...dollSlotNames, ...backpackSlotNames, ...quickSlotNames];
            if (playerInventorySlots.includes(toSlot)) {
                this.player.addItemToInventory(itemR.item, itemR.item.quantity, toSlot);
            }
            // we do not want to adjust quickSlots until the swapping is done so that items not fly away from quickSlots until final item composition is settled
            if (swappingIsFinished) {
                this._adjustQuickSlots();
                this._drawCharacteristics();
            }
        });
        this._drawCharacteristics();
        this._enableDragAndDrop();
    }
    _drawDoll() {
        this.add.sprite(this.opts.windowX + 16, this.opts.windowY + 20, 'doll')
            .setOrigin(0, 0).setScale(0.75).setScrollFactor(0).setDepth(this.opts.baseDepth);
        const dollZoneCoords = {
            rightHand: { x: 16, y: 78 },
            leftHand: { x: 281, y: 246 },
            belt: { x: 202, y: 246 },
            head: { x: 202, y: 20 },
            neck: { x: 202, y: 92 },
            bag: { x: 357, y: 20 },
            ringLeft: { x: 357, y: 246 },
            ringRight: { x: 86, y: 78 },
            body: { x: 202, y: 246 - 77 },
            cape: { x: 287, y: 246 + 82 },
            gloves: { x: 16, y: 78 + 80 },
            tail: { x: 94, y: 246 + 86 },
            pants: { x: 208, y: 246 + 82 },
            boots: { x: 210, y: 246 + 162 },
        };
        Object.entries(dollZoneCoords).forEach(([name, coords]) => {
            const zone = this._createSlot(name, coords.x, coords.y, true);
            /*this.add.graphics()
                .fillStyle(0xff0000, 1)
                .fillRect(zone.x + zone.input.hitArea.x, zone.y + zone.input.hitArea.y, zone.input.hitArea.width, zone.input.hitArea.height);*/
        });
    }
    _drawQuickSlots() {
        for (let i = 0; i < this.numberOfQuickSlots; i++) {
            this._createSlot(`quickSlot${i}`, 16 + 64 * i, this.opts.windowHeight - 64 - 16);
        }
    }
    _drawBackpack() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const slotX = this.opts.windowWidth - 20 - 64 * 5 + 64 * i;
                const slotY = 20 + 64 * j;
                this._createSlot(`backpack${i}_${j}`, slotX, slotY);
            }
        }
    }
    _adjustQuickSlots() {
        var _a;
        const oldQuickSlotsNumber = this.numberOfQuickSlots;
        const newQuickSlotsNumber = ((_a = this.player.getItemInSlot("belt")) === null || _a === void 0 ? void 0 : _a.specifics.quickSlots) || 1;
        console.log(`Adjusting quickSlots from ${oldQuickSlotsNumber} to ${newQuickSlotsNumber}`);
        this.numberOfQuickSlots = newQuickSlotsNumber;
        if (newQuickSlotsNumber < oldQuickSlotsNumber) {
            for (let i = oldQuickSlotsNumber - 1; i > newQuickSlotsNumber - 1; i--) {
                const itemToBeMoved = this.itemsMap.get(`quickSlot${i}`);
                if (itemToBeMoved) {
                    const emptyBackPackSlot = this.player.getEmptyBackpackSlot();
                    if (emptyBackPackSlot) {
                        this._moveItemFromSlotToSlot(`quickSlot${i}`, emptyBackPackSlot);
                    }
                    else {
                        this._dropItem(`quickSlot${i}`);
                    }
                }
                this.slotsDisplayGroup.getChildren().find(obj => obj.name === `quickSlot${i}`).destroy(true);
            }
        }
        if (newQuickSlotsNumber > oldQuickSlotsNumber) {
            for (let i = oldQuickSlotsNumber; i < newQuickSlotsNumber; i++) {
                this._createSlot(`quickSlot${i}`, 16 + 64 * i, this.opts.windowHeight - 64 - 16);
            }
        }
    }
    _drawCharacteristics() {
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

Actions: ${this.player.getAvailableActions().join(', ')}`;
        if (this.characteristicsText)
            this.characteristicsText.destroy(true);
        this.characteristicsText = this.add.text(textX, textY, text, {
            font: '14px monospace',
            color: '#000000',
            wordWrap: {
                width: 32 * 10,
            },
        }).setScrollFactor(0).setDepth(this.opts.baseDepth).setName('characteristicsText');
    }
}
//# sourceMappingURL=inventory.js.map