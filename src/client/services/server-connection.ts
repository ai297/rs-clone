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
  constructor(url: string, onConnected?: () => void, onError?: () => void) {
    const socket = ServerConnection.createSocket(url, onConnected, onError);
    super(socket);
  }

  private static createSocket(url: string, onConnected?: () => void, onError?: () => void): SocketIOClient.Socket {
    const manager = new Manager(url, {
      path: CONNECTION_PATH,
      reconnectionAttempts: CONNECTION_ATTEMPTS,
    });
    manager.on('reconnect_failed', () => {
      if (onError) onError();
    });

    const socket = manager.socket(CONNECTION_NAMESPACE);
    socket.on('connect', () => {
      if (onConnected) onConnected();
    });
    return socket;
  }
}
