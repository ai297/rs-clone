import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';
import { IComponent } from '../component';
import { delay } from '../../../common/utils/delay';

const ANIMATION_TIME = 1000;

export class Overlay extends BaseComponent {
  constructor(private component: IComponent) {
    super([CSSClasses.Overlay]);
  }

  show(): void {
    this.element.classList.add(CSSClasses.BeforeAppend);
    delay(ANIMATION_TIME);
    this.element.classList.remove(CSSClasses.BeforeAppend);
    this.root.rootElement.append(this.element);
    this.component.beforeAppend?.call(this);
    this.element.append(this.component.element);
    this.component.onAppended?.call(this);
  }

  hide(): void {
    this.component.beforeRemove?.call(this);
    this.component.element.remove();
    this.component.onRemoved?.call(this);
    this.element.classList.add(CSSClasses.BeforeRemove);
    delay(ANIMATION_TIME);
    this.element.classList.remove(CSSClasses.BeforeRemove);
    this.element.remove();
  }
}
