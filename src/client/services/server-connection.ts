import { Manager } from 'socket.io-client';
import { HubEventsServer, IHubResponse } from '../../common';

export class ServerConnection {
  private readonly socket: SocketIOClient.Socket;

  constructor(url: string) {
    this.socket = ServerConnection.createSocket(url);
  }

  startNewGame(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.socket.emit(HubEventsServer.NewGame, (response: IHubResponse): void => {
        if (response.isSuccess) resolve(response.message || '');
        else reject(Error(response.message));
      });
    });
  }

  joinToGame(gameId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.socket.emit(HubEventsServer.JoinGame, gameId, (response: IHubResponse): void => {
        if (response.isSuccess) resolve(response.message || '');
        else reject(Error(response.message));
      });
    });
  }

  private static createSocket(url: string): SocketIOClient.Socket {
    const manager = new Manager(url, {
      path: '/hub',
      reconnectionAttempts: 3,
      reconnectionDelay: 500,
      reconnectionDelayMax: 1000,
      transports: ['websocket', 'polling'],
    });
    // TODO: implement connection error handlers
    manager.on('error', () => {
      console.log('Connection fail');
    });
    manager.on('reconnect_failed', () => {
      console.log('All connection attempts is failed');
    });

    const socket = manager.socket('game-hub');
    // TODO: don't forget remove console log!
    socket.on('connect', () => {
      console.log('Connected to server with id -', socket.id);
    });
    // TODO: add handlers to socket here
    return socket;
  }
}
