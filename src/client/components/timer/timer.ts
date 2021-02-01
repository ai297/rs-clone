import { BaseComponent } from '../base-component';
import { CSSClasses } from '../../enums';

export class Timer extends BaseComponent {
  private secondsValue = 0;

  constructor(
    classes: Array<CSSClasses> = [],
    private readonly showMinutes = true,
  ) {
    super([CSSClasses.Timer, ...classes]);
  }

  public start(seconds: number): void {
    this.secondsValue = seconds;
    this.countdownSeconds();
  }

  public stop = (): void => {
    this.secondsValue = 0;
    this.element.innerText = '';
  };

  private countdownSeconds = (): void => {
    if (this.secondsValue > 0) {
      this.secondsValue -= 1;

      const minutes = Math.floor(this.secondsValue / 60).toString();
      const seconds = Math.floor(this.secondsValue % 60).toString().padStart(2, '0');

      this.element.innerText = this.showMinutes ? `${minutes}:${seconds}` : `${this.secondsValue}`;
      setTimeout(this.countdownSeconds, 1000);
    }
  };
}
