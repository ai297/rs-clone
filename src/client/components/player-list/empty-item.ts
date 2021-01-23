import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement } from '../../../common/utils';
import { BaseButton } from '../base-button/base-button';
import { ILobbyLocalization, LOBBY_DEFAULT_LOCALIZATION } from '../../localization';

export class EmptyItem extends BaseComponent {
  private loc: ILobbyLocalization;

  constructor(private gameCreator: boolean, localization?: ILobbyLocalization) {
    super([CSSClasses.PlayerListItem, CSSClasses.EmptyItem]);
    this.loc = localization || LOBBY_DEFAULT_LOCALIZATION;
    const playerAvatarWrapper = createElement(Tags.Div, [CSSClasses.PlayerAvatar]);
    this.element.append(playerAvatarWrapper);
    if (this.gameCreator) {
      const addBotButton = new BaseButton(this.loc.AddBot, () => console.log('add bot'), [CSSClasses.AddBotButton]);
      this.element.append(addBotButton.element);
    }
  }
}
