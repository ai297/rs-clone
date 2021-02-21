import {
  CardTypes,
  MagicSigns,
} from '../enums';

export interface ICard {
  id: string;
  title: string;
  type: CardTypes;
  magicSign: MagicSigns;
  src: string;
  text: string;
  initiative: number;
}
