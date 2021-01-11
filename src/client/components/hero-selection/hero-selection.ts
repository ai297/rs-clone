import { BaseComponent } from '../base-component';
// import heroesData from '../../../../public/heroes.json';
import { createElement } from '../../../common';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { IHero } from '../../../common/interfaces';
import { callbackify } from 'util';

export class HeroSelection extends BaseComponent {
  private markedHero: HTMLElement | null;

  private heroes: Record<string, HTMLElement>;

  constructor(private onSelect: (heroId: string) => void) {
    super([CSSClasses.HeroSelection]);
    this.heroes = {};
    this.markedHero = null;
    this.createMarkup();
    this.onSelect('fff');
  }

  createMarkup() : void {
    fetch('./heroes.json')
      .then((response) => response.json())
      .then((data) => {
        data.forEach((elem: IHero) => {
          const hero = createElement(Tags.Div, [CSSClasses.Hero]);
          hero.setAttribute('id', elem.id);
          hero.innerHTML = `<div class="${CSSClasses.HeroImage}">
                          <img src="${ImagesPaths.HeroesAvatars}${elem.image}.png" alt="${elem.id}">
                        </div>
                        <div class="${CSSClasses.HeroName}">${elem.name}</div>`;
          this.heroes[elem.id] = hero;
          this.element.append(hero);
        });
      });
    this.element.addEventListener('click', (event) => this.selectHero(event));
  }

  public makeDisabled(id: string): void {
    this.heroes[id]?.classList.add(CSSClasses.HeroDisabled);
  }

  private selectHero(event: Event): void {
    this.markedHero?.classList.remove(CSSClasses.HeroSelected);
    const target: HTMLElement | null = (<HTMLElement>event.target).closest(`.${CSSClasses.Hero}`);
    if (target) {
      this.markedHero = target;
      this.markedHero.classList.add(CSSClasses.HeroSelected);
    }
    this.onSelect(String(this.markedHero?.id));
  }
}
