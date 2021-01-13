import { BaseComponent } from '../base-component';
import { CSSClasses, ImagesPaths } from '../../enums';
import { ICard } from '../../../common/interfaces';
import { CardTypes, MagicSigns } from '../../../common';

const LOCALE_TYPES = ['источник', 'качество', 'действие'];
const LOCALE_ELEMENTS = ['тайна', 'тьма', 'природа', 'стихия', 'иллюзия'];
const IMG_PATH = ImagesPaths.CardsSpells;

export class CardSpell extends BaseComponent {
  constructor(private card: ICard) {
    super([CSSClasses.СardСontainer]);

    const {
      id, title, type, magicSign, src, text, initiative,
    } = this.card;

    const temp = type;
    const typeCard = CardTypes[temp];
    const temp2 = magicSign;
    const magicSignCard = MagicSigns[temp2];

    let initiativeElem = '';

    if (type === CardTypes.action) {
      initiativeElem = `<div class="${CSSClasses.СardType}-icon">${initiative}</div>`;
    }

    const cardTemplate = `
      <div class="${CSSClasses.Сard} ${CSSClasses.СardType}--${typeCard} ${CSSClasses.СardElement}--${magicSignCard}">
        <div class="${CSSClasses.СardContent}">
          <div class="${CSSClasses.СardImage}">
            <img src="${IMG_PATH}${typeCard}/${src}.jpg" alt="${id} image">
          </div>
          <div class="${CSSClasses.СardTitle}">
            <div>${title}</div>
          </div>
          ${initiativeElem}
            <div class="${CSSClasses.СardText}">
              ${text}
            </div>
        </div>
        <div class="${CSSClasses.СardElement}--label">${LOCALE_ELEMENTS[magicSign]}</div>
        <div class="${CSSClasses.СardType}--label">${LOCALE_TYPES[type]}</div>
      </div>
    `;

    this.element.innerHTML = cardTemplate;
  }

  get id(): string {
    return this.card.id;
  }
}
