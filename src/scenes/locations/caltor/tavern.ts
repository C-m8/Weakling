import GeneralLocation from '../generalLocation';
import BartenderNpc from '../../../triggers/npcs/tavern/bartenderNpc';
import FarmerJoeNpc from '../../../triggers/npcs/tavern/farmerJoeNpc';

export default class TavernScene extends GeneralLocation {
  constructor() {
    super({ key: 'Tavern' });
  }

  public preload() {
    super.preload();
  }

  public init(data: { toCoordinates: { x: number; y: number; } }) {
    super.init(data);
  }

  public create() {
    super.create('tavern');
    new BartenderNpc({ scene: this });
    new FarmerJoeNpc({ scene: this });
  }

  public update() {
    super.update();
  }
}