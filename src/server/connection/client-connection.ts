import { Socket } from 'socket.io';
import { BaseConnection, HubEventsClient, HubEventsServer } from '../../common';

export class ClientConnection extends BaseConnection<HubEventsClient, HubEventsServer> {
  protected gameId = '';

  get currentGameId(): string { return this.gameId; }

  setGameId(gameId: string): void {
    const socket = <Socket> this.socket;
    if (this.gameId) socket.leave(this.gameId);
    this.gameId = gameId;
    socket.join(this.gameId);
  }

  removeListeners(event: HubEventsServer): void {
    const socket = <Socket> this.socket;
    socket.removeAllListeners(event);
  }

  sendOthers<T>(event: HubEventsClient, data?: T): void {
    const socket = <Socket> this.socket;
    socket.to(this.currentGameId).emit(String(event), data);
  }
}
