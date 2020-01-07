import Player from "../entities/player.js";
import {ModalDialogPlugin} from "../plugins/modal-dialog.js";
import {InventoryPlugin} from "../plugins/inventory.js";

export class HouseScene extends Phaser.Scene {
    private player: Player;

    constructor() {
        super({key: 'House'});
    }

    public preload() {
        this.load.scenePlugin('ModalDialogPlugin', ModalDialogPlugin, 'modalDialog', 'modalDialog');
        this.load.scenePlugin('InventoryPlugin', InventoryPlugin, 'inventory', 'inventory');
    }

    public init({player}) {
        if (player) {
            this.player = player;
        } else {
            this.player = new Player();
        }
    }

    public create() {
        const map = this.make.tilemap({key: 'house'});
        const tileSet1 = map.addTilesetImage('[Base]BaseChip_pipo', 'base');
        const tileSet2 = map.addTilesetImage('castle', 'castle');

        const layer1 = map.createStaticLayer('Tile Layer 1', [tileSet1, tileSet2], 0, 0);
        const layer2 = map.createStaticLayer('Tile Layer 2', [tileSet1, tileSet2], 0, 0);
        const layer3 = map.createStaticLayer('Tile Layer 3', [tileSet1, tileSet2], 0, 0);
        //layer2.setCollisionByProperty({collides: true});

        const spawnPoint = map.findObject("Objects", obj => obj.name === "Start");
        this.player.prepareWorldImage(this, spawnPoint['x'], spawnPoint['y']);

        this.physics.add.collider(this.player.worldImage, layer2);

        const worldMapObject = map.findObject("Objects", obj => obj.name === "WorldMap");
        const worldMapPortal = this.physics.add
            .image(worldMapObject['x'], worldMapObject['y'], null)
            .setOrigin(0, 0)
            .setDisplaySize(worldMapObject['width'], worldMapObject['height'])
            .setVisible(false)
            .setImmovable();
        this.physics.add.collider(this.player.worldImage, worldMapPortal, () => this.scene.start("WorldMap"));

        const camera = this.cameras.main;
        camera.startFollow(this.player.worldImage);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        /*const houseDoorObject = map.findObject("Objects", obj => obj.name === "House Door");
        const houseDoor = this.physics.add
            .image(houseDoorObject['x'], houseDoorObject['y'], null).setOrigin(0,0)
            .setDisplaySize(houseDoorObject['width'],houseDoorObject['height'])
            .setVisible(false)
            .setImmovable();
        this.physics.add.collider(this.player.sprite, houseDoor, () => console.log('collided with the door') );*/

        const debugGraphics = this.add.graphics().setAlpha(0.25);
        layer2.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
    }

    public update() {
        this.player.update();
    }
}