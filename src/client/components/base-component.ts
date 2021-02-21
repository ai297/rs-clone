import { createElement } from '../../common';
import { CSSClasses, Tags } from '../enums';
import { IRootComponent } from '../root-component';
import { IComponent } from './component';

export abstract class BaseComponent implements IComponent {
  private static root?: IRootComponent;

  private el: HTMLElement;

  constructor(classList?: Array<CSSClasses>) {
    this.el = createElement(Tags.Div, [CSSClasses.Component, ...(classList || [])]);
  }

  public get element(): HTMLElement {
    return this.el;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get root(): IRootComponent {
    return BaseComponent.rootComponent;
  }

  private static get rootComponent(): IRootComponent {
    return BaseComponent.root || {
      rootElement: document.body,
      baseURL: '',
      getGameUrl: () => '',
    };
  }

  static setRoot(root: IRootComponent): void {
    if (!BaseComponent.root) BaseComponent.root = root;
  }
}
