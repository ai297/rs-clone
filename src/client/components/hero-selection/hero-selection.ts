import { BaseComponent } from '../base-component';
import { createElement } from '../../../common';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { IHero } from '../../../common/interfaces';

export class HeroSelection extends BaseComponent {
  private selectedHero: HTMLElement | null;

  private heroes: Map<string, HTMLElement> = new Map<string, HTMLElement>();

  constructor(private onSelect: (heroId: string) => void) {
    super([CSSClasses.HeroSelection]);
    this.selectedHero = null;
    this.createMarkup();
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
          this.heroes.set(elem.id, hero);
          this.element.append(hero);
        });
      });
    this.element.addEventListener('click', (event) => this.selectHero(event));
  }

  public makeDisabled(id: string): void {
    this.heroes.get(id)?.classList.add(CSSClasses.HeroDisabled);
  }

  private selectHero(event: Event): void {
    this.selectedHero?.classList.remove(CSSClasses.HeroSelected);
    const target: HTMLElement | null = (<HTMLElement>event.target).closest(`.${CSSClasses.Hero}`);
    if (target) {
      this.selectedHero = target;
      this.selectedHero.classList.add(CSSClasses.HeroSelected);
    }
    this.onSelect(String(this.selectedHero?.id));
  }
}
