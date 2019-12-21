export const weapons: { [key: string]: Weapon } = {
    'fist-weapon': {
        weaponId: 'fist-weapon',
        damage: 10,
        slot: 'anyHand',
        sprite: {key: 'fist-weapon', frame: null},
        size: ['xs', 's', 'm', 'l', 'xl', 'xxxl']
    }
};

export const belts: { [key: string]: Belt } = {
    'rope-belt': {
        beltId: 'rope-belt',
        additionalCharacteristics: [],
        quickSlots: 2,
        slot: 'belt',
        sprite: {key: 'rope-belt', frame: null},
        size: ['xs', 's', 'm'],
    },
    'fancy-belt': {
        beltId: 'fancy-belt',
        additionalCharacteristics: [],
        quickSlots: 2,
        slot: 'belt',
        sprite: {key: 'icons', frame: 127},
        size: ['xs', 's', 'm'],
    }
};