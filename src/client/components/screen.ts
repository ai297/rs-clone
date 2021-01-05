abstract class Screen {
  private screenContainer: HTMLElement;

  constructor() {
    this.screenContainer = document.createElement('div');
    this.screenContainer.classList.add('screen-container');
  }

  public get container(): HTMLElement {
    return this.screenContainer;
  }
}

export default Screen;
