import { ICallbackHandler } from '../interfaces';
import { IHubResponse } from '../interfaces/DTO/hub-response';
import { ISocket } from './soket-iterface';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

  addEventListener<T>(event: TEvent, handler: (...args: any[]) => IHubResponse<T> | Promise<IHubResponse<T>>): void {
    this.socket.on(String(event), (...args: any[]): void => {
      let callback: ICallbackHandler | undefined;
      let data = args;
      if (args.length >= 1 && typeof args[args.length - 1] === 'function') {
        callback = args[args.length - 1] as ICallbackHandler;
        data = args.slice(0, -1);
      }
      const result = handler(...data);
      if (result instanceof Promise) {
        (<Promise<IHubResponse<T>>> result).then((response) => {
          if (callback) callback(response);
        });
      } else if (callback) callback(result);
    });
  }
}
