import { HubEventsServer, ICard, IHubResponse } from '../../common';
import { ClientConnection } from '../connection';
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
    connection.addEventListener(HubEventsServer.JoinGame, (id: string) => this.joinGame(id));
    connection.addEventListener(HubEventsServer.StartGame, (id: string) => this.startGame(id));
  }

  newGame(id: string): IHubResponse<string> {
    if (this.games.size >= MAX_GAMES) return GameService.error('Max games limit is reached. Please, try again later');
    if (this.games.has(id)) return GameService.error('The game is already exists');
    const game = new Game(this.getCards());
    this.games.set(id, game);
    console.log(`Create a new game with id ${id}. Games now: ${this.games.size}`);
    return { isSuccess: true, data: id };
  }

  joinGame(id: string): IHubResponse<string> {
    if (this.games.has(id)) {
      return { isSuccess: true, data: id };
    }
    return GameService.notFound();
  }

  startGame(id: string): IHubResponse<string> {
    if (!this.games.has(id)) return GameService.notFound();
    const game = <Game>(this.games.get(id));
    try {
      game.startGame();
      return { isSuccess: true };
    } catch (err: unknown) {
      return GameService.error((<Error> err)?.message);
    }
  }

  private static error = (message?: string): IHubResponse<string> => ({ isSuccess: false, data: message });

  private static notFound = (): IHubResponse<string> => GameService.error('Game not found');
}
