import { createElement } from '../../common';
import { CSSClasses, Tags } from '../enums';

export interface IComponent {
  readonly element: HTMLElement;
  beforeAppend?: () => Promise<void>;
  onAppended?: () => Promise<void>;
  beforeRemove?: () => Promise<void>;
  onRemoved?: () => Promise<void>;
}

export abstract class BaseComponent implements IComponent {
  private el: HTMLElement;

  constructor(classList?: Array<CSSClasses>) {
    this.el = createElement(Tags.Div, [CSSClasses.Component, ...(classList || [])]);
  }

  public get element(): HTMLElement {
    return this.el;
  }
}
