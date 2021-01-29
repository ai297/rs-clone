import * as fs from 'fs';
import { ICard } from '../../common/interfaces';
import { CardTypes, MagicSigns } from '../../common/enums';

export class CardRepository {
  private pathPublic: string;

  private fileCards = '\\cards.json';

  private cardsArray: Array<ICard> = [];

  constructor(path: string) {
    this.pathPublic = path;
  }

  getData = (): Array<ICard> => {
    if (this.cardsArray.length === 0) {
      this.loadData();
    }
    return this.cardsArray;
  };

  loadData = (): void => {
    const cardsJSON = fs.readFileSync(`${this.pathPublic}${this.fileCards}`, 'utf-8');

    const cards: Array<{id: string;
      title: string;
      type: string;
      magicSign: string;
      src: string;
      text: string;
      initiative: number;}> = JSON.parse(cardsJSON);

    cards.forEach((obj) => {
      const {
        id, title, type, magicSign, src, text, initiative,
      } = obj;

      const objTyped: ICard = {
        id,
        title,
        type: CardTypes[type as keyof typeof CardTypes],
        magicSign: MagicSigns[magicSign as keyof typeof MagicSigns],
        src,
        text,
        initiative,
      };

      this.cardsArray.push(objTyped);
    });
  };
}
