import { Player } from '../player';
import { ICard, shuffleArray } from '../../common';

const MAX_SIZE_GAME = 4;
const MIN_SIZE_GAME = 2;

const MAX_CARDS_HAND = 7;

export class Game {
  private playersValue: Array<Player> = [];

  private activeDeck: Array<ICard> = [];

  private usedCardsDeck: Array<ICard> = [];

  constructor(
    private cardDeck: Array<ICard>,
  ) {}

  public addPlayer(player: Player) {
    if (this.playersValue.length < MAX_SIZE_GAME) {
      this.playersValue = [...this.playersValue, player];
    } else {
      // потом можно иначе это сделать
      console.log('Мест нет');
    }
  }

  public get players(): Array<Player> {
    return this.playersValue;
  }

  public startGame(): void {
    const numberPlayers = this.playersValue.length < MIN_SIZE_GAME;
    const playerReadiness = this.playersValue.filter((cur) => cur.isReady).length === this.playersValue.length;

    if (!numberPlayers) {
      console.log('Мало людей для начала');
      return;
    }
    if (!playerReadiness) {
      console.log('Игроки не готовы');
      return;
    }

    // сделали копию колоды => перетасовали колоду под текущую игру
    this.activeDeck = shuffleArray([...this.cardDeck]);

    this.giveCards();
  }

  private giveCards() {
    this.playersValue.forEach((player) => {
      const needAddIndex = MAX_CARDS_HAND - player.handCards.length;
      // здесь пока остановился.
    });
  }
}
