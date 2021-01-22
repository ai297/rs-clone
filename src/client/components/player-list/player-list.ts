import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { PlayerListItem } from './player-list-item';
import { EmptyItem } from './empty-item';
import { MAX_PLAYERS } from '../../../common';

export class PlayerList extends BaseComponent {
  private players: Record<string, PlayerListItem> = {};

  private emptyItems: Array<EmptyItem> = [];

  constructor() {
    super([CSSClasses.PlayerList]);
    for (let i = 0; i < MAX_PLAYERS; i++) {
      const emptyItem = new EmptyItem();
      this.emptyItems.push(emptyItem);
      this.element.append(emptyItem.element);
    }
  }

  addPlayer(id: string, name: string, hero: string, avatar: string): void {
    if (this.emptyItems.length === 0) return;
    const emptyItem = <EmptyItem> this.emptyItems.shift();
    const newPlayer: PlayerListItem = new PlayerListItem(id, name, hero, avatar);

    this.players[id] = newPlayer;
    this.element.replaceChild(newPlayer.element, emptyItem.element);
  }

  removePlayer(id: string): void {
    if (!this.players[id]) return;
    const emptyItem = new EmptyItem();
    this.emptyItems.push(emptyItem);
    this.players[id]?.element.remove();
    delete this.players[id];
    this.element.append(emptyItem.element);
  }
}
