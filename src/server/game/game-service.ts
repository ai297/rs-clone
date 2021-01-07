import { ICard, IHubResponse } from '../../common';
import { Game } from './game';

const MAX_GAMES = 100;

export class GameService {
  private readonly getCards: () => Array<ICard>;

  private games: Map<string, Game> = new Map<string, Game>();

  constructor(deckFactory: () => Array<ICard>) {
    this.getCards = deckFactory;
  }

  newGame(id: string): IHubResponse {
    if (this.games.size >= MAX_GAMES) {
      return { isSuccess: false, message: 'Max games limit is reached. Please, try agane later' };
    }
    if (this.games.has(id)) return { isSuccess: false, message: 'The game is already exists' };
    const game = new Game(this.getCards());
    this.games.set(id, game);
    console.log(`Create a new game with id ${id}. Games now: ${this.games.size}`);
    return { isSuccess: true, message: id };
  }

  joinGame(id: string): IHubResponse {
    if (this.games.has(id)) {
      return { isSuccess: true, message: id };
    }
    return { isSuccess: false, message: 'Game not found' };
  }

  startGame(id: string): IHubResponse {
    if (!this.games.has(id)) return { isSuccess: false, message: 'Game not found' };
    // const game = this.games.get(gameId);
    // game.startGame();
    // return { isSuccess: true };
    return { isSuccess: false, message: 'Not implemented' };
  }

  getGame(id: string): Game | null {
    return this.games.get(id) || null;
  }
}
