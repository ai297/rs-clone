import { Player } from '../../player';
import { ICard } from '../../../common';
import { CardHandler } from './type';
import { Spells } from './spells';
import { IGameForCasting } from '../interface';

const numberLivingPlayersForEnd = 1;

export class CastingSpells {
  private spells: Spells;

  constructor(
    private players: Array<Player>,
    private game: IGameForCasting,
  ) {
    this.spells = new Spells(this.players, game);
  }

  public castSpells(): void {
    const queue: Array<Player> = this.players.slice().sort((a, b) => b.spell.initiative - a.spell.initiative);

    queue.forEach((player) => {
      const cards: Array<ICard> = [...player.spell];
      const positionPlayer: number = this.players.findIndex((current) => player === current);
      cards.forEach((currentCard: ICard) => {
        const handler = this.spells.getHandler(currentCard.id);
        if (handler) (handler as CardHandler)(positionPlayer, currentCard);

        this.players = this.players.filter((current: Player) => current.hitPoints > 0);
        this.checkForEndGame();
      });
      const usedCards: Array<ICard> = player.transferSpellCards();

      this.game.usedCardHandler(usedCards);
    });
  }

  private checkForEndGame(): void {
    this.players.forEach((cur, index) => console.log('pozit player', index, 'hit point', cur.hitPoints));
    const numberLivingPlayers: number = this.players.filter((player: Player) => player.hitPoints > 0).length;
    if (numberLivingPlayers === numberLivingPlayersForEnd) {
      this.game.checkEndGameHandler();
    }
  }
}
