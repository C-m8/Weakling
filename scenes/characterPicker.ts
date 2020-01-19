import {Player, playerInstance} from "../entities/player.js";
import {OverlayScene} from "./overlayScene.js";

export class CharacterPickerScene extends OverlayScene {
    private player: Player;

    constructor() {
        super({key: 'CharacterPicker'});
    }

    public init() {
        this.player = playerInstance;
    }

    public preload() {

    }

    public create() {
        this.prepareOverlay('WorldMap');
        this._drawCharacterOptions();
    }

    private _drawCharacterOptions() {
        const marthaBlond = this.add.image(this.opts.windowX + 192 + 128 * 0, this.opts.windowY + 184 - 16, 'martha-blond', 1)
            .setDisplaySize(128, 128).setOrigin(0, 0);
        const marthaGreen = this.add.image(this.opts.windowX + 192 + 128 * 1, this.opts.windowY + 184 - 16, 'martha-green', 1)
            .setDisplaySize(128, 128).setOrigin(0, 0);
        const marthaPink = this.add.image(this.opts.windowX + 192 + 128 * 2, this.opts.windowY + 184 - 16, 'martha-pink', 1)
            .setDisplaySize(128, 128).setOrigin(0, 0);
        const jeremyBlond = this.add.image(this.opts.windowX + 192 + 128 * 0, this.opts.windowY + 184 + 128 + 16, 'jeremy-blond', 1)
            .setDisplaySize(128, 128).setOrigin(0, 0);
        const jeremyGreen = this.add.image(this.opts.windowX + 192 + 128 * 1, this.opts.windowY + 184 + 128 + 16, 'jeremy-green', 1)
            .setDisplaySize(128, 128).setOrigin(0, 0);
        const jeremyPink = this.add.image(this.opts.windowX + 192 + 128 * 2, this.opts.windowY + 184 + 128 + 16, 'jeremy-pink', 1)
            .setDisplaySize(128, 128).setOrigin(0, 0);
        const chars = [marthaBlond, marthaGreen, marthaPink, jeremyBlond, jeremyGreen, jeremyPink];
        chars.forEach(char => {
            char.setInteractive();
            const self = this;
            char.on('pointerdown', function () {
                self.player.worldImageSpriteParams = {texture: this.texture.key, frame: 1};
                const anims = self.anims;
                anims.remove('walk_down');
                anims.remove('walk_up');
                anims.remove('walk_right');
                anims.remove('walk_left');
                anims.remove('idle_up');
                anims.remove('idle_down');
                anims.remove('idle_left');
                anims.remove('idle_right');
                anims.create({
                    key: 'walk_down',
                    frames: anims.generateFrameNames(self.player.worldImageSpriteParams.texture, {start: 0, end: 2}),
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: 'walk_up',
                    frames: anims.generateFrameNames(self.player.worldImageSpriteParams.texture, {start: 9, end: 11}),
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: 'walk_right',
                    frames: anims.generateFrameNames(self.player.worldImageSpriteParams.texture, {start: 6, end: 8}),
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: 'walk_left',
                    frames: anims.generateFrameNames(self.player.worldImageSpriteParams.texture, {start: 3, end: 5}),
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: 'idle_up',
                    frames: [{key: self.player.worldImageSpriteParams.texture, frame: 10}],
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: 'idle_down',
                    frames: [{key: self.player.worldImageSpriteParams.texture, frame: 1}],
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: 'idle_left',
                    frames: [{key: self.player.worldImageSpriteParams.texture, frame: 4}],
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: 'idle_right',
                    frames: [{key: self.player.worldImageSpriteParams.texture, frame: 7}],
                    frameRate: 10,
                    repeat: -1
                });
                self.scene.get('WorldMap')['playerImage'].anims.play("idle_up");
                self.closeScene();
            })
        })
    }
}