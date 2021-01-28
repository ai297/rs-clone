import { CSSClasses } from '../../enums';
import { BaseComponent } from '../base-component';

export class ActionLayer extends BaseComponent {
  constructor(layer = 1) {
    super([CSSClasses.GameActionLayer]);
    this.element.style.zIndex = layer.toString();
  }
}
