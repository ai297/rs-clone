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

class App implements IRootComponent {
  private staticScreens: Map<StaticScreens, IComponent> = new Map<StaticScreens, IComponent>();

  private gameService!: GameService;

  private readonly heroesRepository: HeroesRepository;

  private currentScreen?: IComponent;

  constructor(
    private readonly mainContainer: HTMLElement,
    private readonly appURL: string,
    private readonly createGameUrl?: (gameId: string) => string,
  ) {
    BaseComponent.setRoot(this);
    this.heroesRepository = new HeroesRepository();
  }

  get rootElement(): HTMLElement { return this.mainContainer; }

  get baseURL(): string { return this.appURL; }

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
    window.history.replaceState(null, '', this.baseURL);
  };

  showLobby = async (gameCreator = false): Promise<void> => {
    window.history.replaceState(null, '', this.getGameUrl(this.gameService.currentGameId));
    await this.show(new LobbyScreen(gameCreator, this.heroesRepository, this.gameService));
  };

  showGame = async (/* params */): Promise<void> => {
    await this.show(new GameScreen(this.gameService, this.heroesRepository));
  };

  start(gameId?: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // TODO: show preloader before connect to server here
      this.mainContainer.innerHTML = 'Loading...';
      const connection = new ServerConnection(
        this.baseURL,
        () => {
          // TODO: hide preloader here
          this.mainContainer.innerHTML = '';
          resolve();
          if (gameId) this.joinGame(String(gameId));
          else this.showStatic(StaticScreens.Start);
        },
        () => {
          // TODO: show connection error screen here
          this.mainContainer.innerHTML = 'Connection error.';
          reject(Error('Cannot connect to server...'));
        },
      );
      this.gameService = new GameService(connection, () => this.showGame());
      this.staticScreens.set(StaticScreens.Start, new StartScreen(this.gameService));
    });
  }

  getGameUrl(gameId: string): string {
    if (this.createGameUrl) return this.createGameUrl(gameId);
    return `${this.baseURL}/#${gameId}`;
  }

  private joinGame(gameId: string): void {
    this.gameService.joinGame(gameId).then(() => {
      this.showLobby();
    }).catch((e) => {
      // TODO: show join game error screen here
      console.log((<Error> e).message);
      this.showStatic(StaticScreens.Start);
    });
  }
}

export default App;
