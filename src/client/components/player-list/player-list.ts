import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { PlayerListItem } from '../player-list-item/player-list-item';

export class PlayerList extends BaseComponent {
  constructor() {
    super(CSSClasses.PlayerList);
  }

  addPlayer(name: string, hero: string, avatar: string): HTMLElement {
    const newPlayer: PlayerListItem = new PlayerListItem(name, hero, avatar);
    this.element.append(newPlayer.element);

    return this.element;
  }

  removePlayer(name: string): void {
    const players = this.element.querySelectorAll(`.${CSSClasses.PlayerName}`);
    let removedPlayer: HTMLElement | null = null;

    players.forEach((player) => {
      if (player.textContent === name) {
        removedPlayer = player.closest(`.${CSSClasses.PlayerListItem}`);
      }
    });

    if (removedPlayer) {
      (removedPlayer as HTMLElement).remove();
    }
  }
}
