/* eslint-disable class-methods-use-this */
import { BaseComponent } from '../base-component';
import heroesData from '../../../../public/heroes.json';
import { createElement } from '../../../common';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { BaseButton } from '../base-button/base-button';

export class HeroSelection extends BaseComponent {
  private markedHero: HTMLElement | null;

  private heroes: Record<string, HTMLElement>;

  constructor() {
    super(CSSClasses.HeroSelection);
    this.heroes = {};
    this.markedHero = null;
    this.createMarkup();
  }

  createMarkup() : void {
    const heroesContainer = createElement(Tags.Div, [CSSClasses.HeroesContainer], '');
    heroesData.forEach((elem) => {
      const hero = createElement(Tags.Div, [CSSClasses.Hero]);
      hero.setAttribute('id', elem.id);
      hero.innerHTML = `<div class="${CSSClasses.HeroImage}">
                          <img src="${ImagesPaths.Avatars}${elem.id}.png" alt="${elem.id}">
                        </div>
                        <div class="${CSSClasses.HeroName}">${elem.name}</div>`;
      this.heroes[elem.id] = hero;
      heroesContainer.append(hero);
    });
    const heroSelectionButton = new BaseButton('Готово', this.setHero);
    this.element.append(heroesContainer, heroSelectionButton.element);
    heroesContainer.addEventListener('click', this.switchHero);
  }

  public makeDisabled(id: string): void {
    this.heroes[id]?.classList.add(CSSClasses.HeroDisabled);
  }

  private switchHero(event: Event): void {
    this.markedHero?.classList.remove(CSSClasses.HeroMarked);
    const target: HTMLElement | null = (<HTMLElement>event.target).closest(`.${CSSClasses.Hero}`);
    if (target) {
      this.markedHero = target;
      this.markedHero.classList.add(CSSClasses.HeroMarked);
    }
  }

  // пока не заработал диспач ивента
  private setHero() : void {
    if (this.markedHero) {
      this.element.dispatchEvent(new CustomEvent('hero-selected', {
        detail: this.markedHero.getAttribute('id'),
        bubbles: true,
        composed: true,
      }));
    }
  }
}
