import { IHubResponse } from '../interfaces/DTO/hub-response';

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface ISocket {
  id: string,
  on: Function,
  emit: Function,
}

export abstract class BaseConnection<TRequest, TEvent> {
  constructor(protected readonly socket: ISocket) { }

  get id(): string { return this.socket.id; }

  dispatch<T>(command: TRequest): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      this.socket.emit(String(command), (response: IHubResponse<T>): void => {
        if (response.isSuccess) resolve(response.data);
        else reject(Error(String(response.data)));
      });
    });
  }

  addEventListener<T>(event: TEvent, handler: (...args: any[]) => IHubResponse<T>): void {
    this.socket.on(String(event), (...args: any[]): void => {
      let callback;
      if (args.length >= 1 && typeof args[args.length - 1] === 'function') callback = args[args.length - 1];
      const result = handler(...(args.slice(0, -1)));
      if (callback) callback(result);
    });
  }
}
