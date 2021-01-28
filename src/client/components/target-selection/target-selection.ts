import { BaseComponent } from '../base-component';
import { CSSClasses, ImagesPaths, Tags } from '../../enums';
import { TargetForSelection } from '../../../common/interfaces/target-for-selection';
import {
  createElement, SELECT_TARGET_TIME, TARGET_ALL,
} from '../../../common';
import { GAME_SCREEN_DEFAULT_LOCALIZATION, IGameScreenLocalization } from '../../localization';

export class TargetSelection extends BaseComponent {
  constructor(
    private targets: Array<TargetForSelection>,
    private callback: (id: string) => void,
    private selectAll: boolean = true,
    private timer: number = SELECT_TARGET_TIME,
    private loc: IGameScreenLocalization = GAME_SCREEN_DEFAULT_LOCALIZATION,
  ) {
    super([CSSClasses.TargetSelection]);

    const AllTarget: TargetForSelection = {
      id: TARGET_ALL,
      name: this.loc.ALlEnemies,
      image: 'all_enemies',
    };

    if (this.selectAll) targets.push(AllTarget);
    this.createMarkup();
  }

  createMarkup(): void {
    const targetsTitle = createElement(Tags.Span, [CSSClasses.TargetSelectionTitle]);
    targetsTitle.innerText = this.loc.TargetSelection;
    const targetsWrapper = createElement(Tags.Div, [CSSClasses.TargetsWrapper]);

    this.targets.forEach((targetCur) => {
      const target = createElement(Tags.Div, [CSSClasses.Target]);
      target.setAttribute('data-id', `${targetCur.id}`);
      const targetImg = createElement(Tags.Img, [CSSClasses.TargetImg]);
      targetImg.setAttribute('src', `${ImagesPaths.HeroesFullSize}${targetCur.image}.jpg`);
      const targetTitle = createElement(Tags.Span, [CSSClasses.TargetTitle]);
      targetTitle.innerText = targetCur.name;
      target.append(targetImg, targetTitle);

      target.addEventListener('click', () => {
        this.callback(targetCur.id);
      });

      targetsWrapper.append(target);
    });

    const timeBarContainer = createElement(Tags.Div, [CSSClasses.TargetTimeContainer]);
    const timeBar = createElement(Tags.Div, [CSSClasses.TargetTime]);
    timeBarContainer.append(timeBar);
    timeBar.style.animationDuration = `${this.timer}ms`;

    this.element.append(targetsTitle, targetsWrapper, timeBarContainer);
  }
}
