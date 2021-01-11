import {
  HubEventsServer,
  HubEventsClient,
  IHubResponse,
  HubResponse,
  IPlayerInfo,
  ICreatePlayerRequest,
} from '../../common';
import { ServerConnection } from './server-connection';

export class GameService {
  private gameId = '';

  private playerId = '';

  private players: Array<IPlayerInfo> = [];

  constructor(private readonly connection: ServerConnection) {
    connection.addEventListener(HubEventsClient.AddPlayer, (player: IPlayerInfo) => this.addPlayer(player));
    connection.addEventListener(HubEventsClient.RemovePlayer, (playerId: string) => this.removePlayer(playerId));
  }

  get currentGameId(): string { return this.gameId; }

  get currentPlayerId(): string { return this.playerId; }

  get currentPlayers(): Array<IPlayerInfo> { return this.players; }

  private clearState(): void {
    this.gameId = '';
    this.playerId = '';
    this.players = [];
    this.onPlayerJoined = undefined;
    this.onPlayerLeaved = undefined;
  }

  private addPlayer(player: IPlayerInfo): IHubResponse<null> {
    this.players.push(player);
    this.players.sort((playerA, playerB) => playerA.position - playerB.position);
    this.onPlayerJoined?.call(this, player);
    return HubResponse.Ok();
  }

  private removePlayer(playerId: string): IHubResponse<null> {
    const removingPlayerIndex = this.players.findIndex((player) => player.id === playerId);
    if (removingPlayerIndex >= 0) {
      this.players.splice(removingPlayerIndex, 1);
      this.onPlayerLeaved?.call(this, playerId);
    }
    return HubResponse.Ok();
  }

  onPlayerJoined?: (playerInfo: IPlayerInfo) => void;

  onPlayerLeaved?: (playerId: string) => void;

  /**
   * This method returns promise, that resolve with gameId: string as argument
   */
  async newGame(): Promise<string> {
    this.clearState();
    this.gameId = await this.connection.dispatch<string>(HubEventsServer.NewGame);
    return this.gameId;
  }

  /**
   * This method returns array of players, who already joined to game
   */
  async joinGame(gameId: string): Promise<IPlayerInfo[]> {
    this.clearState();
    const playersInGame = await this.connection.dispatch<IPlayerInfo[]>(HubEventsServer.JoinGame, gameId);
    this.players.push(...playersInGame);
    return playersInGame;
  }

  /**
   * This method returns nothing now, but it should returns anything
   */
  async startGame(): Promise<void> {
    await this.connection.dispatch<void>(HubEventsServer.StartGame);
  }

  /**
   * This method returns created player
   */
  async createHero(request: ICreatePlayerRequest): Promise<IPlayerInfo> {
    const playerInfo = await this.connection.dispatch<IPlayerInfo>(HubEventsServer.AddPlayer, request);
    this.playerId = playerInfo.id;
    return playerInfo;
  }
}
