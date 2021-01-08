import { CSSClasses } from '../enums';

export interface IComponent {
  readonly element: HTMLElement;
}

export abstract class BaseComponent implements IComponent {
  private el: HTMLElement;

  constructor(className?: string) {
    this.el = document.createElement('div');
    this.el.className = `${CSSClasses.Component} ${className || ''}`;
  }

  public get element(): HTMLElement {
    return this.el;
  }
}
