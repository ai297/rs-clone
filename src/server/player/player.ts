import { ICard } from '../../common';
import { PlayerSpell } from './player-spell';

const STARTING_HEALTH = 20;

export class Player {
  private handCardsValue: Array<ICard> = [];

  private currentSpell: PlayerSpell;

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
    this.currentSpell = new PlayerSpell(cards);

    this.callback.cardSelectionHandler();
  }

  public get spell(): PlayerSpell {
    return this.currentSpell;
  }

  public transferSpellCards(): Array<ICard> {
    this.isSpellReady = false;
    // передавая закл в отработку чистим слот
    const result: Array<ICard> = [...this.currentSpell];
    return result;
  }

  public setChooseCardsHandler(callback: () => void): void {
    this.callback.cardSelectionHandler = callback;
  }

  public get hitPoints(): number {
    return this.hitPointsValue;
  }

  public makeDamage(damage: number): void {
    this.hitPointsValue -= damage;
  }

  makeHeal(heal: number): void {
    this.hitPointsValue += heal;
    if (this.hitPointsValue > 25) {
      this.hitPointsValue = 25;
    }
  }
}
