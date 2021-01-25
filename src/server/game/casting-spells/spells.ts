import {
  CardTypes,
  forEachAsync,
  getRandomInteger,
  ICard,
  MagicSigns,
} from '../../../common';
import { CardHandler } from './type';
import { Player } from '../../player';
import { PowerMagic } from './enum';
import {
  sumArray,
  checkStrength,
  getNumberUniqueMagicSign,
  throwCheck,
} from './utils';
import { IGameForCasting } from '../interface';

const TARGET_SMALLEST_CUBE = true;

async function makePowerDiceRoll(player: Player, magicSign: MagicSigns): Promise<PowerMagic> {
  const amountDice = [...player.spell]
    .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === magicSign ? 1 : 0)), 0);
  const throwResult = await player.makeDiceRoll(amountDice);
  const strongPower: PowerMagic = checkStrength(sumArray(throwResult));
  return strongPower;
}

export class Spells {
  private readonly spells = new Map<string, CardHandler>();

  private numberPlayers: number = this.players.length;

  constructor(
    private players: Array<Player>,
    private game: IGameForCasting,
  ) {
    this.spells
      .set('fist_nature', this.useFistNatureCard)
      .set('fountain_youth', this.useFountainYouthCard)
      .set('phantoms', this.usePhantomsCard)
      .set('death_wish', this.useDeathWish)
      .set('thunderbolt', this.useThunderbolt)
      .set('divisor', this.useDivisor)
      .set('chicken', this.useChicken)
      .set('cute_death', this.useCuteDeath)
      .set('egg_blow', this.useEggBlow)
      .set('acid_shower', this.useAcidShower)
      .set('midnight_merlin', this.useMidnightMerlin)
      .set('voodoo_ben', this.useVoodooBen)
      .set('wind_beard', this.useWindBeard)
      .set('professor', this.useProfessor)
      .set('zmey_gorynych', this.useZmeyGorynych)
      .set('heat', this.useHeat)
      .set('chrono_walker', this.useChronoWalker)
      .set('chuk_geck', this.useChukGeck)
      .set('king_oberon', this.useKingOberon)
      .set('fallen_rose', this.useFallenRose)
      .set('wormy', this.useWormy)
      .set('duel_hell', this.useDuelHell)
      .set('faster', this.useFaster)
      .set('mystical', this.useMystical)
      .set('infernal', this.useInfernal)
      .set('explosive', this.useExplosive)
      .set('cat_trouble', this.useCatTrouble)
      .set('head_broken', this.useHeadBroken)
      .set('spiky', this.useSpiky)
      .set('stunning', this.useStunning)
      .set('ritual', this.useRitual)
      .set('brilliant', this.useBrilliant)
      .set('tasty', this.useTasty)
      .set('cubic', this.useCubic)
      .set('sharp', this.useSharp);
  }

  public getHandler(currentCard: string): CardHandler {
    const handler = this.spells.get(currentCard);
    if (handler) return handler;
    return this.useEmpty;
  }

  public checkCardInDeck(key: string): boolean {
    return this.spells.has(key);
  }

  private getNextOpponent(position: number, isLeft = true): Player | null {
    // проверка входных данных
    if (position > this.players.length - 1 || position < 0) return null;

    const currentPlayer = <Player> this.players[position];
    // на всякий случай исключаем "убитых" героев что бы заклинание могло попасть в следующую цель
    const alivePlayers = this.players.filter((player) => player.hitPoints > 0);
    // если сам игрок уже не живой - он неможет применять заклинание. Так же, если кроме него никого больше нет в живых
    if (currentPlayer.hitPoints <= 0 || alivePlayers.length < 2) return null;

    const currentPlayerPosition = alivePlayers.findIndex((player) => player === currentPlayer);
    let targetPosition;
    if (isLeft) targetPosition = currentPlayerPosition === alivePlayers.length - 1 ? 0 : currentPlayerPosition + 1;
    else targetPosition = currentPlayerPosition === 0 ? alivePlayers.length - 1 : currentPlayerPosition - 1;
    return <Player> alivePlayers[targetPosition];
  }

  async getConcreteOpponent(position: number, isStrongest = true) : Promise<Player | null> {
    // проверка входных данных
    if (position > this.players.length - 1 || position < 0) return null;

    const currentPlayer = <Player> this.players[position];
    // соперники
    const opponents = this.players.filter((player) => player !== currentPlayer);
    opponents.sort((a, b) => (isStrongest ? b.hitPoints - a.hitPoints : a.hitPoints - b.hitPoints));

    if (opponents.length < 1) return null;
    if (opponents.length === 1 || opponents[0].hitPoints !== opponents[1].hitPoints) return opponents[0];
    const [target] = await throwCheck(opponents, false);
    return target;
  }

  private getLeftOpponent(position: number): Player | null { return this.getNextOpponent(position); }

  private getRightOpponent(position: number): Player | null { return this.getNextOpponent(position, false); }

  private getStrongestOpponent(position: number): Promise<Player | null> {
    return this.getConcreteOpponent(position);
  }

  private getWeakestOpponent(position: number): Promise<Player | null> {
    return this.getConcreteOpponent(position, false);
  }

  // ---------------------------------------------------------------------------------------------- //
  /**
   * кулак природы
   */
  private useFistNatureCard = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = this.getLeftOpponent(positionPlayer);
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);
    const damageStrength = [1, 2, 4];
    const damage = damageStrength[strongPower] || 0;
    if (damage) await target?.takeDamage(damage);
  };

  /**
   * фонтан молодости
   */
  private useFountainYouthCard = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const healingStrengths = [0, 2, 4];
    const heal = healingStrengths[strongPower] || 0;
    // если размер исцеления равен 0 - ничего не делаем. Возможно надо будет изменить,
    // если отображать на клиенте анимации неудачных эффектов
    if (heal) await player.takeHeal(heal);
  };

  /**
   * фантомагады
   */
  private usePhantomsCard = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = this.getLeftOpponent(positionPlayer);
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [1, 3, 4];
    const damage = damageStrength[strongPower] || 0;
    if (damage) await target?.takeDamage(damage);
  };

  /**
   * жажда смерти
   */
  private useDeathWish = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = this.getRightOpponent(positionPlayer);
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [2, 3, 4];
    const damageYourself = 1;
    const damage = damageStrength[strongPower] || 0;

    // если никакому сопернику урон не наносится, то и сам игрок урон не получает
    if (damage && target) {
      await Promise.race([target.takeDamage(damage), player.takeDamage(damageYourself)]);
    }
  };

  /**
   * удар молнии
   */
  private useThunderbolt = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const firstTarget = this.getLeftOpponent(positionPlayer);
    const firstTargetPosition = this.players.findIndex((p) => p === firstTarget);
    const secondTarget = firstTarget ? this.getLeftOpponent(firstTargetPosition) : null;

    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [1, 2, 4];
    const damage = damageStrength[strongPower] || 0;

    const damageTasks: Array<Promise<void>> = [];
    if (damage && firstTarget) damageTasks.push(firstTarget.takeDamage(damage));
    if (damage && secondTarget) damageTasks.push(secondTarget.takeDamage(damage));

    await Promise.race(damageTasks);
  };

  /**
   * ловушка-резка
   */
  private useDivisor = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = this.getLeftOpponent(positionPlayer);
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [2, 3, 6];
    const damage = damageStrength[strongPower] || 0;
    if (damage && target) await target.takeDamage(damage);
  };

  /**
   * курятина
   */
  private useChicken = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = await this.getStrongestOpponent(positionPlayer);

    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);
    const damageStrength = [1, 1, 7];
    const damage = damageStrength[strongPower] || 0;

    if (damage && target) target.takeDamage(damage);
  };

  /**
   * мило-смертие
   */
  private useCuteDeath = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = await this.getWeakestOpponent(positionPlayer);

    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);
    const damageStrength = [2, 3, 4];
    const damage = damageStrength[strongPower] || 0;

    if (damage && target) await target.takeDamage(damage);
  };

  /**
   * яйцобой
   */
  private useEggBlow = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    // TODO: при броске на 10+ надо добавлять сокровище
    const player = this.players[positionPlayer];
    const target = await this.getWeakestOpponent(positionPlayer);

    const damageStrength = [1, 3, 5];
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);
    const damage = damageStrength[strongPower] || 0;

    if (damage && target) await target.takeDamage(damage);
  };

  private useAcidShower = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === cardCurrent.magicSign ? 1 : 0)), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(sumArray(throwResult));

    const damageStrength: Array<number> = [1, 2, 4];
    const damage: number = damageStrength[strongPower] || 0;
    // let damage = 0;
    // switch (strongPower) {
    //   case PowerMagic.weakThrow:
    //     damage = 1;
    //     break;
    //   case PowerMagic.averageThrow:
    //     damage = 2;
    //     break;
    //   case PowerMagic.strongThrow:
    //     damage = 4;
    //     break;
    //   default:
    //     throw new Error('strong power is wrong');
    // }

    const leftOpponent = this.getLeftOpponent(positionPlayer);
    const rightOpponent = this.getRightOpponent(positionPlayer);
    const damageTasks: Array<Promise<void>> = [];
    if (leftOpponent) damageTasks.push((<Player> leftOpponent).takeDamage(damage));
    if (rightOpponent && rightOpponent !== leftOpponent) {
      damageTasks.push((<Player> rightOpponent).takeDamage(damage));
    }
    await Promise.race(damageTasks);

    // если противник один то он ловит удар
    // if (this.numberPlayers === 2) {
    //   const targetIndex: number = positionPlayer - 1;
    //   const target = this.players[targetIndex];
    //   target.takeDamage(damage);
    // } else {
    //   let targetIndexOne: number = positionPlayer - 1;
    //   if (targetIndexOne < 0) targetIndexOne += this.numberPlayers;
    //   let targetIndexTwo: number = positionPlayer + 1;
    //   if (targetIndexTwo >= this.numberPlayers) targetIndexTwo -= this.numberPlayers;

    //   const targetOne = this.players[targetIndexOne];
    //   const targetTwo = this.players[targetIndexTwo];

    //   targetOne.takeDamage(damage);
    //   targetTwo.takeDamage(damage);
    // }
  };

  private useMidnightMerlin = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    let targets = this.players.filter((playerCur) => !(playerCur === player));

    let target: Player = targets[0];
    if (targets.length > 1) {
      targets.sort((a, b) => b.hitPoints - a.hitPoints);
      if (targets[0].hitPoints !== targets[1].hitPoints) {
        target = targets[0] as Player;
      } else {
        targets = targets.filter((cur, index, array) => cur.hitPoints === array[0].hitPoints);
        [target] = await throwCheck(targets, TARGET_SMALLEST_CUBE);
      }
    }
    // урон завязан на количество активных магов
    const damage = this.numberPlayers;

    target.takeDamage(damage);
  };

  private useVoodooBen = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    for (let i = 0; i < this.numberPlayers; i++) {
      if (this.players[i] !== player) {
        // eslint-disable-next-line no-await-in-loop
        const damage = await this.players[i].makeDiceRoll(1);
        this.players[i].takeDamage(sumArray(damage));
      }
    }
  };

  private useWindBeard = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const actions: Array<ICard> = [...player.spell].filter((spell) => spell.type === CardTypes.action);
    if (actions.length > 0) {
      const action: ICard = actions[0];
      const handler = await this.getHandler(actions[0].id);
      if (handler) await handler(positionPlayer, action);
    }
    return Promise.resolve();
  };

  private useProfessor = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => !(playerCur === player));
    const target = targets[getRandomInteger(0, targets.length - 1)];
    const PROFESSOR_DAMAGE = 3;
    await target?.takeDamage(PROFESSOR_DAMAGE);
  };

  private useZmeyGorynych = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => !(playerCur === player));
    const damage = getNumberUniqueMagicSign([...player.spell]);

    targets.forEach((target) => {
      target.takeDamage(damage);
    });
    return Promise.resolve();
  };

  private useHeat = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    let targets = this.players.filter((playerCur) => !(playerCur === player));

    let target: Player = targets[0];

    if (targets.length > 1) {
      targets.sort((a, b) => b.hitPoints - a.hitPoints);
      if (targets[0].hitPoints !== targets[1].hitPoints) {
        target = targets[0] as Player;
      } else {
        targets = targets.filter((cur, index, array) => cur.hitPoints === array[0].hitPoints);
        [target] = await throwCheck(targets, TARGET_SMALLEST_CUBE);
      }
    }
    const DAMAGE_HEAT = 3;
    target.takeDamage(DAMAGE_HEAT);
  };

  private useChronoWalker = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const bonusThePlayerResult = getNumberUniqueMagicSign([...player.spell]);

    const throwResults: Array<[number, Player]> = Array(this.numberPlayers);

    for (let i = 0; i < this.numberPlayers; i++) {
      // eslint-disable-next-line no-await-in-loop
      let throwResult = [];
      if (this.players[i] === player) {
        // eslint-disable-next-line no-await-in-loop
        throwResult = await this.players[i].makeDiceRoll(1, bonusThePlayerResult);
      } else {
        // eslint-disable-next-line no-await-in-loop
        throwResult = await this.players[i].makeDiceRoll(1);
      }

      throwResults[i] = [sumArray(throwResult), this.players[i]];
    }
    throwResults.sort((a, b) => a[0] - b[0]);
    if (throwResults[0][0] !== throwResults[1][0]) {
      // обязательно протестить!!!!
      const target: Player = throwResults[0][1];

      const CHRONO_WALKER_DAMAGE = 3;
      target.takeDamage(CHRONO_WALKER_DAMAGE);
    } else {
      // если вверху не получилось выявить однозначную цель рекурсивно повторяем
      this.useChronoWalker(positionPlayer, cardCurrent);
    }
  };

  private useChukGeck = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const fourCards = this.game.getCardsActiveDeck(4);
    const qualityCards = fourCards.filter((cardCur) => cardCur.type === CardTypes.quality);

    forEachAsync(qualityCards, async (curCard) => {
      const handler = await this.getHandler(curCard.id);
      if (handler) await handler(positionPlayer, curCard);
    });

    this.game.usedCardHandler(fourCards);

    return Promise.resolve();
  };

  private useKingOberon = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const HEAL_OBERON = 2;
    player.takeHeal(HEAL_OBERON);
    return Promise.resolve();
  };

  private useFallenRose = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const HEAL_ROSE = getNumberUniqueMagicSign([...player.spell]);
    player.takeHeal(HEAL_ROSE);
    return Promise.resolve();
  };

  private useWormy = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    let targets = this.players.filter((playerCur) => !(playerCur === player));

    let target: Player = targets[0];
    if (targets.length > 1) {
      targets.sort((a, b) => b.hitPoints - a.hitPoints);
      if (targets[0].hitPoints !== targets[1].hitPoints) {
        target = targets[0] as Player;
      } else {
        targets = targets.filter((cur, index, array) => cur.hitPoints === array[0].hitPoints);
        [target] = await throwCheck(targets, TARGET_SMALLEST_CUBE);
      }
    }

    const damage = [...player.spell].filter((curCard) => curCard.magicSign === MagicSigns.dark).length;

    target.takeDamage(damage);
  };

  private useDuelHell = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players
      .filter((playerCur) => !(playerCur === player))
      .map((playerCur) => playerCur.id);

    let idTarget = '';
    if (targets.length === 1) {
      [idTarget] = targets;
    } else {
      [idTarget] = (await player.selectTarget(targets));
    }

    const [target] = this.players
      .filter((playerCur) => playerCur.id === idTarget);

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === cardCurrent.magicSign ? 1 : 0)), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(sumArray(throwResult));

    let damage = 0;
    let damageYourself = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 2;
        break;
      case PowerMagic.averageThrow:
        damage = 4;
        damageYourself = 1;
        break;
      case PowerMagic.strongThrow:
        damage = 5;
        damageYourself = 2;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    if (damageYourself !== 0) player.takeDamage(damageYourself);
    target.takeDamage(damage);
  };

  private useFaster = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => !(playerCur === player));

    const FASTER_DAMAGE = 1;
    targets.forEach((target) => {
      target.takeDamage(FASTER_DAMAGE);
    });
  };

  private useMystical = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    let targetIndex: number = positionPlayer - 1;
    if (targetIndex < 0) {
      targetIndex += this.numberPlayers;
    }

    const target = this.players[targetIndex];

    const damage = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === cardCurrent.magicSign ? 1 : 0)), 0);

    target.takeDamage(damage);
  };

  private useInfernal = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => !(playerCur === player));

    const damage = [...player.spell].filter((card: ICard) => card.magicSign === MagicSigns.element).length;

    targets.forEach((target) => target.takeDamage(damage));
  };

  private useExplosive = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players
      .filter((playerCur) => !(playerCur === player))
      .map((playerCur) => playerCur.id);

    let idTarget = '';
    if (targets.length === 1) {
      [idTarget] = targets;
    } else {
      [idTarget] = (await player.selectTarget(targets));
    }

    const [target] = this.players
      .filter((playerCur) => playerCur.id === idTarget);

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === cardCurrent.magicSign ? 1 : 0)), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(sumArray(throwResult));

    let damage = 0;
    let damageYourself = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
        break;
      case PowerMagic.averageThrow:
        damage = 3;
        damageYourself = 1;
        break;
      case PowerMagic.strongThrow:
        damage = 4;
        damageYourself = 0;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    if (damageYourself !== 0) player.takeDamage(damageYourself);
    target.takeDamage(damage);
  };

  private useCatTrouble = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const possibleTargets = this.players.filter((playerCur) => !(playerCur === player));

    if (possibleTargets.length > 1) {
      const [luckyPlayer, resultDiceRoll] = await throwCheck(possibleTargets);

      const targets = resultDiceRoll
        .filter((curRes: {value: number, player: Player}) => curRes.player !== luckyPlayer);

      targets.forEach((curPlayer): void => {
        const target = curPlayer.player;
        const damage = curPlayer.value;
        target.takeDamage(damage);
      });
    } else {
      const [target] = possibleTargets;
      const resultDice = sumArray(await target.makeDiceRoll(1));
      if (resultDice < 4) {
        target.takeDamage(resultDice);
      }
    }
  };

  private useHeadBroken = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const possibleTargets = this.players.filter((playerCur) => !(playerCur === player));

    const targetIndex = getRandomInteger(0, possibleTargets.length - 1);
    const target = possibleTargets[targetIndex];

    const HEAD_BROKEN_DAMAGE = 3;

    target.takeDamage(HEAD_BROKEN_DAMAGE);
  };

  private useSpiky = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    let targetIndex: number = positionPlayer - 1;
    if (targetIndex < 0) {
      targetIndex += this.numberPlayers;
    }

    const target = this.players[targetIndex];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === cardCurrent.magicSign ? 1 : 0)), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(sumArray(throwResult));

    let damage = 0;
    let heal = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
        break;
      case PowerMagic.averageThrow:
        damage = 1;
        heal = 1;
        break;
      case PowerMagic.strongThrow:
        damage = 3;
        heal = 3;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    player.takeHeal(heal);
    target.takeDamage(damage);
  };

  private useStunning = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => !(playerCur === player));

    const countDamage = getNumberUniqueMagicSign([...player.spell]);

    const stunningDamage = 2;

    for (let i = 0; i < countDamage; i++) {
      targets.forEach((playerCur) => {
        playerCur.takeDamage(stunningDamage);
      });
    }
  };

  private useRitual = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players
      .filter((playerCur) => !(playerCur === player))
      .map((playerCur) => playerCur.id);

    let idTarget = '';
    if (targets.length === 1) {
      [idTarget] = targets;
    } else {
      [idTarget] = (await player.selectTarget(targets));
    }

    const [target] = this.players
      .filter((playerCur) => playerCur.id === idTarget);

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === cardCurrent.magicSign ? 1 : 0)), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(sumArray(throwResult));

    let damage = 0;
    let damageYourself = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damageYourself = 3;
        break;
      case PowerMagic.averageThrow:
        damage = 3;

        break;
      case PowerMagic.strongThrow:
        damage = 5;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    if (damageYourself !== 0) player.takeDamage(damageYourself);
    if (damage !== 0) target.takeDamage(damage);
  };

  private useBrilliant = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    let targets = this.players.filter((playerCur) => !(playerCur === player));

    let target: Player = targets[0];

    if (targets.length > 1) {
      targets.sort((a, b) => b.hitPoints - a.hitPoints);
      if (targets[0].hitPoints !== targets[1].hitPoints) {
        target = targets[0] as Player;
      } else {
        targets = targets.filter((cur, index, array) => cur.hitPoints === array[0].hitPoints);
        [target] = await throwCheck(targets, TARGET_SMALLEST_CUBE);
      }
    }

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + (card.magicSign === cardCurrent.magicSign ? 1 : 0)), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(sumArray(throwResult));

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
        break;
      case PowerMagic.averageThrow:
        damage = 2;
        break;
      case PowerMagic.strongThrow:
        damage = 5;
        break;
      default:
        throw new Error('strong power is wrong');
    }
    target.takeDamage(damage);
  };

  private useTasty = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players
      .filter((playerCur) => !(playerCur === player) && (playerCur.hitPoints % 2 === 1));
    if (targets.length !== 0) {
      const damage = getNumberUniqueMagicSign([...player.spell]);
      targets.forEach((playerCur) => playerCur.takeDamage(damage));
    }
  };

  // убрать цикл
  private useCubic = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => !(playerCur === player));

    const resultDiceRollPlayer = await player.makeDiceRoll(2);
    resultDiceRollPlayer.pop();
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      // eslint-disable-next-line no-await-in-loop
      const [resultDiceRollTarget] = await target.makeDiceRoll(1);
      if (resultDiceRollPlayer.includes(resultDiceRollTarget)) {
        target.takeDamage(resultDiceRollTarget);
      }
    }
  };

  private useSharp = async (positionPlayer: number): Promise<void> => {
    const damageSharp = 3;

    const leftOpponent = this.getLeftOpponent(positionPlayer);
    const rightOpponent = this.getRightOpponent(positionPlayer);
    const damageTasks: Array<Promise<void>> = [];
    if (leftOpponent) damageTasks.push((<Player> leftOpponent).takeDamage(damageSharp));
    if (rightOpponent && rightOpponent !== leftOpponent) {
      damageTasks.push((<Player> rightOpponent).takeDamage(damageSharp));
    }
    await Promise.race(damageTasks);

    // if (this.numberPlayers === 2) {
    //   const targetIndex: number = positionPlayer - 1;
    //   const target = this.players[targetIndex];
    //   target.takeDamage(damageSharp);
    // } else {
    //   let targetIndexOne: number = positionPlayer - 1;
    //   if (targetIndexOne < 0) targetIndexOne += this.numberPlayers;
    //   let targetIndexTwo: number = positionPlayer + 1;
    //   if (targetIndexTwo >= this.numberPlayers) targetIndexTwo -= this.numberPlayers;

    //   const targetOne = this.players[targetIndexOne];
    //   const targetTwo = this.players[targetIndexTwo];

    //   targetOne.takeDamage(damageSharp);
    //   targetTwo.takeDamage(damageSharp);
    // }
  };

  private useEmpty = async (): Promise<void> => {
    console.log('No card handler!');
    return Promise.resolve();
  };
}
