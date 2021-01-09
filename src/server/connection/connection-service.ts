import http from 'http';
import { Server, Socket } from 'socket.io';
import { CONNECTION_PATH } from '../../common';
import { ConnectionEvents } from './connection-events';
import { ClientConnection } from './client-connection';

type ConnectionHandler = (connection: ClientConnection) => void;

export class ConnectionService {
  readonly io: Server;

  private readonly onConnect: Set<ConnectionHandler> = new Set<ConnectionHandler>();

  private readonly onDisconnect: Set<ConnectionHandler> = new Set<ConnectionHandler>();

  constructor() {
    this.io = new Server({
      path: CONNECTION_PATH,
      cookie: false,
    });

    this.io.on(ConnectionEvents.Connect, (socket: Socket) => {
      const connection = new ClientConnection(socket);
      this.onConnect.forEach((handler) => handler(connection));
      socket.on(ConnectionEvents.Disconnect, () => this.onDisconnect.forEach((handler) => handler(connection)));
    });
  }

  addEventListener(event: ConnectionEvents, handler: ConnectionHandler): void {
    if (event === ConnectionEvents.Connect) this.onConnect.add(handler);
    else this.onDisconnect.add(handler);
  }

  removeEventListener(event: ConnectionEvents, handler: ConnectionHandler): void {
    if (event === ConnectionEvents.Connect) this.onConnect.delete(handler);
    else this.onDisconnect.delete(handler);
  }

  attachToServer(server: http.Server): void {
    this.io.attach(server);
  }
}
