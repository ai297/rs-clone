import { ICard } from '../../../common';
import { Player } from '../../player';

export type CardHandler = (positionPlayer: number, card: ICard) => void;
export type RollResult = { player: Player, rolls: Array<number> };
