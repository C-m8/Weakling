import { PreloadScene } from './scenes/preload.js';
import { WorldMapScene } from "./scenes/worldMap.js";
import { HouseScene } from "./scenes/house.js";
import { FightScene } from "./scenes/fight.js";
const zoom = 1;
const gameConfig = {
    title: 'Sample',
    type: Phaser.AUTO,
    width: 800 / zoom,
    height: 640 / zoom,
    // @ts-ignore
    pixelArt: true,
    zoom: zoom,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
        },
    },
    parent: 'game',
    backgroundColor: '#000000',
    scene: [PreloadScene, WorldMapScene, HouseScene, FightScene]
};
export const game = new Phaser.Game(gameConfig);
//# sourceMappingURL=index.js.map