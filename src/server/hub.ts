import http from 'http';
import { Server } from 'socket.io';

export default class Hub {
  private io: Server;

  constructor() {
    this.io = new Server({
      path: '/hub',
      cookie: false,
      transports: ['websocket', 'polling'],
    });
  }

  init(server: http.Server): void {
    this.io.attach(server);
  }
}
