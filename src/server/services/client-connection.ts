import { Socket } from 'socket.io';
import { IHubResponse, HubEventsServer } from '../../common';

export default class ClientConnection {
  constructor(private readonly socket: Socket) { }

  get id(): string { return this.socket.id; }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  addEventListener(event: HubEventsServer, handler: (...args: any[]) => IHubResponse): void {
    this.socket.on(event, (...args: any[]): void => {
      if (args.length < 1 || typeof args[args.length - 1] !== 'function') return;
      const callback = args.splice(-1, 1)[0];
      callback(handler(...args));
    });
  }

  // TODO: Add methods for call client's methods here
}
