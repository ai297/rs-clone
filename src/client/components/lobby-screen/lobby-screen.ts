import { BaseComponent } from '../base-component';
import {
  createElement, ICreatePlayerRequest, IHero, IPlayerInfo,
} from '../../../common';
import { HeroSelection } from '../hero-selection/hero-selection';
import { PlayerList } from '../player-list/player-list';
import { BaseButton } from '../base-button/base-button';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { GameService } from '../../services/game-service';
import { ILobbyLocalization } from '../localization/interface-lobby-localization';
import { LOBBY_DEFAULT_LOCALIZATION } from '../localization/localization';
import { HeroesRepository } from '../../services';

const SERVER_URL = `${window.location.protocol}//${window.location.host}`;

export class LobbyScreen extends BaseComponent {
  private heroSelection : HeroSelection = new HeroSelection(this.heroesRepository, this.onSelect.bind(this));

  private playerList : PlayerList = new PlayerList();

  private currentHero : IHero | null = null;

  private nameInput : HTMLElement | null = null;

  private loc: ILobbyLocalization;

  private heroSelectionButton: BaseButton | null = null;

  private startGameButton?: BaseButton | null = null;

  private playerName = '';

  private isDisabled = false;

  constructor(
    private gameCreator: boolean,
    private heroesRepository: HeroesRepository,
    private gameService: GameService,
    loc?: ILobbyLocalization,
  ) {
    super([CSSClasses.Lobby]);
    this.loc = loc || LOBBY_DEFAULT_LOCALIZATION;
    this.createMarkup();
    this.gameService.currentPlayers.forEach((elem) => {
      this.heroesRepository.getHero(elem.heroId).then((hero) => {
        if (hero) {
          this.playerList.addPlayer(
            elem.id,
            elem.userName,
            hero.name,
            `${ImagesPaths.HeroesAvatars}${hero.image}.png`,
          );
        }
      });
    });
    this.gameService.onPlayerJoined = this.onPlayerJoined;
    this.gameService.onPlayerLeaved = this.onPlayerLeaved;
  }

  private onPlayerJoined(playerInfo: IPlayerInfo) {
    this.heroSelection.makeDisabled(playerInfo.heroId, true);
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
    if (this.currentHero?.id === playerInfo.heroId) {
      this.currentHero = null;
      this.readyToSelect();
    }
    if (this.gameService.currentPlayers.length > 2 && this.startGameButton) {
      this.startGameButton.disableButton = false;
    }
  }

  private onPlayerLeaved(playerId: string) {
    const player = this.gameService.currentPlayers.find((elem) => elem.id === playerId);
    this.playerList.removePlayer(playerId);
    if (player) {
      this.heroSelection.makeDisabled(player.heroId, false);
    }
    if (this.gameService.currentPlayers.length < 2 && this.startGameButton) {
      this.startGameButton.disableButton = true;
    }
  }

  createMarkup(): void {
    const gameLink = `${SERVER_URL}/${this.gameService.currentGameId}`;
    const gameLinkElement = createElement(Tags.Div, [CSSClasses.GameLink], `${this.loc.GameLink}: ${gameLink}`);

    this.nameInput = createElement(Tags.Input, [CSSClasses.NameInput]);
    this.nameInput.setAttribute('type', 'text');
    this.nameInput.setAttribute('placeholder', this.loc.EnterYourName);
    this.nameInput.oninput = this.readyToSelect.bind(this);

    this.heroSelectionButton = new BaseButton(
      this.loc.SelectHero,
      this.setHero.bind(this),
      [CSSClasses.SelectHeroButton],
    );
    this.heroSelectionButton.disableButton = true;

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
      this.startGameButton.disableButton = true;
      this.element.append(this.startGameButton.element);
    }
  }

  private onSelect(hero: IHero): void {
    this.currentHero = hero;
    this.readyToSelect();
  }

  private readyToSelect(): void {
    this.playerName = (<HTMLInputElement> this.nameInput)?.value.trim();
    if (this.playerName && this.currentHero) {
      (<BaseButton> this.heroSelectionButton).disableButton = false;
    } else {
      (<BaseButton> this.heroSelectionButton).disableButton = true;
    }
  }

  private disableLobby(value: boolean) {
    if (value) {
      this.nameInput?.setAttribute('readonly', '');
      (<BaseButton> this.heroSelectionButton).disableButton = true;
      this.heroSelection.isDisabled = true;
    } else {
      this.nameInput?.removeAttribute('readonly');
      (<BaseButton> this.heroSelectionButton).disableButton = false;
      this.heroSelection.isDisabled = false;
    }
  }

  async setHero(): Promise<void> {
    if (!this.isDisabled) {
      this.isDisabled = true;
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
        this.isDisabled = false;
        this.disableLobby(false);
      }
    }
  }
}
