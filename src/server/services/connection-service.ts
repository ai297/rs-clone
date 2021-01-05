import http from 'http';
import { Server, Socket } from 'socket.io';
// import { HubEventsServer } from '../../common';

export default class ConnectionService {
  private readonly io: Server;

  constructor() {
    this.io = new Server({
      path: '/hub',
      cookie: false,
      transports: ['websocket', 'polling'],
    });

    // logging for test...
    this.io.on('connection', (socket: Socket) => {
      console.log(`a user connected with id ${socket.id}`);
      // TODO: add handlers for current connection here
    });
  }

  attachToServer(server: http.Server): void {
    this.io.attach(server);
  }
}
