import { Server } from 'http';
import { ConnectionEvents, ConnectionService } from './connection';
import { CardRepository, GameService } from './services';

export default class App {
  private readonly connectionService: ConnectionService;

  private readonly gameService: GameService;

  constructor(private server: Server, path: string) {
    const cardsRepository = new CardRepository(path);
    this.connectionService = new ConnectionService();
    this.gameService = new GameService(cardsRepository, this.connectionService);

    // TODO: don't forget delete console logs
    // this.connectionService.addEventListener(
    //   ConnectionEvents.Connect,
    //   (con) => {
    //     console.log(`a user connected with id ${con.id}`);
    //   },
    // );
    // this.connectionService.addEventListener(
    //   ConnectionEvents.Disconnect,
    //   (con) => console.log(`a user with id ${con.id} disconnected`),
    // );
    this.connectionService.attachToServer(this.server);
  }

  start(port: number): void {
    this.server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server started on port ${port}`);
    });
  }
}
