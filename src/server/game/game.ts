import { Player } from '../player';
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

    if (numberPlayers) {
      console.log('Мало людей для начала');
      return;
    }
    if (!playerReadiness) {
      console.log('Игроки не готовы');
      return;
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

      player.setChooseCardsHandler(this.cardSelectionHandler);

      // тестовая выдача карт она будет происходить не отсюда \\\\\\\
      // обязательно удалить!!!!!
      player.addSpellCards(player.handCards.slice(0, 3));
    });
  }

  private cardSelectionHandler = (): void => {
    const SPELLS_NOT_READY = false;

    const isMagicReady = this.playersValue.reduce((acc: boolean, player: Player) => {
      if (!acc) {
        return player.isSpellReady;
      }
      return acc;
    }, SPELLS_NOT_READY);

    if (isMagicReady) {
      this.castSpells();
    }
  };

  private castSpells(): void {
    // класс очень короткоживущий - существует только в момент выполнения функции и никуда больше не записывается.
    const casting = new CastingSpells(this.players, this.checkEndGameHandler);

    casting.calculateInitiative();

    for (let i = 0; i < this.players.length; i += 1) {
      if (this.isEndGame) break;
      casting.castSpell();
    }

    if (!this.isEndGame) {
      // пока закомичено иначе GameLoop бесконечен.
      // this.giveCards();
    } else {
      this.isEndGame = false;
    }
  }

  private checkEndGameHandler = (): void => {
    // рубильник для остановки GameLoop
    this.isEndGame = true;

    console.log(this.players.filter((player: Player) => player.hitPoints > 0),
      'вызовем метод для сообщения, что этот пользователь выжил');
  };
}
