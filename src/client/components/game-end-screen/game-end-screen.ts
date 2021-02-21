import { BaseComponent } from '../base-component';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { createElement } from '../../../common/utils';
import { IPlayerInfo } from '../../../common/interfaces';
import { GameService, HeroesRepository } from '../../services';
import { IGameEndLocalization, GAME_END_DEFAULT_LOCALIZATION } from '../../localization';
import { BaseButton } from '../base-button/base-button';

export class GameEndScreen extends BaseComponent {
  constructor(
    private gameService: GameService,
    private alivePlayers: Array<IPlayerInfo>,
    private heroes: HeroesRepository,
    private onHomeButtonClick: () => void,
    localization?: IGameEndLocalization,
  ) {
    super([CSSClasses.GameEndScreen]);
    const loc = localization || GAME_END_DEFAULT_LOCALIZATION;

    const screenWrapper = createElement(Tags.Div, [CSSClasses.GameEndWrapper]);
    const gameEndTitle = createElement(Tags.Div, [CSSClasses.GameEndTitle]);
    const playerContainer = createElement(Tags.Div, [CSSClasses.PLayerContainer]);
    const playerAvatar = createElement(Tags.Img, [CSSClasses.ItemAvatar]);
    const gameEndButton = new BaseButton(loc.HomeButton, () => this.onHomeButtonClick());

    const currentPlayer = this.gameService.currentPlayers.find((elem) => elem.id === this.gameService.currentPlayerId);
    if (currentPlayer) {
      this.heroes.getHero(currentPlayer.heroId).then((hero) => {
        if (hero) {
          playerAvatar.setAttribute('src', `${ImagesPaths.HeroesFullSize}${hero.image}.jpg`);
          playerAvatar.setAttribute('alt', hero.name);
        }
      });
    }

    if (this.alivePlayers.length > 0) {
      this.alivePlayers.forEach((player) => {
        if (this.gameService.currentPlayerId === player.id) {
          gameEndTitle.innerText = loc.WinnerTitle;
        } else {
          gameEndTitle.innerText = loc.LoserTitle;
        }
      });
    } else {
      gameEndTitle.innerText = loc.NoWinnersTitle;
    }

    playerContainer.append(playerAvatar);
    screenWrapper.append(gameEndTitle, playerContainer, gameEndButton.element);
    this.element.append(screenWrapper);

    // const winnerContainer = createElement(Tags.Div, [CSSClasses.WinnerContainer], loc.WinnerTitle);
    // const losersContainer = createElement(Tags.Div, [CSSClasses.LosersContainer], loc.LosersTitle);
    // const createMarkup = (container: HTMLElement, player: IPlayerInfo): HTMLElement => {
    //   const playerName = createElement(Tags.Div, [CSSClasses.ItemName], player.userName);
    //   const playerHeroName = createElement(Tags.Div, [CSSClasses.ItemHeroName]);
    //   const playerAvatar = createElement(Tags.Img, [CSSClasses.ItemAvatar]);
    //   this.heroes.getHero(player.heroId).then((hero) => {
    //     if (hero) {
    //       playerHeroName.textContent = hero.name;
    //       playerAvatar.setAttribute('src', `${ImagesPaths.HeroesAvatars}${hero.image}.png`);
    //       playerAvatar.setAttribute('alt', hero.name);
    //     }
    //   });
    //   container.append(playerAvatar, playerName, playerHeroName);
    //   return container;
    // };
    // this.alivePlayers.forEach((player) => createMarkup(winnerContainer, player));
    // const losers : Array<IPlayerInfo> = [];
    // this.gameService.currentPlayers.forEach((player) => this.alivePlayers.forEach((elem) => {
    //   if (elem.id !== player.id) {
    //     losers.push(player);
    //   }
    // }));
    // const losersArr: Array<HTMLElement> = [];
    // losers.forEach((loser) => {
    //   const item = createElement(Tags.Div, [CSSClasses.LoserItem]);
    //   losersArr.push(createMarkup(item, loser));
    // });
    // losersContainer.append(...losersArr);
    // this.element.append(winnerContainer, losersContainer);
  }
}
