import { Player } from '../../player';
import { forEachAsync, ICard } from '../../../common';
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

  public async castSpells(): Promise<void> {
    const queue: Array<Player> = this.players.slice().sort((a, b) => b.spell.initiative - a.spell.initiative);

    await forEachAsync(queue, async (player) => {
      const cards: Array<ICard> = [...player.spell];
      const positionPlayer: number = this.players.findIndex((current) => player === current);

      await forEachAsync(cards, async (currentCard: ICard) => {
        // console.log(currentCard.id);
        const handler = await this.spells.getHandler(currentCard.id);
        if (handler) await (handler as CardHandler)(positionPlayer, currentCard);

        const deadThisCast: Array<Player> = this.players.filter((current: Player) => current.hitPoints < 1);
        // если есть покойничек то запускаем его отработку
        if (deadThisCast.length > 0) {
          // обновляем состояние списка игроков
          this.players = this.players.filter((current: Player) => current.hitPoints > 0);
          // потрошим с покойничка карты и отдаем их в отбой
          this.removeCardsFromCorpse(deadThisCast);
          // проверяем игру на законченность
          this.checkForEndGame();
        }
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

  private removeCardsFromCorpse(deadThisCast: Array<Player>) {
    // пробегаем по мертвым колдунам забираем карты из заклинания и руки и отдаем в отбой
    deadThisCast.forEach((player) => {
      const activeSpell = player.transferSpellCards();
      const activeHand = player.transferHandsCards();
      this.game.usedCardHandler([...activeSpell, ...activeHand]);
    });
  }
}
