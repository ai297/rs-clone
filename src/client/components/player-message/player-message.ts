import { createElement, delay, IPlayerInfo } from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { BaseComponent } from '../base-component';
import { Avatar } from '../avatar';

const ANIMATIN_DELAY = 500;

export class PlayerMessage extends BaseComponent {
  private readonly messageContainer: HTMLElement;

  constructor(private readonly player: IPlayerInfo) {
    super([CSSClasses.PlayerMessage]);

    this.messageContainer = createElement(Tags.Div, [CSSClasses.PlayerMessageContent]);
    const avatar = new Avatar(player.heroId);

    this.element.append(avatar.element, this.messageContainer);
  }

  setMessage(message: string): void {
    this.messageContainer.innerHTML = message;
  }

  async beforeRemove(): Promise<void> {
    this.element.classList.add(CSSClasses.PlayerMessageInit);
    await delay(ANIMATIN_DELAY);
  }

  onRemoved(): Promise<void> {
    this.element.classList.remove(CSSClasses.PlayerMessageInit);
    return Promise.resolve();
  }

  beforeAppend(): Promise<void> {
    this.element.classList.add(CSSClasses.PlayerMessageInit);
    return Promise.resolve();
  }

  async onAppended(): Promise<void> {
    await delay(50);
    this.element.classList.remove(CSSClasses.PlayerMessageInit);
    await delay(ANIMATIN_DELAY);
  }
}
