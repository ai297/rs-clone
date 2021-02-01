import { delay, AnimationTimes } from '../../../common';
import { CSSClasses } from '../../enums';
import { BaseComponent } from '../base-component';

export class Dice extends BaseComponent {
  constructor(value?: number) {
    super([CSSClasses.Dice]);

    const val = value || Math.round(Math.random() * 5 + 1);

    const values: Array<number> = Array<number>(6).fill(1).map((n, i) => n + i);
    const valIndex = values.indexOf(val);
    if (valIndex > 2) {
      const before = values.splice(0, valIndex - 2);
      values.push(...before);
    } else if (valIndex >= 0) {
      const before = values.splice(values.length + valIndex - 2, 2 - valIndex);
      values.unshift(...before);
    }

    this.element.innerHTML = `
      <div class="dice__side dice__side--front">${values[0]}</div>
      <div class="dice__side dice__side--back">${values[1]}</div>
      <div class="dice__side dice__side--top">${values[2]}</div>
      <div class="dice__side dice__side--bottom">${values[3]}</div>
      <div class="dice__side dice__side--left">${values[4]}</div>
      <div class="dice__side dice__side--right">${values[5]}</div>
    `;
  }

  async roll(): Promise<void> {
    this.element.classList.add(CSSClasses.DiceRollingAnimation);
    await delay(AnimationTimes.Dice);
    this.element.classList.remove(CSSClasses.DiceRollingAnimation);
  }
}
