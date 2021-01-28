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
      this.element.innerText = 'Что-то пошло не так...';
    }
  }

  constructor(localization = 'ru') {
    super([CSSClasses.AboutScreen]);

    this.load();
  }

  showData(data: { title: string; content: string; team: Array<any>; }): void {
    const container = createElement(Tags.Div, [CSSClasses.AboutContainer]);
    const headerImage = createElement(Tags.Div, [CSSClasses.AboutHeaderImage]);
    const title = createElement(Tags.H1, [CSSClasses.AboutTitle], data.title);
    const content = createElement(Tags.Div, [CSSClasses.AboutText]);
    const team = createElement(Tags.Div, [CSSClasses.AboutTeam]);
    const membersData: Array<HTMLElement> = [];

    content.innerHTML = data.content;
    data.team.forEach((member): void => {
      const markup = this.createTeamMarkup(member.memberName, member.gitAdress, member.photo, member.description);

      membersData.push(markup);
    });

    team.append(...membersData);
    container.append(headerImage, title, content, team);
    this.element.append(container);
  }

  // eslint-disable-next-line class-methods-use-this
  createTeamMarkup(
    memberName: string,
    gitAdress: string,
    photo: string,
    description: string,
  ): HTMLElement {
    const member = createElement(Tags.Div, [CSSClasses.TeamMateContainer]);
    const markup = `
      <img class="team-mate__avatar" src="${ImagesPaths.PhotoTeam}${photo}" alt="${memberName}">
      <a href="https://github.com/${gitAdress}" target='_blank'">
        <span class="team-mate__name">${memberName}
      </a>
      </div>
      <div class="team-mate__description">${description}</div>
    `;

    member.innerHTML = markup;

    return member;
  }
}
