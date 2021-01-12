import {
  delay,
  HubEventsClient,
  HubEventsServer,
  HubResponse,
  ICallbackHandler,
  ICard,
  IHealthUpdate,
  ISpellSelected,
} from '../../common';
import { ClientConnection } from '../connection';
import { PlayerEvents } from './player-events';
import { PlayerSpell } from './player-spell';

const DEFAULT_HEALTH = 20;
const MAX_HEALTH = 25;
const DICE_MIN_VALUE = 1;
const DICE_MAX_VALUE = 6;
const MAX_AWAIT_TIME = 3000;

function race(task: Promise<void>): Promise<void> {
  return Promise.race([delay(MAX_AWAIT_TIME), task]);
}

export class Player {
  private handCardsValue: Array<ICard> = [];

  private currentSpell: PlayerSpell = PlayerSpell.Empty;

  private listeners: Map<PlayerEvents, Set<ICallbackHandler>> = new Map<PlayerEvents, Set<ICallbackHandler>>();

  private hitPointsValue = DEFAULT_HEALTH;

  constructor(
    private connection: ClientConnection,
    private readonly playerId: string,
    private readonly userName: string,
    private readonly heroId: string,
  ) {
    this.addConnectionListeners();
  }

  get id(): string { return this.playerId; }

  get name(): string { return this.userName; }

  get hero(): string { return this.heroId; }

  get handCards(): Array<ICard> { return this.handCardsValue; }

  get isSpellReady(): boolean { return this.spell !== PlayerSpell.Empty; }

  get spell(): PlayerSpell { return this.currentSpell; }

  get hitPoints(): number { return this.hitPointsValue; }

  changeConnection(connection: ClientConnection): void {
    if (connection.id === this.connection.id) return;
    this.removeConnectionListeners();
    this.connection.dispatch(HubEventsClient.GoOut);
    this.connection = connection;
    this.addConnectionListeners();
  }

  addListener(event: PlayerEvents, handler: ICallbackHandler): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set<ICallbackHandler>());
    const eventListeners = <Set<ICallbackHandler>> this.listeners.get(event);
    eventListeners.add(handler);
  }

  async addCardsHand(cards: Array<ICard>): Promise<void> {
    try {
      await this.connection.dispatch(HubEventsClient.GetCards, cards);
    } finally {
      this.handCardsValue = [...this.handCardsValue, ...cards];
    }
  }

  transferSpellCards(): Array<ICard> {
    // передавая закл в отработку чистим слот
    const result: Array<ICard> = [...this.spell];
    // вот тут очищать
    this.currentSpell = PlayerSpell.Empty;
    return result;
  }

  async takeDamage(damage: number): Promise<void> {
    this.hitPointsValue = this.hitPoints > damage ? this.hitPoints - damage : 0;
    const message: IHealthUpdate = { playerId: this.id, currentHealth: this.hitPoints, isDamage: true };
    try {
      await race(this.connection.dispatch<void>(HubEventsClient.UpdateHealath, message));
    } finally {
      this.dispatchCallbacks(PlayerEvents.TakeDamage, message);
    }
  }

  async takeHeal(heal: number): Promise<void> {
    this.hitPointsValue += heal;
    if (this.hitPointsValue > MAX_HEALTH) {
      this.hitPointsValue = MAX_HEALTH;
    }
    const message: IHealthUpdate = { playerId: this.id, currentHealth: this.hitPoints, isDamage: false };
    try {
      await race(this.connection.dispatch<void>(HubEventsClient.UpdateHealath, message));
    } finally {
      this.dispatchCallbacks(PlayerEvents.TakeDamage, message);
    }
  }

  async makeDiceRoll(number: number): Promise<number> {
    const rolls: Array<number> = [];
    let result = 0;
    for (let i = 0; i < number; i++) {
      const roll = DICE_MIN_VALUE + Math.floor(Math.random() * DICE_MAX_VALUE);
      result += roll;
      rolls.push(roll);
    }
    try {
      await race(this.connection.dispatch<void>(HubEventsClient.DiceRoll, rolls));
    } finally {
      this.dispatchCallbacks(PlayerEvents.MakeDiceRoll, rolls);
    }
    return result;
  }

  addSpellCards(cardIds: Array<string>): void {
    // кладем в активное заклинание
    this.currentSpell = new PlayerSpell(this.handCardsValue.filter((card) => cardIds.includes(card.id)));
    // убираем из руки
    const spellCards = [...this.currentSpell].map((card) => card.id);
    this.handCardsValue = this.handCardsValue.filter((card) => !spellCards.includes(card.id));

    const message: ISpellSelected = { playerId: this.id, spellCards: this.currentSpell.length };
    this.dispatchCallbacks(PlayerEvents.CardsSelected, message);
  }

  private dispatchCallbacks<T>(event: PlayerEvents, ...args: T[]) {
    const callback = this.listeners.get(event);
    callback?.forEach((handler) => handler(...args));
  }

  private addConnectionListeners(): void {
    this.connection.addEventListener(HubEventsServer.SelectSpell, (cardIds: Array<string>) => {
      this.addSpellCards(cardIds);
      return HubResponse.Ok();
    });
  }

  private removeConnectionListeners(): void {
    this.connection.removeListeners(HubEventsServer.SelectSpell);
  }
}
