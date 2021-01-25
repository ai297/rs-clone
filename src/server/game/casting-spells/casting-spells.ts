import { Player } from '../../player';
import { forEachAsync, ICard, MAX_WINNERS } from '../../../common';
import { Spells } from './spells';
import { IGameForCasting } from '../interface';

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
      const cards: Array<ICard> = await player.startSpellCasting();
      const positionPlayer: number = this.players.findIndex((current) => player === current);

      await forEachAsync(cards, async (currentCard: ICard) => {
        // console.log(currentCard.id);
        await player.castCard(currentCard.id);

        const handler = this.spells.getHandler(currentCard.id);
        await handler(positionPlayer, currentCard);
        // this.players.forEach((cur, index) => console.log('pozit player', index, 'hit point', cur.hitPoints));

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
    const numberLivingPlayers: number = this.players.filter((player: Player) => player.hitPoints > 0).length;
    if (numberLivingPlayers <= MAX_WINNERS) {
      this.game.endGame();
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
