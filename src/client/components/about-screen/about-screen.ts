import { BaseComponent } from '../base-component';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { createElement } from '../../../common/utils';

const URL = './about-us.json';

export class AboutScreen extends BaseComponent {
  private async load(): Promise<void> {
    try {
      const response = await fetch(URL);
      const data = await response.json();
      this.showData(data);
    } catch {
      // this.showErrorMessage();
      // // или
      this.element.innerText = 'Что-то пошло не так...';
    }
  }

  constructor(localization = 'ru') {
    super([CSSClasses.AboutProject]);

    const loc = localization;

    this.load();
  }

  showData(data: { title: string; content: string; team: Array<any>; }): void {
    const title = createElement(Tags.H1, [CSSClasses.AboutProjectTitle], data.title);
    const content = createElement(Tags.Div, [CSSClasses.AboutProjectText]);
    const team = createElement(Tags.Div, [CSSClasses.AboutProjectTeam]);
    const membersData: Array<HTMLElement> = [];

    content.innerHTML = data.content;
    data.team.forEach((member): void => {
      const markup = this.createMarkup(member.memberName, member.description, member.photo, member.gitAdress);

      membersData.push(markup);
    });

    team.append(...membersData);
    this.element.append(title, content, team);
  }

  // eslint-disable-next-line class-methods-use-this
  createMarkup(
    memberName: string,
    description: string,
    photo: string,
    gitAdress: string,
  ): HTMLElement {
    const member = createElement(Tags.Div, [CSSClasses.TeamMateContainer]);
    const markup = `
      <img class="team-mate__avatar" src="${ImagesPaths.PhotoTeam}${photo}" alt="${memberName}">
      <div class="team-mate__name">${memberName}
        <a src="https://github.com/${gitAdress}"></a>
      </div>
      <div class="team-mate__hero">${description}</div>
    `;

    member.innerHTML = markup;

    return member;
  }
}
