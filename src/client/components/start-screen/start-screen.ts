import { BaseComponent } from '../base-component';
import { CSSClasses, ImagesPaths, Tags } from '../../enums';
import { BaseButton } from '../base-button/base-button';
import { IStartScreenLocalization, START_SCREEN_DEFAULT_LOCALIZATION } from '../../localization';
import { GameService } from '../../services';
import {
  createElement, delay, getRandomInteger, playSound, Sounds,
} from '../../../common';

const BACKGROUNDS = ['bg1.jpg', 'bg2.jpg'];
const LOGO = 'logo.png';
const ANIMATION_TIME = 500;

export class StartScreen extends BaseComponent {
  private loc: IStartScreenLocalization;

  private bgImg: HTMLImageElement = new Image();

  constructor(
    private gameService: GameService,
    private showAboutScreen: () => void,
    localization?: IStartScreenLocalization,
  ) {
    super([CSSClasses.StartScreen]);
    this.loc = localization || START_SCREEN_DEFAULT_LOCALIZATION;
    this.createMarkup();
  }

  private createMarkup() {
    const logo = createElement(Tags.Div, [CSSClasses.StartScreenLogo]);
    logo.innerHTML = `<img src=${ImagesPaths.Images}${LOGO} alt=logo>`;
    const buttonsContainer = createElement(Tags.Div, [CSSClasses.StartScreenButtons]);
    const newGameButton = new BaseButton(
      this.loc.NewGame,
      async () => {
        await playSound(Sounds.btnStandard);
        this.startNewGame();
      },
      [CSSClasses.StartScreenButton],
    );
    const joinButton = new BaseButton(
      this.loc.Join,
      async () => {
        await playSound(Sounds.btnStandard);
        console.log('Join');
      },
      [CSSClasses.StartScreenButton],
    );
    const rulesButton = new BaseButton(
      this.loc.Rules,
      async () => {
        await playSound(Sounds.btnStandard);
        console.log('Rules');
      },
      [CSSClasses.StartScreenButton],
    );
    const aboutButton = new BaseButton(
      this.loc.About,
      async () => {
        await playSound(Sounds.btnStandard);
        this.showAboutScreen();
      },
      [CSSClasses.StartScreenButton],
    );

    buttonsContainer.append(
      newGameButton.element,
      joinButton.element,
      rulesButton.element,
      aboutButton.element,
    );

    this.element.append(logo, buttonsContainer);
  }

  async beforeAppend() : Promise<void> {
    this.element.classList.add(CSSClasses.StartScreenHidden);
    const image = String(BACKGROUNDS[getRandomInteger(0, BACKGROUNDS.length - 1)]);
    return new Promise<void>((resolve) => {
      this.bgImg.src = `${ImagesPaths.Backgrounds}${image}`;
      this.bgImg.onload = () => {
        resolve();
      };
    });
  }

  async onAppended() : Promise<void> {
    this.element.style.backgroundImage = `url(${this.bgImg.src})`;
    await delay(ANIMATION_TIME);
    this.element.classList.remove(CSSClasses.StartScreenHidden);
  }

  async startNewGame() : Promise<void> {
    try {
      await this.gameService.newGame();
    } catch {
      alert('Не удалось создать новую игру');
    }
  }
}
