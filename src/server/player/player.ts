import {
  START_HEALTH,
  MAX_HEALTH,
  DICE_MAX_VALUE,
  DICE_MIN_VALUE,
  MAX_AWAIT_TIME,
  SELECT_TARGET_TIME,
  delay,
  HubEventsClient,
  HubEventsServer,
  HubResponse,
  ICallbackHandler,
  ICard,
  IHealthUpdate,
  ISpellSelected,
  IDiceRoll,
  getRandomInteger,
  ISelectTarget,
  ICastSpell,
  ICastCard,
} from '../../common';
import { ClientConnection } from '../connection';
import { PlayerEvents } from './player-events';
import { PlayerSpell } from './player-spell';

function race<T>(task: Promise<T>, data?: T, time?: number): Promise<T> {
  return new Promise<T>((resolve) => {
    delay(time || MAX_AWAIT_TIME).then(() => {
      resolve(data as T);
    });
    task.then(resolve).catch(() => resolve(data as T));
  });
}

export class Player {
  private handCardsValue: Array<ICard> = [];

  private currentSpell: PlayerSpell = PlayerSpell.Empty;

  private listeners: Map<PlayerEvents, Set<ICallbackHandler>> = new Map<PlayerEvents, Set<ICallbackHandler>>();

  private hitPointsValue = START_HEALTH;

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
    this.handCardsValue = [...this.handCardsValue, ...cards];
    await race(this.connection.dispatch(HubEventsClient.GetCards, cards));
  }

  async startSpellCasting(): Promise<ICard[]> {
    const cards = [...this.spell];
    const message: ICastSpell = { playerId: this.id, cards };
    this.dispatchCallbacks(PlayerEvents.CastSpell, message);
    await race(this.connection.dispatch(HubEventsClient.CastSpell, message));
    return cards;
  }

  async castCard(cardId: string): Promise<void> {
    const message: ICastCard = { playerId: this.id, cardId };
    this.dispatchCallbacks(PlayerEvents.CastCard, message);
    await race(this.connection.dispatch(HubEventsClient.CastCard, message));
  }

  transferSpellCards(): Array<ICard> {
    // передавая закл в отработку чистим слот
    const result: Array<ICard> = [...this.spell];
    // вот тут очищать
    this.currentSpell = PlayerSpell.Empty;
    return result;
  }

  transferHandsCards(): Array<ICard> {
    const result: Array<ICard> = this.handCards;
    this.handCardsValue = [];
    return result;
  }

  async takeDamage(damage: number): Promise<void> {
    this.hitPointsValue = this.hitPoints > damage ? this.hitPoints - damage : 0;
    const message: IHealthUpdate = {
      playerId: this.id,
      healthsChange: damage,
      currentHealth: this.hitPoints,
      isDamage: true,
    };
    this.dispatchCallbacks(PlayerEvents.UpdateHealths, message);
    await race(this.connection.dispatch<void>(HubEventsClient.UpdateHealath, message));
  }

  async takeHeal(heal: number): Promise<void> {
    this.hitPointsValue += heal;
    if (this.hitPointsValue > MAX_HEALTH) {
      this.hitPointsValue = MAX_HEALTH;
    }
    const message: IHealthUpdate = {
      playerId: this.id,
      healthsChange: heal,
      currentHealth: this.hitPoints,
      isDamage: false,
    };
    this.dispatchCallbacks(PlayerEvents.UpdateHealths, message);
    await race(this.connection.dispatch<void>(HubEventsClient.UpdateHealath, message));
  }

  async makeDiceRoll(number: number, bonus = 0): Promise<Array<number>> {
    const rolls: Array<number> = [];
    for (let i = 0; i < number; i++) {
      const roll = DICE_MIN_VALUE + Math.floor(Math.random() * DICE_MAX_VALUE);
      rolls.push(roll);
    }
    const message: IDiceRoll = { playerId: this.id, rolls, bonus };
    this.dispatchCallbacks(PlayerEvents.MakeDiceRoll, message);
    await race(this.connection.dispatch<void>(HubEventsClient.DiceRoll, message));
    rolls.push(bonus);
    return rolls;
  }

  async selectTarget(targets: Array<string>, numberOfTargets = 1): Promise<Array<string>> {
    const message: ISelectTarget = { targets, numberOfTargets };
    const randomResult: Array<string> = [];
    while (randomResult.length < numberOfTargets && targets.length > 0) {
      randomResult.push(...targets.splice(getRandomInteger(0, targets.length - 1), 1));
    }
    const selectTargetTask = this.connection.dispatch<string[]>(HubEventsClient.SelectTarget, message);
    const result = await race(selectTargetTask, randomResult, SELECT_TARGET_TIME);
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
