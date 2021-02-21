import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';

export class Timer extends BaseComponent {
  private secondsValue = 0;

  private timerId?: number;

  constructor(
    classes: Array<CSSClasses> = [],
    private readonly showMinutes = true,
  ) {
    super([CSSClasses.Timer, ...classes]);
  }

  public start(seconds: number): void {
    clearInterval(this.timerId);
    this.secondsValue = seconds;
    this.timerId = window.setInterval(this.countdownSeconds, 1000);
  }

  public stop = (): void => {
    clearInterval(this.timerId);
    this.secondsValue = 0;
    this.element.innerText = '';
  };

  private countdownSeconds = (): void => {
    if (this.secondsValue <= 1) {
      clearInterval(this.timerId);
      return;
    }
    this.secondsValue -= 1;

    const minutes = Math.floor(this.secondsValue / 60).toString();
    const seconds = Math.floor(this.secondsValue % 60).toString().padStart(2, '0');

    this.element.innerText = this.showMinutes ? `${minutes}:${seconds}` : `${this.secondsValue}`;
  };
}
