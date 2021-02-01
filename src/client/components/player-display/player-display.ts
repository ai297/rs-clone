import {
  MAX_HEALTH,
  START_HEALTH,
  MIDDLE_HEALTH_PERСENT,
  LOW_HEALTH_PERСENT,
  createElement,
  delay,
} from '../../../common';
import { BaseComponent } from '../base-component';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';

const DEAD_WIZARD = 'R. I. P.';
const RECOVERY_ANIMATION_DELAY = 2000;
const DAMAGE_ANIMATION_DELAY = 2000;

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

    this.playerAvatar.setAttribute('src', `${ImagesPaths.HeroesAvatars}${this.avatar}.png`);
    this.playerAvatar.setAttribute('alt', this.heroName);

    this.updateHealth();

    if (this.isCurrentPlayer === true) {
      this.element.classList.add(CSSClasses.GamePlayerDisplayContainerCurrent);
      this.element.append(this.playerAvatar, playerHero, this.playerHealth);
    } else {
      this.element.classList.add(CSSClasses.GamePlayerDisplayContainerOpponent);
      this.element.append(this.playerAvatar, playerName, playerHero, this.playerHealth);
    }
  }

  setSelected(val = true): void {
    this.element.classList.toggle(CSSClasses.GamePlayerSelected, val);
  }

  private updateHealth(): void {
    this.playerHealth.textContent = `${this.health}/${MAX_HEALTH}`;
    this.updateScaleColor(this.health / MAX_HEALTH);

    if (this.health <= 0) {
      this.element.classList.add(`${CSSClasses.GamePlayerDisplayContainer}--dead`);
      this.playerAvatar.setAttribute('src', `${ImagesPaths.HeroesDeaths}${this.avatar}.png`);

      this.playerHealth.innerHTML = '';
      this.playerHealth.textContent = DEAD_WIZARD;
    }
  }

  private updateScaleColor(persentHealth: number): void {
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

  addHealth = async (currentHealth: number, points: number): Promise<void> => {
    const pointsAnimation = createElement(
      Tags.Div,
      [CSSClasses.GamePlayerPointsAnimation],
      `+${points}`,
    );
    this.element.append(pointsAnimation);
    await delay(50);
    pointsAnimation.classList.add(CSSClasses.InGameAddHealthAnimation);

    this.health = currentHealth;

    if (this.health > MAX_HEALTH) {
      this.health = MAX_HEALTH;
    }

    await delay(DAMAGE_ANIMATION_DELAY / 2);
    this.updateHealth();
    await delay(DAMAGE_ANIMATION_DELAY / 2);
    pointsAnimation.remove();
  };

  bringDamage = async (currentHealth: number, points: number): Promise<void> => {
    const pointsAnimation = createElement(
      Tags.Div,
      [CSSClasses.GamePlayerPointsAnimation],
      `-${points}`,
    );
    this.element.append(pointsAnimation);
    await delay(50);
    pointsAnimation.classList.add(CSSClasses.InGameBringDamageAnimation);

    this.health = currentHealth;

    if (this.health <= 0) {
      this.health = 0;
    }

    await delay(DAMAGE_ANIMATION_DELAY / 2);
    this.updateHealth();
    await delay(DAMAGE_ANIMATION_DELAY / 2);
    pointsAnimation.remove();
  };
}
