import { createElement } from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { IComponent } from '../base-component';

export class BaseButton implements IComponent {
  private el: HTMLElement;

  constructor(private title: string, private callback: () => void, private cssClass?: Array<CSSClasses>) {
    this.el = createElement(Tags.Button, [CSSClasses.Button, ...cssClass || []]);
    this.el.innerText = title;
    this.el.setAttribute('type', Tags.Button);
    this.el.addEventListener('click', callback);
  }

  public get element(): HTMLElement {
    return this.el;
  }
}
