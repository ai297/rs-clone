import { ICard } from '../card';

export interface ICastSpell {
  playerId: string,
  cards: Array<ICard>,
}
