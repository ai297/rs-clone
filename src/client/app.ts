import
{
  IComponent,
  StartScreen,
  LobbyScreen,
  GameScreen,
} from './components';
import { StaticScreens } from './enums';
import { createConnectionFactory, GameService, ServerConnection } from './services';

const SERVER_URL = `${window.location.protocol}//${window.location.host}`;

class App {
  private staticScreens: Map<StaticScreens, IComponent> = new Map<StaticScreens, IComponent>();

  private readonly connectionFactory: () => Promise<ServerConnection>;

  private readonly gameService: GameService;

  constructor(private mainContainer: HTMLElement) {
    this.connectionFactory = createConnectionFactory(SERVER_URL);
    this.gameService = new GameService(this.connectionFactory);

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
