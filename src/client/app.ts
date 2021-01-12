import
{
  IComponent,
  StartScreen,
  LobbyScreen,
  GameScreen,
} from './components';
import { StaticScreens } from './enums';
import { GameService, ServerConnection } from './services';

const SERVER_URL = `${window.location.protocol}//${window.location.host}`;

class App {
  private staticScreens: Map<StaticScreens, IComponent> = new Map<StaticScreens, IComponent>();

  private readonly gameService: GameService;

  constructor(private mainContainer: HTMLElement) {
    // TODO: show preloader before connect to server here
    // TODO: don't forget remove console.logs
    const connection = new ServerConnection(
      SERVER_URL,
      // TODO: hide preloader here
      () => console.log('Connected to server'),
      // TODO: show message about connection problems
      () => console.log('Cannot connect to server...'),
    );
    this.gameService = new GameService(connection);
    setTimeout(async () => {
      console.log('Try to create new game...');
      const gameId = await this.gameService.newGame();
      console.log('New game created!', gameId);
      this.gameService.onPlayerJoined = (playerInfo) => console.log('New player join to game', playerInfo);
      setTimeout(async () => {
        console.log('Try to create new player...');
        const playerInfo = await this.gameService.createHero({
          gameId,
          heroId: 'hero-123',
          userName: 'Vasya',
        });
        console.log('Player created!', playerInfo);
        setTimeout(async () => {
          console.log('Try to create second user...');
          const anotherPlayerInfo = await this.gameService.createHero({
            gameId,
            heroId: 'pam-pararam!',
            userName: 'Ivan Ivanov',
          });
          console.log('Player created!', anotherPlayerInfo);
        }, 5000);
      }, 5000);
    }, 10000);

    this.staticScreens.set(StaticScreens.Start, new StartScreen());
  }

  show(component: IComponent): void {
    this.mainContainer.innerHTML = '';
    this.mainContainer.append(component.element);
  }

  showStatic(type: StaticScreens): void {
    const nextScreen = this.staticScreens.get(type);
    if (nextScreen) this.show(<IComponent>nextScreen);
  }

  showLobby(/* params */): void {
    this.show(new LobbyScreen(/* params */));
  }

  showGame(/* params */): void {
    this.show(new GameScreen(/* params */));
  }
}

export default App;
