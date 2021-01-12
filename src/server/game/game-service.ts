import {
  HubEventsServer,
  ICard,
  IHubResponse,
  HubResponse,
  IPlayerInfo,
  // HubEventsClient,
} from '../../common';
import { ClientConnection } from '../connection';
import { Player } from '../player';
import { Game } from './game';

const MAX_GAMES = 100;

interface ICardRepository {
  getData: () => ICard[]
}

export class GameService {
  private readonly getCards: () => Array<ICard>;

  private games: Map<string, Game> = new Map<string, Game>();

  constructor(cardRepo: ICardRepository) {
    this.getCards = cardRepo.getData.bind(cardRepo);
  }

  configureConnection(connection: ClientConnection): void {
    connection.addEventListener(HubEventsServer.NewGame, () => this.newGame(connection.id));
    connection.addEventListener(HubEventsServer.JoinGame, (gameId: string) => this.joinGame(gameId));
    connection.addEventListener(HubEventsServer.StartGame, () => this.startGame(connection));
    connection.addEventListener(HubEventsServer.AddPlayer, (gameId: string) => this.createPlayer(gameId));
  }

  newGame(gameId: string): IHubResponse<string> {
    if (this.games.size >= MAX_GAMES) return HubResponse.Error('Max games limit is reached. Please, try again later');
    if (this.games.has(gameId)) return HubResponse.Error('The game is already exists');
    const game = new Game(this.getCards());
    this.games.set(gameId, game);
    console.log(`Create a new game with id ${gameId}. Games now: ${this.games.size}`);
    return HubResponse.Success(gameId);
  }

  joinGame(gameId: string): IHubResponse<IPlayerInfo[] | string> {
    if (this.games.has(gameId)) {
      // TODO: get playerInfo object from players in game
      // return GameService.success<IPlayerInfo[]>([]);
      return HubResponse.Error('Not implemented');
    }
    return GameService.notFound();
  }

  startGame(connection: ClientConnection): IHubResponse<string | null> {
    if (!this.games.has(connection.currentGameId)) return GameService.notFound();
    const game = <Game>(this.games.get(connection.currentGameId));
    try {
      game.startGame();
      // TODO: return any data about game?
      return HubResponse.Ok();
    } catch (err: unknown) {
      return HubResponse.Error((<Error> err)?.message);
    }
  }

  createPlayer(gameId: string /* connection: ClientConnection */): IHubResponse<IPlayerInfo | string> {
    if (!this.games.has(gameId)) return GameService.notFound();
    const game = <Game>(this.games.get(gameId));
    // TODO: replace to call method of PlayerService
    const player = new Player();
    game.addPlayer(player);
    // TODO: get playerInfo object from player
    // connection.dispatch(HubEventsClient.AddPlayer, playerInfo)
    // return GameService.success<IPlayerInfo>(...);
    return HubResponse.Error('Not implemented');
  }

  private static notFound = (): IHubResponse<string> => HubResponse.Error('Game not found');
}
