import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement } from '../../../common/utils';

const MAX_HEALTH = 25;
const START_HEALTH = 20;
const DEAD_WIZARD = 'R.I.P.';

export class GamePlayerDisplay extends BaseComponent {
  private playerHealth: HTMLElement;

  constructor(
    private name: string,
    private heroName: string,
    private avatar: string,
    private health: number = START_HEALTH,
    private isGameCreator: boolean = false,
  ) {
    super([CSSClasses.GamePlayerDisplayContainer]);

    const playerName = createElement(Tags.Div, [CSSClasses.GamePlayerName], this.name);
    const playerHero = createElement(Tags.Div, [CSSClasses.GamePlayerHero], this.heroName);
    const playerAvatar = createElement(Tags.Img, [CSSClasses.GamePlayerAvatar]);

    this.playerHealth = createElement(Tags.Div, [CSSClasses.GamePlayerHealth]);

    playerAvatar.setAttribute('src', this.avatar);
    playerAvatar.setAttribute('alt', this.heroName);

    this.playerHealth.textContent = `${this.health} / ${MAX_HEALTH}`;

    if (isGameCreator === true) {
      this.element.append(playerAvatar, playerHero, this.playerHealth);
    } else {
      this.element.append(playerAvatar, playerName, playerHero, this.playerHealth);
    }
  }

  updateHealth(): string {
    this.playerHealth.textContent = `${this.health} / ${MAX_HEALTH}`;

    if (this.health <= 0) {
      this.playerHealth.innerHTML = '';
      this.playerHealth.textContent = DEAD_WIZARD;
    }

    return this.playerHealth.textContent;
  }

  addHealth(num: number): string {
    this.health += num;

    if (this.health > MAX_HEALTH) {
      this.health = MAX_HEALTH;
    }

    return this.updateHealth();
  }

  takeDamage(num: number): string {
    this.health -= num;

    if (this.health <= 0) {
      this.health = 0;
    }

    return this.updateHealth();
  }
}
