import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { BaseButton } from '../base-button/base-button';

export class StartScreen extends BaseComponent {
  constructor() {
    super([CSSClasses.StartScreen]);
    const newGameButton = new BaseButton('Новая игра', () => console.log('New'), [CSSClasses.StartScreenButton]);
    const joinButton = new BaseButton('Присоединиться', () => console.log('Join'), [CSSClasses.StartScreenButton]);
    const rulesButton = new BaseButton('Правила', () => console.log('Rules'), [CSSClasses.StartScreenButton]);
    const settingsButton = new BaseButton('Настройки', () => console.log('Settings'), [CSSClasses.StartScreenButton]);
    this.element.append(newGameButton.element, joinButton.element, rulesButton.element, settingsButton.element);
  }
}
