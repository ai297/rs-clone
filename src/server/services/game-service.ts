import {
  HubEventsServer,
  HubEventsClient,
  ICard,
  IHubResponse,
  HubResponse,
  IPlayerInfo,
  ICreatePlayerRequest,
  ISpellSelected,
  IHealthUpdate,
  IDiceRoll,
  MAX_GAMES,
  getRandomInteger,
} from '../../common';
import { ClientConnection, ConnectionService, ConnectionEvents } from '../connection';
import { Player, PlayerEvents } from '../player';
import { Game } from '../game/game';
import { PlayerService } from './player-service';
import { SimpleBotConnection } from '../bot/bot-connection';

interface ICardRepository {
  getData: () => ICard[]
}

export class GameService {
  private readonly getCards: () => Array<ICard>;

  private games: Map<string, Game> = new Map<string, Game>();

  constructor(
    cardRepo: ICardRepository,
    private readonly connectionService: ConnectionService,
    private readonly playerService: PlayerService,
  ) {
    this.getCards = cardRepo.getData.bind(cardRepo);
    this.connectionService.addEventListener(
      ConnectionEvents.Connect,
      (connection) => {
        this.configureConnection(connection);
      },
    );
  }

  private configureConnection(connection: ClientConnection): void {
    connection.addEventListener(HubEventsServer.NewGame, () => this.newGame(connection));
    connection.addEventListener(HubEventsServer.JoinGame, (gameId: string) => this.joinGame(gameId, connection));
    connection.addEventListener(HubEventsServer.StartGame, () => this.startGame(connection.currentGameId));
    connection.addEventListener(
      HubEventsServer.AddPlayer, (req: ICreatePlayerRequest) => this.createPlayer(req, connection),
    );
    connection.addEventListener(
      HubEventsServer.AddBot, (heroId: string) => this.createBot(connection.currentGameId, heroId),
    );
  }

  newGame(connection: ClientConnection): IHubResponse<string> {
    const gameId = connection.id;
    if (this.games.size >= MAX_GAMES) return HubResponse.Error('Max games limit is reached. Please, try again later');
    if (this.games.has(gameId)) return HubResponse.Error('The game is already exists');

    // TODO: add onGameEndCallback to Game constructor here
    const game = new Game(this.getCards());
    this.games.set(gameId, game);
    connection.setGameId(gameId);

    console.log(`New game was created with id ${gameId}. Games now: ${this.games.size}`);
    return HubResponse.Success(gameId);
  }

  joinGame(gameId: string, connection: ClientConnection): IHubResponse<IPlayerInfo[] | string> {
    if (!this.games.has(gameId)) return GameService.notFound();

    const game = <Game> this.games.get(gameId);

    if (game.isStarted) return HubResponse.Error('The game has already started');

    const playersInfo = game.players.map(GameService.getPlayerInfo);
    connection.setGameId(gameId);

    return HubResponse.Success(playersInfo);
  }

  startGame(gameId: string): IHubResponse<string | null> {
    if (!this.games.has(gameId)) return GameService.notFound();
    const game = <Game>(this.games.get(gameId));
    try {
      game.startGame();
      // TODO: return any data about game?
      this.connectionService.dispatch(gameId, HubEventsClient.StartGame);
      return HubResponse.Ok();
    } catch (err: unknown) {
      return HubResponse.Error((<Error> err)?.message);
    }
  }

  createPlayer(request: ICreatePlayerRequest, connection: ClientConnection): IHubResponse<IPlayerInfo | string> {
    if (!this.games.has(request.gameId)) return GameService.notFound();

    const game = <Game>(this.games.get(request.gameId));

    const isNameOrHeroTaken = !(game.players.every(
      (player) => (
        player.name.toLowerCase() !== request.userName.toLowerCase()
        && player.hero !== request.heroId
      ),
    ));
    if (isNameOrHeroTaken) return HubResponse.Error('This name or hero is already taken');

    const playerId = `${request.gameId}-${encodeURI(request.userName.toLowerCase())}`;
    const player = new Player(connection, playerId, request.userName, request.heroId);
    try {
      game.addPlayer(player);
      this.addPlayerListeners(player, request.gameId);
      this.playerService.addPlayer(playerId, player);
      const playerPosition = game.players.length - 1;
      const playerInfo = GameService.getPlayerInfo(player, playerPosition);
      this.connectionService.dispatch(request.gameId, HubEventsClient.AddPlayer, playerInfo);
      return HubResponse.Success<IPlayerInfo>(playerInfo);
    } catch (err: unknown) {
      return HubResponse.Error((<Error> err)?.message);
    }
  }

  createBot(gameId: string, heroId: string): IHubResponse<IPlayerInfo | string> {
    if (!this.games.has(gameId)) return GameService.notFound();

    const game = <Game>(this.games.get(gameId));

    const isHeroTaken = !(game.players.every((player) => player.hero !== heroId));
    if (isHeroTaken) return HubResponse.Error('This hero is already taken');

    const botNames: string[] = ['Toma', 'Max', 'Anna', 'Al'];
    const playerNames: string[] = game.players.map((player) => player.name);
    let botName: string;
    do {
      botName = botNames[getRandomInteger(0, botNames.length - 1)];
    } while (playerNames.includes(botName));

    const botConnection = new SimpleBotConnection(gameId);
    const player = new Player(botConnection, botConnection.id, `[bot] ${botName}`, heroId);

    try {
      game.addPlayer(player);
      this.addPlayerListeners(player, gameId);
      const playerPosition = game.players.length - 1;
      const playerInfo = GameService.getPlayerInfo(player, playerPosition);
      this.connectionService.dispatch(gameId, HubEventsClient.AddPlayer, playerInfo);
      return HubResponse.Success<IPlayerInfo>(playerInfo);
    } catch (err: unknown) {
      return HubResponse.Error((<Error> err)?.message);
    }
  }

  private addPlayerListeners(player: Player, gameId: string): void {
    player.addListener(PlayerEvents.CardsSelected, (message: ISpellSelected) => {
      this.connectionService.dispatch(gameId, HubEventsClient.SpellSelected, message);
    });
    player.addListener(PlayerEvents.UpdateHealths, (message: IHealthUpdate) => {
      this.connectionService.dispatch(gameId, HubEventsClient.UpdateHealath, message);
    });
    player.addListener(PlayerEvents.MakeDiceRoll, (message: IDiceRoll) => {
      this.connectionService.dispatch(gameId, HubEventsClient.DiceRoll, message);
    });
  }

  private static notFound = (): IHubResponse<string> => HubResponse.Error('Game not found');

  private static getPlayerInfo = (player: Player, position: number): IPlayerInfo => ({
    id: player.id,
    userName: player.name,
    heroId: player.hero,
    health: player.hitPoints,
    position,
  });
}
