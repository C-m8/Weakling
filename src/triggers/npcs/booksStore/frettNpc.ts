import GeneralNpc from '../generalNpc';
import GeneralLocation from '../../../scenes/locations/generalLocation';
import {
  frettAfterTrueNameCalledDialog,
  frettDialog, frettHowCanIHelpYouDialog,
  frettObservedReadingAndInterestDialog,
  frettObservedReadingDialog, frettRepeatStoryDialog,
} from '../../../data/dialogs/caltor/frettDialog';
import { SpriteParameters } from '../../../types/my-types';

export default class FrettNpc extends GeneralNpc {
  constructor({
    scene, x, y, spriteParams,
  }: { scene: GeneralLocation; x?: number; y?: number; spriteParams?: SpriteParameters }) {
    super({
      scene,
      name: 'Frett',
      triggerX: x,
      triggerY: y,
      spriteParams,
      initDialog: frettDialog,
      interactionCallback: (/* param */) => {},
    });

    this.preInteractionCallback = () => {
      if (scene.player.getQuestById('theSelflessSpirit')?.currentStates.includes('falseNameLearned')) {
        this.setDialog(frettObservedReadingDialog);
      }

      if (scene.player.getQuestById('theSelflessSpirit')?.currentStates.includes('falseNameCalled')) {
        this.setDialog(frettObservedReadingAndInterestDialog, (param: string) => {
          if (param === 'trueNameLearned') {
            scene.player.updateQuest('theSelflessSpirit', 'trueNameLearned');
          }
          this.setDialog(frettRepeatStoryDialog);
        });
      }

      if (scene.player.getQuestById('theSelflessSpirit')?.currentStates.includes('trueNameLearned')) {
        this.setDialog(frettHowCanIHelpYouDialog);
      }

      if (scene.player.getQuestById('theSelflessSpirit')?.currentStates.includes('trueNameCalled')) {
        this.setDialog(frettAfterTrueNameCalledDialog, (param: string) => {
          if (param === 'bookObtained') {
            scene.player.addItemToInventory('jeremaya-book', 1, undefined, scene);
            scene.player.updateQuest('theSelflessSpirit', 'oathLearned');
            this.setDialog(frettHowCanIHelpYouDialog);
          }
        });
      }

      if (scene.player.getQuestById('theSelflessSpirit')?.currentStates.includes('oathLearned')) {
        this.setDialog(frettHowCanIHelpYouDialog);
      }
    };
  }
}
