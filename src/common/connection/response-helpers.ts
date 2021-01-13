import { IHubResponse } from '../interfaces';

export class HubResponse {
  static Success<T>(data: T): IHubResponse<T> { return { isSuccess: true, data }; }

  static Error = (message?: string): IHubResponse<string> => ({ isSuccess: false, data: message || '' });

  static Ok = (): IHubResponse<null> => HubResponse.Success<null>(null);
}
