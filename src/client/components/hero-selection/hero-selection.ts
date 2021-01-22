import { BaseComponent } from '../base-component';
import { createElement } from '../../../common';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { IHero } from '../../../common/interfaces';
import { HeroesRepository } from '../../services';

export class HeroSelection extends BaseComponent {
  private selectedHero: HTMLElement | null;

  private heroes: Map<string, HTMLElement> = new Map<string, HTMLElement>();

  private fullHero!: HTMLElement;

  private isActive = true;

  constructor(
    private heroesRepository: HeroesRepository,
    private onSelect: (hero: IHero) => void,
    private disabledHeroes: Array<string> = [],
  ) {
    super([CSSClasses.HeroSelection]);
    this.selectedHero = null;
    this.createMarkup();
  }

  createMarkup() : void {
    const heroesWrapper = createElement(Tags.Div, [CSSClasses.HeroSelectionHeroesWrapper]);
    const heroes = createElement(Tags.Div, [CSSClasses.HeroSelectionHeroes]);
    heroesWrapper.append(heroes);
    this.fullHero = createElement(Tags.Div, [CSSClasses.HeroSelectionFullHero]);
    this.fullHero.innerHTML = `<img src="${ImagesPaths.HeroesFullSize}pisster.jpg" alt="pisster">`;
    this.heroesRepository.getAllHeroes().then((data: IHero[]) => {
      data.forEach((elem: IHero) => {
        const hero = createElement(Tags.Div, [CSSClasses.Hero]);
        hero.innerHTML = `<img src="${ImagesPaths.HeroesAvatars}${elem.image}.png" alt="${elem.id}">`;
        hero.addEventListener('click', (event) => {
          this.selectHero(event, elem);
        });
        this.heroes.set(elem.id, hero);
        heroes.append(hero);
        if (this.disabledHeroes.includes(elem.id)) {
          this.makeDisabled(elem.id);
        }
      });
      this.element.append(this.fullHero, heroesWrapper);
    });
  }

  public makeDisabled(id: string, value = true): void {
    if (value) {
      this.heroes.get(id)?.classList.add(CSSClasses.HeroDisabled);
    } else {
      this.heroes.get(id)?.classList.remove(CSSClasses.HeroDisabled);
    }
  }

  public get isDisabled():boolean {
    return !this.isActive;
  }

  public set isDisabled(value: boolean) {
    if (value) {
      this.element.classList.add(CSSClasses.HeroSelectionDisabled);
    } else {
      this.element.classList.remove(CSSClasses.HeroSelectionDisabled);
    }
    this.isActive = !value;
  }

  private selectHero(event: Event, hero: IHero): void {
    if (this.isActive) {
      this.selectedHero?.classList.remove(CSSClasses.HeroSelected);
      const target: HTMLElement | null = (<HTMLElement>event.target).closest(`.${CSSClasses.Hero}`);
      if (target) {
        this.selectedHero = target;
        this.selectedHero.classList.add(CSSClasses.HeroSelected);
      }
      this.fullHero.innerHTML = `<img src="${ImagesPaths.HeroesFullSize}${hero.id}.jpg" alt="${hero.id}">`;
      this.onSelect(hero);
    }
  }
}
