import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement } from '../../../common/utils';

const MAX_CARDS = 10;

export class OpponentsCards
  extends BaseComponent {
  private maxCards: Array<HTMLElement> = [];

  constructor() {
    super([CSSClasses.OpponentsCards, CSSClasses.OpponentsCardsEmpty]);

    for (let i = 0; i < MAX_CARDS; i += 1) {
      const card: HTMLElement = createElement(Tags.Div, [CSSClasses.OpponentCardItem]);

      this.maxCards.push(card);
    }
  }

  showCards(num: number): HTMLElement {
    this.element.classList.remove(CSSClasses.OpponentsCardsEmpty);
    this.element.append(...this.maxCards.slice(0, num));

    return this.element;
  }

  removeCards(): void {
    this.element.classList.add(CSSClasses.OpponentsCardsEmpty);
    this.element.innerHTML = '';
  }
}
