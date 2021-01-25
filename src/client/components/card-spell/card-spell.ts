import { ICard, CardTypes, MagicSigns } from '../../../common';
import { BaseComponent } from '../base-component';
import { CSSClasses, ImagesPaths } from '../../enums';

const LOCALE_TYPES = ['источник', 'качество', 'действие'];
const LOCALE_ELEMENTS = ['тайна', 'тьма', 'природа', 'стихия', 'иллюзия'];
const IMG_PATH = ImagesPaths.CardsSpells;

export class CardSpell extends BaseComponent {
  constructor(private card: ICard) {
    super([CSSClasses.СardСontainer]);

    const typeCard = CardTypes[card.type];
    const magicSignCard = MagicSigns[card.magicSign];

    let initiativeElem = '';

    if (card.type === CardTypes.action) {
      initiativeElem = `<div class="${CSSClasses.СardType}-icon">${card.initiative}</div>`;
    }

    const cardTemplate = `
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

    this.element.innerHTML = cardTemplate;
  }

  get id(): string {
    return this.card.id;
  }

  get cardType(): CardTypes {
    return this.card.type;
  }

  get isFlipped(): boolean { return this.element.classList.contains(CSSClasses.CardFlipped); }

  flip(force?: boolean): void { this.element.classList.toggle(CSSClasses.CardFlipped, force); }
}
