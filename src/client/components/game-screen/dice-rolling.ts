import { CSSClasses, Tags } from '../../enums';
import { ActionLayer } from './action-layer';
import { DiceRoller } from '../dice-roller/dice-roller';
import { createElement, delay } from '../../../common';

const DICE_WAIT_TIME = 1500;

export class DiceRolling extends ActionLayer {
  private readonly container: HTMLElement;

  constructor() {
    super(2, CSSClasses.DiceRolling);
    this.container = createElement(Tags.Div, [CSSClasses.DiceRollingWrapper]);
    this.element.append(this.container);
  }

  async showRolls(rolls: Array<number>): Promise<void> {
    const roll = new DiceRoller(rolls);
    this.container.append(roll.element);
    await delay(50);
    await roll.show();
    await delay(DICE_WAIT_TIME);
    await roll.beforeRemove();
    roll.element.remove();
  }
}
