import {
  MAX_HEALTH,
  START_HEALTH,
  createElement,
  delay,
} from '../../../common';
import { BaseComponent } from '../base-component';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';

const MIDDLE_HEALTH_PERСENT = 0.6;
const LOW_HEALTH_PERСENT = 0.2;
const DEAD_WIZARD = 'R. I. P.';
const RECOVERY_ANIMATION_DELAY = 3000;
const DAMAGE_ANIMATION_DELAY = 2500;

const PRIMARY_SUCCESS_COLOR = '#0EB70B';
const PRIMARY_SUCCESS_COLOR_OPACITY = 'rgba(14, 183, 11, 0.5)';
const SECONDARY_WARNING_COLOR = '#F5A404';
const SECONDARY_WARNING_COLOR_OPACITY = 'rgba(245, 164, 4, 0.5)';
const SECONDARY_ATTENTION_COLOR = '#F11721';
const SECONDARY_ATTENTION_COLOR_OPACITY = 'rgba(241, 23, 33, 0.5)';
const PRIMARY_DARK_COLOR = '#1E1E1E';

export class GamePlayerDisplay extends BaseComponent {
  private playerHealth: HTMLElement;

  private playerAvatar: HTMLElement;

  private pointsAnimation: HTMLElement;

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

    this.playerAvatar = createElement(Tags.Img, [CSSClasses.GamePlayerAvatar]);
    this.playerHealth = createElement(Tags.Div, [CSSClasses.GamePlayerHealth]);

    this.pointsAnimation = createElement(Tags.Div, [CSSClasses.GamePlayerPointsAnimation]);

    this.playerAvatar.setAttribute('src', `${ImagesPaths.HeroesAvatars}${this.avatar}.png`);
    this.playerAvatar.setAttribute('alt', this.heroName);

    this.updateHealth();

    if (this.isCurrentPlayer === true) {
      this.element.classList.add(CSSClasses.GamePlayerDisplayContainerCurrent);
      this.element.append(this.playerAvatar, playerHero, this.playerHealth, this.pointsAnimation);
    } else {
      this.element.classList.add(CSSClasses.GamePlayerDisplayContainerOpponent);
      this.element.append(this.playerAvatar, playerName, playerHero, this.playerHealth, this.pointsAnimation);
    }
  }

  updateHealth(): void {
    this.playerHealth.textContent = `${this.health}/${MAX_HEALTH}`;
    this.updateScaleColor(this.health / MAX_HEALTH);

    if (this.health <= 0) {
      this.playerAvatar.setAttribute('src', `${ImagesPaths.HeroesDeaths}${this.avatar}.png`);
      this.element.classList.add(CSSClasses.GameOpponentSection);

      this.playerHealth.innerHTML = '';
      this.playerHealth.textContent = DEAD_WIZARD;
    }
  }

  updateScaleColor(persentHealth: number): void {
    let healthLevel = 'high';
    let color = PRIMARY_SUCCESS_COLOR;
    let colorOpacity = PRIMARY_SUCCESS_COLOR_OPACITY;

    this.playerHealth.setAttribute('class', CSSClasses.GamePlayerHealth);

    if (persentHealth < MIDDLE_HEALTH_PERСENT) {
      healthLevel = 'middle';
      color = SECONDARY_WARNING_COLOR;
      colorOpacity = SECONDARY_WARNING_COLOR_OPACITY;
    }

    if (persentHealth <= LOW_HEALTH_PERСENT) {
      healthLevel = 'low';
      color = SECONDARY_ATTENTION_COLOR;
      colorOpacity = SECONDARY_ATTENTION_COLOR_OPACITY;
    }

    this.playerHealth.classList.add(`${CSSClasses.GamePlayerHealth}--${healthLevel}`);

    this.playerHealth.style.backgroundImage = `
      linear-gradient(90deg,
                      transparent 0%,
                      transparent ${persentHealth * 100}%,
                      ${PRIMARY_DARK_COLOR} ${persentHealth * 100}%,
                      ${PRIMARY_DARK_COLOR} 100%),
      linear-gradient(180deg,
                      ${color} 0%,
                      ${colorOpacity} 100%)`;
  }

  addHealth = async (points: number): Promise<void> => {
    this.pointsAnimation.classList.remove(CSSClasses.GamePlayerPointsHidden);
    this.pointsAnimation.classList.add(CSSClasses.InGameAddHealthAnimation);
    this.pointsAnimation.textContent = `+${points}`;

    this.health += points;

    if (this.health > MAX_HEALTH) {
      this.health = MAX_HEALTH;
    }

    await delay(RECOVERY_ANIMATION_DELAY);
    this.pointsAnimation.classList.remove(CSSClasses.InGameAddHealthAnimation);
    this.pointsAnimation.classList.add(CSSClasses.GamePlayerPointsHidden);
    this.updateHealth();
  };

  bringDamage = async (points: number): Promise<void> => {
    this.pointsAnimation.classList.add(CSSClasses.InGameBringDamageAnimation);
    this.pointsAnimation.textContent = `-${points}`;

    this.health -= points;

    if (this.health <= 0) {
      this.health = 0;
    }

    await delay(DAMAGE_ANIMATION_DELAY);
    this.pointsAnimation.textContent = '';
    this.pointsAnimation.classList.remove(CSSClasses.InGameBringDamageAnimation);
    this.updateHealth();
  };
}
