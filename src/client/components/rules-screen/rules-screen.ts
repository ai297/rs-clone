import { BaseComponent } from '../base-component';
import { BaseButton } from '../base-button/base-button';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { createElement } from '../../../common/utils';
import { IRulesLocalization, RULES_DEFAULT_LOCALIZATION } from '../../localization';

const URL = './rules.json';

export class RulesScreen extends BaseComponent {
  private async load(): Promise<void> {
    try {
      const response = await fetch(URL);
      const data = await response.json();
      this.showData(data);
    } catch {
      this.element.innerText = 'Что-то пошло не так...';
    }
  }

  private loc: IRulesLocalization;

  constructor(private showStartScreen: () => Promise<void>, localization?: IRulesLocalization) {
    super([CSSClasses.RulesScreen]);

    this.loc = localization || RULES_DEFAULT_LOCALIZATION;
    this.load();
  }

  showData(data: { title: string; content: string; }): void {
    const container = createElement(Tags.Div, [CSSClasses.RulesContainer]);
    const headerImage = createElement(Tags.Div, [CSSClasses.RulesHeaderImage]);
    const title = createElement(Tags.H1, [CSSClasses.RulesTitle], data.title);
    const content = createElement(Tags.Div, [CSSClasses.RulesText]);

    const backButton = new BaseButton(
      this.loc.BackButton,
      () => this.showStartScreen(),
      [CSSClasses.RulesScreenButton],
    );

    content.innerHTML = data.content;

    container.append(headerImage, title, content, backButton.element);
    this.element.append(container);
  }
}
