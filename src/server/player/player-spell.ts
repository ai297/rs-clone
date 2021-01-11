import { ICard, CardTypes } from '../../common';

const FASTEST_SPELL = 200;
const QUICK_SPELL = 100;

export class PlayerSpell {
  private readonly cards = new Map<CardTypes, ICard>();

  private spellSpeed = 0;

  constructor(cards: Array<ICard>) {
    // здесь при попытке добавить в заклинание карты того типа, который там уже есть - лишние карты просто игнорируются
    cards.forEach((card) => {
      if (!this.cards.has(card.type)) this.cards.set(card.type, card);
      this.spellSpeed += card.initiative;
    });

    // считаем инициативу заклинания
    const cardsCount = [...this.cards.keys()].length;
    if (cardsCount === 1) this.spellSpeed += FASTEST_SPELL;
    if (cardsCount === 2) this.spellSpeed += QUICK_SPELL;
  }

  get initiative(): number { return this.spellSpeed; }

  // это итератор. благодаря ему можно перебрать PlayerSpell как массив или использовать спред
  * [Symbol.iterator](): Generator<ICard> {
    if (this.cards.has(CardTypes.source)) yield <ICard> this.cards.get(CardTypes.source);
    if (this.cards.has(CardTypes.quality)) yield <ICard> this.cards.get(CardTypes.quality);
    if (this.cards.has(CardTypes.action)) yield <ICard> this.cards.get(CardTypes.action);
  }

  private static empty: PlayerSpell = new PlayerSpell([]);

  static get Empty(): PlayerSpell { return PlayerSpell.empty; }
}
