import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { IComponent } from '../component';
import { delay } from '../../../common/utils/delay';

const ANIMATION_TIME = 300;
const DELAY_TIME = 50;

export class Overlay extends BaseComponent {
  private component?: IComponent;

  private isHidde = true;

  constructor() {
    super([CSSClasses.Overlay]);
  }

  async show(component: IComponent): Promise<void> {
    if (!this.isHidde) return;
    this.component = component;
    this.element.classList.add(CSSClasses.BeforeAppend);
    this.root.rootElement.append(this.element);
    await delay(DELAY_TIME);
    this.element.classList.remove(CSSClasses.BeforeAppend);
    await delay(ANIMATION_TIME);
    if (this.component.beforeAppend) await this.component.beforeAppend();
    this.element.append(this.component.element);
    if (this.component.onAppended) await this.component.onAppended();
    this.isHidde = false;
  }

  async hide(): Promise<void> {
    if (this.isHidde) return;
    if (this.component?.beforeRemove) await this.component.beforeRemove();
    this.component?.element.remove();
    if (this.component?.onRemoved) await this.component.onRemoved();
    this.element.classList.add(CSSClasses.BeforeRemove);
    await delay(ANIMATION_TIME);
    this.element.classList.remove(CSSClasses.BeforeRemove);
    this.element.remove();
    this.isHidde = true;
  }
}
