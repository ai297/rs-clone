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
  // ISelectTarget,
} from '../../common';
import { ClientConnection, ConnectionService } from '../connection';

const MIN_BOT_DELAY = 1000;
const MAX_BOT_DELAY = 3000;

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
      .set(HubEventsClient.DiceRoll, () => { })
      .set(HubEventsClient.GetCards, (cards: Array<ICard>): void => {
        this.handCards.push(...cards);
        if (this.health > 0) this.selectSpell();
      })
      .set(HubEventsClient.UpdateHealath, (message: IHealthUpdate): void => {
        this.health = message.currentHealth;
      });
    // .set(HubEventsClient.SelectTarget, (message: ISelectTarget): string[] => {
    //   const randomResult: Array<string> = [];
    //   while (randomResult.length < message.numberOfTargets && message.targets.length > 0) {
    //     randomResult.push(...message.targets.splice(getRandomInteger(0, message.targets.length - 1), 1));
    //   }
    //   return randomResult;
    // });
  }

  setGameId(gameId: string): void { this.gameId = gameId; }

  dispatch<T>(command: HubEventsClient, ...args: any[]): Promise<T> {
    const handler = this.handlers.get(command);
    if (handler && typeof handler === 'function') {
      const result = handler(...args);
      return Promise.resolve(result as T);
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

  private async selectSpell(): Promise<void> {
    // this delay simulate user thinking time
    await delay(getRandomInteger(MIN_BOT_DELAY, MAX_BOT_DELAY));

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

  private dispatchCallbacks<T>(event: HubEventsServer, ...args: T[]) {
    const callback = this.listeners.get(event);
    callback?.forEach((handler) => handler(...args));
  }
}
