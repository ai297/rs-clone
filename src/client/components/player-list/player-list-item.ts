import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement } from '../../../common/utils';

export class PlayerListItem extends BaseComponent {
  constructor(private id: string, private name: string, private heroName: string, private avatar: string) {
    super([CSSClasses.PlayerListItem]);

    const playerName = createElement(Tags.Div, [CSSClasses.PlayerName], this.name);
    const playerHero = createElement(Tags.Div, [CSSClasses.PlayerHero], this.heroName);
    const playerAvatar = createElement(Tags.Img, [CSSClasses.PlayerAvatar]);
    playerAvatar.setAttribute('src', avatar);
    playerAvatar.setAttribute('alt', heroName);

    this.element.append(playerAvatar, playerName, playerHero);
  }
}
