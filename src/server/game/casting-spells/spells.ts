import { CardTypes, ICard } from '../../../common';
import { CardHandler } from './type';
import { Player } from '../../player';
import { PowerMagic } from './enum';
import {
  checkStrength,
  getNumberUniqueMagicSign,
  throwCheck,
} from './utils';
import { IGameForCasting } from '../interface';

const TARGET_SMALLEST_CUBE = false;

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
      .set('chuk_geck', this.useСhukGeck)
      .set('king_oberon', this.useKingOberon)
      .set('fallen_rose', this.useFallenRose);
  }

  public getHandler(currentCard: string): CardHandler {
    const handler = this.spells.get(currentCard);
    if (handler) return handler;
    throw new Error('getHandler not found handler');
  }

  private useFistNatureCard = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    let targetIndex: number = positionPlayer + 1;
    if (targetIndex >= this.numberPlayers) {
      targetIndex -= this.numberPlayers;
    }
    const target = this.players[targetIndex];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);

    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
        break;
      case PowerMagic.averageThrow:
        damage = 2;
        break;
      case PowerMagic.strongThrow:
        damage = 4;
        break;
      default:
        throw new Error('strong power is wrong');
    }
    target.takeDamage(damage);
  };

  private useFountainYouthCard = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);

    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let heal = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        heal = 0;
        break;
      case PowerMagic.averageThrow:
        heal = 2;
        break;
      case PowerMagic.strongThrow:
        heal = 4;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    player.takeHeal(heal);
  };

  private usePhantomsCard = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    let targetIndex: number = positionPlayer - 1;
    if (targetIndex < 0) {
      targetIndex += this.numberPlayers;
    }

    const target = this.players[targetIndex];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
        break;
      case PowerMagic.averageThrow:
        damage = 3;
        break;
      case PowerMagic.strongThrow:
        damage = 4;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    target.takeDamage(damage);
  };

  private useDeathWish = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    let targetIndex: number = positionPlayer - 1;
    if (targetIndex < 0) {
      targetIndex += this.numberPlayers;
    }

    const target = this.players[targetIndex];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;
    const damageYourself = 1;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 2;
        break;
      case PowerMagic.averageThrow:
        damage = 3;
        break;
      case PowerMagic.strongThrow:
        damage = 4;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    player.takeDamage(damageYourself);
    target.takeDamage(damage);
  };

  private useThunderbolt = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    let targetIndexOne: number = positionPlayer + 1;
    if (targetIndexOne >= this.players.length) {
      targetIndexOne -= this.numberPlayers;
    }

    let targetIndexTwo: number | null = targetIndexOne + 1;
    if (targetIndexTwo >= this.players.length) {
      targetIndexTwo -= this.numberPlayers;
    }
    if (targetIndexTwo === positionPlayer) {
      targetIndexTwo = null;
    }

    const amountDice = [...player.spell]
      .reduce((acc: number, card: ICard): number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
        break;
      case PowerMagic.averageThrow:
        damage = 2;
        break;
      case PowerMagic.strongThrow:
        damage = 4;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    this.players[targetIndexOne].takeDamage(damage);
    if (targetIndexTwo) this.players[targetIndexTwo].takeDamage(damage);
  };

  private useDivisor = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    let targetIndex: number = positionPlayer + 1;
    if (targetIndex >= this.players.length) {
      targetIndex -= this.numberPlayers;
    }
    const target = this.players[targetIndex];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 2;
        break;
      case PowerMagic.averageThrow:
        damage = 3;
        break;
      case PowerMagic.strongThrow:
        damage = 6;
        break;
      default:
        throw new Error('strong power is wrong');
    }
    target.takeDamage(damage);
  };

  private useChicken = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    // фильтром выбрасываю автора заклинания из участия в конкурсе на плюху
    let targets = this.players.filter((playerCur) => !(playerCur === player));

    let target: Player = targets[0];
    // если противник один то урон летит в него и блок ниже игнорируется
    if (targets.length > 1) {
      // проверяем по хп есть ли один счастливчик что ловит плюху
      targets.sort((a, b) => b.hitPoints - a.hitPoints);
      if (targets[0].hitPoints !== targets[1].hitPoints) {
        target = targets[0] as Player;
      } else {
        // если счастливчик не найден фильтруем предентентов с одинаковым хп и отправляем их кидать кубы
        // откуда вернется один!
        targets = targets.filter((cur, index, array) => cur.hitPoints === array[0].hitPoints);
        target = await throwCheck(targets, TARGET_SMALLEST_CUBE);
      }
    }

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
        break;
      case PowerMagic.averageThrow:
        damage = 1;
        break;
      case PowerMagic.strongThrow:
        damage = 7;
        break;
      default:
        throw new Error('strong power is wrong');
    }
    target.takeDamage(damage);
  };

  private useCuteDeath = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    let targets = this.players.filter((playerCur) => !(playerCur === player));

    let target: Player = targets[0];
    // если противник один то урон летит в него и блок ниже игнорируется
    if (targets.length > 1) {
      // проверяем по хп есть ли один счастливчик что ловит плюху
      targets.sort((a, b) => a.hitPoints - b.hitPoints);
      if (targets[0].hitPoints !== targets[1].hitPoints) {
        target = targets[0] as Player;
      } else {
        // если счастливчик не найден фильтруем предентентов с одинаковым хп и отправляем их кидать кубы
        // откуда вернется один!
        targets = targets.filter((cur, index, array) => cur.hitPoints === array[0].hitPoints);
        target = await throwCheck(targets, TARGET_SMALLEST_CUBE);
      }
    }

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 2;
        break;
      case PowerMagic.averageThrow:
        damage = 3;
        break;
      case PowerMagic.strongThrow:
        damage = 4;
        break;
      default:
        throw new Error('strong power is wrong');
    }
    target.takeDamage(damage);
  };

  private useEggBlow = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    // при броске на 10+ надо добавлять сокровище
    const player = this.players[positionPlayer];

    let targets = this.players.filter((playerCur) => !(playerCur === player));

    let target: Player = targets[0];
    // если противник один то урон летит в него и блок ниже игнорируется
    if (targets.length > 1) {
      // проверяем по хп есть ли один счастливчик что ловит плюху
      targets.sort((a, b) => a.hitPoints - b.hitPoints);
      if (targets[0].hitPoints !== targets[1].hitPoints) {
        target = targets[0] as Player;
      } else {
        // если счастливчик не найден фильтруем предентентов с одинаковым хп и отправляем их кидать кубы
        // откуда вернется один!
        targets = targets.filter((cur, index, array) => cur.hitPoints === array[0].hitPoints);
        target = await throwCheck(targets, TARGET_SMALLEST_CUBE);
      }
    }

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
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
    target.takeDamage(damage);
  };

  private useAcidShower = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    // при броске на 10+ надо получить сокровище
    const player = this.players[positionPlayer];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = await player.makeDiceRoll(amountDice);
    const strongPower: PowerMagic = checkStrength(throwResult);

    let damage = 0;

    switch (strongPower) {
      case PowerMagic.weakThrow:
        damage = 1;
        break;
      case PowerMagic.averageThrow:
        damage = 2;
        break;
      case PowerMagic.strongThrow:
        damage = 4;
        break;
      default:
        throw new Error('strong power is wrong');
    }

    // если противник один то он ловит удар
    if (this.numberPlayers === 2) {
      const targetIndex: number = positionPlayer - 1;
      const target = this.players[targetIndex];
      target.takeDamage(damage);
    } else {
      let targetIndexOne: number = positionPlayer - 1;
      if (targetIndexOne < 0) targetIndexOne += this.numberPlayers;
      let targetIndexTwo: number = positionPlayer + 1;
      if (targetIndexTwo >= this.numberPlayers) targetIndexTwo -= this.numberPlayers;

      const targetOne = this.players[targetIndexOne];
      const targetTwo = this.players[targetIndexTwo];

      targetOne.takeDamage(damage);
      targetTwo.takeDamage(damage);
    }
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
        target = await throwCheck(targets, TARGET_SMALLEST_CUBE);
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
        const damage = await this.players[i].makeDiceRoll(1);
        this.players[i].takeDamage(damage);
      }
    }
  };

  private useWindBeard = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const actions: Array<ICard> = [...player.spell].filter((spell) => spell.type === CardTypes.action);
    if (actions.length > 0) {
      const action: ICard = actions[0];
      const handler = this.getHandler(actions[0].id);
      if (handler) handler(positionPlayer, action);
    }
    return Promise.resolve();
  };

  private useProfessor = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => !(playerCur === player));
    const target = await throwCheck(targets, TARGET_SMALLEST_CUBE);
    const PROFESSOR_DAMAGE = 3;
    target.takeDamage(PROFESSOR_DAMAGE);
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
        target = await throwCheck(targets, TARGET_SMALLEST_CUBE);
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
      let throwResult = await this.players[i].makeDiceRoll(1);
      if (this.players[i] === player) throwResult += bonusThePlayerResult;
      throwResults[i] = [throwResult, this.players[i]];
    }
    throwResults.sort((a, b) => a[0] - b[0]);
    console.log('обязательно протестить!!!!');
    if (throwResults[0][0] !== throwResults[1][0]) {
      // обязательно протестить!!!!
      const target: Player = throwResults[0][1];

      const CHRONO_WALKER_DAMAGE = 3;
      target.takeDamage(CHRONO_WALKER_DAMAGE);
    } else {
      // если вверху не получилось выявить обнозначную цель рекурсивно повторяем
      this.useChronoWalker(positionPlayer, cardCurrent);
    }
  };

  private useСhukGeck = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const fourCards = this.game.getCardsActiveDeck(4);
    const qualityCards = fourCards.filter((cardCur) => cardCur.type === CardTypes.quality);
    qualityCards.forEach((curCard) => {
      const handler = this.getHandler(curCard.id);
      if (handler) handler(positionPlayer, curCard);
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
}
