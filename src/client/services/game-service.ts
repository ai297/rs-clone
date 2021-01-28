import {
  HubEventsServer,
  HubEventsClient,
  IHubResponse,
  HubResponse,
  IPlayerInfo,
  ICreatePlayerRequest,
  ISpellSelected,
  IHealthUpdate,
  ICard,
  IDiceRoll,
  ISelectTarget,
  ICastSpell,
  ICastCard,
  IJoinGameResponse,
} from '../../common';
import { ServerConnection } from './server-connection';

enum StorageItems {
  GameCreator = 'game-creator',
  PlayerId = 'player-id',
}

export class GameService {
  private gameId = '';

  private playerId = '';

  private playerCards: Array<ICard> = [];

  private players: Array<IPlayerInfo> = [];

  private castingSpellCards: Array<ICard> = [];

  private isCastingStep = false;

  constructor(
    private readonly connection: ServerConnection,
    private readonly onGameCreated?: (isCreator: boolean) => void,
    private readonly onGameStarted?: () => void,
    private readonly onGameEnded?: (alivePlayers: Array<IPlayerInfo>) => void,
    private readonly onGoOut?: () => void,
  ) {
    connection.addEventListener(HubEventsClient.GoOut, () => this.goOut());
    connection.addEventListener(HubEventsClient.StartGame, () => {
      if (this.onGameStarted) this.onGameStarted();
      return HubResponse.Ok();
    });
    connection.addEventListener(HubEventsClient.EndGame, (alivePlayers: Array<IPlayerInfo>) => {
      if (this.onGameEnded) this.onGameEnded(alivePlayers);
      return HubResponse.Ok();
    });
    connection.addEventListener(HubEventsClient.NextMove, () => {
      this.isCastingStep = false;
      if (this.onNextMove) this.onNextMove();
      return HubResponse.Ok();
    });
    connection.addEventListener(HubEventsClient.AddPlayer, (player: IPlayerInfo) => this.addPlayer(player));
    connection.addEventListener(HubEventsClient.RemovePlayer, (playerId: string) => this.removePlayer(playerId));
    connection.addEventListener(HubEventsClient.SpellSelected, (message: ISpellSelected) => this.spellSelect(message));
    connection.addEventListener(HubEventsClient.GetCards, (cards: ICard[]) => this.getCards(cards));
    connection.addEventListener(HubEventsClient.UpdateHealath, (message: IHealthUpdate) => this.healthUpdate(message));
    connection.addEventListener(HubEventsClient.DiceRoll, (message: IDiceRoll) => this.diceRoll(message));
    connection.addEventListener(HubEventsClient.SelectTarget, (message: ISelectTarget) => this.selectTargets(message));
    connection.addEventListener(HubEventsClient.CastSpell, (message: ICastSpell) => this.castSpell(message));
    connection.addEventListener(HubEventsClient.CastCard, (message: ICastCard) => this.castCard(message));
  }

  get currentGameId(): string { return this.gameId; }

  get currentPlayerId(): string { return this.playerId; }

  get currentPlayerCards(): Array<ICard> { return this.playerCards; }

  get currentPlayers(): Array<IPlayerInfo> { return this.players; }

  get isCasting(): boolean { return this.isCastingStep; }

  getPlayerInfo(playerId: string): IPlayerInfo | undefined {
    return this.currentPlayers.find((player) => player.id === playerId);
  }

  onPlayerJoined?: (playerInfo: IPlayerInfo) => void;

  onPlayerLeaved?: (playerInfo: IPlayerInfo) => void;

  onNextMove?: () => void;

  onGetCards?: (cards: Array<ICard>) => Promise<void>;

  onPlayerSelectSpell?: (playerInfo: IPlayerInfo, cardsInSpell: number) => Promise<void>;

  onPlayerTakeDamage?: (playerInfo: IPlayerInfo, damage: number) => Promise<void>;

  onPlayerTakeHeal?: (playerInfo: IPlayerInfo, heal: number) => Promise<void>;

  onPlayerMakeDiceRoll?: (playerInfo: IPlayerInfo, rolls: Array<number>, bonus: number) => Promise<void>;

  onSelectTarget?: (targets: Array<string>, numberOfTargets: number) => Promise<string[]>;

  onSpellCast?: (playerInfo: IPlayerInfo, spellCards: Array<ICard>) => Promise<void>;

  onCardCast?: (playerInfo: IPlayerInfo, card: ICard) => Promise<void>;

  async newGame(): Promise<void> {
    this.clearState();
    this.gameId = await this.connection.dispatch<string>(HubEventsServer.NewGame);
    localStorage.setItem(StorageItems.GameCreator, this.gameId);
    if (this.onGameCreated) this.onGameCreated(true);
  }

  async joinGame(gameId: string): Promise<void> {
    this.clearState();
    const savedGameId = localStorage.getItem(StorageItems.GameCreator);
    const savedPlayerId = localStorage.getItem(StorageItems.PlayerId);

    const joinResponse = await this.connection.dispatch<IJoinGameResponse>(
      HubEventsServer.JoinGame,
      gameId,
      savedPlayerId,
    );
    this.gameId = joinResponse.gameId;
    this.isCastingStep = joinResponse.isCasting;
    this.players = joinResponse.players;
    this.playerId = joinResponse.playerId;
    this.playerCards = joinResponse.playerCards;

    if (joinResponse.isStarted && this.onGameStarted) this.onGameStarted();
    else if (this.onGameCreated) this.onGameCreated(savedGameId === joinResponse.gameId);
  }

  async startGame(): Promise<void> {
    await this.connection.dispatch<void>(HubEventsServer.StartGame);
  }

  /**
   * This method returns created player
   */
  async createHero(request: ICreatePlayerRequest): Promise<IPlayerInfo> {
    const playerInfo = await this.connection.dispatch<IPlayerInfo>(HubEventsServer.AddPlayer, request);
    this.playerId = playerInfo.id;
    localStorage.setItem(StorageItems.PlayerId, playerInfo.id);
    return playerInfo;
  }

  async selectSpell(cardIds: Array<string>): Promise<void> {
    await this.connection.dispatch(HubEventsServer.SelectSpell, cardIds);
    cardIds.forEach((cardId) => {
      const cardIndex = this.playerCards.findIndex((card) => card.id === cardId);
      if (cardIndex >= 0) this.playerCards.splice(cardIndex, 1);
    });
  }

  /**
   * This method send request to create a bot and return bot's player info object
   * @param heroId - heroId for bot character
   */
  async createBot(heroId: string): Promise<IPlayerInfo> {
    const playerInfo = await this.connection.dispatch<IPlayerInfo>(HubEventsServer.AddBot, heroId, this.currentGameId);
    return playerInfo;
  }

  private clearState(): void {
    this.gameId = '';
    this.playerId = '';
    this.players = [];
    this.playerCards = [];
    this.castingSpellCards = [];
    this.isCastingStep = false;
    this.onPlayerJoined = undefined;
    this.onPlayerLeaved = undefined;
    this.onNextMove = undefined;
    this.onGetCards = undefined;
    this.onPlayerSelectSpell = undefined;
    this.onPlayerTakeDamage = undefined;
    this.onPlayerTakeHeal = undefined;
    this.onPlayerMakeDiceRoll = undefined;
    this.onSelectTarget = undefined;
    this.onSpellCast = undefined;
    this.onCardCast = undefined;
  }

  private goOut(): IHubResponse<null> {
    this.clearState();
    if (this.onGoOut) this.onGoOut();
    return HubResponse.Ok();
  }

  private addPlayer(player: IPlayerInfo): IHubResponse<null> {
    this.players.push(player);
    this.players.sort((playerA, playerB) => playerA.position - playerB.position);
    this.onPlayerJoined?.call(this, player);
    return HubResponse.Ok();
  }

  private removePlayer(playerId: string): IHubResponse<null> {
    const removingPlayerIndex = this.players.findIndex((player) => player.id === playerId);
    if (removingPlayerIndex >= 0) {
      const removingPlayer = this.players.splice(removingPlayerIndex, 1)[0];
      this.onPlayerLeaved?.call(this, removingPlayer);
    }
    return HubResponse.Ok();
  }

  private async spellSelect(message: ISpellSelected): Promise<IHubResponse<null>> {
    if (this.onPlayerSelectSpell) {
      await this.onPlayerSelectSpell(<IPlayerInfo> this.getPlayerInfo(message.playerId), message.spellCards);
    }
    return HubResponse.Ok();
  }

  private async healthUpdate(message: IHealthUpdate): Promise<IHubResponse<null | string>> {
    const player = this.getPlayerInfo(message.playerId);
    if (player) (<IPlayerInfo> player).health = message.currentHealth;
    else return HubResponse.Error('Player not found');
    if (message.isDamage && this.onPlayerTakeDamage) {
      await this.onPlayerTakeDamage(player, message.healthsChange);
    }
    if (!message.isDamage && this.onPlayerTakeHeal) {
      await this.onPlayerTakeHeal(player, message.healthsChange);
    }
    return HubResponse.Ok();
  }

  private async getCards(cards: Array<ICard>): Promise<IHubResponse<null>> {
    this.playerCards.push(...cards);
    this.isCastingStep = false;
    if (this.onGetCards) await this.onGetCards(cards);
    return HubResponse.Ok();
  }

  private async diceRoll(message: IDiceRoll): Promise<IHubResponse<null>> {
    if (this.onPlayerMakeDiceRoll) {
      await this.onPlayerMakeDiceRoll(<IPlayerInfo> this.getPlayerInfo(message.playerId), message.rolls, message.bonus);
    }
    return HubResponse.Ok();
  }

  private async selectTargets(message: ISelectTarget): Promise<IHubResponse<string[] | string>> {
    if (this.onSelectTarget) {
      const result = await this.onSelectTarget(message.targets, message.numberOfTargets);
      return HubResponse.Success(result);
    }
    return HubResponse.Error();
  }

  private async castSpell(message: ICastSpell): Promise<IHubResponse<null>> {
    if (message.playerId === this.currentPlayerId) {
      const castCardsId = message.cards.map((card) => card.id);
      this.playerCards = this.playerCards.filter((card) => !castCardsId.includes(card.id));
    }
    this.castingSpellCards = message.cards;
    if (this.onSpellCast) {
      await this.onSpellCast(<IPlayerInfo> this.getPlayerInfo(message.playerId), message.cards);
    }
    return HubResponse.Ok();
  }

  private async castCard(message: ICastCard): Promise<IHubResponse<null>> {
    if (this.onCardCast) {
      await this.onCardCast(<IPlayerInfo> this.getPlayerInfo(message.playerId), message.card);
    }
    return HubResponse.Ok();
  }
}
