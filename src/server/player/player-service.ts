import { Player } from './player';

export class PlayerService {
  private readonly playersCache: Map<string, Player> = new Map<string, Player>();

  getPlayer(playerId: string): Player | null {
    if (this.playersCache.has(playerId)) return <Player> this.playersCache.get(playerId);
    return null;
  }

  addPlayer(playerId: string, player: Player): void {
    this.playersCache.set(playerId, player);
  }

  removePlayers(playerIds: Array<string>): void {
    playerIds.forEach((playerId) => this.playersCache.delete(playerId));
  }
}
