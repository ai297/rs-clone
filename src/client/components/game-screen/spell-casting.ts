import {
  delay,
  forEachAsync,
  ICard,
} from '../../../common';
import { CSSClasses } from '../../enums';
import { CardSpell } from '../card-spell/card-spell';
import { ActionLayer } from './action-layer';

const CARD_ANIMATION_TIME = 500;

export class SpellCasting extends ActionLayer {
  private cards: Array<CardSpell> = [];

  private completeCards: Array<CardSpell> = [];

  constructor() {
    super(1, CSSClasses.SpellCasting);
  }

  async showSpell(cards: Array<ICard>): Promise<void> {
    if (cards.length === 0) return;

    const timeOut = CARD_ANIMATION_TIME / cards.length;
    await forEachAsync(cards, async (cardInfo) => {
      this.addCard(cardInfo);
      await delay(timeOut);
    });
  }

  async clearSpell(): Promise<void> {
    const allCards = [...this.completeCards, ...this.cards];
    this.cards = [];
    this.completeCards = [];
    if (allCards.length === 0) return;

    const timeOut = CARD_ANIMATION_TIME / allCards.length;
    await forEachAsync(allCards, async (card) => {
      card.beforeRemove();
      setTimeout(() => {
        card.element.remove();
        card.onRemoved();
      }, CARD_ANIMATION_TIME);
      await delay(timeOut);
    });
    this.element.innerHTML = '';
  }

  private async addCard(card: ICard, before?: string): Promise<void> {
    const spellCard = new CardSpell(card);
    spellCard.flip();
    this.cards.push(spellCard);
    await spellCard.beforeAppend();
    const beforeCard = this.cards.find((playingCard) => playingCard.id === before);
    this.element.insertBefore(spellCard.element, beforeCard?.element || null);
    await spellCard.onAppended(CARD_ANIMATION_TIME);
    spellCard.flip();
  }
}
