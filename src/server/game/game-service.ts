import { HubEventsServer, ICard, IHubResponse } from '../../common';
import { ClientConnection } from '../connection';
import { Game } from './game';

const MAX_GAMES = 100;

export class GameService {
  private readonly getCards: () => Array<ICard>;

  private games: Map<string, Game> = new Map<string, Game>();

  constructor(deckFactory: () => Array<ICard>) {
    this.getCards = deckFactory;
  }

  configureConnection(connection: ClientConnection): void {
    connection.addEventListener(HubEventsServer.NewGame, (): IHubResponse => {
      if (this.games.size >= MAX_GAMES) {
        return { isSuccess: false, message: 'Max games limit is reached. Please, try agane later' };
      }
      if (this.games.has(connection.id)) return { isSuccess: false, message: 'The game is already exists' };
      const game = new Game(this.getCards());
      this.games.set(connection.id, game);
      console.log(`Create a new game with id ${connection.id}. Games now: ${this.games.size}`);
      return { isSuccess: true, message: connection.id };
    });

    connection.addEventListener(HubEventsServer.JoinGame, (gameId: string): IHubResponse => {
      if (this.games.has(gameId)) {
        return { isSuccess: true, message: gameId };
      }
      return { isSuccess: false, message: 'Game not found' };
    });

    connection.addEventListener(HubEventsServer.StartGame, (gameId: string): IHubResponse => {
      if (!this.games.has(gameId)) return { isSuccess: false, message: 'Game not found' };
      // const game = this.games.get(gameId);
      // game.startGame();
      // return { isSuccess: true };
      return { isSuccess: false, message: 'Not implemented' };
    });
  }
}
