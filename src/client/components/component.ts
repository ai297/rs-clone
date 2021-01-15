export interface IComponent {
  readonly element: HTMLElement;
  beforeAppend?: () => Promise<void>;
  onAppended?: () => Promise<void>;
  beforeRemove?: () => Promise<void>;
  onRemoved?: () => Promise<void>;
}
