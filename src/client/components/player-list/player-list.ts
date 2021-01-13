import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { PlayerListItem } from './player-list-item';

export class PlayerList extends BaseComponent {
  private players: Record<string, PlayerListItem>;

  constructor() {
    super([CSSClasses.PlayerList]);
    this.players = {};
  }

  addPlayer(id: string, name: string, hero: string, avatar: string): HTMLElement {
    const newPlayer: PlayerListItem = new PlayerListItem(id, name, hero, avatar);

    this.players[id] = newPlayer;
    this.element.append(newPlayer.element);

    return this.element;
  }

  removePlayer(id: string): void {
    this.players[id]?.element.remove();
    delete this.players[id];
  }
}
