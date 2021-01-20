import { ICallbackHandler } from '../interfaces';

export interface ISocket {
  id: string,
  on: ICallbackHandler,
  emit: ICallbackHandler,
}
