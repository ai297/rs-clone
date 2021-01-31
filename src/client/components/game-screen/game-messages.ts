import { createElement, IPlayerInfo } from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { ActionLayer } from './action-layer';
import { PlayerMessage } from '../player-message/player-message';

export class GameMessages extends ActionLayer {
  private readonly messages: Array<PlayerMessage> = [];

  constructor() {
    super(3, CSSClasses.GameMessages);
  }

  async newMessage(
    playerInfo: IPlayerInfo,
    heroName: string,
    header: string,
    content?: string,
  ): Promise<PlayerMessage> {
    const container = createElement(Tags.Div, [CSSClasses.GameMessagesItem]);
    this.element.append(container);
    const message = new PlayerMessage(playerInfo);
    message.setMessage(`
      <h3>${heroName} (${playerInfo.userName}) ${header}</h3>
      ${content || ''}
    `);
    this.messages.push(message);
    await message.beforeAppend();
    container.append(message.element);
    await message.onAppended();
    return message;
  }

  async removeMessage(message: PlayerMessage): Promise<void> {
    if (!this.messages.includes(message)) return;
    const index = this.messages.indexOf(message);
    this.messages.splice(index, 1);
    await message.beforeRemove();
    message.element.parentElement?.remove();
    await message.onRemoved();
  }
}
