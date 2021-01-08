import { Server } from 'http';
import { HubEventsServer, IHubResponse } from '../common';
import { ClientConnection, ConnectionService } from './connection';
import { GameService } from './game/game-service';

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
