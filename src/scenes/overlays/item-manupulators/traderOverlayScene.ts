import Item from '../../../entities/item';
import ContainerOverlayScene from './containerOverlayScene';
import { backpackSlotNames, containerSlotNames } from '../../../data/items/itemSlots';
import prepareLog from '../../../helpers/logger';
import { Slots } from '../../../types/my-types';

export default class TraderOverlayScene extends ContainerOverlayScene {
  private npcMoney?: number;
  private playerMoney?: number;

  constructor() {
    super({ key: 'TraderOverlay' });
  }

  public create() {
    super.create();
    this.setCurrentCopperAmount();
    this.updatePriceTags();
  }

  private setCurrentCopperAmount() {
    this.itemsMap.forEach((itemRepresentation, currentSlot) => {
      if (currentSlot.startsWith('containerSlot') && itemRepresentation.item.itemId === 'copper-pieces') {
        this.npcMoney = itemRepresentation.item.quantity;
      } else if (itemRepresentation.item.itemId === 'copper-pieces') {
        this.playerMoney = itemRepresentation.item.quantity;
      }
    });
  }

  private updatePriceTags() {
    this.itemsMap.forEach((itemRepresentation, currentSlot) => {
      if (currentSlot.startsWith('containerSlot')) {
        itemRepresentation.setPriceTag(this.playerMoney, 'player');
      } else {
        itemRepresentation.setPriceTag(this.npcMoney, 'npc');
      }
    });
  }

  protected _moveItemFromSlotToSlot(fromSlot: Slots, toSlot: Slots, quantity?: number) {
    if (
      (fromSlot.includes('container') && (this.itemsMap.has(toSlot) && this.itemsMap.get(toSlot).item.itemId !== this.itemsMap.get(fromSlot).item.itemId))
      || (toSlot.includes('container') && (this.itemsMap.has(toSlot) && this.itemsMap.get(toSlot).item.itemId !== this.itemsMap.get(fromSlot).item.itemId))
      || (fromSlot.includes('container') && toSlot.includes('container'))
      || this.itemsMap.get(fromSlot)?.item.itemId === 'copper-pieces'
      || this.itemsMap.get(toSlot)?.item.itemId === 'copper-pieces'
      || this.itemsMap.get(fromSlot)?.item.sellPrice === 0
    ) {
      console.log(...prepareLog(`Trying to move !!forbidden combination, ??animating ??item ??back to ??${fromSlot}`));
      super._moveItemFromSlotToSlot(fromSlot, fromSlot);
      return;
    }
    if (fromSlot.includes('container') === false && toSlot.includes('container') === false) {
      super._moveItemFromSlotToSlot(fromSlot, toSlot, quantity);
      return;
    }
    const [playerMoneySlot, playerMoneyItemR] = [...this.itemsMap].find(([slotName, item]) => slotName.includes('backpack') && item.item.itemId === 'copper-pieces') ?? [];
    const [traderMoneySlot, traderMoneyItemR] = [...this.itemsMap].find(([slotName, item]) => slotName.includes('container') && item.item.itemId === 'copper-pieces') ?? [];
    const playerMoney = playerMoneyItemR ? playerMoneyItemR?.item.quantity : 0;
    const traderMoney = traderMoneyItemR ? traderMoneyItemR?.item.quantity : 0;
    const tradingItemR = this.itemsMap.get(fromSlot);
    if (quantity === undefined) quantity = tradingItemR.item.quantity;
    if (fromSlot.includes('container')) {
      console.log(...prepareLog(`Trying to buy ??${quantity} !!${tradingItemR.item.itemId}`));
      const totalItemCost = tradingItemR.item.buyPrice * quantity;
      if (playerMoney >= totalItemCost) {
        console.log(...prepareLog('Player has !!enough money to buy it'));
        super._moveItemFromSlotToSlot(fromSlot, toSlot, quantity);
        this._changeItemQuantity(playerMoneySlot, playerMoney - totalItemCost);
        this.playerMoney = (playerMoney - totalItemCost);
        this.npcMoney = (traderMoney + totalItemCost);
        this.updatePriceTags();
        if (traderMoneyItemR) {
          console.log(...prepareLog('Trader !!has money in the inventory'));
          this._changeItemQuantity(traderMoneySlot, traderMoney + totalItemCost);
        } else {
          console.log(...prepareLog('Trader !!doesn\'t have money in the inventory'));
          const newMoneyItem = new Item('copper-pieces', totalItemCost);
          const emptyTraderSlot = this._getEmptyTraderSlot();
          if (emptyTraderSlot) {
            this._createItemRepresentation(newMoneyItem, emptyTraderSlot);
          } else {
            throw new Error('Emergency! No slot to create money on trader!');
          }
        }
      } else {
        console.log(...prepareLog('??Player has !!not !!enough money to buy it'));
        super._moveItemFromSlotToSlot(fromSlot, fromSlot);
        return;
      }
    }
    if (toSlot.includes('container')) {
      console.log(...prepareLog(`Trying to sell ??${quantity} !!${tradingItemR.item.itemId}`));
      const totalItemCost = tradingItemR.item.sellPrice * quantity;
      if (traderMoney >= totalItemCost) {
        console.log(...prepareLog('Trader has !!enough money to buy it'));
        super._moveItemFromSlotToSlot(fromSlot, toSlot, quantity);
        this._changeItemQuantity(traderMoneySlot, traderMoney - totalItemCost);
        this.npcMoney = (traderMoney - totalItemCost);
        this.playerMoney = (playerMoney + totalItemCost);
        this.updatePriceTags();
        if (playerMoneyItemR) {
          this._changeItemQuantity(playerMoneySlot, playerMoney + totalItemCost);
        } else {
          const newMoneyItem = new Item('copper-pieces', totalItemCost);
          const emptyPlayerSlot = this._getFirstEmptySlot(backpackSlotNames);
          if (emptyPlayerSlot) {
            this._createItemRepresentation(newMoneyItem, emptyPlayerSlot);
          } else {
            throw new Error('Emergency! No slot to create money on player!');
          }
        }
      } else {
        console.log(...prepareLog('??Trader has !!not !!enough money to buy item!'));
        super._moveItemFromSlotToSlot(fromSlot, fromSlot, quantity);
      }
    }
  }

  private _getEmptyTraderSlot() {
    return containerSlotNames.find((slotToCheck) => this.itemsMap.get(slotToCheck) === undefined);
  }

  protected _showItemDescriptionAndActions(slot: Slots) {
    if (slot.includes('container')) {
      super._showItemDescriptionAndActions(slot, false);
    } else {
      super._showItemDescriptionAndActions(slot, true);
    }
  }

  protected _itemDoubleClickCallback(itemCurrentSlot: any) {
    if (itemCurrentSlot.includes('container') === false) {
      this._moveItemFromSlotToFirstPossible(itemCurrentSlot, containerSlotNames, 1);
    } else {
      this._moveItemFromSlotToFirstPossible(itemCurrentSlot, backpackSlotNames, 1);
    }
  }

  protected _drawContainerSlotsAndTitle() {
    super._drawContainerSlotsAndTitle(false);
  }
}
