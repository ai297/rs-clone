import { HubEventsServer, IPlayerInfo, ICreatePlayerRequest } from '../../common';
import { ServerConnection } from './server-connection';

export class GameService {
  constructor(private readonly getConnection: () => Promise<ServerConnection>) { }

  /**
   * This method returns promise, that resolve with gameId: string as argument
   */
  async newGame(): Promise<string> {
    const connection = await this.getConnection();
    const gameId = await connection.dispatch<string>(HubEventsServer.NewGame);
    return gameId;
  }

  /**
   * This method returns array of players, who already joined to game
   */
  async joinGame(gameId: string): Promise<IPlayerInfo[]> {
    const connection = await this.getConnection();
    const playersInGame = await connection.dispatch<IPlayerInfo[]>(HubEventsServer.JoinGame, gameId);
    return playersInGame;
  }

  /**
   * This method nothing return now, but it should return anything
   */
  async startGame(): Promise<void> {
    const connection = await this.getConnection();
    await connection.dispatch<void>(HubEventsServer.StartGame);
  }

  /**
   * This method returns created player
   */
  async createHero(request: ICreatePlayerRequest): Promise<IPlayerInfo> {
    const connection = await this.getConnection();
    const playerInfo = await connection.dispatch<IPlayerInfo>(HubEventsServer.AddPlayer, request);
    return playerInfo;
  }
}
