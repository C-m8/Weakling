import {GeneralLocation} from "./generalLocation.js";
import {EyeballNpc} from "../npcs/backCave/eyeballNpc.js";

export class BackCaveScene extends GeneralLocation {

    constructor() {
        super({key: 'BackCave'});
    }

    public create() {
        super.create('backCave');

        new EyeballNpc({scene: this});
    }
}
