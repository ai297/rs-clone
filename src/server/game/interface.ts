import { ICard } from '../../common';

export interface IGameForCasting {
  checkEndGameHandler: () => void,
  usedCardHandler: (cardUsed: Array<ICard>) => void,
  getCardsActiveDeck: (number: number) => Array<ICard>,
}
