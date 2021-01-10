import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { PlayerListItem } from '../player-list-item/player-list-item';

export class PlayerList extends BaseComponent {
  private items: Record<string, PlayerListItem>;

  constructor() {
    super(CSSClasses.PlayerList);
    this.items = {};
  }

  addPlayer(name: string, hero: string, avatar: string): HTMLElement {
    const newPlayer: PlayerListItem = new PlayerListItem(name, hero, avatar);

    this.items[name] = newPlayer;
    this.element.append(newPlayer.element);

    return this.element;
  }

  removePlayer(name: string): void {
    this.items[name]?.element.remove();
    delete this.items[name];
  }
}
