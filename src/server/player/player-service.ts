import { ClientConnection } from '../connection';
import { Player } from './player';

export class PlayerService {
  private readonly playersCache: Map<string, Player> = new Map<string, Player>();

  getPlayer(playerId: string, connection: ClientConnection): Player {
    let player: Player;
    if (!this.playersCache.has(playerId)) {
      player = new Player(connection);
      this.playersCache.set(playerId, player);
    } else {
      player = <Player> this.playersCache.get(playerId);
      player.changeConnection(connection);
    }
    return player;
  }

  removePlayers(playerIds: Array<string>): void {
    playerIds.forEach((playerId) => this.playersCache.delete(playerId));
  }
}
