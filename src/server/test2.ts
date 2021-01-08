import { CardTypes, ICard, MagicSigns } from '../common';
import { cardsJSON } from './test';
/* eslint-disable */
export const cards: Array<ICard> = cardsJSON.map((card): ICard => {
  return Object.assign(card, {
    type: CardTypes[card.type as keyof typeof CardTypes],
    magicSign: MagicSigns[card.magicSign as keyof typeof MagicSigns],
  });
});

export const disabledCard = [
  'chrono_walker',   'sphinx',         'chuk_geck',
  'twins',           'doctor_root',    'fallen_rose',
  'snout',           'king_oberon',    'fat_hag',
  'midnight_merlin', 'voodoo_ben',     'fairy_death',
  'old_devil',       'psychomind',     'huckster',
  'wind_beard',      'professor',      'zmey_gorynych',
  'magog',           'heat',           'typhoon',
  'suppressing',     'spiky',          'powerful',
  'stunning',        'stone',          'rancid',
  'duel_hell',       'ritual',         'wormy',
  'brilliant',       'mystical',       'two_faced',
  'faster',          'infernal',       'explosive',
  'tasty',           'cubic',          'cat_trouble',
  'disco',           'head_broken',    'sharp',
  'divisor',         'glare',          'phantoms',
  'brain_pump',      'fist_nature',    'fountain_youth',
  'dismembered',     'dancing_snakes', 'god_storm',
  'death_wish',      'deal_devil',     'exorcism',
  'cute_death',      'egg_blow',       'dragon_stock',
  'acid_shower',     'vortex_force',   'thunderbolt',
  'nuclear_bath',    'chicken',        'meatball'
]

