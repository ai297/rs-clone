import { Player } from '../player';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  MAX_CARDS_IN_HAND,
  START_GAME_DELAY,
  ICard,
  shuffleArray,
  delay,
  START_GAME_TIMEOUT,
  SERVER_DELAY,
  SELECT_SPELL_TIME,
} from '../../common';
import { CastingSpells } from './casting-spells';
import { IGameForCasting } from './interface';
import { Spells } from './casting-spells/spells';

export class Game implements IGameForCasting {
  private playersValue: Array<Player> = [];

  private activeDeck: Array<ICard> = [];

  private usedCardsDeck: Array<ICard> = [];

  private isEndGame = false;

  private isGameStarted = false;

  private isCastingStep = false;

  private timerId: NodeJS.Timeout;

  private timerStarted = 0;

  constructor(
    cardDeck: Array<ICard>,
    private readonly onGameEnd?: (winners: Player[]) => void,
    private readonly onNextMove?: () => void,
    private readonly onBreak?: () => void,
  ) {
    const spell = new Spells(this.players, this);
    const madeCards = cardDeck.filter((card) => spell.checkCardInDeck(card.id));
    this.activeDeck = [...madeCards, ...madeCards];

    this.timerId = setTimeout(() => {
      if (this.onBreak) this.onBreak();
    }, START_GAME_TIMEOUT + SERVER_DELAY);
    this.timerStarted = Date.now();
  }

  public addPlayer(player: Player): void {
    if (this.playersValue.length >= MAX_PLAYERS) throw new Error('There are no places in the game');
    this.playersValue.push(player);
    player.onSpellSelected = () => this.cardSelectionHandler();
  }

  public get players(): Array<Player> {
    return this.playersValue;
  }

  get isStarted(): boolean { return this.isGameStarted; }

  get isCasting(): boolean { return this.isCastingStep; }

  get timeout(): number { return this.timerStarted > 0 ? Date.now() - this.timerStarted : 0; }

  startGame(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.players.length < MIN_PLAYERS) reject(Error('Few players to start the game'));

      clearTimeout(this.timerId);
      this.timerStarted = 0;
      this.isGameStarted = true;
      resolve();

      this.activeDeck = shuffleArray(this.activeDeck);

      delay(START_GAME_DELAY).then(() => this.giveCards());
    });
  }

  private async giveCards(): Promise<void> {
    if (this.onNextMove) this.onNextMove();
    this.isCastingStep = false;

    const activePlayers = this.players.filter((current: Player) => current.isAlive);
    const giveCardTasks: Array<Promise<void>> = [];
    activePlayers.forEach((player) => {
      // console.log(`give cards to player ${player.name}`);
      // считаем сколько карт надо досдать игроку.
      const needAddIndex = MAX_CARDS_IN_HAND - player.handCards.length;
      // если в колоде осталось меньше чем нужно сдать запускаем обработку
      if (this.activeDeck.length < needAddIndex) {
        // добавляем в колоду отбой и перемешиваем
        this.activeDeck = shuffleArray([...this.activeDeck, ...this.usedCardsDeck]);
        // обнуляем отбой
        this.usedCardsDeck = [];
      }

      const startIndex = this.activeDeck.length - needAddIndex;

      const tempCards = this.activeDeck.splice(startIndex);
      giveCardTasks.push(player.addCardsHand(tempCards));
    });

    await Promise.race(giveCardTasks);

    // card selection timer start
    this.timerId = setTimeout(() => this.castSpells(), SELECT_SPELL_TIME + SERVER_DELAY);
    this.timerStarted = Date.now();
  }

  private cardSelectionHandler(): void {
    const isMagicReady = this.players.filter((player) => player.isAlive).every((player) => player.isSpellReady);

    if (isMagicReady) {
      this.castSpells();
    }
  }

  private async castSpells(): Promise<void> {
    this.isCastingStep = true;
    clearTimeout(this.timerId);
    this.timerStarted = 0;

    const activePlayers = this.players.filter((current: Player) => current.isAlive);
    const casting = new CastingSpells(activePlayers, this);

    await casting.castSpells();

    if (!this.isEndGame) {
      this.giveCards();
    } else {
      this.endGame();
    }
  }

  getCardsActiveDeck = (number: number): Array<ICard> => {
    const startIndex = this.activeDeck.length - number;
    return this.activeDeck.splice(startIndex);
  };

  usedCardHandler = (cardUsed: Array<ICard>): void => {
    this.usedCardsDeck.push(...cardUsed);
  };

  endGame = (): void => {
    this.isEndGame = true;
    this.isCastingStep = false;
    const winners = this.players.filter((player) => player.isAlive);
    if (this.onGameEnd) this.onGameEnd(winners);
  };
}
