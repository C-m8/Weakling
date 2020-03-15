import { GeneralLocation } from "./generalLocation.js";
export class NahkhasCaveScene extends GeneralLocation {
    constructor() {
        super({ key: 'NahkhasCave' });
    }
    preload() {
        super.preload();
    }
    init(data) {
        super.init(data);
    }
    create() {
        super.create('nahkhasCave', 304 - 32 * 6, 128);
    }
    update() {
        super.update();
    }
}
//# sourceMappingURL=nahkhasCave.js.map