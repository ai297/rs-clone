import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { BaseButton } from '../base-button/base-button';
import { IStartScreenLocalization, START_SCREEN_DEFAULT_LOCALIZATION } from '../../localization';
import { GameService } from '../../services';

export class StartScreen extends BaseComponent {
  private loc: IStartScreenLocalization;

  constructor(private gameService: GameService, localization?: IStartScreenLocalization) {
    super([CSSClasses.StartScreen]);
    this.loc = localization || START_SCREEN_DEFAULT_LOCALIZATION;
    const newGameButton = new BaseButton(
      this.loc.NewGame,
      () => this.startNewGame(),
      [CSSClasses.StartScreenButton],
    );
    const joinButton = new BaseButton(
      this.loc.Join,
      () => console.log('Join'),
      [CSSClasses.StartScreenButton],
    );
    const rulesButton = new BaseButton(
      this.loc.Rules,
      () => console.log('Rules'),
      [CSSClasses.StartScreenButton],
    );
    const settingsButton = new BaseButton(
      this.loc.Settings,
      () => console.log('Settings'),
      [CSSClasses.StartScreenButton],
    );
    this.element.append(newGameButton.element, joinButton.element, rulesButton.element, settingsButton.element);
  }

  async startNewGame() : Promise<void> {
    try {
      await this.gameService.newGame();
      this.root.showLobby(true);
    } catch {
      alert('Не удалось создать новую игру');
    }
  }
}
