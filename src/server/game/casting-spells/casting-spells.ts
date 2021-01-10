import { Player } from '../../player';
import { ICard } from '../../../common';
import { CardHandler } from './type';

const numberLivingPlayersForEnd = 1;

export class CastingSpells {
  private numberPlayers: number = this.players.length;

  private handlers: Map<string, CardHandler> = new Map<string, CardHandler>();

  constructor(
    private players: Array<Player>,
    private callbackEndGame: () => void,
    private callbackUsedCards: (cardUsed: Array<ICard>) => void,
  ) {
    this.handlers
      .set('phantoms', this.usePhantomsCard)
      .set('fist_nature', this.useFistNatureCard)
      .set('fountain_youth', this.useFountainYouthCard);
  }

  public castSpells(): void {
    const queue: Array<Player> = this.players.slice().sort((a, b) => a.spell.initiative - b.spell.initiative);

    queue.forEach((player) => {
      const cards: Array<ICard> = [...player.spell];
      const positionPlayer: number = this.players.findIndex((current) => player === current);
      cards.forEach((currentCard: ICard) => {
        console.log('name spell', currentCard.id);
        const handler = this.handlers.get(currentCard.id);
        if (handler) (handler as CardHandler)(positionPlayer, currentCard);

        this.players = this.players.filter((current: Player) => current.hitPoints > 0);
        this.checkForEndGame();
      });
      const usedCards: Array<ICard> = player.transferSpellCards();

      this.callbackUsedCards(usedCards);
    });
  }

  private checkForEndGame(): void {
    this.players.forEach((cur, index) => console.log('pozit player', index, 'hit point', cur.hitPoints));
    const numberLivingPlayers: number = this.players.filter((player: Player) => player.hitPoints > 0).length;
    if (numberLivingPlayers === numberLivingPlayersForEnd) {
      this.callbackEndGame();
    }
  }

  private usePhantomsCard = (positionPlayer: number, cardCurrent: ICard): void => {
    const player = this.players[positionPlayer];
    let targetIndex: number = positionPlayer - 1;
    if (targetIndex < 0) {
      targetIndex += this.numberPlayers;
    }

    const target = this.players[targetIndex];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = player.makeDiceRoll(amountDice);

    const weakThrow = throwResult < 5;
    const averageThrow = throwResult > 4 && throwResult < 10;
    const strongThrow = throwResult > 9;

    let damage = 0;

    if (weakThrow) {
      damage = 1;
    }
    if (averageThrow) {
      damage = 3;
    }
    if (strongThrow) {
      damage = 4;
    }
    target.makeDamage(damage);
  };

  private useFistNatureCard = (positionPlayer: number, cardCurrent: ICard): void => {
    const player = this.players[positionPlayer];
    let targetIndex: number = positionPlayer + 1;
    if (targetIndex >= this.players.length) {
      targetIndex -= this.numberPlayers;
    }
    const target = this.players[targetIndex];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = player.makeDiceRoll(amountDice);

    const weakThrow = throwResult < 5;
    const averageThrow = throwResult > 4 && throwResult < 10;
    const strongThrow = throwResult > 9;

    let damage = 0;
    if (weakThrow) {
      damage = 1;
    }
    if (averageThrow) {
      damage = 2;
    }
    if (strongThrow) {
      damage = 4;
    }
    target.makeDamage(damage);
  };

  private useFountainYouthCard = (positionPlayer: number, cardCurrent: ICard) => {
    const player = this.players[positionPlayer];

    const amountDice = [...player.spell]
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);

    const throwResult = player.makeDiceRoll(amountDice);

    const averageThrow = throwResult > 4 && throwResult < 10;
    const strongThrow = throwResult > 9;

    let heal = 0;
    if (averageThrow) {
      heal = 2;
    }
    if (strongThrow) {
      heal = 4;
    }
    player.makeHeal(heal);
  };
}
