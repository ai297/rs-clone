import {
  HubEventsServer,
  HubEventsClient,
  ICard,
  IHubResponse,
  HubResponse,
  IPlayerInfo,
  ICreatePlayerRequest,
} from '../../common';
import { ClientConnection, ConnectionService, ConnectionEvents } from '../connection';
import { Player, PlayerService } from '../player';
import { Game } from './game';

const MAX_GAMES = 100;

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
      this.playerService.addPlayer(playerId, player);
      const playerPosition = game.players.length - 1;
      const playerInfo = GameService.getPlayerInfo(player, playerPosition);
      console.log('new Player created', playerInfo);
      this.connectionService.dispatch(request.gameId, HubEventsClient.AddPlayer, playerInfo);
      return HubResponse.Success<IPlayerInfo>(playerInfo);
    } catch (err: unknown) {
      return HubResponse.Error((<Error> err)?.message);
    }
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
