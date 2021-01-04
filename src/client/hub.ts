import io from 'socket.io-client';

export default class Hub {
  private socket;

  constructor(url: string, gameId: string) {
    this.socket = io(url, {
      path: '/hub',
      reconnectionDelayMax: 10000,
      query: {
        game: gameId,
      },
    });
  }
}
