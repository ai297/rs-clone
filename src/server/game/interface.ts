import { ICard } from '../../common';

export interface IGameForCasting {
  endGame: () => void,
  usedCardHandler: (cardUsed: Array<ICard>) => void,
  getCardsActiveDeck: (number: number) => Array<ICard>,
}
