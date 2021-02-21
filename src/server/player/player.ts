import {
  START_HEALTH,
  MAX_HEALTH,
  DICE_MAX_VALUE,
  DICE_MIN_VALUE,
  MAX_AWAIT_TIME,
  SELECT_TARGET_TIME,
  SERVER_DELAY,
  delay,
  HubEventsClient,
  HubEventsServer,
  HubResponse,
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
import { PlayerSpell } from './player-spell';

function race<T>(task: Promise<T>, data?: T, time?: number): Promise<T> {
  return new Promise<T>((resolve) => {
    delay(time ? time + SERVER_DELAY : MAX_AWAIT_TIME + SERVER_DELAY).then(() => {
      resolve(data as T);
    });
    task.then(resolve).catch(() => resolve(data as T));
  });
}

export class Player {
  private handCardsValue: Array<ICard> = [];

  private currentSpell: PlayerSpell = PlayerSpell.Empty;

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

  get isAlive(): boolean { return this.hitPoints > 0; }

  onSpellSelected?: () => void;

  changeConnection(connection: ClientConnection): void {
    if (connection.id === this.connection.id) return;
    this.goOut();
    this.connection = connection;
    this.addConnectionListeners();
  }

  async addCardsHand(cards: Array<ICard>): Promise<void> {
    this.handCardsValue = [...this.handCardsValue, ...cards];
    await race(this.connection.dispatch(HubEventsClient.GetCards, cards));
  }

  goOut(): Promise<void> {
    this.removeConnectionListeners();
    this.connection.setGameId('');
    return this.connection.dispatch(HubEventsClient.GoOut);
  }

  async startSpellCasting(): Promise<ICard[]> {
    const cards = [...this.spell];
    const message: ICastSpell = { playerId: this.id, cards };
    this.connection.sendOthers(HubEventsClient.CastSpell, message);
    await race(this.connection.dispatch(HubEventsClient.CastSpell, message));
    return cards;
  }

  async castCard(card: ICard, addon = false): Promise<void> {
    const message: ICastCard = { playerId: this.id, card, addon };
    this.connection.sendOthers(HubEventsClient.CastCard, message);
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
    this.connection.sendOthers(HubEventsClient.UpdateHealath, message);
    await race(this.connection.dispatch<void>(HubEventsClient.UpdateHealath, message));
  }

  async takeHeal(heal: number): Promise<void> {
    if (this.hitPoints <= 0) return;
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
    this.connection.sendOthers(HubEventsClient.UpdateHealath, message);
    await race(this.connection.dispatch<void>(HubEventsClient.UpdateHealath, message));
  }

  async makeDiceRoll(number: number, bonus = 0): Promise<Array<number>> {
    const rolls: Array<number> = [];
    for (let i = 0; i < number; i++) {
      const roll = DICE_MIN_VALUE + Math.floor(Math.random() * DICE_MAX_VALUE);
      rolls.push(roll);
    }
    const message: IDiceRoll = { playerId: this.id, rolls: [...rolls], bonus };
    // console.log(`${this.name} rolls ${number} dice result - `, rolls);
    this.connection.sendOthers(HubEventsClient.DiceRoll, message);
    await race(this.connection.dispatch<void>(HubEventsClient.DiceRoll, message));
    if (bonus) rolls.push(bonus);
    return rolls;
  }

  async selectTarget(targets: Array<string>, numberOfTargets = 1): Promise<Array<string>> {
    const message: ISelectTarget = { targets: [...targets], numberOfTargets };
    if (numberOfTargets >= targets.length) return targets;
    const randomResult: Array<string> = [];
    while (randomResult.length < numberOfTargets && targets.length > 0) {
      randomResult.push(...targets.splice(getRandomInteger(0, targets.length - 1), 1));
    }
    const selectTargetTask = this.connection.dispatch<string[]>(HubEventsClient.SelectTarget, message);
    const selectionResult = await race(selectTargetTask, randomResult, SELECT_TARGET_TIME);
    const result = selectionResult.every((target) => targets.includes(target)) ? selectionResult : randomResult;
    // console.log(`${this.name} select target`, result);
    return result;
  }

  private addSpellCards(cardIds: Array<string>): void {
    if (this.spell !== PlayerSpell.Empty) return;
    // create new spell (only with cards which contains in hand)
    const spellCards = cardIds.filter((cardId) => this.handCards.findIndex((card) => card.id === cardId) >= 0)
      .map((cardId) => <ICard> this.handCards.find((card) => card.id === cardId));
    this.currentSpell = new PlayerSpell(spellCards);
    // remove spell cards from hand
    spellCards.forEach((card) => {
      const cardIndex = this.handCards.findIndex((handCard) => handCard.id === card.id);
      if (cardIndex >= 0) this.handCards.splice(cardIndex, 1);
    });
    // send notification to clients
    const message: ISpellSelected = { playerId: this.id, spellCards: this.currentSpell.length };
    this.connection.sendOthers(HubEventsClient.SpellSelected, message);
    if (this.onSpellSelected) this.onSpellSelected();
  }

  private addConnectionListeners(): void {
    this.connection.addEventListener(HubEventsServer.SelectSpell, (cardIds: Array<string>) => {
      this.addSpellCards(cardIds);
      // console.log(`${this.name} select spell`);
      return HubResponse.Ok();
    });
  }

  private removeConnectionListeners(): void {
    this.connection.removeListeners(HubEventsServer.SelectSpell);
  }
}
