import {
  delay,
  forEachAsync,
  AnimationTimes,
  ICard,
} from '../../../common';
import { CSSClasses } from '../../enums';
import { CardSpell } from '../card-spell/card-spell';
import { ActionLayer } from './action-layer';

export class SpellCasting extends ActionLayer {
  private cards: Array<CardSpell> = [];

  private completeCards: Array<CardSpell> = [];

  constructor() {
    super(1, CSSClasses.SpellCasting);
  }

  async showSpell(cards: Array<ICard>): Promise<void> {
    if (cards.length === 0) return;

    await forEachAsync(cards, async (cardInfo) => {
      const card = await this.addCard(cardInfo);
      this.cards.push(card);
    });
  }

  async showCard(cardInfo: ICard, isNew = false): Promise<void> {
    const previousCard = this.completeCards[this.completeCards.length - 1];
    previousCard?.element.classList.remove(CSSClasses.CardActive);
    let spellCard: CardSpell;
    if (isNew) {
      spellCard = await this.addCard(cardInfo, previousCard?.element);
    } else {
      const cardIndex = this.cards.findIndex((card) => card.id === cardInfo.id);
      [spellCard] = this.cards.splice(cardIndex, 1);
    }
    if (spellCard) this.completeCards.push(spellCard);
    spellCard?.element.classList.add(CSSClasses.CardActive);
    await delay(AnimationTimes.SpellCard / 2);
  }

  async clearSpell(): Promise<void> {
    const allCards = [...this.completeCards, ...this.cards];
    this.cards = [];
    this.completeCards = [];
    if (allCards.length === 0) return;

    const timeOut = AnimationTimes.SpellCard / allCards.length;
    await forEachAsync(allCards, async (card) => {
      card.beforeRemove();
      setTimeout(() => {
        card.element.remove();
        card.onRemoved();
      }, AnimationTimes.SpellCard);
      await delay(timeOut);
    });
    this.element.innerHTML = '';
  }

  private async addCard(card: ICard, after?: HTMLElement): Promise<CardSpell> {
    const spellCard = new CardSpell(card);
    spellCard.flip();
    await spellCard.beforeAppend();
    this.element.insertBefore(spellCard.element, after?.nextSibling || null);
    await spellCard.onAppended(AnimationTimes.SpellCard);
    spellCard.flip();
    return spellCard;
  }
}
