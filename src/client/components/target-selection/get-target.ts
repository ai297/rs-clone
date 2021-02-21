import { delay, SELECT_TARGET_TIME } from '../../../common';
import { Overlay } from '../overlay';
import { TargetForSelection } from './target-for-selection';
import { TargetSelection } from './target-selection';

export function getTarget(
  overlay: Overlay,
  targets: TargetForSelection[],
  isSelectAll = false,
  timeout = SELECT_TARGET_TIME,
): Promise<string[]> {
  const selectTargetPromise = (): Promise<string[]> => new Promise((resolve) => {
    const targetSelection = new TargetSelection(
      targets,
      (result) => {
        overlay.hide();
        resolve([result]);
      },
      isSelectAll,
      timeout,
    );
    overlay.show(targetSelection);
  });
  const timerPromise = (): Promise<string[]> => new Promise((resolve) => {
    delay(timeout).then(() => {
      overlay.hide();
      resolve([]);
    });
  });
  return Promise.race([timerPromise(), selectTargetPromise()]);
}
