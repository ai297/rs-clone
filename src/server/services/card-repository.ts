import * as fs from 'fs';
import path from 'path';
import { ICard } from '../../common/interfaces';
import { CardTypes, MagicSigns } from '../../common/enums';

export class CardRepository {
  private pathPublic: string;

  private fileCards = 'cards.json';

  private cardsArray: Array<ICard> = [];

  constructor(publicPath: string) {
    this.pathPublic = publicPath;
  }

  getData = (): Array<ICard> => {
    if (this.cardsArray.length === 0) {
      this.loadData();
    }
    return this.cardsArray;
  };

  loadData = (): void => {
    const filePath = path.join(this.pathPublic, this.fileCards);
    const cardsJSON = fs.readFileSync(filePath, 'utf-8');

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
