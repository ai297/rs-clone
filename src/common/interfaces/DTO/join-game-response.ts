import { IPlayerInfo } from '../player-info';

export interface IJoinGameResponse {
  gameId: string,
  isStarted: boolean,
  players: Array<IPlayerInfo>,
}
