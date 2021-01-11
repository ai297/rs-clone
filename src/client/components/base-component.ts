import { CSSClasses } from '../enums';

export interface IComponent {
  readonly element: HTMLElement;
  beforeAppend?: () => Promise<void>;
  onAppended?: () => Promise<void>;
  beforeRemove?: () => Promise<void>;
  onRemoved?: () => Promise<void>;
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
