import { ICard, IHubResponse } from '../../common';
import { Player } from '../player';
import { Game } from './game';

const MAX_GAMES = 100;

export class GameService {
  private readonly getCards: () => Array<ICard>;

  private games: Map<string, Game> = new Map<string, Game>();

  constructor(deckFactory: () => Array<ICard>) {
    this.getCards = deckFactory;
  }

  newGame(id: string): IHubResponse {
    if (this.games.size >= MAX_GAMES) return GameService.error('Max games limit is reached. Please, try again later');
    if (this.games.has(id)) return GameService.error('The game is already exists');
    const game = new Game(this.getCards());
    this.games.set(id, game);
    console.log(`Create a new game with id ${id}. Games now: ${this.games.size}`);
    return { isSuccess: true, message: id };
  }

  joinGame(id: string): IHubResponse {
    if (this.games.has(id)) {
      return { isSuccess: true, message: id };
    }
    return GameService.notFound();
  }

  startGame(id: string): IHubResponse {
    if (!this.games.has(id)) return GameService.notFound();
    const game = <Game>(this.games.get(id));
    try {
      game.startGame();
      return { isSuccess: true };
    } catch (err: unknown) {
      return GameService.error((<Error> err)?.message);
    }
  }

  addPlayer(gameId: string, player: Player): IHubResponse {
    if (!this.games.has(gameId)) return GameService.notFound();
    const game = <Game> this.games.get(gameId);
    try {
      game.addPlayer(player);
      return { isSuccess: true };
    } catch (err: unknown) {
      return GameService.error((<Error> err)?.message);
    }
  }

  private static error = (message?: string): IHubResponse => ({ isSuccess: false, message });

  private static notFound = (): IHubResponse => GameService.error('Game not found');
}
