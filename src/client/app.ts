import
{
  IComponent,
  StartScreen,
  LobbyScreen,
  GameScreen,
} from './components';
import { StaticScreens } from './enums';
import { GameService, HeroesRepository, ServerConnection } from './services';

const SERVER_URL = `${window.location.protocol}//${window.location.host}`;

class App {
  private staticScreens: Map<StaticScreens, IComponent> = new Map<StaticScreens, IComponent>();

  private readonly gameService: GameService;

  private readonly heroesRepository: HeroesRepository;

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
    this.heroesRepository = new HeroesRepository();

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

  showLobby(gameCreator: boolean): void {
    this.show(new LobbyScreen(gameCreator, this.heroesRepository, this.gameService));
  }

  showGame(/* params */): void {
    this.show(new GameScreen(/* params */));
  }
}

export default App;
