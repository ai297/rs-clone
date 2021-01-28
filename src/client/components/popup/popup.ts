import { BaseComponent } from '../base-component';
import { CSSClasses, Tags } from '../../enums';
import { BaseButton } from '../base-button/base-button';
import { createElement } from '../../../common';

export class Popup extends BaseComponent {
  constructor(private callback: () => void, private popupText: string, private buttonTitle: string = 'OK') {
    super([CSSClasses.Popup]);
    const popupContent = createElement(Tags.Div, [CSSClasses.PopupText], popupText);
    const popupButton = new BaseButton(buttonTitle, callback, [CSSClasses.PopupButton]);
    this.element.append(popupContent, popupButton.element);
  }
}
