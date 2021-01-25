import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';

export class Timer extends BaseComponent {
  private secondsValue = 0;

  constructor(
    classes: Array<CSSClasses> = [],
  ) {
    super([CSSClasses.Timer, ...classes]);
  }

  public start(seconds: number): void {
    this.secondsValue = seconds;
    this.countdownSeconds();
    this.element.innerText = seconds.toString();
  }

  public stop = (): void => {
    this.secondsValue = 0;
    this.element.innerText = '';
  };

  private countdownSeconds = (): void => {
    if (this.secondsValue === 0) {
      console.log('timer ends');
    } else {
      this.secondsValue -= 1;

      const minutes = Math.floor(this.secondsValue / 60).toString().padStart(2, '0');
      const seconds = Math.floor(this.secondsValue % 60).toString().padStart(2, '0');

      this.element.innerText = `${minutes}:${seconds}`;
      setTimeout(this.countdownSeconds, 1000);
    }
  };
}
