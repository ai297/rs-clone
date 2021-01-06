import http from 'http';
import { Server, Socket } from 'socket.io';
import { ClientConnection } from './client-connection';

export class ConnectionService {
  private readonly io: Server;

  onUserConnected?: (connection: ClientConnection) => void;

  onUserDisconnected?: (connection: ClientConnection) => void;

  constructor() {
    this.io = new Server({
      path: '/hub',
      cookie: false,
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket: Socket) => {
      const connection = new ClientConnection(socket);
      socket.on('disconnect', () => this.onUserDisconnected?.call(this, connection));
      this.onUserConnected?.call(this, connection);
    });
  }

  attachToServer(server: http.Server): void {
    this.io.attach(server);
  }
}
