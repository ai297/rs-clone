import { IHero } from '../../common';

const DATA_URL = './heroes.json';

export class HeroesRepository {
  private isLoaded = false;

  private heroes: Map<string, IHero> = new Map<string, IHero>();

  private load(): Promise<void> {
    return new Promise((res) => {
      fetch(DATA_URL)
        .then((response) => response.json())
        .then((data) => {
          data.forEach((element: IHero) => {
            this.heroes.set(element.id, element);
          });
          this.isLoaded = true;
          res();
        });
    });
  }

  private async getHeroes(): Promise<Map<string, IHero>> {
    if (!this.isLoaded) {
      try {
        await this.load();
      } catch (err: unknown) {
        console.log(`Failed to load heroes: ${(<Error> err)?.message}`);
      }
    }
    return this.heroes;
  }

  async getAllHeroes(): Promise<IHero[]> {
    const heroes = await this.getHeroes();
    return [...heroes.values()];
  }

  async getHero(heroId: string): Promise<IHero | undefined> {
    const heroes = await this.getHeroes();
    return heroes.get(heroId);
  }
}
