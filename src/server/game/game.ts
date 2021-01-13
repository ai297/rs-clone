import { Player, PlayerEvents } from '../player';
import { ICard, shuffleArray } from '../../common';
import { CastingSpells } from './casting-spells';

const MAX_SIZE_GAME = 4;
const MIN_SIZE_GAME = 2;

const MAX_CARDS_HAND = 8;

export class Game {
  private playersValue: Array<Player> = [];

  private activeDeck: Array<ICard> = [];

  private usedCardsDeck: Array<ICard> = [];

  private isEndGame = false;

  constructor(
    private cardDeck: Array<ICard>,
  ) {}

  public addPlayer(player: Player): void {
    if (this.playersValue.length < MAX_SIZE_GAME) {
      this.playersValue = [...this.playersValue, player];
    } else {
      throw new Error('There are no places in the game');
    }
  }

  public get players(): Array<Player> {
    return this.playersValue;
  }

  public startGame(): void {
    const numberPlayers = this.playersValue.length < MIN_SIZE_GAME;

    if (numberPlayers) {
      throw new Error('Few players to start the game');
    }

    this.activeDeck = shuffleArray([...this.cardDeck]);

    this.giveCards();
  }

  private giveCards(): void {
    this.playersValue.forEach((player) => {
      // считаем сколько карт надо досдать игроку.
      const needAddIndex = MAX_CARDS_HAND - player.handCards.length;
      // ///// здесь вписать потом обработку заканчивающейся колоды //////

      const startIndex = this.activeDeck.length - needAddIndex;

      const tempCards = this.activeDeck.splice(startIndex);
      player.addCardsHand(tempCards);

      player.addListener(PlayerEvents.CardsSelected, this.cardSelectionHandler);
    });
  }

  private cardSelectionHandler = (): void => {
    const isMagicReady = this.playersValue.every((player) => player.isSpellReady);

    if (isMagicReady) {
      this.castSpells();
    }
  };

  private castSpells(): void {
    // класс очень короткоживущий - существует только в момент выполнения функции и никуда больше не записывается.
    const casting = new CastingSpells(this.players, this.checkEndGameHandler, this.usedCardHandler);

    casting.castSpells();

    if (!this.isEndGame) {
      // пока закомичено иначе GameLoop бесконечен.
      // this.giveCards();
    } else {
      this.isEndGame = false;
    }
  }

  private usedCardHandler = (cardUsed: Array<ICard>) => {
    this.usedCardsDeck.push(...cardUsed);
  };

  private checkEndGameHandler = (): void => {
    // рубильник для остановки GameLoop
    this.isEndGame = true;

    console.log(this.players.filter((player: Player) => player.hitPoints > 0),
      'вызовем метод для сообщения, что этот пользователь выжил');
  };
}
