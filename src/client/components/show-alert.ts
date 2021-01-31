import { Overlay } from './overlay';
import { Popup } from './popup/popup';

export function showAlert(text: string): Promise<void> {
  return new Promise((resolve) => {
    const overlay = new Overlay();
    const popup = new Popup(
      () => {
        overlay.hide().then(() => resolve());
      },
      text,
    );
    overlay.show(popup);
  });
}
