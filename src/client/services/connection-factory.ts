import { ServerConnection } from './server-connection';

export function createConnectionFactory(url: string): () => Promise<ServerConnection> {
  let connection: ServerConnection;
  return (): Promise<ServerConnection> => {
    if (connection) return Promise.resolve(connection);
    return new Promise<ServerConnection>((resolve, reject) => {
      connection = new ServerConnection(
        url,
        () => resolve(connection),
        () => reject(Error('Connection fail')),
      );
    });
  };
}
