/* eslint-disable no-param-reassign */
import {
  HubEventsServer,
  ICard,
  IHubResponse,
  IPlayerInfo,
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
    if (this.games.size >= MAX_GAMES) return GameService.error('Max games limit is reached. Please, try again later');
    if (this.games.has(gameId)) return GameService.error('The game is already exists');
    const game = new Game(this.getCards());
    this.games.set(gameId, game);
    console.log(`Create a new game with id ${gameId}. Games now: ${this.games.size}`);
    return GameService.success(gameId);
  }

  joinGame(gameId: string): IHubResponse<IPlayerInfo[] | string> {
    if (this.games.has(gameId)) {
      // TODO: get playerInfo object from players in game
      // return GameService.success<IPlayerInfo[]>([]);
      return GameService.error('Not implemented');
    }
    return GameService.notFound();
  }

  startGame(connection: ClientConnection): IHubResponse<string | null> {
    if (!this.games.has(connection.currentGameId)) return GameService.notFound();
    const game = <Game>(this.games.get(connection.currentGameId));
    try {
      game.startGame();
      // TODO: return any data about game?
      return GameService.success<null>(null);
    } catch (err: unknown) {
      return GameService.error((<Error> err)?.message);
    }
  }

  createPlayer(gameId: string /* connection: ClientConnection */): IHubResponse<IPlayerInfo | string> {
    if (!this.games.has(gameId)) return GameService.notFound();
    const game = <Game>(this.games.get(gameId));
    // TODO: replace to call method of PlayerService
    const player = new Player();
    game.addPlayer(player);
    // TODO: get playerInfo object from player
    // return GameService.success<IPlayerInfo>(...);
    return GameService.error('Not implemented');
  }

  private static success<T>(data: T): IHubResponse<T> { return { isSuccess: true, data }; }

  private static error = (message?: string): IHubResponse<string> => ({ isSuccess: false, data: message || '' });

  private static notFound = (): IHubResponse<string> => GameService.error('Game not found');
}
