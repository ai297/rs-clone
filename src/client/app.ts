/* eslint-disable @typescript-eslint/no-explicit-any */
import StartScreen from './components/start-screen/start-screen';
import LobbyScreen from './components/lobby-screen/lobby-screen';
import GameScreen from './components/game-screen/game-screen';
import GameEndScreen from './components/game-end-screen/game-end-screen';
import SettingsScreen from './components/settings-screen/settings-screen';
import TutorialScreen from './components/tutorial-screen/tutorial-screen';
import BaseComponent from './components/base-component';
import { StaticScreens } from './enums/StaticScreen';
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
