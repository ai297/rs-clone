import { Server } from 'http';
import {
  HubEventsServer, ICard, IHubResponse, shuffleArray,
} from '../common';
import { ClientConnection, ConnectionService } from './connection';
import { GameService } from './game/game-service';
import { Player } from './player';
import { Game } from './game';
import { cards } from './test2';

export default class App {
  private readonly connectionService: ConnectionService;

  private readonly gameService: GameService;

  constructor(private server: Server) {
    this.connectionService = new ConnectionService();
    this.gameService = new GameService(() => []);

    // TODO: don't forget delete console logs
    this.connectionService.onUserConnected = (con) => this.configureConnection(con);
    this.connectionService.onUserDisconnected = (con) => console.log(`a user with id ${con.id} disconnected`);
    this.connectionService.attachToServer(this.server);
  }

  private configureConnection(connection: ClientConnection): void {
    console.log(`a user connected with id ${connection.id}`);
    connection.addEventListener(
      HubEventsServer.NewGame, (): IHubResponse => this.gameService.newGame(connection.id),
    );
    connection.addEventListener(
      HubEventsServer.JoinGame, (gameId: string): IHubResponse => this.gameService.joinGame(gameId),
    );
    connection.addEventListener(
      HubEventsServer.StartGame, (gameId: string): IHubResponse => this.gameService.startGame(gameId),
    );
  }

  start(port: number): void {
    this.server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server started on port ${port}`);
    });
  }
}

const game = new Game(shuffleArray(cards));

const player1 = new Player();
const player2 = new Player();
const player3 = new Player();

game.addPlayer(player1);
game.addPlayer(player2);
game.addPlayer(player3);

game.startGame();

// тестовая выдача карт она будет происходить не отсюда \\\\\\\
// обязательно удалить!!!!!
const fistNature = cards.find((card: ICard) => card.id === 'fist_nature');
const fountain_youth = cards.find((card: ICard) => card.id === 'fountain_youth');

player1.addSpellCards(player3.handCards.slice(0, 1));
player2.addSpellCards([fountain_youth as ICard]);
player3.addSpellCards(player3.handCards.slice(0, 1));

// cards.forEach((cur) => {
//   console.log(cur.id);
// });
