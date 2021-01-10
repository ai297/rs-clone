import { Manager } from 'socket.io-client';
import {
  BaseConnection,
  CONNECTION_ATTEMPTS,
  CONNECTION_NAMESPACE,
  CONNECTION_PATH,
  HubEventsServer,
  HubEventsClient,
} from '../../common';

export class ServerConnection extends BaseConnection<HubEventsServer, HubEventsClient> {
  constructor(url: string) {
    super(ServerConnection.createSocket(url));
  }

  private static createSocket(url: string): SocketIOClient.Socket {
    const manager = new Manager(url, {
      path: CONNECTION_PATH,
      reconnectionAttempts: CONNECTION_ATTEMPTS,
    });
    // TODO: implement connection error handlers
    manager.on('error', () => {
      console.log('Connection fail');
    });
    manager.on('reconnect_failed', () => {
      console.log('All connection attempts is failed');
    });

    const socket = manager.socket(CONNECTION_NAMESPACE);
    // TODO: don't forget remove console log!
    socket.on('connect', () => {
      console.log('Connected to server with id -', socket.id);
    });
    // TODO: add handlers to socket here
    return socket;
  }
}
