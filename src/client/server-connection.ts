import io from 'socket.io-client';
import { HubEventsServer, IHubResponse } from '../common';

export default class ServerConnection {
  private readonly socket: SocketIOClient.Socket;

  constructor(url: string) {
    this.socket = ServerConnection.createSocket(url);
  }

  startNewGame(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.socket.emit(HubEventsServer.NewGame, (response: IHubResponse): void => {
        if (response.isSuccess) resolve(response.message);
        else reject(Error(response.message));
      });
    });
  }

  joinToGame(gameId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.socket.emit(HubEventsServer.JoinGame, gameId, (response: IHubResponse): void => {
        if (response.isSuccess) resolve(response.message);
        else reject(Error(response.message));
      });
    });
  }

  private static createSocket(url: string): SocketIOClient.Socket {
    const socket = io(url, {
      path: '/hub',
      reconnectionDelayMax: 10000,
    });
    // TODO: don't forget remove console log!
    socket.on('connect', () => {
      console.log('Connected to server', socket.id);
    });
    // TODO: add handlers to socket here
    return socket;
  }
}
