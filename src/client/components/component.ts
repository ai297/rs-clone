export interface IComponent {
  readonly element: HTMLElement;
  beforeAppend?: () => Promise<void>;
  onAppended?: (duration?: number) => Promise<void>;
  beforeRemove?: (duration?: number) => Promise<void>;
  onRemoved?: () => Promise<void>;
}
