import { PowerMagic } from './enum';
import { Player } from '../../player';
import { ICard } from '../../../common';

export function checkStrength(throwResult: number): PowerMagic {
  if (throwResult < 0) {
    throw new Error('throw the result is not working correctly');
  }
  if (throwResult < 5) {
    return PowerMagic.weakThrow;
  }
  if (throwResult > 4 && throwResult < 10) {
    return PowerMagic.averageThrow;
  }
  return PowerMagic.strongThrow;
}

export const throwCheck = async (players: Array<Player>, searchByGreatest = true): Promise<Player> => {
  if (players.length < 2) throw new Error('throwCheck requires from two elements in an array');

  function diceRollDecorator(number = 1, player: Player): Promise<{ value: number, player: Player }> {
    return new Promise((res) => {
      player.makeDiceRoll(number).then((resultRoll) => res({ value: resultRoll, player }));
    });
  }
  const NUMBER_DICE = 1;
  const targets = await Promise.all(players.map((player) => diceRollDecorator(NUMBER_DICE, player)));
  let target: Player | undefined;
  targets.sort((a, b) => {
    if (searchByGreatest) {
      return b.value - a.value;
    }
    return a.value - b.value;
  });
  // проверяем не совпал ли результат у двух
  if (targets[0].value !== targets[1].value) {
    target = targets[0].player;
  }

  if (target) return target;
  return throwCheck(players, searchByGreatest);
};

export const getNumberUniqueMagicSign = (cards: Array<ICard>): number => {
  const magicSignInSpell = cards.map((card) => card.magicSign);
  const uniqueCharacters = Array.from(new Set(magicSignInSpell)).length;
  return uniqueCharacters;
};
