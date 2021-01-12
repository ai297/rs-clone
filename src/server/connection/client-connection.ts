import { Socket } from 'socket.io';
import { BaseConnection, HubEventsClient, HubEventsServer } from '../../common';

export class ClientConnection extends BaseConnection<HubEventsClient, HubEventsServer> {
  private gameId = '';

  get currentGameId(): string { return this.gameId; }

  setGameId(gameId: string): void {
    const socket = <Socket> this.socket;
    if (this.gameId) socket.leave(this.gameId);
    this.gameId = gameId;
    socket.join(this.gameId);
  }
}
