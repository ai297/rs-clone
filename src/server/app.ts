import { Server } from 'http';
import { ConnectionService } from './connection';

export default class App {
  private readonly connectionService: ConnectionService;

  constructor(private server: Server) {
    this.connectionService = new ConnectionService();
    this.connectionService.attachToServer(this.server);

    // TODO: don't forget delete next console logs
    this.connectionService.onUserConnected = (con) => console.log(`a user connected with id ${con.id}`);
    this.connectionService.onUserDisconnected = (con) => console.log(`a user with id ${con.id} disconnected`);
  }

  start(port: number): void {
    this.server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server started on port ${port}`);
    });
  }
}
