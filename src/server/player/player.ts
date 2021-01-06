import { ICard } from '../../common';

export class Player {
  private handCardsValue: Array<ICard> = [];

  private spellCardsValue: Array<ICard> = [];

  private isReadyValue = false;

  public addCardsHand(cards: Array<ICard>) {
    this.handCardsValue = [...this.handCardsValue, ...cards];
  }

  public get handCards(): Array<ICard> {
    return this.handCardsValue;
  }

  public addSpellCards(cards: Array<ICard>) {
    // убираем из руки
    this.handCardsValue = this.handCardsValue.filter((cardCurrent: ICard) => !cards.includes(cardCurrent));

    // ложим в активное заклинание
    this.spellCardsValue = [...cards];
  }

  public transferSpellCards(): Array<ICard> {
    // передавая закл в отработку чистим слот
    const result: Array<ICard> = [...this.spellCardsValue];
    this.spellCardsValue = [];
    return result;
  }

  public set isReady(status: boolean) {
    this.isReadyValue = status;
  }

  public get isReady(): boolean {
    return this.isReadyValue;
  }
}
