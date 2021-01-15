import { StaticScreens } from './enums';

export interface IRootComponent {
  readonly rootElement: HTMLElement,
  showLobby(isCreator: boolean): Promise<void>,
  showStatic(type: StaticScreens): Promise<void>,
  showGame(): Promise<void>,
}
