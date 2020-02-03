import { Location } from "../entities/location.js";
export class HargkakhsCaveScene extends Location {
    constructor() {
        super({ key: 'HargkakhsCave' });
    }
    preload() {
        this.preparePlugins();
    }
    init() {
    }
    create() {
        this.prepareMap('hargkakhsCave', 304, 192);
        this.layers.find(layer => layer.layer.name === 'EmptyChest').setVisible(false);
        this.chest = this.createTrigger({ objectName: 'Chest', offsetX: 304, offsetY: 192 });
        /*'Chest', () => {
        }, 'Objects', null, null, 'collide', 304, 192);*/
    }
    update() {
        var _a;
        this.updatePlayer();
        if (((_a = this.chest.body) === null || _a === void 0 ? void 0 : _a.embedded) && this.keys.space.isDown) {
            const key = this.player.inventory.find(item => { var _a; return ((_a = item.specifics) === null || _a === void 0 ? void 0 : _a.opens) === 'hargkakhsChest'; });
            if (key) {
                this.layers.find(layer => layer.layer.name === 'EmptyChest').setVisible(true);
                this.player.addItemToInventory('fancy-belt');
                this.player.addItemToInventory('work-gloves');
                this.player.removeItemFromInventory(key);
                this.chest.destroy(true);
            }
        }
    }
}
//# sourceMappingURL=hargkakhsCave.js.map