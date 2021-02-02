import { IComponent } from '../component';
import { AnimationTimes, createElement, delay } from '../../../common';
import { CSSClasses, Tags } from '../../enums';

export class SplashScreen implements IComponent {
  readonly element: HTMLElement;

  constructor() {
    this.element = createElement(Tags.Div, [CSSClasses.SplashScreen]);
  }

  async beforeRemove(): Promise<void> {
    this.element.classList.add(CSSClasses.SplashScreenSkullAway);
    await delay(AnimationTimes.SplashScreenRemove);
  }
}
