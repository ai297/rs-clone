import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';

// предлагаю это вынести в отдельный класс, куда передавать объект с параметрами или енам
function createElement(
  tag: string,
  cssClass: CSSClasses,
  title?: string,
  attr?: string,
): HTMLElement {
  const element = document.createElement(tag);

  element.classList.add(cssClass);
  element.innerText = title;
  element.setAttribute('src', attr); // переделать надо нормально

  return element;
}

// хардкод!!!
const playerList = [
  {
    avatar: 'player1Ava',
    name: 'player1Name',
  },
  {
    avatar: 'player2Ava',
    name: 'player2Name',
  },
];

export class PlayerList extends BaseComponent {
  constructor() {
    super();
    this.container.classList.add(CSSClasses.playerListContainer);

    // если планируем локализацию, то надо в папку компонента класть объект с подписями, лучше это сразу делать
    const playerListTitle = createElement('div', CSSClasses.playerListTitle, 'Список игроков');
    const playerListWrapper = createElement('ul', CSSClasses.playerListWrapper);

    playerList.forEach((player) => {
      // это предлагаю в отдельный класс
      const playerListItem = createElement('li', CSSClasses.playerListItem);
      const playerAvatar = createElement('img', CSSClasses.playerAvatar, '', player.avatar);
      const playerName = createElement('span', CSSClasses.playerName, player.name);
      // сюда наверное добавятся еще эл-ты с полями объекта player

      playerListItem.append(playerAvatar, playerName);
      playerListWrapper.append(playerListItem);
    });

    // предлагаю кнопки вынести в отдельный класс
    const startGameBtn = createElement('button', CSSClasses.startGameBtn, 'Начать игру');

    this.container.append(playerListTitle, playerListWrapper, startGameBtn);
  }

  /* methods of class */
}
