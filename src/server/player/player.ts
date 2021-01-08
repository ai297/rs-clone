import { ICard } from '../../common';

const STARTING_HEALTH = 20;

export class Player {
  private handCardsValue: Array<ICard> = [];

  private spellCardsValue: Array<ICard> = [];

  private callback: { [name: string]: () => void } = {};

  public isSpellReady = false;

  private hitPointsValue = STARTING_HEALTH;

  public addCardsHand(cards: Array<ICard>): void {
    this.handCardsValue = [...this.handCardsValue, ...cards];
  }

  public get handCards(): Array<ICard> {
    return this.handCardsValue;
  }

  public addSpellCards(cards: Array<ICard>): void {
    this.isSpellReady = true;
    // убираем из руки
    this.handCardsValue = this.handCardsValue.filter((cardCurrent: ICard) => !cards.includes(cardCurrent));

    // кладем в активное заклинание
    this.spellCardsValue = [...cards];

    this.callback.cardSelectionHandler();
  }

  public get spellCards(): Array<ICard> {
    // этот метод только отдает карты, нужен будет для расчета инициативы.
    return this.spellCardsValue;
  }

  public transferSpellCards(): Array<ICard> {
    this.isSpellReady = false;
    // передавая закл в отработку чистим слот
    const result: Array<ICard> = [...this.spellCardsValue];
    this.spellCardsValue = [];
    return result;
  }

  public setChooseCardsHandler(callback: () => void): void {
    this.callback.cardSelectionHandler = callback;
  }

  public get hitPoints(): number {
    return this.hitPointsValue;
  }
}
