import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';

const SCREEN_BUTTONS = ['Новая игра', 'Присоединиться', 'Правила', 'Настройки'];

function createButtons(title: string): HTMLElement {
  const button = document.createElement('button');
  button.innerText = title;
  button.classList.add(CSSClasses.StartScreenButton);
  return button;
}

export class StartScreen extends BaseComponent {
  constructor() {
    super();
    this.container.classList.add(CSSClasses.StartScreen);
    SCREEN_BUTTONS.forEach((title) => {
      const button = createButtons(title);
      this.container.append(button);
    });
  }
}
