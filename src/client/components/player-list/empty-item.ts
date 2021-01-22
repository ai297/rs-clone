import { BaseComponent } from '../base-component';
import { Tags, CSSClasses } from '../../enums';
import { createElement } from '../../../common/utils';

export class EmptyItem extends BaseComponent {
  constructor() {
    super([CSSClasses.PlayerListItem, CSSClasses.EmptyItem]);

    const playerAvatarWrapper = createElement(Tags.Div, [CSSClasses.PlayerAvatar]);
    this.element.append(playerAvatarWrapper);
  }
}
