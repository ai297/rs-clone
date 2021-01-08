import cards from './public/cards.json';
import { ICard } from '../../common/interfaces/ICard';
import { CardTypes, MagicSigns } from '../../common/enums';

class CardRepository {
  getData = (): Array<ICard> => {
    const cardsArray: Array<ICard> = [];

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

      cardsArray.push(objTyped);
    });

    return cardsArray;
  };
}

export default CardRepository;
