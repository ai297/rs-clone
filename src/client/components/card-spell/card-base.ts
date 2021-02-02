import { delay } from '../../../common';
import { CSSClasses } from '../../enums';
import { BaseComponent } from '../base-component';

export class CardBase extends BaseComponent {
  constructor() {
    super([CSSClasses.СardСontainer]);
  }

  get isFlipped(): boolean { return this.element.classList.contains(CSSClasses.CardFlipped); }

  flip(force?: boolean): void { this.element.classList.toggle(CSSClasses.CardFlipped, force); }

  rotate(degree: number): CardBase {
    const style = ` rotate(${degree}deg)`;
    this.element.style.transform += style;
    return this;
  }

  moveY(value: string): CardBase {
    const style = ` translateY(${value})`;
    this.element.style.transform += style;
    return this;
  }

  clearTransform(): CardBase {
    this.element.style.transform = '';
    return this;
  }

  beforeAppend(): Promise<void> {
    this.element.classList.add(CSSClasses.CardBeforeAppend);
    return Promise.resolve();
  }

  async onAppended(duration = 0): Promise<void> {
    await delay(50);
    this.element.classList.remove(CSSClasses.CardBeforeAppend);
    await delay(duration);
    this.element.classList.add(CSSClasses.CardUsed);
  }

  async beforeRemove(duration = 0): Promise<void> {
    this.element.classList.add(CSSClasses.CardBeforeRemove);
    await delay(duration);
  }

  onRemoved(): Promise<void> {
    this.element.classList.remove(CSSClasses.CardBeforeRemove);
    return Promise.resolve();
  }
}
