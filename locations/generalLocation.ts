import {Player, playerInstance} from "../characters/adventurers/player.js";
import Item from "../entities/item.js";
import {GAME_W} from "../config/constants.js";

export class GeneralLocation extends Phaser.Scene {
    public player: Player;
    public playerImage: Phaser.Physics.Arcade.Sprite;
    public keys: { [key: string]: any };
    public layers: (Phaser.Tilemaps.StaticTilemapLayer | Phaser.Tilemaps.DynamicTilemapLayer)[];
    public map: Phaser.Tilemaps.Tilemap;
    public prevSceneKey: string;
    protected triggers: { image: Phaser.Physics.Arcade.Image, callback: Function, type: 'overlap' | 'collide' | 'activate' | 'activateOverlap', name: string }[];
    private cooldown: number;
    private offsetX: number;
    private offsetY: number;

    constructor(sceneSettings) {
        super(sceneSettings);
        this.triggers = [];
        this.cooldown = 0;
    }

    public preparePlugins() {
    }

    public prepareMap(mapKey, layerOffsetX = 0, layerOffsetY = 0) {
        this.map = this.make.tilemap({key: mapKey});
        this.offsetX = layerOffsetX;
        this.offsetY = layerOffsetY;

        this.player = playerInstance;
        const spawnPoint = this.getMapObject("Start");
        if (spawnPoint) {
            const playerData = this.player.prepareWorldImage(this, spawnPoint['x'] + this.offsetX, spawnPoint['y'] + this.offsetY);
            this.playerImage = playerData.worldImage;
            this.keys = playerData.keys;
            const camera = this.cameras.main;
            camera.startFollow(this.playerImage);
            camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            camera.setDeadzone(200, 100);
            this.showOpenInventoryIcon();
        }

        const tilesets = [];
        this.map.tilesets.forEach(tileset => {
            tilesets.push(this.map.addTilesetImage(tileset.name, tileset.name))
        });

        this.layers = [];
        this.map.layers.forEach(layer => {
            let createdLayer;
            if (Array.isArray(layer.properties) && layer.properties.find(prop => prop.name === 'dynamic' && prop.value === true)) {
                createdLayer = this.map.createDynamicLayer(layer.name, tilesets, this.offsetX, this.offsetY);
            } else {
                createdLayer = this.map.createStaticLayer(layer.name, tilesets, this.offsetX, this.offsetY);
            }
            if (layer.alpha !== 1) createdLayer.setAlpha(layer.alpha);
            this.layers.push(createdLayer);
            // lol kek if there is no props then it is an object, otherwise - array.. Phaser bug?
            if (Array.isArray(layer.properties) && layer.properties.find(prop => prop.name === 'hasCollisions')) {
                createdLayer.setCollisionByProperty({collides: true});
                this.setSidesCollisions(createdLayer.layer);
                this.physics.add.collider(this.playerImage, createdLayer);
            }
            if (Array.isArray(layer.properties) && layer.properties.find(prop => prop.name === 'fringe')) {
                createdLayer.setDepth(1);
            }
        });

        this.map.getObjectLayer('Doors/Doors Objects')?.objects.forEach(object => {
            const spriteParams = this.getSpriteParamsByObjectName(object.name, 'Doors/Doors Objects');
            const texture = spriteParams.key;
            const frame = spriteParams.frame as number;
            // Todo: there must be a better way to do that but I am way too tired not to find it...
            const trigger = this.createTrigger({
                objectName: object.name,
                objectLayer: 'Doors/Doors Objects',
                texture: texture,
                frame: frame,
                interaction: 'activate',
                callback: () => {
                    trigger.image.disableBody();
                    trigger.image.disableInteractive();
                    this.layers.find(layer =>layer.layer.name === 'Doors/Doors Fringe').getTileAtWorldXY(trigger.image.x+ 16, trigger.image.y-16).setVisible(false);
                    this.triggers = this.triggers.filter(triggerInArray => triggerInArray.image !== trigger.image);
                    trigger.image.anims.play('open_door');
                    trigger.image.y-=64;
                    trigger.image.body.setOffset(0,64);
                },
            });
        });

        this.map.getObjectLayer('Containers')?.objects.forEach(object => {
            const spriteParams = this.getSpriteParamsByObjectName(object.name, 'Containers');
            const texture = spriteParams.key;
            const frame = spriteParams.frame as number;
            const openedFrame = object.properties.find(prop => prop.name === 'openedFrame')?.value;
            const trigger = this.createTrigger({
                objectName: object.name,
                objectLayer: 'Containers',
                texture: texture,
                frame: frame,
                interaction: 'activate',
                callback: () => {
                    trigger.image.setFrame(openedFrame);
                    this.triggers = this.triggers.filter(triggerInArray => triggerInArray !== trigger);
                },
            });
        });

        this.map.getObjectLayer('Enemies')?.objects.forEach(object => {
            const enemyImage = object.properties.find(prop => prop.name === 'image')?.value;
            const enemies = JSON.parse(object.properties.find(prop => prop.name === 'enemies')?.value);
            this.createTrigger({
                objectName: object.name,
                objectLayer: 'Enemies',
                texture: enemyImage,
                frame: null,
                interaction: 'activate',
                callback: () => {
                    this.switchToScene('Battle', {enemies: enemies, enemyName: object.name});
                },
            });
        });

        this.map.getObjectLayer('Waypoints')?.objects.forEach(object => {
            const toLocation = object.properties.find(prop => prop.name === 'location')?.value;
            let toCoordinates = object.properties.find(prop => prop.name === 'toCoordinates')?.value;
            if (toCoordinates) toCoordinates = JSON.parse(toCoordinates);
            this.createTrigger({
                objectName: object.name,
                objectLayer: 'Waypoints',
                texture: null,
                frame: null,
                interaction: 'activate',
                callback: () => {
                    if (toLocation) {
                        this.switchToScene(toLocation);
                    }
                    if (toCoordinates) {
                        this.playerImage.setPosition(toCoordinates.x * 32 + this.offsetX, toCoordinates.y * 32 + this.offsetY);
                    }
                },
            });
        });

        this.map.getObjectLayer('Items')?.objects.forEach(object => {
            const itemId = object.properties.find(prop => prop.name === 'itemId')?.value;
            const itemQuantity = object.properties.find(prop => prop.name === 'quantity')?.value;
            const item = new Item(itemId, itemQuantity);
            let texture = item.sprite.key;
            let frame = item.sprite.frame;
            if (object.gid) {
                const spriteParams = this.getSpriteParamsByObjectName(object.name, 'Items');
                texture = spriteParams.key;
                frame = spriteParams.frame as number;
            }
            const trigger = this.createTrigger({
                objectName: object.name,
                objectLayer: 'Items',
                texture: texture,
                frame: frame,
                interaction: 'activate',
                callback: () => {
                    this.player.addItemToInventory(itemId, itemQuantity);
                    trigger.image.destroy(true);
                },
            });
        });

        this.map.getObjectLayer('Messages')?.objects.forEach(object => {
            const text = object.properties.find(prop => prop.name === 'text')?.value;
            const interaction = object.properties.find(prop => prop.name === 'interaction')?.value;
            const singleUse = object.properties.find(prop => prop.name === 'singleUse')?.value;
            const trigger = this.createTrigger({
                objectName: object.name,
                objectLayer: 'Messages',
                texture: null,
                frame: null,
                interaction: interaction,
                callback: () => {
                    this.switchToScene('Dialog', {
                        dialogTree: [{
                            id: 'message',
                            text: text,
                            replies: [{
                                text: '(End)',
                                callbackParam: 'fastEnd'
                            }]
                        }],
                        closeCallback: (param) => {
                            if (singleUse) {
                                trigger.image.destroy(true);
                            }
                        }
                    }, false);
                },
            });
        });

        this.physics.world.setBounds(this.offsetX, this.offsetY, this.map.widthInPixels, this.map.heightInPixels);

        this.events.on('wake', (scene, data) => {
            if (data?.defeatedEnemy) {
                this.triggers.find(trigger => trigger.name === data.defeatedEnemy).image.destroy(true);
            }
        });

        if (mapKey !== 'battle') this.createDebugButton();
    }

    public getSpriteParamsByObjectName(objectName: string, objectLayer = 'Objects'): Phaser.Types.GameObjects.Sprite.SpriteConfig {
        const gid = this.getMapObject(objectName, objectLayer)['gid'];
        for (let i = 0; i < this.map.tilesets.length; i++) {
            const tileset = this.map.tilesets[i];
            if (gid >= tileset.firstgid && gid < tileset.firstgid + tileset.total) {
                return {key: tileset.name, frame: gid - tileset.firstgid}
            }
        }
    }

    private setSidesCollisions(layer) {
        for (let ty = 0; ty < layer.height; ty++) {
            for (let tx = 0; tx < layer.width; tx++) {
                const tile = layer.data[ty][tx];

                if (!tile) continue;

                if (tile.properties['collideSides']) {
                    const directions = JSON.parse(tile.properties['collideSides']);
                    if ((tx !== 0) && directions.includes('left') && !layer.data[ty][tx - 1].collideRight) {
                        tile.setCollision(true, tile.collideRight, tile.collideUp, tile.collideDown, false);
                        layer.data[ty][tx - 1].setCollision(layer.data[ty][tx - 1].collideLeft, true, layer.data[ty][tx - 1].collideUp, layer.data[ty][tx - 1].collideDown, false);
                    }
                    if ((tx !== layer.width - 1) && directions.includes('right') && !layer.data[ty][tx + 1].collideLeft) {
                        tile.setCollision(tile.collideLeft, true, tile.collideUp, tile.collideDown, false);
                        layer.data[ty][tx + 1].setCollision(true, layer.data[ty][tx + 1].collideRight, layer.data[ty][tx + 1].collideUp, layer.data[ty][tx + 1].collideDown, false);
                    }
                    if ((ty !== 0) && directions.includes('up') && !layer.data[ty - 1][tx].collideDown) {
                        tile.setCollision(tile.collideLeft, tile.collideRight, true, tile.collideDown, false);
                        layer.data[ty - 1][tx].setCollision(layer.data[ty - 1][tx].collideLeft, layer.data[ty - 1][tx].collideRight, layer.data[ty - 1][tx].collideUp, true, false);
                    }
                    if ((ty !== layer.height - 1) && directions.includes('down') && !layer.data[ty + 1][tx].collideUp) {
                        tile.setCollision(tile.collideLeft, tile.collideRight, tile.collideUp, true, false);
                        layer.data[ty + 1][tx].setCollision(layer.data[ty + 1][tx].collideLeft, layer.data[ty + 1][tx].collideRight, true, layer.data[ty + 1][tx].collideDown, false);
                    }
                }
            }
        }
    };

    public showOpenInventoryIcon(opts?: Object, closeCallback?: Function) {
        const inventoryGraphics = this.add.graphics().setScrollFactor(0)
            .fillStyle(0xf0d191, 0.8)
            .fillRect(+GAME_W - 32 - 64, 32, 64, 64)
            .lineStyle(3, 0x907748)
            .strokeRect(+GAME_W - 32 - 64, 32, 64, 64)
            .setDepth(10 - 1);
        const inventoryIconImage = this.add.image(+GAME_W - 32 - 64, 32, 'bag-green')
            .setOrigin(0, 0,).setScrollFactor(0).setScale(2).setInteractive().setDepth(10 - 1);
        inventoryIconImage.on('pointerdown', () => {
            this.switchToScene('Inventory', {opts, closeCallback}, false);
        });
        this.input.keyboard.off('keyup-I');
        this.input.keyboard.on('keyup-I', () => {
            this.switchToScene('Inventory', {opts, closeCallback}, false);
        })
    }

    public createTrigger(
        {
            objectName,
            callback = () => {
            },
            objectLayer = 'Objects',
            texture = null,
            frame = null,
            interaction = 'activate',
            offsetX = this.offsetX,
            offsetY = this.offsetY
        }: TriggerParams
    ) {
        const object = this.getMapObject(objectName, objectLayer);
        if (!object) {
            console.log(`Object ${objectName} is not found on ${objectLayer} layer of the map`, this.map);
            return;
        }
        const triggerImage = this.physics.add
            .sprite(object['x'] + offsetX, object['y'] + offsetY, texture, frame)
            .setOrigin(0, 0)
            .setDisplaySize(object['width'], object['height'])
            .setImmovable();
        if (texture === null) {
            triggerImage.setVisible(false)
        }
        if (object['gid']) {
            // Phaser and Tiled are very inconsistent when it comes to how they work with different types of objects.....
            // TODO: fix once Tiled and\or phaser figure it out...
            triggerImage.y -= 32;
        }
        if (interaction === 'collide') {
            this.physics.add.collider(this.playerImage, triggerImage, () => callback());
        }
        if (interaction === 'overlap') {
            this.physics.add.overlap(this.playerImage, triggerImage, () => callback());
        }
        if (interaction === 'activate') {
            this.physics.add.collider(this.playerImage, triggerImage);
        }
        if (interaction === 'activateOverlap') {
            this.physics.add.overlap(this.playerImage, triggerImage);
        }
        //TODO: might need rework to support callback update...
        const trigger  = {image: triggerImage, callback: callback, type: interaction, name: objectName};
        this.triggers.push(trigger);
        return trigger;
    }

    public getMapObject(objectName: string, objectLayer = 'Objects'): Phaser.GameObjects.GameObject {
        const object = this.map.findObject(objectLayer, obj => obj.name === objectName);
        if (!object) console.log(`Object ${objectName} was not found on ${objectLayer} layer!`);
        return object;
    }

    public updatePlayer() {
        this.player.update(this.playerImage, this.keys);
        if (this.keys.space.isDown) {
            if (this.cooldown === 0) {
                this.cooldown = 50;
                for (let i = 0; i < this.triggers.length; i++) {
                    const trigger = this.triggers[i];
                    if (trigger.type === 'activate' || trigger.type === 'activateOverlap') {
                        //checking if player is looking at the trigger image
                        if ( trigger.type === 'activateOverlap' ||
                            ((trigger.image.getTopLeft().y === this.playerImage.getBottomRight().y) && [0, 1, 2].includes(Number(this.playerImage.frame.name))) ||
                            ((trigger.image.getTopLeft().x === this.playerImage.getBottomRight().x) && [6, 7, 8].includes(Number(this.playerImage.frame.name))) ||
                            ((trigger.image.getBottomRight().y === this.playerImage.getTopLeft().y) && [9, 10, 11].includes(Number(this.playerImage.frame.name))) ||
                            ((trigger.image.getBottomRight().x === this.playerImage.getTopLeft().x && [3, 4, 5].includes(Number(this.playerImage.frame.name))))
                        ) {
                            const image = trigger.image;
                            const callback = trigger.callback;
                            const bodies = this.physics.overlapRect(image.x, image.y, image.displayWidth + 2, image.displayHeight + 2);
                            // @ts-ignore
                            if (bodies.includes(this.playerImage.body) && bodies.includes(image.body)) {
                                callback();
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (this.cooldown !== 0) this.cooldown--;
    }

    public createDebugButton() {
        const debugButton = this.add.image(32, 32, 'debug-icon').setOrigin(0, 0).setInteractive().setScrollFactor(0).setDepth(100);
        let debugModeOn = false;
        const debugGraphics = this.add.graphics().setAlpha(0.25).setVisible(debugModeOn);
        this.layers.forEach(layer => {
            if (Array.isArray(layer.layer.properties) && layer.layer.properties.find(prop => prop.name === 'hasCollisions')) {
                layer.renderDebug(debugGraphics, {
                    tileColor: null,
                    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
                    faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
                });
            }
        });
        debugButton.on('pointerdown', () => {
            debugModeOn = !debugModeOn;
            debugGraphics.setVisible(debugModeOn);
        });
        this.input.keyboard.off('keyup-F1');
        this.input.keyboard.on('keyup-F1', () => {
            debugModeOn = !debugModeOn;
            debugGraphics.setVisible(debugModeOn);
        })
    }

    public switchToScene(sceneKey: string, data: object = {}, shouldSleep = true) {
        //console.log(`Switching from %c${this.scene.key}%c to %c${sceneKey}%c. Should %c${this.scene.key}%c turn off %c(sleep): ${shouldSleep}`, 'color: red', 'color: auto', 'color: red', 'color: auto', 'color: red', 'color: auto', 'color: red');
        // TODO: figure out proper way to stop player from sticky controls - caused by scene pausing...
        // further investigation - confirmed in FF, dunno about other browsers. If take away focus from the window and back - no bug.
        // still dont know how to fix properly..
        // this event handler should not be here (it actually should not exist at all) but keeping it here for easier port of the fix..
        // NEW INFO - apparently this does the fix, though mechanisms changed since it was detected so not sure, keeping old solution just in case
        this.input.keyboard.resetKeys();
        //if (this.keys) Object.values(this.keys).forEach(key => key.isDown = false);

        if (shouldSleep) {
            this.scene.sleep(this.scene.key);
        } else {
            this.scene.pause(this.scene.key);
        }
        this.scene.run(sceneKey, {...data, prevScene: this.scene.key});
    }
}