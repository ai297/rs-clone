import { IComponent } from '../base-component';

export class BaseButton implements IComponent {
  private el: HTMLElement;

  constructor(private title: string, private callback: () => void) {
    this.el = document.createElement('button');
    this.el.innerText = title;
    this.el.addEventListener('click', callback);
  }

  public get element(): HTMLElement {
    return this.el;
  }
}
