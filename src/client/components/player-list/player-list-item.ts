import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement } from '../../../common/utils';

export class PlayerListItem extends BaseComponent {
  constructor(private id: string, private name: string, private heroName: string, private avatar: string) {
    super([CSSClasses.PlayerListItem]);

    const playerName = createElement(Tags.Div, [CSSClasses.PlayerName], this.name);
    const playerHero = createElement(Tags.Div, [CSSClasses.PlayerHero], this.heroName);
    const playerInfo = createElement(Tags.Div, [CSSClasses.PlayerInfo]);
    const playerAvatarWrapper = createElement(Tags.Div, [CSSClasses.PlayerAvatar]);
    playerAvatarWrapper.innerHTML = `<img src="${avatar}" alt="${heroName}">`;
    playerInfo.append(playerName, playerHero);
    this.element.append(playerAvatarWrapper, playerInfo);
  }
}
