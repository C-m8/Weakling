import {items} from "../actionsAndEffects/items.js";

export default class Item {
    public itemId: string;
    public displayName: string;
    public description: string;
    public slot: string[];
    public sprite: { key: string; frame: number };
    public stackable: boolean;
    public modified: boolean;
    public currentSlot: string;
    public quantity: number;
    public specifics: any;
    public sellPrice: number;
    public buyPrice: number;

    constructor(itemId: string, quantity= 1, options= {}) {
        let itemParams = {};
        if (itemId) {
            itemParams = JSON.parse(JSON.stringify(items[itemId]));
        }
        itemParams = {...itemParams, ...options, quantity: quantity};
        Object.entries(itemParams).forEach(([key, value]) => this[key] = value);
    }

}
