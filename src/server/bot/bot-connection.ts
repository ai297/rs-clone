/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HubEventsServer,
  HubEventsClient,
  IHubResponse,
  ICard,
  delay,
  getRandomInteger,
  ICallbackHandler,
  START_HEALTH,
  IHealthUpdate,
  AnimationTimes,
  ISelectTarget,
  SELECT_TARGET_TIME,
  ICastSpell,
  ICastCard,
} from '../../common';
import { ClientConnection, ConnectionService } from '../connection';

const MIN_BOT_DELAY = 1000;
const MAX_BOT_DELAY = 5000;

type EventHandler = (...args: any[]) => any;

export class SimpleBotConnection extends ClientConnection {
  // bot state
  private handCards: Array<ICard> = [];

  private health = START_HEALTH;

  private readonly listeners: Map<HubEventsServer, Set<ICallbackHandler>> = new Map();

  private readonly handlers: Map<HubEventsClient, EventHandler> = new Map();

  constructor(gameId: string, private readonly connectionService: ConnectionService) {
    super({
      id: `bot_${(Math.random() * 1000).toFixed()}`,
      on: () => { },
      emit: () => { },
    });
    this.setGameId(gameId);

    this.handlers
      .set(HubEventsClient.DiceRoll, this.diceRoll)
      .set(HubEventsClient.GetCards, this.getCards)
      .set(HubEventsClient.UpdateHealath, this.updateHealths)
      .set(HubEventsClient.SelectTarget, this.selectTarget)
      .set(HubEventsClient.CastSpell, this.castSpell)
      .set(HubEventsClient.CastCard, this.castCard);
  }

  private diceRoll = async (): Promise<void> => {
    const timeout = AnimationTimes.ShowMessage * 2
      + AnimationTimes.Dice
      + AnimationTimes.DiceRoller
      + AnimationTimes.DiceRollShowTime;
    await delay(timeout);
  };

  private getCards = async (cards: Array<ICard>): Promise<void> => {
    this.handCards.push(...cards);
    await delay(cards.length * AnimationTimes.AddCard);
    await delay(getRandomInteger(MIN_BOT_DELAY, MAX_BOT_DELAY));
    if (this.health > 0) this.selectSpell();
  };

  private updateHealths = async (message: IHealthUpdate): Promise<void> => {
    this.health = message.currentHealth;
    if (message.isDamage) await delay(AnimationTimes.Damage);
    else await delay(AnimationTimes.Heal);
  };

  private selectTarget = async (message: ISelectTarget): Promise<string[]> => {
    const randomResult: Array<string> = [];
    while (randomResult.length < message.numberOfTargets && message.targets.length > 0) {
      randomResult.push(...message.targets.splice(getRandomInteger(0, message.targets.length - 1), 1));
    }
    await delay(SELECT_TARGET_TIME / 2);
    return randomResult;
  };

  private castSpell = async (message: ICastSpell): Promise<void> => {
    const timeout = AnimationTimes.SpellCard
      + AnimationTimes.ShowMessage * 2
      + message.cards.length * AnimationTimes.SpellCard;
    await delay(timeout);
  };

  private castCard = async (message: ICastCard): Promise<void> => {
    if (message.addon) await delay(AnimationTimes.SpellCard);
    await delay(AnimationTimes.SpellCard);
  };

  setGameId(gameId: string): void { this.gameId = gameId; }

  dispatch<T>(command: HubEventsClient, ...args: any[]): Promise<T> {
    const handler = this.handlers.get(command);
    if (handler && typeof handler === 'function') {
      const result = handler(...args);
      return result;
    }
    return Promise.reject(Error('Unknown method'));
  }

  sendOthers<T>(event: HubEventsClient, data?: T): void {
    this.connectionService.dispatch(this.currentGameId, event, data);
  }

  addEventListener<T>(
    event: HubEventsServer,
    handler: (...args: any[]) => IHubResponse<T> | Promise<IHubResponse<T>>,
  ): void {
    const handlerFunc = handler as ICallbackHandler;
    if (!this.listeners.has(event)) {
      const set = new Set<ICallbackHandler>();
      this.listeners.set(event, set);
    }
    const eventListeners = this.listeners.get(event);
    eventListeners?.add(handlerFunc);
  }

  removeListeners(event: HubEventsServer): void {
    this.listeners.delete(event);
  }

  private dispatchCallbacks<T>(event: HubEventsServer, ...args: T[]) {
    const callback = this.listeners.get(event);
    callback?.forEach((handler) => handler(...args));
  }

  // BOT LOGIC
  private selectSpell(): void {
    // TODO: write spell selection logic here
    // for example - select all cards with different magic signs
    const selectedCards: Array<ICard> = [];

    this.handCards.forEach((card) => {
      if (!selectedCards.map((selectedCard) => selectedCard.type).includes(card.type)) {
        selectedCards.push(card);
      }
    });

    // when cards selected, remove its from hand and dispatch callback whit selected cards id
    this.handCards = this.handCards.filter((card) => !selectedCards.includes(card));
    this.dispatchCallbacks(HubEventsServer.SelectSpell, selectedCards.map((card) => card.id));
  }
}
