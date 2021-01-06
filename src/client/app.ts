/* eslint-disable @typescript-eslint/no-explicit-any */
import
{
  StartScreen,
  LobbyScreen,
  GameScreen,
  GameEndScreen,
  SettingsScreen,
  TutorialScreen,
} from './components/index';
import { BaseComponent } from './components/base-component';
import { StaticScreens } from './enums/static-screens';
import { ServerConnection } from './services';

class App {
  private staticScreens: Record<StaticScreens, BaseComponent>;

  constructor(private mainContainer: HTMLElement) {
    this.staticScreens = {
      [StaticScreens.Start]: new StartScreen(),
      [StaticScreens.Tutorial]: new TutorialScreen(),
      [StaticScreens.Settings]: new SettingsScreen(),
    };

    // create connection with server (demo)
    const connection = new ServerConnection('http://localhost:8080');
  }

  private clear(): void {
    this.mainContainer.innerHTML = '';
  }

  showStaticScreen(type: StaticScreens): void {
    this.clear();
    const currentScreen = this.staticScreens[type];
    this.mainContainer.append(currentScreen.container);
  }

  showLobbyScreen(/* params */): void {
    this.clear();
    const currentScreen = new LobbyScreen(/* params */);
    this.mainContainer.append(currentScreen.container);
  }

  showGameScreen(/* params */): void {
    this.clear();
    const currentScreen = new GameScreen(/* params */);
    this.mainContainer.append(currentScreen.container);
  }

  showGameEndScreen(/* params */): void {
    this.clear();
    const currentScreen = new GameEndScreen(/* params */);
    this.mainContainer.append(currentScreen.container);
  }
}

export default App;
