import { delay, ICallbackHandler, ICard } from '../../../common';
import { CSSClasses } from '../../enums';
import { CardSpell } from '../card-spell/card-spell';

export class PlayingCard extends CardSpell {
  constructor(cardInfo: ICard, public onClick?: ICallbackHandler) {
    super(cardInfo);
    this.element.addEventListener('click', (event) => {
      event.preventDefault();
      if (!this.disabled && this.onClick) this.onClick(this.id);
    });
  }

  get disabled(): boolean { return this.element.classList.contains(CSSClasses.PlayingCardDisabled); }

  set disabled(val: boolean) {
    if (val) this.element.classList.add(CSSClasses.PlayingCardDisabled);
    else this.element.classList.remove(CSSClasses.PlayingCardDisabled);
  }

  rotate(degree: number): PlayingCard {
    const style = ` rotate(${degree}deg)`;
    this.element.style.transform += style;
    return this;
  }

  moveY(value: string): PlayingCard {
    const style = ` translateY(${value})`;
    this.element.style.transform += style;
    return this;
  }

  clearTransform(): PlayingCard {
    this.element.style.transform = '';
    return this;
  }

  beforeAppend(): Promise<void> {
    this.element.classList.add(CSSClasses.PlayingCardBeforeAppend);
    return Promise.resolve();
  }

  async onAppended(duration = 0): Promise<void> {
    await delay(50);
    this.element.classList.remove(CSSClasses.PlayingCardBeforeAppend);
    await delay(duration);
  }

  async beforeRemove(duration = 0): Promise<void> {
    this.element.classList.add(CSSClasses.PlayingCardBeforeRemove);
    await delay(duration);
  }

  onRemoved(): Promise<void> {
    this.element.classList.remove(CSSClasses.PlayingCardBeforeRemove);
    return Promise.resolve();
  }
}
