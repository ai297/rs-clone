import {
  ICard,
  CardTypes,
  MagicSigns,
  ICallbackHandler,
  delay,
} from '../../../common';
import { BaseComponent } from '../base-component';
import { CSSClasses, ImagesPaths } from '../../enums';

const LOCALE_TYPES = ['источник', 'качество', 'действие'];
const LOCALE_ELEMENTS = ['тайна', 'тьма', 'природа', 'стихия', 'иллюзия'];
const IMG_PATH = ImagesPaths.CardsSpells;

export class CardSpell extends BaseComponent {
  constructor(private card: ICard, public onClick?: ICallbackHandler) {
    super([CSSClasses.СardСontainer]);

    this.element.addEventListener('click', (event) => {
      event.preventDefault();
      if (!this.disabled && this.onClick) this.onClick(this.id);
    });

    this.createMarkup(card);
  }

  get id(): string {
    return this.card.id;
  }

  get cardType(): CardTypes {
    return this.card.type;
  }

  get isFlipped(): boolean { return this.element.classList.contains(CSSClasses.CardFlipped); }

  flip(force?: boolean): void { this.element.classList.toggle(CSSClasses.CardFlipped, force); }

  get disabled(): boolean { return this.element.classList.contains(CSSClasses.CardDisabled); }

  set disabled(val: boolean) {
    this.element.classList.toggle(CSSClasses.CardDisabled, val);
  }

  rotate(degree: number): CardSpell {
    const style = ` rotate(${degree}deg)`;
    this.element.style.transform += style;
    return this;
  }

  moveY(value: string): CardSpell {
    const style = ` translateY(${value})`;
    this.element.style.transform += style;
    return this;
  }

  clearTransform(): CardSpell {
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
    this.element.classList.add(CSSClasses.CardUsed);
    await delay(duration);
  }

  async beforeRemove(duration = 0): Promise<void> {
    this.element.classList.add(CSSClasses.CardBeforeRemove);
    await delay(duration);
  }

  onRemoved(): Promise<void> {
    this.element.classList.remove(CSSClasses.CardBeforeRemove);
    return Promise.resolve();
  }

  private createMarkup(card: ICard): void {
    const typeCard = CardTypes[card.type];
    const magicSignCard = MagicSigns[card.magicSign];

    let initiativeElem = '';
    if (card.type === CardTypes.action) {
      initiativeElem = `<div class="${CSSClasses.СardType}-icon">${card.initiative}</div>`;
    }

    this.element.innerHTML = `
      <div class="${CSSClasses.Сard} ${CSSClasses.СardType}--${typeCard} ${CSSClasses.СardElement}--${magicSignCard}">
        <div class="${CSSClasses.СardContent}">
          <div class="${CSSClasses.СardImage}" style="background-image: url(${IMG_PATH}${typeCard}/${card.src}.jpg)">
          </div>
          <div class="${CSSClasses.СardTitle}">
            <div>${card.title}</div>
          </div>
          ${initiativeElem}
            <div class="${CSSClasses.СardText}">
              ${card.text}
            </div>
        </div>
        <div class="${CSSClasses.СardElement}--label">${LOCALE_ELEMENTS[card.magicSign]}</div>
        <div class="${CSSClasses.СardType}--label">
          ${LOCALE_TYPES[card.type]}<span>${LOCALE_TYPES[card.type][0].toUpperCase()}</span>
        </div>
        <div class="${CSSClasses.СardBackside}"></div>
      </div>
    `;
  }
}
