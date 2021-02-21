export interface IRootComponent {
  readonly rootElement: HTMLElement,
  readonly baseURL: string,
  getGameUrl(gameId: string): string,
}
