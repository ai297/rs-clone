import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { IComponent } from '../component';
import { delay } from '../../../common/utils/delay';

const ANIMATION_TIME = 3000;
const DELAY_TIME = 1;

export class Overlay extends BaseComponent {
  constructor(private component: IComponent) {
    super([CSSClasses.Overlay]);
  }

  async show(): Promise<void> {
    this.element.classList.add(CSSClasses.BeforeAppend);
    this.root.rootElement.append(this.element);
    await delay(DELAY_TIME);
    this.element.classList.remove(CSSClasses.BeforeAppend);
    await delay(ANIMATION_TIME);
    if (this.component.beforeAppend) await this.component.beforeAppend();
    this.element.append(this.component.element);
    if (this.component.onAppended) await this.component.onAppended();
  }

  async hide(): Promise<void> {
    if (this.component.beforeRemove) await this.component.beforeRemove();
    this.component.element.remove();
    if (this.component.onRemoved) await this.component.onRemoved();
    this.element.classList.add(CSSClasses.BeforeRemove);
    await delay(ANIMATION_TIME);
    this.element.classList.remove(CSSClasses.BeforeRemove);
    this.element.remove();
  }
}
