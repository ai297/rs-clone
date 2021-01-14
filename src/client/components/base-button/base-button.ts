import { createElement } from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { IComponent } from '../component';

export class BaseButton implements IComponent {
  private el: HTMLElement;

  constructor(private title: string, private callback: () => void, private cssClass?: Array<CSSClasses>) {
    this.el = createElement(Tags.Button, [CSSClasses.Button, ...cssClass || []]);
    this.el.innerText = title;
    this.el.setAttribute('type', 'button');
    this.el.addEventListener('click', callback);
  }

  public get element(): HTMLElement {
    return this.el;
  }

  public get disabled(): boolean {
    return (this.el.hasAttribute('disabled'));
  }

  public set disabled(value: boolean) {
    if (value) {
      this.el.setAttribute('disabled', '');
    } else {
      this.el.removeAttribute('disabled');
    }
  }
}
