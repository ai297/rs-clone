import { CSSClasses } from '../../enums';
import { BaseComponent } from '../base-component';

export abstract class ActionLayer extends BaseComponent {
  constructor(layer = 1, ...classes: CSSClasses[]) {
    super([CSSClasses.GameActionLayer, ...classes]);
    this.element.style.zIndex = layer.toString();
  }
}
