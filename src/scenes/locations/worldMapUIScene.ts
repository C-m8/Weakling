import * as Phaser from 'phaser';

import GeneralLocation from './generalLocation';
import {
  DEBUG, GAME_W, TILE_SIZE,
} from '../../config/constants';

export default class WorldMapUIScene extends Phaser.Scene {
  private locationScene: GeneralLocation;
  private cursorCoordinatesText: Phaser.GameObjects.Text;
  constructor() {
    super('WorldMapUIScene');
  }

  create(locationScene: GeneralLocation) {
    // This is a hack needed to avoid UI scene being show during overlay scenes, it checks if current active scene is a Location Scene.
    // Without it, it will happen when one overlay quickly switched to another one - like when dialog switched to location and then instantly to Trader inventory or container
    // It caused by fact that events, like scene.launch and scene.stop, are async and not guaranteed to be received in order emitted...
    if (!(this.scene.manager.getScenes(true)[0] instanceof GeneralLocation)) {
      // console.log('Trying to create UI scene while no Location Scene is running - aborting');
      this.scene.stop('WorldMapUIScene');
      return;
    }
    console.log('creating UI');
    this.scene.moveAbove(locationScene.scene.key, 'WorldMapUIScene');
    this.locationScene = locationScene;
    const buttons = [{
      hoverText: 'Achievements (K)',
      icon: { texture: 'icons', frame: 'icons/coins/large-coin-with-crown' },
      onClick: () => { this.locationScene.switchToScene('Achievements', {}, false); },
      hotKeys: ['keyup-K'],
    }, {
      hoverText: 'Quest Journal (J)',
      icon: { texture: 'icons', frame: 'icons/books-and-scrolls/book-with-bookmark' },
      onClick: () => { this.locationScene.switchToScene('QuestLog', {}, false); },
      hotKeys: ['keyup-J'],
    }, {
      hoverText: 'Options (O, ESC)',
      icon: { texture: 'icons', frame: 'icons/music/harp' },
      onClick: () => { this.locationScene.switchToScene('Options', {}, false); },
      hotKeys: ['keyup-O', 'keyup-ESC'],
    }, {
      hoverText: 'Inventory (I)',
      icon: { texture: 'icons', frame: 'icons/bags/green-bag' },
      onClick: () => { this.locationScene.switchToScene('Inventory', {}, false); },
      hotKeys: ['keyup-I'],
    }];

    let iconBaseSize = TILE_SIZE;

    if (this.sys.game.device.os.android || this.sys.game.device.os.iOS || this.sys.game.device.os.iPad || this.sys.game.device.os.iPhone) {
      iconBaseSize *= 1.5;
    }

    // topMenuBackgroundGraphics
    this.add.graphics()
      .setScrollFactor(0)
      .fillStyle(0xf0d191, 0.8)
      .fillRect(+GAME_W - iconBaseSize / 2 - buttons.length * iconBaseSize * 2, iconBaseSize / 2,
        buttons.length * iconBaseSize * 2, iconBaseSize * 2)
      .lineStyle(3, 0x907748)
      .strokeRect(+GAME_W - iconBaseSize / 2 - buttons.length * iconBaseSize * 2, iconBaseSize / 2,
        buttons.length * iconBaseSize * 2, iconBaseSize * 2)
      .setDepth(10 - 1);

    buttons.forEach((button, i) => {
      const buttonX = +GAME_W - (buttons.length - i) * iconBaseSize * 2;
      const buttonY = iconBaseSize;
      this.add.graphics()
        .setScrollFactor(0)
        .fillStyle(0xf0d191, 0.8)
        .fillRect(buttonX, buttonY, iconBaseSize, iconBaseSize)
        .lineStyle(3, 0x907748)
        .strokeRect(buttonX, buttonY, iconBaseSize, iconBaseSize)
        .setDepth(10 - 1);
      const iconSprite = this.add.sprite(buttonX, buttonY, button.icon.texture, button.icon.frame)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDisplaySize(iconBaseSize, iconBaseSize)
        .setInteractive({ useHandCursor: true })
        .setDepth(10 - 1)
        .on('pointerdown', button.onClick);

      // TODO: figure out why hover text does not work on half of the locations..
      const hoverText = this.add.text(buttonX - iconBaseSize, buttonY + iconBaseSize, button.hoverText, {
        backgroundColor: 'lightgrey',
        color: 'black',
      }).setDepth(10).setVisible(false);
      iconSprite
        .on('pointerover', () => hoverText.setVisible(true))
        .on('pointerout', () => hoverText.setVisible(false));

      button.hotKeys.forEach((hotKey) => {
        this.input.keyboard.off(hotKey);
        this.input.keyboard.on(hotKey, button.onClick);
      });
    });

    if (DEBUG) {
      this.add.graphics()
        .setScrollFactor(0)
        .fillStyle(0xf0d191, 0.8)
        .fillRect(iconBaseSize, iconBaseSize, iconBaseSize, iconBaseSize)
        .lineStyle(3, 0x907748)
        .strokeRect(iconBaseSize, iconBaseSize, iconBaseSize, iconBaseSize)
        .setDepth(10 - 1);
      const allItemsIconImage = this.add.image(iconBaseSize, iconBaseSize, 'icons', 'icons/chests/overgrown-chest')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDisplaySize(iconBaseSize, iconBaseSize)
        .setInteractive({ useHandCursor: true })
        .setDepth(10 - 1);
      allItemsIconImage.on('pointerdown', () => {
        this.locationScene.switchToScene('AllItems', {}, false);
      });

      this.cursorCoordinatesText = this.add.text(0, 0, '', {
        color: 'black',
        backgroundColor: '#f0d191',
      })
        .setDepth(1000)
        .setScrollFactor(0)
        .setOrigin(0, 0);
    }
  }

  update() {
    if (DEBUG) {
      const cursorX = Math.round(this.input.mousePointer.x);
      const cursorY = Math.round(this.input.mousePointer.y);
      this.cursorCoordinatesText.setText(`${cursorX} ${cursorY}`);
    }
  }
}