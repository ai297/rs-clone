import { Server } from 'http';
import { ConnectionEvents, ConnectionService } from './connection';
import CardRepository from './services/card-repository';
import { GameService } from './game/game-service';

export default class App {
  constructor(private server: Server) {
    const cardsRepository = new CardRepository();
    const connectionService = new ConnectionService();
    const gameService = new GameService(cardsRepository);

    // TODO: don't forget delete console logs
    connectionService.addEventListener(
      ConnectionEvents.Connect,
      (con) => {
        console.log(`a user connected with id ${con.id}`);
        gameService.configureConnection(con);
      },
    );
    connectionService.addEventListener(
      ConnectionEvents.Disconnect,
      (con) => console.log(`a user with id ${con.id} disconnected`),
    );
    connectionService.attachToServer(this.server);
  }

  start(port: number): void {
    this.server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server started on port ${port}`);
    });
  }
}
