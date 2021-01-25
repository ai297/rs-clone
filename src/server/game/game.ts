import { Player } from '../player';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  MAX_CARDS_IN_HAND,
  START_GAME_DELAY,
  ICard,
  shuffleArray,
  delay,
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

  constructor(
    private cardDeck: Array<ICard>,
    private readonly onGameEnd?: (winners: Player[]) => void,
    private readonly onNextMove?: () => void,
  ) {}

  public addPlayer(player: Player): void {
    if (this.playersValue.length >= MAX_PLAYERS) throw new Error('There are no places in the game');
    this.playersValue.push(player);
    // проклятый es-lint =)
    this.playersValue[this.playersValue.length - 1].onSpellSelected = () => this.cardSelectionHandler();
  }

  public get players(): Array<Player> {
    return this.playersValue;
  }

  get isStarted(): boolean { return this.isGameStarted; }

  get isCasting(): boolean { return this.isCastingStep; }

  startGame(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.players.length < MIN_PLAYERS) reject(Error('Few players to start the game'));

      this.isGameStarted = true;
      resolve();

      const spell = new Spells(this.players, this);
      const madeCards = this.cardDeck.filter((card) => spell.checkCardInDeck(card.id));
      madeCards.push(...madeCards);
      this.activeDeck = shuffleArray(madeCards);

      delay(START_GAME_DELAY).then(() => this.giveCards());
    });
  }

  private giveCards(): void {
    if (this.onNextMove) this.onNextMove();
    this.isCastingStep = false;

    const activePlayers = this.players.filter((current: Player) => current.hitPoints > 0);
    activePlayers.forEach((player) => {
      console.log(`give cards to player ${player.name}`);
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
      player.addCardsHand(tempCards);
    });
  }

  private cardSelectionHandler(): void {
    const isMagicReady = this.players.every((player) => player.isSpellReady);

    if (isMagicReady) {
      this.castSpells();
    }
  }

  private async castSpells(): Promise<void> {
    this.isCastingStep = true;

    const activePlayers = this.players.filter((current: Player) => current.hitPoints > 0);
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
    const winners = this.players.filter((player) => player.hitPoints > 0);
    if (this.onGameEnd) this.onGameEnd(winners);
  };
}
