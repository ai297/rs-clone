import { Player } from '../../player';
import { ICard } from '../../../common';
import { CardHandler } from './type';

const FASTEST_SPELL_INDEX = 1;
const FASTEST_SPELL = 200;

const QUICK_SPELL_INDEX = 2;
const QUICK_SPELL = 100;

const numberLivingPlayersForEnd = 1;

const rollDice = (amount: number): number => {
  const lower = 1;
  const upper = amount * 6;

  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

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

  private calculateInitiative(): Array<Player> {
    const orderSpells = this.players.map((player) => {
      // не забыть обработать когда меньше трех карт с 0 инициативой через кубик
      if (player.spellCards.length === FASTEST_SPELL_INDEX) {
        return FASTEST_SPELL;
      }
      if (player.spellCards.length === QUICK_SPELL_INDEX) {
        return QUICK_SPELL;
      }
      return player.spellCards.reduce((acc, cur): number => acc + cur.initiative, 0);
    });
    return this.players
      .map((player: Player, index: number): [Player, number] => (
        [player, orderSpells[index]]
      ))
      .sort((a, b) => b[1] - a[1])
      .map((current: [Player, number]): Player => current[0]);
  }

  public castSpells(): void {
    const queue: Array<Player> = this.calculateInitiative();

    queue.forEach((player) => {
      // с фронтенда карты приходят в нужном порядке [source, quality, action]
      const cards: Array<ICard> = player.spellCards;
      const positionPlayer: number = this.players.findIndex((current) => player === current);
      cards.forEach((currentCard: ICard) => {
        console.log('name spell', currentCard.id);
        const handler = this.handlers.get(currentCard.id);
        if (handler) handler(positionPlayer, currentCard);
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

    const amountDice = player.spellCards
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = rollDice(amountDice);

    let damage = 0;
    if (throwResult < 5) {
      damage = 1;
    }
    if (throwResult > 4 && throwResult < 10) {
      damage = 3;
    }
    if (throwResult > 9) {
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

    const amountDice = player.spellCards
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);
    const throwResult = rollDice(amountDice);

    let damage = 0;
    if (throwResult < 5) {
      damage = 1;
    }
    if (throwResult > 4 && throwResult < 10) {
      damage = 2;
    }
    if (throwResult > 9) {
      damage = 4;
    }
    target.makeDamage(damage);
  };

  private useFountainYouthCard = (positionPlayer: number, cardCurrent: ICard) => {
    const player = this.players[positionPlayer];

    const amountDice = player.spellCards
      .reduce((acc:number, card: ICard):number => (acc + card.magicSign === cardCurrent.magicSign ? 1 : 0), 0);

    const throwResult = rollDice(amountDice);

    let heal = 0;
    if (throwResult > 4 && throwResult < 10) {
      heal = 2;
    }
    if (throwResult > 9) {
      heal = 4;
    }
    player.makeHeal(heal);
  };
}
