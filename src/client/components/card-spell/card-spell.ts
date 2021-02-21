import {
  ICard,
  CardTypes,
  MagicSigns,
} from '../../../common';
import { CSSClasses, ImagesPaths } from '../../enums';
import { CardBase } from './card-base';

const LOCALE_TYPES = ['источник', 'качество', 'действие'];
const LOCALE_ELEMENTS = ['тайна', 'тьма', 'природа', 'стихия', 'иллюзия'];
const IMG_PATH = ImagesPaths.CardsSpells;

export class CardSpell extends CardBase {
  constructor(private card: ICard, public onClick?: (card: CardSpell) => void) {
    super();

    this.element.addEventListener('click', (event) => {
      event.preventDefault();
      if (!this.disabled && this.onClick) this.onClick(this);
    });

    this.createMarkup(card);
  }

  get id(): string {
    return this.card.id;
  }

  get cardType(): CardTypes {
    return this.card.type;
  }

  get disabled(): boolean { return this.element.classList.contains(CSSClasses.CardDisabled); }

  set disabled(val: boolean) {
    this.element.classList.toggle(CSSClasses.CardDisabled, val);
  }

  private createMarkup(card: ICard): void {
    const typeCard = CardTypes[card.type];
    const magicSignCard = MagicSigns[card.magicSign];

    let initiativeElem = '';
    if (card.type === CardTypes.action) {
      initiativeElem = `<div class="${CSSClasses.СardType}-icon">${card.initiative}</div>`;
    }
    this.element.classList.add(`${CSSClasses.СardType}--${typeCard}`, `${CSSClasses.СardElement}--${magicSignCard}`);
    this.element.innerHTML = `
      <div class="${CSSClasses.Сard}">
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
