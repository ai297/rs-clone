import { ClientConnection } from './client-connection';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function createFackeConnection(): ClientConnection {
  return new ClientConnection({
    id: Math.random().toFixed(10),
    on: () => { },
    emit: () => { },
  });
}
