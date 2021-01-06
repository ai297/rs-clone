import { CSSClasses } from '../enums/css-classes';

export abstract class BaseComponent {
  private componentContainer: HTMLElement;

  constructor() {
    this.componentContainer = document.createElement('div');
    this.componentContainer.classList.add(CSSClasses.ComponentContainer);
  }

  public get container(): HTMLElement {
    return this.componentContainer;
  }
}
