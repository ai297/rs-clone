import { PowerMagic } from './enum';
import { Player } from '../../player';
import { forEachAsync, ICard, MagicSigns } from '../../../common';
import { RollResult } from './type';

export function sumArray(array: Array<number>): number {
  return array.reduce((acc, cur) => acc + cur, 0);
}

export function checkStrength(throwResult: number): PowerMagic {
  if (throwResult <= 0) {
    return PowerMagic.nothing;
  }
  if (throwResult <= 4) {
    return PowerMagic.weakThrow;
  }
  if (throwResult > 4 && throwResult < 10) {
    return PowerMagic.averageThrow;
  }
  return PowerMagic.strongThrow;
}

export const throwCheck = async (
  players: Array<Player>,
  searchByGreatest = true,
): Promise<Player> => {
  if (players.length < 2) throw new Error('throwCheck requires from two elements in an array');

  function diceRollDecorator(number = 1, player: Player): Promise<{ value: number, player: Player }> {
    return new Promise((res) => {
      player.makeDiceRoll(number).then((resultRoll) => res({ value: sumArray(resultRoll), player }));
    });
  }
  const NUMBER_DICE = 1;
  const targets: Array<{ value: number, player: Player }> = [];
  await forEachAsync(players, async (player) => {
    const rollResult = await diceRollDecorator(NUMBER_DICE, player);
    targets.push(rollResult);
  });
  targets.sort((a, b) => {
    if (searchByGreatest) {
      return b.value - a.value;
    }
    return a.value - b.value;
  });

  // проверяем не совпал ли результат у двух
  if (targets[0].value !== targets[1].value) {
    return targets[0].player;
  }

  const nextCheckPlayers = targets.filter((tr) => tr.value === targets[0].value).map((tr) => tr.player);
  return throwCheck(nextCheckPlayers, searchByGreatest);
};

export const getNumberUniqueMagicSign = (cards: Array<ICard>): number => {
  const magicSignInSpell = cards.map((card) => card.magicSign);
  const uniqueCharacters = Array.from(new Set(magicSignInSpell)).length;
  return uniqueCharacters;
};

export const makePowerDiceRoll = async (player: Player, magicSign: MagicSigns): Promise<PowerMagic> => {
  const amountDice = [...player.spell]
    .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === magicSign ? 1 : 0)), 0);
  if (!amountDice) return PowerMagic.nothing;
  const throwResult = await player.makeDiceRoll(amountDice);
  const strongPower: PowerMagic = checkStrength(sumArray(throwResult));
  return strongPower;
};

export const makeDiceRolls = async (players: Array<Player>, diceNumber = 1): Promise<RollResult[]> => {
  const rollResults: Array<RollResult> = [];
  // игроки бросают кубики по-очереди
  await forEachAsync(players, async (player) => {
    const rolls = await player.makeDiceRoll(diceNumber);
    rollResults.push({ player, rolls });
  });
  return rollResults;
};
