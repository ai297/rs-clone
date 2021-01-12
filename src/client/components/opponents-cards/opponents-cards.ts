import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement } from '../../../common/utils';

export class OpponentsCards
  extends BaseComponent {
  constructor() {
    super([CSSClasses.OpponentsCards]);
  }

  showCards(num: number): HTMLElement {
    for (let i = 0; i < num; i += 1) {
      const card = createElement(Tags.Div, [CSSClasses.CardItem]);

      this.element.append(card);
    }

    return this.element;
  }

  removeCards(): void {
    this.element.innerHTML = '';
  }
}
