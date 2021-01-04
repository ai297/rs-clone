import Screen from '../screen';

const SCREEN_BUTTONS = ['Новая игра', 'Присоединиться', 'Правила', 'Настройки'];

function createButtons(title: string): HTMLElement {
  const button = document.createElement('button');
  button.innerText = title;
  button.classList.add('start-screen__button');
  return button;
}

class StartScreen extends Screen {
  constructor() {
    super();
    this.container.classList.add('start-screen');
    SCREEN_BUTTONS.forEach((title) => {
      const button = createButtons(title);
      this.container.append(button);
    });
  }
}

export default StartScreen;
