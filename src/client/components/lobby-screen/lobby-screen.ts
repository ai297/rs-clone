import { BaseComponent } from '../base-component';
import {
  MIN_PLAYERS,
  createElement,
  ICreatePlayerRequest,
  IHero,
  IPlayerInfo,
  getRandomInteger,
} from '../../../common';
import { HeroSelection } from '../hero-selection/hero-selection';
import { PlayerList } from '../player-list/player-list';
import { BaseButton } from '../base-button/base-button';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { GameService } from '../../services/game-service';
import { ILobbyLocalization, LOBBY_DEFAULT_LOCALIZATION } from '../../localization';
import { HeroesRepository } from '../../services';

export class LobbyScreen extends BaseComponent {
  private heroSelection! : HeroSelection;

  private playerList : PlayerList = new PlayerList();

  private currentHero : IHero | null = null;

  private nameInput! : HTMLInputElement;

  private loc: ILobbyLocalization;

  private heroSelectionButton! : BaseButton;

  private startGameButton? : BaseButton;

  private playerName = '';

  private isDisabled = false;

  constructor(
    private gameCreator: boolean,
    private heroesRepository: HeroesRepository,
    private gameService: GameService,
    localization?: ILobbyLocalization,
  ) {
    super([CSSClasses.Lobby]);
    this.loc = localization || LOBBY_DEFAULT_LOCALIZATION;
    const disabledHeroes = this.gameService.currentPlayers.map((elem) => elem.heroId);
    this.heroSelection = new HeroSelection(this.heroesRepository, this.onSelect.bind(this), disabledHeroes);
    this.gameService.currentPlayers.forEach((elem) => {
      this.addPlayer(elem);
    });
    this.gameService.onPlayerJoined = this.onPlayerJoined.bind(this);
    this.gameService.onPlayerLeaved = this.onPlayerLeaved.bind(this);
    this.createMarkup();
  }

  private onPlayerJoined(playerInfo: IPlayerInfo): void {
    this.heroSelection.makeDisabled(playerInfo.heroId, true);
    this.addPlayer(playerInfo);
    if (this.currentHero?.id === playerInfo.heroId) {
      this.currentHero = null;
      this.readyToSelect();
    }
    if (this.gameService.currentPlayers.length >= MIN_PLAYERS && this.startGameButton) {
      this.startGameButton.disabled = false;
    }
  }

  private onPlayerLeaved(playerInfo: IPlayerInfo): void {
    this.playerList.removePlayer(playerInfo.id);
    this.heroSelection.makeDisabled(playerInfo.heroId, false);
    if (this.gameService.currentPlayers.length < MIN_PLAYERS && this.startGameButton) {
      this.startGameButton.disabled = true;
    }
  }

  private addPlayer(playerInfo: IPlayerInfo): void {
    this.heroesRepository.getHero(playerInfo.heroId).then((hero) => {
      if (hero) {
        this.playerList.addPlayer(
          playerInfo.id,
          playerInfo.userName,
          hero.name,
          `${ImagesPaths.HeroesAvatars}${hero.image}.png`,
        );
      }
    });
  }

  private createMarkup(): void {
    const lobbyHeader = createElement(Tags.Div, [CSSClasses.LobbyHeader]);
    const gameLink = this.root.getGameUrl(this.gameService.currentGameId);
    lobbyHeader.innerHTML = `<h1 class="${CSSClasses.LobbyTitle}">${this.loc.Title}</h1>
                            <div class="${CSSClasses.GameLinkWrapper} ${CSSClasses.LobbySubtitle}">
                              <p>${this.loc.GameLink}:</p>
                              <p class="${CSSClasses.GameLink}">${gameLink}</p>
                            </div>`;

    const lobbyMain = createElement(Tags.Div, [CSSClasses.LobbyMain]);
    const lobbyMainLeft = createElement(Tags.Div, [CSSClasses.LobbyMainLeft]);
    const lobbyMainRight = createElement(Tags.Div, [CSSClasses.LobbyMainRight]);
    lobbyMainRight.innerHTML = `<div class="${CSSClasses.LobbySubtitle}">${this.loc.PlayerList}</div>`;
    lobbyMainRight.append(this.playerList.element);
    lobbyMain.append(lobbyMainLeft, lobbyMainRight);

    const nameLabel = createElement(Tags.Label, [CSSClasses.LobbySubtitle], this.loc.EnterYourName);
    this.nameInput = createElement(Tags.Input, [CSSClasses.NameInput]) as HTMLInputElement;
    this.nameInput.setAttribute('type', 'text');
    // this.nameInput.setAttribute('placeholder', this.loc.EnterYourName);
    this.nameInput.oninput = this.readyToSelect.bind(this);
    nameLabel.append(this.nameInput);
    lobbyMainLeft.append(nameLabel, this.heroSelection.element);

    const lobbyButtons = createElement(Tags.Div, [CSSClasses.LobbyButtons]);
    this.heroSelectionButton = new BaseButton(
      this.loc.SelectHero,
      this.setHero.bind(this),
      [CSSClasses.SelectHeroButton],
    );
    this.heroSelectionButton.disabled = true;
    lobbyButtons.append(this.heroSelectionButton.element);

    if (this.gameCreator) {
      this.startGameButton = new BaseButton(
        this.loc.StartGame,
        () => this.startGameHandler(),
        [CSSClasses.StartGameButton, CSSClasses.StartGameButtonDisabled],
      );
      this.startGameButton.disabled = true;
      // const addBotButton = new BaseButton('Добавить бота', async () => {
      //   const heroes = await this.heroesRepository.getAllHeroes();
      //   const hero = heroes[getRandomInteger(0, heroes.length - 1)];
      //   try {
      //     await this.gameService.createBot(hero.id);
      //   } catch (e: unknown) {
      //     alert((e as Error)?.message);
      //   }
      // });
      // this.element.append(addBotButton.element);
      lobbyButtons.append(this.startGameButton.element);
    }

    this.element.append(
      lobbyHeader,
      lobbyMain,
      lobbyButtons,
    );
  }

  private async startGameHandler(): Promise<void> {
    try {
      await this.gameService.startGame();
    } catch (error) {
      alert(error);
    }
  }

  private onSelect(hero: IHero): void {
    this.currentHero = hero;
    this.readyToSelect();
  }

  private readyToSelect(): void {
    this.playerName = this.nameInput.value.trim();
    if (this.playerName && this.currentHero) {
      this.heroSelectionButton.disabled = false;
    } else {
      this.heroSelectionButton.disabled = true;
    }
  }

  private disableLobby(value: boolean): void {
    this.isDisabled = value;
    if (value) {
      this.nameInput.setAttribute('readonly', '');
      this.heroSelectionButton.disabled = true;
      this.heroSelection.isDisabled = true;
    } else {
      this.nameInput.removeAttribute('readonly');
      this.heroSelectionButton.disabled = false;
      this.heroSelection.isDisabled = false;
    }
  }

  private async setHero(): Promise<void> {
    if (!this.isDisabled) {
      this.disableLobby(true);
      const request: ICreatePlayerRequest = {
        gameId: this.gameService.currentGameId,
        userName: this.playerName,
        heroId: String(this.currentHero?.id),
      };
      try {
        await this.gameService.createHero(request);
      } catch (err: unknown) {
        alert(`Не удалось создать игрока: ${(<Error> err)?.message}`);
        this.disableLobby(false);
      }
    }
  }
}
