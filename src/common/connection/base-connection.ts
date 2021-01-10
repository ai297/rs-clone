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

  dispatch<T>(command: TRequest, ...args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.socket.emit(String(command), ...args, (response: IHubResponse<T>): void => {
        if (response.isSuccess) resolve(response.data);
        else reject(Error(String(response.data)));
      });
    });
  }

  addEventListener<T>(event: TEvent, handler: (...args: any[]) => IHubResponse<T>): void {
    this.socket.on(String(event), (...args: any[]): void => {
      if (args.length < 1 || typeof args[args.length - 1] !== 'function') return;
      const callback = args.splice(-1, 1)[0];
      callback(handler(...args));
    });
  }
}
