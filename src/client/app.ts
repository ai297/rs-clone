import
{
  IComponent,
  StartScreen,
  LobbyScreen,
  GameScreen,
} from './components';
import { StaticScreens } from './enums';
import { GameService, HeroesRepository, ServerConnection } from './services';
import { IRootComponent } from './root-component';
import { BaseComponent } from './components/base-component';

const SERVER_URL = `${window.location.protocol}//${window.location.host}`;

class App implements IRootComponent {
  private staticScreens: Map<StaticScreens, IComponent> = new Map<StaticScreens, IComponent>();

  private readonly gameService: GameService;

  private readonly heroesRepository: HeroesRepository;

  private currentScreen?: IComponent;

  constructor(private readonly mainContainer: HTMLElement) {
    BaseComponent.setRoot(this);
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

    this.staticScreens.set(StaticScreens.Start, new StartScreen(this.gameService));
  }

  get rootElement(): HTMLElement { return this.mainContainer; }

  show = async (component: IComponent): Promise<void> => {
    if (this.currentScreen && this.currentScreen?.beforeRemove) {
      await this.currentScreen?.beforeRemove();
    }
    this.currentScreen?.element.remove();
    if (this.currentScreen && this.currentScreen?.onRemoved) {
      await this.currentScreen?.onRemoved();
    }
    if (component.beforeAppend) await component.beforeAppend();
    this.currentScreen = component;
    this.mainContainer.append(component.element);
    if (component.onAppended) await component.onAppended();
  };

  showStatic = async (type: StaticScreens): Promise<void> => {
    const nextScreen = this.staticScreens.get(type);
    if (nextScreen) await this.show(<IComponent>nextScreen);
  };

  showLobby = async (gameCreator = false): Promise<void> => {
    await this.show(new LobbyScreen(gameCreator, this.heroesRepository, this.gameService));
  };

  showGame = async (/* params */): Promise<void> => {
    await this.show(new GameScreen(this.gameService, this.heroesRepository));
  };

  start(): void {
    this.showStatic(StaticScreens.Start);
  }
}

export default App;
