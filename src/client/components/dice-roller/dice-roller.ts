import { createElement, delay } from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { BaseComponent } from '../base-component';
import { Dice } from './dice';

const ANIMATION_DELAY = 500;

function createContainer(dice: Dice, index: number, dicesNum: number): HTMLElement {
  const container = createElement(Tags.Div, [CSSClasses.DiceContainer]);
  const shadow = createElement(Tags.Div, [CSSClasses.DiceShadow]);
  container.append(shadow, dice.element);
  const rotateStep = Math.round(360 / dicesNum);
  const rotate = rotateStep * index + Math.round(Math.random() * (rotateStep / 2) - rotateStep / 4);
  container.style.transform = `rotateZ(${rotate}deg)`;
  return container;
}

export class DiceRoller extends BaseComponent {
  private readonly dices: Array<Dice>;

  private readonly diceContainers: Array<HTMLElement>;

  constructor(rolls: Array<number>) {
    super([CSSClasses.DiceRoller]);
    this.dices = rolls.map((num) => new Dice(num));

    this.diceContainers = this.dices.map((dice, index) => createContainer(dice, index, this.dices.length));
    this.element.append(...this.diceContainers);
  }

  show(): Promise<void> {
    this.element.classList.add(CSSClasses.DiceRollerShow);
    this.diceContainers.forEach((container) => {
      const move = (200 + Math.random() * 100).toFixed();
      container.style.transform += ` translateX(${move}%)`;
    });
    return Promise.race(this.dices.map((dice) => dice.roll()));
  }

  async beforeRemove(): Promise<void> {
    this.element.classList.remove(CSSClasses.DiceRollerShow);
    await delay(ANIMATION_DELAY);
  }
}
