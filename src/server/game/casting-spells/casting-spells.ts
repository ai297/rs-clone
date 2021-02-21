import { Player } from '../../player';
import { forEachAsync, ICard, MAX_WINNERS } from '../../../common';
import { Spells } from './spells';
import { IGameForCasting } from '../interface';
import { makeDiceRolls, sumArray } from './utils';

export class CastingSpells {
  private spells: Spells;

  constructor(
    private players: Array<Player>,
    private game: IGameForCasting,
  ) {
    this.spells = new Spells([...this.players], game);
  }

  public async castSpells(): Promise<void> {
    const queue = await this.getCastingQueue();

    await forEachAsync(queue, async (currentPlayer, index, breakCast) => {
      if (!currentPlayer.isAlive) {
        // this.checkForEndGame(); // на всякий случай, против бага по зависанию игры..
        return;
      }
      const cards: Array<ICard> = await currentPlayer.startSpellCasting();
      const positionPlayer: number = this.players.findIndex((player) => player === currentPlayer);

      await forEachAsync(cards, async (currentCard: ICard, cardIndex, breakSpell) => {
        if (!currentPlayer.isAlive) {
          breakSpell();
          return;
        }
        // console.log(currentCard.id);
        await currentPlayer.castCard(currentCard);

        const handler = this.spells.getHandler(currentCard.id);
        await handler(positionPlayer, currentCard);
        // this.players.forEach((cur, index) => console.log('pozit player', index, 'hit point', cur.hitPoints));

        if (this.checkForEndGame()) {
          breakSpell();
          breakCast();
        }
      });
    });

    this.players.forEach((player) => {
      const usedCards: Array<ICard> = player.transferSpellCards();
      this.game.usedCardHandler(usedCards);
      if (!player.isAlive) {
        const handCardss = player.transferHandsCards();
        this.game.usedCardHandler(handCardss);
      }
    });
  }

  private checkForEndGame(): boolean {
    const numberLivingPlayers: number = this.players.filter((player: Player) => player.isAlive).length;
    if (numberLivingPlayers <= MAX_WINNERS) {
      this.game.endGame();
      return true;
    }
    return false;
  }

  async getCastingQueue(): Promise<Player[]> {
    const players = this.players.slice().sort((a, b) => b.spell.initiative - a.spell.initiative);
    let index = 0;
    let groupIndex = -1;
    let prevInitiative = -1;
    const groups: Player[][] = [];
    while (index < players.length) {
      const player = players[index];
      if (player.spell.initiative !== prevInitiative) {
        groupIndex++;
        groups[groupIndex] = [];
      }
      groups[groupIndex].push(player);
      prevInitiative = player.spell.initiative;
      index++;
    }

    const resultQueue: Player[] = [];
    await forEachAsync(groups, async (group) => {
      if (group.length < 2) resultQueue.push(...group);
      else {
        const rolls = await makeDiceRolls(group);
        const groupQueue = rolls.sort((a, b) => sumArray(b.rolls) - sumArray(a.rolls))
          .map((rollResult) => rollResult.player);
        resultQueue.push(...groupQueue);
      }
    });
    return resultQueue;
  }
}
