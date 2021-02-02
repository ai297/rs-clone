import { ICard } from '../card';
import { IPlayerInfo } from '../player-info';

export interface IJoinGameResponse {
  gameId: string,
  isStarted: boolean,
  isCasting: boolean,
  players: Array<IPlayerInfo>,
  playerId: string,
  playerCards: Array<ICard>,
  timeout: number,
}
