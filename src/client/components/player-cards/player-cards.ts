import {
  // CardTypes,
  // MagicSigns,
  createElement,
  delay,
  ICard,
} from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { BaseComponent } from '../base-component';
import { CardSpell } from '../card-spell/card-spell';

const ADD_CARD_DELAY = 0;
const SELECT_CARD_DELAY = 0;

export class PlayerCards extends BaseComponent {
  private readonly handCards: CardSpell[] = [];

  private readonly spellCards: CardSpell[] = [];

  private isCardSelecting = false;

  private readonly handElement: HTMLElement;

  private readonly selectedCardsElement: HTMLElement;

  constructor() {
    super([CSSClasses.PlayerCards]);

    this.handElement = createElement(Tags.Div, [CSSClasses.PlayerCardsHand]);
    this.selectedCardsElement = createElement(Tags.Div, [CSSClasses.PlayerSelectedCards], 'selected cards');
    this.element.append(this.selectedCardsElement, this.handElement);
  }

  newCard = async (cardInfo: ICard): Promise<void> => {
    const card = new CardSpell(cardInfo);
    this.handCards.push(card);
    card.element.classList.add(CSSClasses.CardTakeHandAnimation);
    this.handElement.prepend(card.element);
    await delay(1);
    card.element.classList.remove(CSSClasses.CardTakeHandAnimation);
    await delay(ADD_CARD_DELAY);
  };

  selectCard = async (cardId: string): Promise<void> => {
    if (this.isCardSelecting) return;
    this.isCardSelecting = true;
    const selectCardIndex = this.handCards.findIndex((card) => card.id === cardId);
    if (selectCardIndex < 0) return;
    const card = <CardSpell> this.handCards[selectCardIndex];
    if (this.spellCards.findIndex((spellCard) => spellCard.cardType === card.cardType) >= 0) return;
    this.handCards.splice(selectCardIndex, 1);
    card.element.classList.add(CSSClasses.CardSelectAnimation);
    await delay(SELECT_CARD_DELAY);
    card.element.classList.remove(CSSClasses.CardSelectAnimation);
    this.selectedCardsElement.append(card.element);
    this.isCardSelecting = false;
  };
}
