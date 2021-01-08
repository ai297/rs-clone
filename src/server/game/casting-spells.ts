import { Player } from '../player';

const FASTEST_SPELL_INDEX = 1;
const FASTEST_SPELL = 200;

const QUICK_SPELL_INDEX = 2;
const QUICK_SPELL = 100;

export class CastingSpells {
  private orderSpells: Array<number> = [];

  constructor(
    private players: Array<Player>,
    private callbackEndGame: () => void,
  ) {}

  calculateInitiative(): void {
    this.orderSpells = this.players.map((player) => {
      if (player.spellCards.length === FASTEST_SPELL_INDEX) {
        return FASTEST_SPELL;
      }
      if (player.spellCards.length === QUICK_SPELL_INDEX) {
        return QUICK_SPELL;
      }
      return player.spellCards.reduce((acc, cur): number => {
        const result = acc + cur.initiative;
        return result;
      }, 0);
    });
  }

  castSpells() {
    console.log('magic');
    console.log(this);
  }
}
