import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { PlayerListItem } from '../player-list-item/player-list-item';

export class PlayerList extends BaseComponent {
  private players: Record<string, PlayerListItem>;

  constructor() {
    super(CSSClasses.PlayerList);
    this.players = {};
  }

  addPlayer(name: string, hero: string, avatar: string): HTMLElement {
    const newPlayer: PlayerListItem = new PlayerListItem(name, hero, avatar);

    this.players[name] = newPlayer;
    this.element.append(newPlayer.element);

    return this.element;
  }

  removePlayer(name: string): void {
    this.players[name]?.element.remove();
    delete this.players[name];
  }
}
