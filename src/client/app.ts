/* eslint-disable @typescript-eslint/no-explicit-any */
import StartScreen from './components/start-screen/start-screen';
import LobbyScreen from './components/lobby-screen/lobby-screen';
import GameScreen from './components/game-screen/game-screen';
import GameEndScreen from './components/game-end-screen/game-end-screen';
import SettingsScreen from './components/settings-screen/settings-screen';
import TutorialScreen from './components/tutorial-screen/tutorial-screen';

class App {
  private staticScreens: Record<string, any>;

  private currentScreen: any;

  constructor(private mainContainer: HTMLElement) {
    this.staticScreens = {
      startScreen: new StartScreen(),
      settingsScreen: new SettingsScreen(),
      tutorialScreen: new TutorialScreen(),
    };
  }

  clear(): void {
    this.mainContainer.innerHTML = '';
  }

  showStaticScreen(name: string): void {
    this.clear();
    this.currentScreen = this.staticScreens[name];
    this.mainContainer.append(this.currentScreen?.container);
  }

  showLobbyScreen(/* params */): void {
    this.clear();
    this.currentScreen = new LobbyScreen(/* params */);
    this.mainContainer.append(this.currentScreen?.container);
  }

  showGameScreen(/* params */): void {
    this.clear();
    this.currentScreen = new GameScreen(/* params */);
    this.mainContainer.append(this.currentScreen?.container);
  }

  showGameEndScreen(/* params */): void {
    this.clear();
    this.currentScreen = new GameEndScreen(/* params */);
    this.mainContainer.append(this.currentScreen?.container);
  }
}

export default App;
