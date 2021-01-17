import {
  MAX_HEALTH,
  START_HEALTH,
} from '../../../common';
import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement, delay } from '../../../common/utils';

const DEAD_WIZARD = 'R.I.P.';
const RECOVERY_ANIMATION_DELAY = 0;
const DAMAGE_ANIMATION_DELAY = 0;

export class GamePlayerDisplay extends BaseComponent {
  private playerHealth: HTMLElement;

  constructor(
    private name: string,
    private heroName: string,
    private avatar: string,
    private health: number = START_HEALTH,
    private isCurrentPlayer: boolean = false,
  ) {
    super([CSSClasses.GamePlayerDisplayContainer]);

    const playerName = createElement(Tags.Div, [CSSClasses.GamePlayerName], this.name);
    const playerHero = createElement(Tags.Div, [CSSClasses.GamePlayerHero], this.heroName);
    const playerAvatar = createElement(Tags.Img, [CSSClasses.GamePlayerAvatar]);

    this.playerHealth = createElement(Tags.Div, [CSSClasses.GamePlayerHealth]);

    playerAvatar.setAttribute('src', this.avatar);
    playerAvatar.setAttribute('alt', this.heroName);

    this.playerHealth.textContent = `${this.health} / ${MAX_HEALTH}`;

    if (this.isCurrentPlayer === true) {
      this.element.append(playerAvatar, playerHero, this.playerHealth);
    } else {
      this.element.append(playerAvatar, playerName, playerHero, this.playerHealth);
    }
  }

  updateHealth(): void {
    this.playerHealth.textContent = `${this.health} / ${MAX_HEALTH}`;

    if (this.health <= 0) {
      this.playerHealth.innerHTML = '';
      this.playerHealth.textContent = DEAD_WIZARD;
    }
  }

  addHealth = async (num: number): Promise<void> => {
    this.element.classList.add(CSSClasses.InGameAddHealthAnimation);
    this.health += num;

    if (this.health > MAX_HEALTH) {
      this.health = MAX_HEALTH;
    }

    await delay(RECOVERY_ANIMATION_DELAY);
    this.element.classList.remove(CSSClasses.InGameAddHealthAnimation);
    this.updateHealth();
  };

  bringDamage = async (num: number): Promise<void> => {
    this.element.classList.add(CSSClasses.InGameBringDamageAnimation);
    this.health -= num;

    if (this.health <= 0) {
      this.health = 0;
    }

    await delay(DAMAGE_ANIMATION_DELAY);
    this.element.classList.remove(CSSClasses.InGameBringDamageAnimation);
    this.updateHealth();
  };
}
