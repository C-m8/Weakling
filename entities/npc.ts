import {items} from "../actionsAndEffects/items.js";

export default class Npc {
    public inventory: Item[];
    public dialog: DialogTree;
    public image: Phaser.Physics.Arcade.Image;
    private dialogCallback: Function;

    constructor(scene, name: string, position, texture: string, frame: number, initDialog?: DialogTree, initDialogCallback?: Function, items?: any[]) {

        this.image = scene.physics.add
            .image(position['x'], position['y'], texture, frame)
            .setOrigin(0, 0)
            .setDisplaySize(position['width'], position['height'])
            .setImmovable();

        if (initDialog) {
            this.dialog = initDialog;
            this.dialogCallback = initDialogCallback || (() => {});
            let isDialogClosed = true;
            scene.physics.add.collider(scene.playerImage, this.image, () => {
                if (isDialogClosed && this.dialog) {
                    isDialogClosed = false;
                    scene.modalDialog.showDialog(this.dialog, scene.player, {}, (param) => {
                        isDialogClosed = true;
                        this.dialogCallback(param);
                    });
                }
            });
        }

        this.inventory = [];
        items?.forEach(item => this.addItemToInventory(item.itemId, item.quantity));
    }

    public setDialog(newDialog?: DialogTree, newDialogCallback?: Function) {
        this.dialog = newDialog;
        this.dialogCallback = newDialogCallback || (() => {});
    }

    public addItemToInventory(itemId, quantity = 1): Item {
        // todo? might have to do deep copy...
        const item = {...items[itemId]};
        if (item.stackable) {
            item.quantity = quantity;
            const existingItem = this.inventory.find(existingItem => existingItem.itemId === item.itemId);
            if (existingItem) {
                existingItem.quantity += item.quantity;
                return existingItem;
            }
        }

        this.inventory.push(item);
        return item;
    }

    public removeItemFromInventory(item: Item, quantity = 1) {
        if (!this.inventory.includes(item) || quantity > item.quantity) {
            throw 'Trying to remove non-existing item (or more items than possessed)!'
        }
        if (quantity === item.quantity || !item.quantity) {
            this.inventory = this.inventory.filter(existingItem => existingItem !== item)
        } else {
            item.quantity -= quantity;
        }
    }
}
