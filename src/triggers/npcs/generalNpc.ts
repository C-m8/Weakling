import * as Phaser from 'phaser';

import Item from '../../entities/item';
import Trigger from '../trigger';
import GeneralLocation from '../../scenes/locations/generalLocation';
import { DialogTree, Slots, SpriteParameters } from '../../types/my-types';
import findPath from '../../helpers/findPath';

enum NpcActionState
{
  WALKING,
  IDLE
}

export enum Direction {
  none,
  up = 1,
  down = 2,
  left = 4,
  right = 8
}
export interface NpcOptions {
  scene: GeneralLocation;
  name: string;
  triggerX?: number;
  triggerY?: number;
  spriteParams?: SpriteParameters;
  initDialog?: DialogTree;
  preInteractionCallback?: Function;
  interactionCallback?: Function;
  items?: any[];
}

export default class GeneralNpc extends Trigger {
  public dialog: DialogTree;
  protected preInteractionCallback: Function;
  private interactionCallback: Function;
  private items: Map<Slots, Item>;
  private numberOfSlots: number;

  private walkPath: Phaser.Math.Vector2[];
  private walkToTarget?: Phaser.Math.Vector2;
  private _direction: Direction;
  private _npcActionState: NpcActionState;
  public walkEvent: Phaser.Time.TimerEvent

  constructor(
    {
      scene,
      name,
      triggerX,
      triggerY,
      spriteParams,
      initDialog,
      items = [],
      preInteractionCallback = () => {
      },
      interactionCallback = () => {
      },
    }: NpcOptions,
  ) {
    if (triggerX === undefined) {
      const mapObject = scene.getMapObject(name, 'NPCs');
      triggerX = mapObject.x;
      triggerY = mapObject.y;
      spriteParams = scene.getSpriteParamsByObjectName(name, 'NPCs') || {
        texture: undefined,
        frame: undefined,
      };
      spriteParams.width = mapObject.width;
      spriteParams.height = mapObject.height;
    }
    super({
      scene,
      name,
      triggerX,
      triggerY,
      triggerW: spriteParams.width,
      triggerH: spriteParams.height,
      texture: spriteParams.texture,
      frame: spriteParams.frame,
      callback: () => {
        this.preInteractionCallback();
        if (this.dialog) {
          scene.switchToScene('Dialog', {
            dialogTree: this.dialog,
            speakerName: this.name,
            closeCallback: (param: any) => {
              this.interactionCallback(param);
            },
          }, false);
        } else {
          this.interactionCallback = interactionCallback || (() => {});
          this.interactionCallback();
        }
      },
    });

    this.walkPath = [];
    this._direction = Direction.none;
    this._npcActionState = NpcActionState.IDLE;

    this.walkEvent = this.scene.time.addEvent({
      delay: 60,
      callback: () => {
        this.walk();
      },
      loop: true,
    });

    this.walkEvent.paused = false;

    if (spriteParams.animation) this.image.anims.play(spriteParams.animation);
    this.dialog = initDialog;
    this.preInteractionCallback = preInteractionCallback;
    this.interactionCallback = interactionCallback;

    this.items = new Map<Slots, Item>();
    this.numberOfSlots = 15;
    for (let i = 0; i < Math.floor(this.numberOfSlots / 5) + 1; i += 1) {
      const slotsInRow = Math.floor((this.numberOfSlots - 5 * i) / 5) > 0 ? 5 : this.numberOfSlots % 5;
      for (let j = 0; j < slotsInRow; j += 1) {
        if (items[5 * i + j]) {
          const newItem = new Item(items[5 * i + j].itemId, items[5 * i + j].quantity);
          this.items.set(`containerSlot${j}_${i}` as Slots, newItem);
        }
      }
    }
  }

  /**
   * Needs to be called repeatedly
   * @param map
   * @param toPositionX
   * @param toPositionY
   */
  public moveCharacter(map: Phaser.Tilemaps.Tilemap, toPositionX: number, toPositionY: number) {
    const { worldX, worldY } = { worldX: toPositionX, worldY: toPositionY };

    const groundLayerObject = map.getLayer('Layer 1/Below player').tilemapLayer;
    const wallsLayerObject = map.getLayer('Layer 1/Collisions').tilemapLayer;

    const startVector = groundLayerObject.worldToTileXY(this.image.x, this.image.y);
    const targetVector = groundLayerObject.worldToTileXY(worldX, worldY);

    const generatedPath = findPath(startVector, targetVector, groundLayerObject, wallsLayerObject);
    this.walkAlong(generatedPath);
  }

  protected handlePlayerImageCollision(playerImage: Phaser.Physics.Arcade.Sprite, collisionImage: Phaser.Physics.Arcade.Sprite) {
    // to prevent the animation to play for graveNpc
    if (collisionImage.frame.texture.key === 'base-addition') return;

    if (collisionImage.anims == null && collisionImage.anims.currentFrame == null) return;

    const triggerBodyBounds = collisionImage.body.getBounds({
      x: 0, y: 0, right: 0, bottom: 0,
    });
    const playerBodyBounds = playerImage.body.getBounds({
      x: 0, y: 0, right: 0, bottom: 0,
    });

    if (triggerBodyBounds.y === playerBodyBounds.bottom) collisionImage.anims.play(`${collisionImage.texture.key}-idle-up`);
    if (triggerBodyBounds.x === playerBodyBounds.right) collisionImage.anims.play(`${collisionImage.texture.key}-idle-left`);
    if (triggerBodyBounds.bottom === playerBodyBounds.y) collisionImage.anims.play(`${collisionImage.texture.key}-idle-down`);
    if (triggerBodyBounds.right === playerBodyBounds.x) collisionImage.anims.play(`${collisionImage.texture.key}-idle-right`);
  }

  public setDialog(newDialog?: DialogTree, newInteractionCallback?: Function) {
    this.dialog = newDialog;
    if (newInteractionCallback) this.interactionCallback = newInteractionCallback;
  }

  public startTrade() {
    this.scene.switchToScene('TraderOverlay', {
      name: this.name,
      numberOfSlots: this.numberOfSlots,
      items: this.items,
      closeCallback: (itemsInContainer: Map<Slots, Item>) => {
        this.items = itemsInContainer;
      },
    }, false);
  }

  public addItemsToTrade(itemsData: { itemId: string; quantity: number }[]) {
    itemsData.forEach((item) => {
      for (let i = 0; i < Math.floor(this.numberOfSlots / 5) + 1; i += 1) {
        const slotsInRow = Math.floor((this.numberOfSlots - 5 * i) / 5) > 0 ? 5 : this.numberOfSlots % 5;
        for (let j = 0; j < slotsInRow; j += 1) {
          if (this.items.get(`containerSlot${j}_${i}` as Slots) === undefined) {
            const newItem = new Item(item.itemId, item.quantity);
            this.items.set(`containerSlot${j}_${i}` as Slots, newItem);
            return;
          }
        }
      }
      throw new Error('Trader is full, cant add items! Write more code to handle it properly!');
    });
  }

  walkAlong(path: Phaser.Math.Vector2[]) {
    if (!path || path.length <= 0) {
      return;
    }

    this._npcActionState = NpcActionState.WALKING;

    this.walkPath = path;
    this.walkTo(this.walkPath.shift()!);
  }

  private walkTo(target: Phaser.Math.Vector2) {
    this.walkToTarget = target;
    // this.walk();
  }

  public walk() {
    if (!this.image.body) {
      return;
    }

    let dx = 0;
    let dy = 0;

    if (this.walkToTarget) {
      dx = this.walkToTarget.x - this.image.x;
      dy = this.walkToTarget.y - this.image.y;

      if (Math.abs(dx) < 1) {
        dx = 0;
      }
      if (Math.abs(dy) < 1) {
        dy = 0;
      }
      if (dx === 0 && dy === 0) {
        if (this.walkPath.length > 0) {
          this.walkTo(this.walkPath.shift()!);
          return;
        }

        this.walkToTarget = undefined;
        this._npcActionState = NpcActionState.IDLE;
        this.image.anims.play(`${this.image.texture.key}-idle-${Direction[this._direction]}`);
      }
    }

    this.mimicKeys(dx, dy);
  }

  mimicKeys(dx: number, dy: number) {
    const walkLeft = dx < 0;
    const walkRight = dx > 0;
    const walkUp = dy < 0;
    const walkDown = dy > 0;

    const speed = 35;

    if (this._npcActionState === NpcActionState.IDLE) {
      this.image.setVelocity(0, 0);
      this.image.setImmovable(true);
      this.walkEvent.paused = true;
      return;
    }

    if (walkLeft) {
      this._direction = Direction.left;
      this.image.anims.play(`${this.image.texture.key}-walk-left`, true);
      this.image.setVelocity(-speed, 0);
    } else if (walkRight) {
      this._direction = Direction.right;
      this.image.anims.play(`${this.image.texture.key}-walk-right`, true);
      this.image.setVelocity(speed, 0);
    } else if (walkUp) {
      this._direction = Direction.up;
      this.image.anims.play(`${this.image.texture.key}-walk-up`, true);
      this.image.setVelocity(0, -speed);
    } else if (walkDown) {
      this._direction = Direction.down;
      this.image.anims.play(`${this.image.texture.key}-walk-down`, true);
      this.image.setVelocity(0, speed);
    } else {
      this.image.setVelocity(0, 0);
      this.image.setImmovable(true);
    }
  }
}
