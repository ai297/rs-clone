import { ICard, CardTypes } from '../../common';

const FASTEST_SPELL = 200;
const QUICK_SPELL = 100;

export class PlayerSpell {
  private readonly cards = new Map<CardTypes, ICard>();

  private spellSpeed = 0;

  private spellLength = 0;

  constructor(cards: Array<ICard>) {
    // здесь при попытке добавить в заклинание карты того типа, который там уже есть - лишние карты просто игнорируются
    cards.forEach((card) => {
      if (!this.cards.has(card.type)) {
        this.cards.set(card.type, card);
        this.spellSpeed += card.initiative;
        this.spellLength++;
      }
    });

    // считаем инициативу заклинания
    if (this.spellLength === 1) this.spellSpeed += FASTEST_SPELL;
    if (this.spellLength === 2) this.spellSpeed += QUICK_SPELL;
  }

  get initiative(): number { return this.spellSpeed; }

  get length(): number { return this.spellLength; }

  // это итератор. благодаря ему можно перебрать PlayerSpell как массив или использовать спред
  * [Symbol.iterator](): Generator<ICard> {
    if (this.cards.has(CardTypes.source)) yield <ICard> this.cards.get(CardTypes.source);
    if (this.cards.has(CardTypes.quality)) yield <ICard> this.cards.get(CardTypes.quality);
    if (this.cards.has(CardTypes.action)) yield <ICard> this.cards.get(CardTypes.action);
  }

  private static empty: PlayerSpell = new PlayerSpell([]);

  static get Empty(): PlayerSpell { return PlayerSpell.empty; }

  addCardForSpell(cardsAdd: Array<ICard>): void {
    cardsAdd.forEach((cur, index) => {
      this.cards.set(index, cur);
    });
  }
}
