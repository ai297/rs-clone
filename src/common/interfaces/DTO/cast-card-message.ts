import { ICard } from '../card';

export interface ICastCard {
  playerId: string,
  card: ICard,
  addon: boolean
}
