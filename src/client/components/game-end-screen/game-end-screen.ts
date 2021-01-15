import { BaseComponent } from '../base-component';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { createElement } from '../../../common/utils';
import { IPlayerInfo } from '../../../common/interfaces';
import { HeroesRepository } from '../../services';
import { IGameEndLocalization, GAME_END_DEFAULT_LOCALIZATION } from '../localization';

export class GameEndScreen extends BaseComponent {
  constructor(
    private players: Array<IPlayerInfo>,
    private winnerId: string,
    localization?: IGameEndLocalization,
  ) {
    super([CSSClasses.GameEndScreen]);

    const loc = localization || GAME_END_DEFAULT_LOCALIZATION;

    const winnerContainer = createElement(Tags.Div, [CSSClasses.WinnerContainer], loc.WinnerTitle);
    const losersContainer = createElement(Tags.Div, [CSSClasses.LosersContainer], loc.LosersTitle);
    const heroes = new HeroesRepository();

    const createMarkup = (container: HTMLElement, player: IPlayerInfo): HTMLElement => {
      const playerName = createElement(Tags.Div, [CSSClasses.ItemName], player.userName);
      const playerHeroName = createElement(Tags.Div, [CSSClasses.ItemHeroName]);
      const playerAvatar = createElement(Tags.Img, [CSSClasses.ItemAvatar]);

      heroes.getHero(player.heroId).then((hero) => {
        if (hero) {
          playerHeroName.textContent = hero.name;
          playerAvatar.setAttribute('src', `${ImagesPaths.HeroesAvatars}${hero.image}.png`);
          playerAvatar.setAttribute('alt', hero.name);
        }
      });

      container.append(playerAvatar, playerName, playerHeroName);

      return container;
    };

    const winner = this.players.find((player) => player.id === this.winnerId);
    if (winner) {
      createMarkup(winnerContainer, winner);
    }

    const losers = this.players.filter((player) => player.id !== this.winnerId);
    const losersArr: Array<HTMLElement> = [];

    losers.forEach((loser) => {
      const item = createElement(Tags.Div, [CSSClasses.LoserItem]);

      losersArr.push(createMarkup(item, loser));
    });
    losersContainer.append(...losersArr);

    this.element.append(winnerContainer, losersContainer);
  }
}
