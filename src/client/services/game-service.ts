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
} from '../../common';
import { ServerConnection } from './server-connection';

export class GameService {
  private gameId = '';

  private playerId = '';

  private playerCards: Array<ICard> = [];

  private players: Array<IPlayerInfo> = [];

  constructor(private readonly connection: ServerConnection) {
    connection.addEventListener(HubEventsClient.AddPlayer, (player: IPlayerInfo) => this.addPlayer(player));
    connection.addEventListener(HubEventsClient.RemovePlayer, (playerId: string) => this.removePlayer(playerId));
    connection.addEventListener(HubEventsClient.SpellSelected, (message: ISpellSelected) => this.spellSelect(message));
    connection.addEventListener(HubEventsClient.GetCards, (cards: ICard[]) => this.getCards(cards));
    connection.addEventListener(HubEventsClient.UpdateHealath, (message: IHealthUpdate) => this.healthUpdate(message));
    connection.addEventListener(HubEventsClient.DiceRoll, (message: IDiceRoll) => this.diceRoll(message));
  }

  get currentGameId(): string { return this.gameId; }

  get currentPlayerId(): string { return this.playerId; }

  get currentPlayerCards(): Array<ICard> { return this.playerCards; }

  get currentPlayers(): Array<IPlayerInfo> { return this.players; }

  private clearState(): void {
    this.gameId = '';
    this.playerId = '';
    this.players = [];
    this.onPlayerJoined = undefined;
    this.onPlayerLeaved = undefined;
    this.onPlayerSelectSpell = undefined;
    this.onGetCards = undefined;
    this.onPlayerTakeDamage = undefined;
    this.onPlayerTakeHeal = undefined;
    this.onPlayerMakeDiceRoll = undefined;
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
    if (this.onPlayerSelectSpell) await this.onPlayerSelectSpell(message.playerId, message.spellCards);
    return HubResponse.Ok();
  }

  private async healthUpdate(message: IHealthUpdate): Promise<IHubResponse<null>> {
    const player = this.currentPlayers.find((playerInfo) => playerInfo.id === message.playerId);
    if (player) (<IPlayerInfo> player).health = message.currentHealth;
    if (message.isDamage && this.onPlayerTakeDamage) {
      await this.onPlayerTakeDamage(message.playerId, message.healthsChange, message.currentHealth);
    }
    if (!message.isDamage && this.onPlayerTakeHeal) {
      await this.onPlayerTakeHeal(message.playerId, message.healthsChange, message.currentHealth);
    }
    return HubResponse.Ok();
  }

  private async getCards(cards: Array<ICard>): Promise<IHubResponse<null>> {
    this.playerCards.push(...cards);
    if (this.onGetCards) await this.onGetCards(cards);
    return HubResponse.Ok();
  }

  private async diceRoll(message: IDiceRoll): Promise<IHubResponse<null>> {
    if (this.onPlayerMakeDiceRoll) await this.onPlayerMakeDiceRoll(message.playerId, message.rolls, message.bonus);
    return HubResponse.Ok();
  }

  onPlayerJoined?: (playerInfo: IPlayerInfo) => void;

  onPlayerLeaved?: (playerInfo: IPlayerInfo) => void;

  onPlayerSelectSpell?: (playerId: string, cardsInSpell: number) => Promise<void>;

  onGetCards?: (cards: Array<ICard>) => Promise<void>;

  onPlayerTakeDamage?: (playerId: string, damage: number, currentHealth: number) => Promise<void>;

  onPlayerTakeHeal?: (playerId: string, heal: number, currentHealth: number) => Promise<void>;

  onPlayerMakeDiceRoll?: (playerId: string, rolls: Array<number>, bonus: number) => Promise<void>;

  /**
   * This method returns promise, that resolve with gameId: string as argument
   */
  async newGame(): Promise<string> {
    this.clearState();
    this.gameId = await this.connection.dispatch<string>(HubEventsServer.NewGame);
    return this.gameId;
  }

  /**
   * This method returns array of players, who already joined to game
   */
  async joinGame(gameId: string): Promise<IPlayerInfo[]> {
    this.clearState();
    const playersInGame = await this.connection.dispatch<IPlayerInfo[]>(HubEventsServer.JoinGame, gameId);
    this.players.push(...playersInGame);
    return playersInGame;
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
    return playerInfo;
  }

  async selectSpell(cardIds: Array<string>): Promise<void> {
    await this.connection.dispatch(HubEventsServer.SelectSpell, cardIds);
    this.playerCards = this.playerCards.filter((card) => !cardIds.includes(card.id));
  }
}
