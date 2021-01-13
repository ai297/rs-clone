import { BaseComponent } from '../base-component';
import {
  createElement, ICreatePlayerRequest, IHero, IPlayerInfo,
} from '../../../common';
import { HeroSelection } from '../hero-selection/hero-selection';
import { PlayerList } from '../player-list/player-list';
import { BaseButton } from '../base-button/base-button';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { GameService } from '../../services/game-service';
import { ILobbyLocalization, LOBBY_DEFAULT_LOCALIZATION } from '../localization';
import { HeroesRepository } from '../../services';

const SERVER_URL = `${window.location.protocol}//${window.location.host}`;
const MIN_PLAYERS_NUMBER = 2;

export class LobbyScreen extends BaseComponent {
  private heroSelection : HeroSelection = new HeroSelection(this.heroesRepository, this.onSelect.bind(this));

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
    this.createMarkup();
    this.gameService.currentPlayers.forEach((elem) => {
      this.addPlayer(elem);
    });
    this.gameService.onPlayerJoined = this.onPlayerJoined.bind(this);
    this.gameService.onPlayerLeaved = this.onPlayerLeaved.bind(this);
  }

  private onPlayerJoined(playerInfo: IPlayerInfo) {
    this.heroSelection.makeDisabled(playerInfo.heroId, true);
    this.addPlayer(playerInfo);
    if (this.currentHero?.id === playerInfo.heroId) {
      this.currentHero = null;
      this.readyToSelect();
    }
    if (this.gameService.currentPlayers.length > MIN_PLAYERS_NUMBER && this.startGameButton) {
      this.startGameButton.disabled = false;
    }
  }

  private onPlayerLeaved(playerInfo: IPlayerInfo) {
    this.playerList.removePlayer(playerInfo.id);
    this.heroSelection.makeDisabled(playerInfo.heroId, false);
    if (this.gameService.currentPlayers.length < MIN_PLAYERS_NUMBER && this.startGameButton) {
      this.startGameButton.disabled = true;
    }
  }

  private addPlayer(playerInfo: IPlayerInfo) {
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

  createMarkup(): void {
    const gameLink = `${SERVER_URL}/${this.gameService.currentGameId}`;
    const gameLinkElement = createElement(Tags.Div, [CSSClasses.GameLink], `${this.loc.GameLink}: ${gameLink}`);

    this.nameInput = createElement(Tags.Input, [CSSClasses.NameInput]) as HTMLInputElement;
    this.nameInput.setAttribute('type', 'text');
    this.nameInput.setAttribute('placeholder', this.loc.EnterYourName);
    this.nameInput.oninput = this.readyToSelect.bind(this);

    this.heroSelectionButton = new BaseButton(
      this.loc.SelectHero,
      this.setHero.bind(this),
      [CSSClasses.SelectHeroButton],
    );
    this.heroSelectionButton.disabled = true;

    this.element.append(
      gameLinkElement,
      this.nameInput,
      this.heroSelection.element,
      this.playerList.element,
      this.heroSelectionButton.element,
    );

    if (this.gameCreator) {
      this.startGameButton = new BaseButton(
        this.loc.StartGame,
        this.gameService.startGame,
        [CSSClasses.StartGameButton, CSSClasses.StartGameButtonDisabled],
      );
      this.startGameButton.disabled = true;
      this.element.append(this.startGameButton.element);
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

  private disableLobby(value: boolean) {
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

  async setHero(): Promise<void> {
    if (!this.isDisabled) {
      this.disableLobby(true);
      const request: ICreatePlayerRequest = {
        gameId: this.gameService.currentGameId,
        userName: this.playerName,
        heroId: String(this.currentHero?.id),
      };
      try {
        await this.gameService.createHero(request);
      } catch {
        alert('Не удалось создать игрока');
        this.disableLobby(false);
      }
    }
  }
}
