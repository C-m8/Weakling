import GeneralLocation from '../generalLocation';
import { firstTimePatchDialog, secondTimePatchDialog } from '../../../data/dialogs/betweenVillageAndDungeon/patchDialog';
import itemsData from '../../../data/itemsData';
import Trigger from '../../../triggers/trigger';

export default class BetweenVillageAndDungeonScene extends GeneralLocation {
  private planted: { plantId: string; plantedAt: number, grown: boolean, tileIndex: number }[];

  constructor() {
    super({ key: 'BetweenVillageAndDungeon' });
    this.planted = [];
  }

  public preload() {
    super.preload();
  }

  public init(data: { toCoordinates: { x: number; y: number; } }) {
    super.init(data);
  }

  public create() {
    super.create('betweenVillageAndDungeon');
    let currentDialog = firstTimePatchDialog;
    // TODO: place plants on the proper places in array and field when some of them are collected and some are not
    const patchMapObject = this.getMapObject('Your patch');
    new Trigger({
      scene: this,
      name: patchMapObject.name,
      triggerX: patchMapObject.x,
      triggerY: patchMapObject.y,
      triggerW: patchMapObject.width,
      triggerH: patchMapObject.height,
      callback: () => {
        const plantables = [...this.player.getAllItems()
          .values()].filter((item) => item.specifics?.plantable);
        const updatedDialog = JSON.parse(JSON.stringify(currentDialog));
        const dialogLineToModify = currentDialog === firstTimePatchDialog ? 1 : 0;
        if (this.planted.length < 9) {
          plantables.forEach((plantable) => {
            updatedDialog[dialogLineToModify].replies.unshift({
              text: plantable.displayName,
              callbackParam: {
                itemId: plantable.itemId,
                resultId: plantable.specifics.plantable,
              },
            });
          });
        } else {
          updatedDialog[dialogLineToModify].replies[0] = {
            text: 'It seems like your patch is fully utilized - collect existing crops before planting new.',
            callbackParam: 'fastEnd',
          };
        }

        this.switchToScene('Dialog', {
          dialogTree: updatedDialog,
          speakerName: 'Your patch',
          closeCallback: (param: any) => {
            currentDialog = secondTimePatchDialog;
            if (param.resultId !== undefined) {
              const itemSelected = plantables.find((plantable) => plantable.itemId === param.itemId);
              this.player.removeItemFromInventory(itemSelected, 1);
              const plant = {
                plantId: param.resultId,
                plantedAt: Date.now(),
                grown: false,
                tileIndex: this.planted.length, // <------ this is wrong, must put to first empty spot!
              };
              this.planted.push(plant);
              this.drawPlant(plant);
            }
          },
        }, false);
      },
    });
  }

  public update() {
    super.update();
    this.planted.forEach((plant) => {
      if (!plant.grown && (Date.now() - plant.plantedAt > 10000)) {
        plant.grown = true;
        this.drawPlant(plant);
      }
    });
  }

  private drawPlant(plant: { tileIndex: number; plantId: string; grown: boolean; plantedAt: number }) {
    const x = plant.tileIndex % 3;
    const y = (plant.tileIndex - x) / 3;
    if (plant.grown) {
      this.erasePlant(plant.tileIndex);
      const mapObject = this.getMapObject(`Patch ${x},${y}`);
      const trigger = new Trigger({
        scene: this,
        name: mapObject.name,
        triggerX: mapObject.x,
        triggerY: mapObject.y,
        triggerW: mapObject.width,
        triggerH: mapObject.height,
        texture: itemsData[plant.plantId].sprite.texture,
        frame: itemsData[plant.plantId].sprite.frame,
        singleUse: true,
        callback: () => {
          this.player.addItemToInventory(plant.plantId, 1, undefined, this);
          this.planted = this.planted.filter((plantInList) => plantInList.tileIndex !== plant.tileIndex);
        },
      });
      // TODO: something weird is happening when create this trigger - it is displaced from requested position, thus immediate correction is needed.
      // it started when system was reworked to use createTrigger from coords and not mapObjects
      setTimeout(() => {
        trigger.image.setPosition(mapObject.x, mapObject.y);
      }, 0);
      this.player.updateAchievement('Welcome to the Farmville', undefined, undefined, 1);
    } else {
      this.map.putTileAt(157, 12 + x, 15 + y, true, 'Patch Plants');
    }
  }

  private erasePlant(tileIndex: number) {
    const x = tileIndex % 3;
    const y = (tileIndex - x) / 3;
    this.map.removeTileAt(12 + x, 15 + y, true, true, 'Patch Plants');
  }
}
