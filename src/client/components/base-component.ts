import { createElement } from '../../common';
import { CSSClasses, Tags } from '../enums';

export interface IComponent {
  readonly element: HTMLElement;
}

export abstract class BaseComponent implements IComponent {
  private el: HTMLElement;

  constructor(className?: Array<CSSClasses>) {
    this.el = createElement(Tags.Div, [CSSClasses.Component, ...className || []]);
  }

  public get element(): HTMLElement {
    return this.el;
  }
}
