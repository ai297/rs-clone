import {
  CardTypes,
  forEachAsync,
  getRandomInteger,
  ICard,
  MagicSigns,
  TARGET_ALL,
} from '../../../common';
import { CardHandler } from './type';
import { Player } from '../../player';
import {
  sumArray,
  getNumberUniqueMagicSign,
  throwCheck,
  makePowerDiceRoll,
  makeDiceRolls,
} from './utils';
import { IGameForCasting } from '../interface';

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
    const alivePlayers = this.players.filter((player) => player.isAlive);
    // если сам игрок уже не живой - он не может применять заклинание. Так же, если кроме него никого больше нет в живых
    if (currentPlayer.hitPoints <= 0 || alivePlayers.length < 2) return null;

    const currentPlayerPosition = alivePlayers.findIndex((player) => player === currentPlayer);
    let targetPosition;
    if (isLeft) targetPosition = currentPlayerPosition === alivePlayers.length - 1 ? 0 : currentPlayerPosition + 1;
    else targetPosition = currentPlayerPosition === 0 ? alivePlayers.length - 1 : currentPlayerPosition - 1;
    return <Player> alivePlayers[targetPosition];
  }

  private async getConcreteOpponent(position: number, isStrongest = true) : Promise<Player | null> {
    // проверка входных данных
    if (position > this.players.length - 1 || position < 0) return null;

    const currentPlayer = <Player> this.players[position];
    // соперники
    const opponents = this.players.filter((player) => player !== currentPlayer && player.isAlive);
    opponents.sort((a, b) => (isStrongest ? b.hitPoints - a.hitPoints : a.hitPoints - b.hitPoints));

    if (opponents.length < 1) return null;
    if (opponents.length === 1 || opponents[0].hitPoints !== opponents[1].hitPoints) return opponents[0];
    const throwCheckOpponents = opponents.filter((opponent) => opponent.hitPoints === opponents[0].hitPoints);
    const target = await throwCheck(throwCheckOpponents, false);
    return target;
  }

  private async selectOpponents(playerPosition: number, targetIds: Array<string>, maxResults = 1): Promise<Player[]> {
    // проверка входных данных
    if (playerPosition > this.players.length - 1 || playerPosition < 0) return [];

    const currentPlayer = this.players[playerPosition];
    const allOpponents = this.players.filter((player) => player !== currentPlayer && player.isAlive);

    if (targetIds.length <= maxResults) {
      if (targetIds.includes(TARGET_ALL)) return allOpponents;
      return allOpponents.filter((player) => targetIds.includes(player.id));
    }

    const selectedTargets = await currentPlayer.selectTarget(targetIds, maxResults);
    if (selectedTargets.includes(TARGET_ALL)) return allOpponents;
    return allOpponents.filter((player) => selectedTargets.includes(player.id));
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
    if (damage && secondTarget && secondTarget !== player) damageTasks.push(secondTarget.takeDamage(damage));

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

  /**
   * душ кислоты
   */
  private useAcidShower = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength: Array<number> = [1, 2, 4];
    const damage: number = damageStrength[strongPower] || 0;

    const leftOpponent = this.getLeftOpponent(positionPlayer);
    const rightOpponent = this.getRightOpponent(positionPlayer);
    const damageTasks: Array<Promise<void>> = [];
    if (leftOpponent) damageTasks.push((<Player> leftOpponent).takeDamage(damage));
    if (rightOpponent && rightOpponent !== leftOpponent) {
      damageTasks.push((<Player> rightOpponent).takeDamage(damage));
    }
    await Promise.race(damageTasks);
  };

  /**
   * полночный мерлин
   */
  private useMidnightMerlin = async (positionPlayer: number): Promise<void> => {
    const target = await this.getStrongestOpponent(positionPlayer);
    // урон завязан на количество активных магов
    const damage = this.players.filter((player) => player.isAlive).length;

    if (target && damage) await target.takeDamage(damage);
  };

  /**
   * вуду бен
   */
  private useVoodooBen = async (positionPlayer: number): Promise<void> => {
    // цели - все живые соперники
    const targets = this.players.filter((player, index) => index !== positionPlayer && player.isAlive);
    const makeDamage = (player: Player, damage: number): Promise<void> => player.takeDamage(damage);
    // все соперники бросают кубики
    const rollResults = await makeDiceRolls(targets);
    // каждый получает урон, равный выброшенному значению
    const damageTasks = rollResults.map((rollResult) => makeDamage(rollResult.player, sumArray(rollResult.rolls)));
    await Promise.race(damageTasks);
  };

  /**
   * ветро-бород
   */
  private useWindBeard = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];
    const actions: Array<ICard> = [...player.spell].filter((spell) => spell.type === CardTypes.action);
    if (actions.length > 0) {
      const action: ICard = actions[0];
      const handler = await this.getHandler(actions[0].id);
      if (handler) await handler(positionPlayer, action);
    }
  };

  /**
   * профессор престо
   */
  private useProfessor = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => playerCur !== player);
    const target = targets[getRandomInteger(0, targets.length - 1)];
    const PROFESSOR_DAMAGE = 3;
    await target?.takeDamage(PROFESSOR_DAMAGE);
  };

  /**
   * змей горыныч
   */
  private useZmeyGorynych = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];

    const targets = this.players.filter((playerCur) => playerCur !== player);
    const damage = getNumberUniqueMagicSign([...player.spell]);

    await Promise.race(targets.map((target) => target.takeDamage(damage)));
  };

  /**
   * жарёха
   */
  private useHeat = async (positionPlayer: number): Promise<void> => {
    const target = await this.getStrongestOpponent(positionPlayer);
    const DAMAGE_HEAT = 3;
    if (target) await target.takeDamage(DAMAGE_HEAT);
  };

  /**
   * хроно йокер
   */
  private useChronoWalker = async (positionPlayer: number): Promise<void> => {
    const currentPlayer = this.players[positionPlayer];
    const opponents = this.players.filter((p) => p !== currentPlayer && p.isAlive);
    const playerRollBonus = getNumberUniqueMagicSign([...currentPlayer.spell]);

    const CARD_DAMAGE = 3;

    const rollResults: Array<{player: Player, rollResult: number }> = [];
    // бросок игрока (с бонусом)
    const playerResult = await currentPlayer.makeDiceRoll(1, playerRollBonus);
    rollResults.push({ player: currentPlayer, rollResult: sumArray(playerResult) });
    // бросок соперников
    const opponentResults = await makeDiceRolls(opponents);
    rollResults.push(...opponentResults.map(({ player, rolls }) => ({ player, rollResult: sumArray(rolls) })));

    if (rollResults.length < 1) return;
    rollResults.sort((a, b) => a.rollResult - b.rollResult);
    let target: Player;
    if (rollResults[0].rollResult !== rollResults[1].rollResult) target = rollResults[0].player;
    else target = await throwCheck([rollResults[0].player, rollResults[1].player], false);

    await target?.takeDamage(CARD_DAMAGE);
  };

  /**
   * чук и гек
   */
  private useChukGeck = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];
    const fourCards = this.game.getCardsActiveDeck(4);
    const qualityCards = fourCards.filter((cardCur) => cardCur.type === CardTypes.quality);

    await forEachAsync(qualityCards, async (curCard) => {
      const handler = await this.getHandler(curCard.id);
      if (handler) {
        await player.castCard(curCard, true);
        await handler(positionPlayer, curCard);
      }
    });

    this.game.usedCardHandler(fourCards);
  };

  /**
   * король оберон
   */
  private useKingOberon = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];
    const HEAL_OBERON = 2;
    await player.takeHeal(HEAL_OBERON);
  };

  /**
   * падшая роза
   */
  private useFallenRose = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];
    const HEAL_ROSE = getNumberUniqueMagicSign([...player.spell]);
    await player.takeHeal(HEAL_ROSE);
  };

  /**
   * червивый
   */
  private useWormy = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = await this.getStrongestOpponent(positionPlayer);
    const damage = 2 * [...player.spell].filter((curCard) => curCard.magicSign === MagicSigns.dark).length;

    if (damage && target) await target.takeDamage(damage);
  };

  /**
   * дуэльадский
   */
  private useDuelHell = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const targetIds = this.players
      .filter((playerCur) => playerCur !== player && playerCur.isAlive)
      .map((playerCur) => playerCur.id);

    const [target] = await this.selectOpponents(positionPlayer, targetIds);

    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [2, 4, 5];
    const selfDamageStrength = [0, 1, 2];
    const damage = damageStrength[strongPower] || 0;
    const damageYourself = selfDamageStrength[strongPower] || 0;

    const damageTasks: Array<Promise<void>> = [];
    if (damage && target) damageTasks.push(target.takeDamage(damage));
    if (damageYourself) damageTasks.push(player.takeDamage(damageYourself));

    await Promise.race(damageTasks);
  };

  /**
   * шустрый
   */
  private useFaster = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];
    const targets = this.players.filter((playerCur) => playerCur !== player && playerCur.isAlive);

    const FASTER_DAMAGE = 1;

    await Promise.race(targets.map((target) => target.takeDamage(FASTER_DAMAGE)));
  };

  /**
   * мистический
   */
  private useMystical = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = this.getRightOpponent(positionPlayer);

    const damage = getNumberUniqueMagicSign([...player.spell]);

    if (damage && target) await target.takeDamage(damage);
  };

  /**
   * адско-стический
   */
  private useInfernal = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];
    const targets = this.players.filter((playerCur) => playerCur !== player && playerCur.isAlive);

    const damage = [...player.spell].filter((card: ICard) => card.magicSign === MagicSigns.element).length;

    if (damage && targets.length > 0) await Promise.race(targets.map((target) => target.takeDamage(damage)));
  };

  /**
   * взрывастый
   */
  private useExplosive = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targetIds = this.players
      .filter((playerCur) => playerCur !== player && playerCur.isAlive)
      .map((playerCur) => playerCur.id);

    const [target] = await this.selectOpponents(positionPlayer, targetIds);
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [1, 3, 4];
    const selfDamageStrength = [0, 1, 0];

    const damage = damageStrength[strongPower] || 0;
    const damageYourself = selfDamageStrength[strongPower] || 0;

    const damageTasks: Array<Promise<void>> = [];

    if (target && damage) damageTasks.push(target.takeDamage(damage));
    if (target && damageYourself) damageTasks.push(player.takeDamage(damageYourself));

    if (damageTasks.length > 0) await Promise.race(damageTasks);
  };

  /**
   * кот-а-строфный
   */
  private useCatTrouble = async (positionPlayer: number): Promise<void> => {
    const PLAYER_BONUS = 2;

    const currentPlayer = this.players[positionPlayer];
    const possibleTargets = this.players.filter((playerCur) => playerCur !== currentPlayer && playerCur.isAlive);

    const diceResults: Array<{player: Player, roll: number }> = [];
    const currentPlayerRoll = await currentPlayer.makeDiceRoll(1, PLAYER_BONUS);
    diceResults.push({ player: currentPlayer, roll: sumArray(currentPlayerRoll) });

    const rolls = await makeDiceRolls(possibleTargets, 1);
    rolls.forEach((rollResult) => {
      diceResults.push({ player: rollResult.player, roll: sumArray(rollResult.rolls) });
    });

    const damageTasks = diceResults.sort((a, b) => b.roll - a.roll)
      .filter((diceResult) => diceResult.roll !== diceResults[0].roll)
      .map(({ player, roll }) => {
        if (player !== currentPlayer) return player.takeDamage(roll);
        return player.takeDamage(roll - PLAYER_BONUS);
      });

    if (damageTasks.length > 0) await Promise.race(damageTasks);
  };

  /**
   * ума-ломный
   */
  private useHeadBroken = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];

    const possibleTargets = this.players.filter((playerCur) => playerCur !== player && playerCur.isAlive);

    const targetIndex = getRandomInteger(0, possibleTargets.length - 1);
    const target = possibleTargets[targetIndex];

    const HEAD_BROKEN_DAMAGE = 3;

    if (target) await target.takeDamage(HEAD_BROKEN_DAMAGE);
  };

  /**
   * колючий
   */
  private useSpiky = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = this.getRightOpponent(positionPlayer);

    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [1, 1, 3];
    const healingStrengths = [0, 1, 3];

    const damage = damageStrength[strongPower] || 0;
    const heal = healingStrengths[strongPower] || 0;

    const tasks: Array<Promise<void>> = [];
    if (heal) tasks.push(player.takeHeal(heal));
    if (target && damage) tasks.push(target.takeDamage(damage));

    if (tasks.length > 0) await Promise.race(tasks);
  };

  /**
   * оглушающий
   */
  private useStunning = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];

    const possibleTargets = this.players.filter((playerCur) => playerCur !== player && playerCur.isAlive);
    const countDamage = getNumberUniqueMagicSign([...player.spell]);

    const targets: Array<Player> = [];
    for (let i = 0; i < countDamage; i++) {
      const target = possibleTargets[getRandomInteger(0, possibleTargets.length - 1)];
      targets.push(target);
    }
    if (targets.length === 0) return;

    const stunningDamage = 2;
    await forEachAsync(targets, async (target) => {
      await target.takeDamage(stunningDamage);
    });
  };

  /**
   * ритуалистичный
   */
  private useRitual = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];

    const targetIds = this.players
      .filter((playerCur) => playerCur !== player && playerCur.isAlive)
      .map((playerCur) => playerCur.id);

    const [target] = await this.selectOpponents(positionPlayer, targetIds);
    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [0, 3, 5];
    const selfDamageStrength = [3, 0, 0];

    const damage = damageStrength[strongPower] || 0;
    const damageYourself = selfDamageStrength[strongPower] || 0;

    const damageTasks: Array<Promise<void>> = [];
    if (target && damage) damageTasks.push(target.takeDamage(damage));
    if (damageYourself) damageTasks.push(player.takeDamage(damageYourself));

    if (damageTasks.length > 0) await Promise.race(damageTasks);
  };

  /**
   * блестящий
   */
  private useBrilliant = async (positionPlayer: number, cardCurrent: ICard): Promise<void> => {
    const player = this.players[positionPlayer];
    const target = await this.getStrongestOpponent(positionPlayer);

    const strongPower = await makePowerDiceRoll(player, cardCurrent.magicSign);

    const damageStrength = [1, 2, 5];
    const damage = damageStrength[strongPower] || 0;

    if (target && damage) await target.takeDamage(damage);
  };

  /**
   * вкусняцкий
   */
  private useTasty = async (positionPlayer: number): Promise<void> => {
    const player = this.players[positionPlayer];

    const damage = getNumberUniqueMagicSign([...player.spell]);
    const damageTasks = this.players
      .filter((playerCur) => playerCur !== player && playerCur.hitPoints % 2 === 1)
      .map((targetPlayer) => targetPlayer.takeDamage(damage));

    if (damageTasks.length > 0) await Promise.race(damageTasks);
  };

  /**
   * кубикованый
   */
  private useCubic = async (positionPlayer: number): Promise<void> => {
    const currentPlayer = this.players[positionPlayer];

    const opponents = this.players.filter((playerCur) => playerCur !== currentPlayer && playerCur.isAlive);
    const resultDiceRollPlayer = await currentPlayer.makeDiceRoll(2);
    const opponentsResults = await makeDiceRolls(opponents);

    const targets: Array<{target: Player, damage: number}> = opponentsResults
      .filter((rollResult) => resultDiceRollPlayer.includes(rollResult.rolls[0]))
      .map(({ player, rolls }) => (
        { target: player, damage: resultDiceRollPlayer[resultDiceRollPlayer.indexOf(rolls[0])] || 0 }
      ));

    if (targets.length === 0) return;
    await Promise.race(targets.map(({ target, damage }) => target.takeDamage(damage)));
  };

  /**
   * крутой
   */
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
  };

  private useEmpty = async (): Promise<void> => {
    console.log('No card handler!');
    return Promise.resolve();
  };
}
