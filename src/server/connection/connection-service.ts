import http from 'http';
import { Server, Socket } from 'socket.io';
import { CONNECTION_PATH, HubEventsClient } from '../../common';
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

  /**
   * Send data to all players in game
   * @param gameId - target clients game id
   * @param event - type of event
   * @param data - sending data
   */
  dispatch<T>(gameId: string, event: HubEventsClient, data?: T): void {
    this.io.to(gameId).emit(event, data);
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
