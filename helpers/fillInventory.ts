import {Player} from "../characters/adventurers/player.js";

export function fillInventoryWithPotions(player: Player, fillBy: 'size' | 'quality' | 'type', type?: string) {
    const qualities = ['weak', 'mediocre', 'average', 'strong', 'powerful'];
    const sizes = ['small', 'medium', 'big', 'giant'];
    const types = ['health', 'energy', 'manna', 'strength'];
    if (fillBy === 'size') {
        sizes.forEach((size) => {
            types.forEach(type => {
                player.addItemToInventory(`${size}-weak-${type}-potion`, 2);
            })
        })
    }
    if (fillBy === 'quality') {
        qualities.forEach((quality) => {
            types.forEach(type => {
                player.addItemToInventory(`small-${quality}-${type}-potion`, 2);
            })
        })
    }
    if (fillBy==='type') {
        sizes.forEach((size) => {
            qualities.forEach(quality => {
                player.addItemToInventory(`${size}-${quality}-${type}-potion`, 2);
            })
        })
    }
}
