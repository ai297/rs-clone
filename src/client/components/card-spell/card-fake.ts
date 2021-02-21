import { CSSClasses } from '../../enums';
import { CardBase } from './card-base';

export class CardFake extends CardBase {
  constructor() {
    super();
    this.element.innerHTML = `<div class="${CSSClasses.Сard} ${CSSClasses.CardFake}"></div>`;
  }
}
