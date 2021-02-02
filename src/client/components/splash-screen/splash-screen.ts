import { IComponent } from '../component';
import { createElement, delay } from '../../../common';
import { CSSClasses, Tags } from '../../enums';

const DELAY_ANIMATION = 1000;

export class SplashScreen implements IComponent {
  readonly element: HTMLElement;

  constructor() {
    this.element = createElement(Tags.Div, [CSSClasses.SplashScreen]);
  }

  async beforeRemove(): Promise<void> {
    this.element.classList.add(CSSClasses.SplashScreenSkullAway);
    await delay(DELAY_ANIMATION);
  }
}
