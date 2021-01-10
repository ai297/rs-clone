import { CardTypes, ICard, MagicSigns } from '../common';
import { cardsJSON } from './test';
/* eslint-disable */
const activeCard = [
  'acid_shower',
  'brain_pump',
  'chicken',
  'cute_death',
  'dancing_snakes',
  'deal_devil',
  'death_wish',
  'dismembered',
  'divisor',
  'dragon_stock',
  'egg_blow',
  'exorcism',
  'fist_nature',
  'fountain_youth',
  'glare',
  'god_storm',
  'meatball',
  'nuclear_bath',
  'thunderbolt',
  'vortex_force',
  'phantoms',
  // 'phantoms',
  // 'fist_nature',
  // 'fountain_youth',
]

export const cards: Array<ICard> = cardsJSON.map((card): ICard => {
  return Object.assign(card, {
    type: CardTypes[card.type as keyof typeof CardTypes],
    magicSign: MagicSigns[card.magicSign as keyof typeof MagicSigns],
  });
}).filter((card) => activeCard.includes(card.id));

// const activeCard = [
//   'acid_shower',
//   'brain_pump',
//   'chicken',
//   'cute_death',
//   'dancing_snakes',
//   'deal_devil',
//   'death_wish',
//   'dismembered',
//   'divisor',
//   'dragon_stock',
//   'egg_blow',
//   'exorcism',
//   'fist_nature',
//   'fountain_youth',
//   'glare',
//   'god_storm',
//   'meatball',
//   'nuclear_bath',
//   'thunderbolt',
//   'vortex_force',
// ]
