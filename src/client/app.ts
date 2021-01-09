import
{
  IComponent,
  StartScreen,
  LobbyScreen,
  GameScreen,
} from './components';
import { StaticScreens } from './enums';
import { ServerConnection } from './services';

class App {
  private staticScreens: Map<StaticScreens, IComponent> = new Map<StaticScreens, IComponent>();

  constructor(private mainContainer: HTMLElement) {
    this.staticScreens.set(StaticScreens.Start, new StartScreen());

    // create connection with server (demo)
    const connection = new ServerConnection('http://localhost:8080');
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
