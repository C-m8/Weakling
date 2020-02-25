export const pantsItems = {
    'leather-pants': {
        itemId: 'leather-pants',
        displayName: 'Leather pants',
        description: 'Basic leather pants',
        slot: ['body', 'pants'],
        sprite: { key: 'icon-item-set', frame: 123 },
        stackable: false,
        modified: false,
        currentSlot: null,
        specifics: {
            additionalCharacteristics: [
                { 'defences.armor': 1 },
                { 'attributes.agility': 1 }
            ],
            size: ['xs', 's', 'm'],
        },
        sellPrice: 7,
        buyPrice: 14
    },
};
//# sourceMappingURL=pantsItems.js.map