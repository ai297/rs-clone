import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement } from '../../../common/utils';
import { BaseButton } from '../base-button/base-button';
import { ILobbyLocalization, LOBBY_DEFAULT_LOCALIZATION } from '../../localization';

export class EmptyItem extends BaseComponent {
  private loc: ILobbyLocalization;

  private addBotButton!: BaseButton;

  constructor(private gameCreator: boolean, private addBot: () => void, localization?: ILobbyLocalization) {
    super([CSSClasses.PlayerListItem, CSSClasses.EmptyItem]);
    this.loc = localization || LOBBY_DEFAULT_LOCALIZATION;
    const playerAvatarWrapper = createElement(Tags.Div, [CSSClasses.PlayerAvatar]);
    this.element.append(playerAvatarWrapper);
    if (this.gameCreator) {
      this.addBotButton = new BaseButton(this.loc.AddBot, () => this.addBot(), [CSSClasses.AddBotButton]);
      this.element.append(this.addBotButton.element);
    }
  }

  public set addBotButtonIsDisabled(value: boolean) {
    if (value) {
      this.addBotButton.disabled = true;
    } else {
      this.addBotButton.disabled = false;
    }
  }
}
