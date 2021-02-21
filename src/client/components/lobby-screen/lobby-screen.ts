import { BaseComponent } from '../base-component';
import {
  MIN_PLAYERS,
  createElement,
  ICreatePlayerRequest,
  IHero,
  IPlayerInfo,
  getRandomInteger, playSound, Sounds, START_GAME_TIMEOUT,
} from '../../../common';
import { HeroSelection } from '../hero-selection/hero-selection';
import { PlayerList } from '../player-list/player-list';
import { BaseButton } from '../base-button/base-button';
import { Tags, CSSClasses, ImagesPaths } from '../../enums';
import { GameService } from '../../services/game-service';
import { ILobbyLocalization, LOBBY_DEFAULT_LOCALIZATION } from '../../localization';
import { HeroesRepository } from '../../services';
import { showAlert } from '../show-alert';
import { Timer } from '../timer/timer';

const VALIDATION_REGEX = /^[a-zA-ZА-Яа-я0-9-_]+ ?[a-zA-ZА-Яа-я0-9-_]+$/;

function validateName(value: string) {
  return VALIDATION_REGEX.test(value) && value.length > 2 && value.length < 19;
}

export class LobbyScreen extends BaseComponent {
  private heroSelection! : HeroSelection;

  private playerList! : PlayerList;

  private currentHero : IHero | null = null;

  private nameInput! : HTMLInputElement;

  private loc: ILobbyLocalization;

  private heroSelectionButton! : BaseButton;

  private startGameButton? : BaseButton;

  private playerName = '';

  private isDisabled = false;

  private disabledHeroes: Array<string> = [];

  constructor(
    private readonly gameCreator: boolean,
    timeout: number,
    private readonly heroesRepository: HeroesRepository,
    private readonly gameService: GameService,
    localization?: ILobbyLocalization,
  ) {
    super([CSSClasses.Lobby]);
    this.loc = localization || LOBBY_DEFAULT_LOCALIZATION;
    this.playerList = new PlayerList(this.gameCreator, this.addBot.bind(this));
    this.gameService.currentPlayers.forEach((elem) => {
      this.addPlayer(elem);
    });
    this.heroSelection = new HeroSelection(this.heroesRepository, this.onSelect.bind(this), this.disabledHeroes);
    this.gameService.onPlayerJoined = this.onPlayerJoined.bind(this);
    this.gameService.onPlayerLeaved = this.onPlayerLeaved.bind(this);
    this.createMarkup();
    if (this.gameService.currentPlayerId) {
      const currentPlayer = this.gameService.getPlayerInfo(this.gameService.currentPlayerId);
      if (currentPlayer) {
        this.nameInput.value = currentPlayer.userName;
        this.disableLobby(true);
        this.heroesRepository.getHero(currentPlayer.heroId).then((hero) => {
          if (hero) {
            this.heroSelection.showSelectedHero(hero);
          }
        });
      }
      this.readyToStart();
    }

    const timer = new Timer();
    this.element.append(timer.element);
    // Почему-то без задержки не хочет таймер запускаться нормально)
    setTimeout(() => timer.start((START_GAME_TIMEOUT - timeout - 1000) / 1000), 1000);
  }

  private onPlayerJoined(playerInfo: IPlayerInfo): void {
    this.heroSelection.makeDisabled(playerInfo.heroId, true);
    this.addPlayer(playerInfo);
    if (this.currentHero?.id === playerInfo.heroId) {
      this.currentHero = null;
      this.readyToSelect();
    }
    this.readyToStart();
  }

  private onPlayerLeaved(playerInfo: IPlayerInfo): void {
    this.playerList.removePlayer(playerInfo.id);
    this.heroSelection.makeDisabled(playerInfo.heroId, false);
    this.readyToStart();
  }

  private readyToStart() {
    if (this.startGameButton) {
      if (this.gameService.currentPlayers.length >= MIN_PLAYERS) {
        this.startGameButton.disabled = false;
      } else {
        this.startGameButton.disabled = true;
      }
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
        this.disabledHeroes.push(hero.id);
      }
    });
  }

  private async addBot(): Promise<void> {
    const heroes = await this.heroesRepository.getAllHeroes();
    this.createBot(heroes);
  }

  private async createBot(heroes: Array<IHero>): Promise<void> {
    const hero = heroes[getRandomInteger(0, heroes.length - 1)];
    if (this.disabledHeroes.indexOf(hero.id) === -1) {
      try {
        await this.gameService.createBot(hero.id);
      } catch {
        await showAlert('Не удалось создать бота...'); // TODO: Заменить на локализацию...
      }
    } else {
      this.createBot(heroes);
    }
  }

  private createMarkup(): void {
    const lobbyMain = createElement(Tags.Div, [CSSClasses.LobbyMain]);
    const lobbyMainLeft = createElement(Tags.Div, [CSSClasses.LobbyMainLeft]);
    const lobbyMainRight = createElement(Tags.Div, [CSSClasses.LobbyMainRight]);
    lobbyMainRight.innerHTML = `<div class="${CSSClasses.LobbySubtitle}">${this.loc.PlayerList}</div>`;
    lobbyMainRight.append(this.playerList.element);
    lobbyMain.append(lobbyMainLeft, lobbyMainRight);

    const nameLabel = createElement(Tags.Label, [CSSClasses.LobbySubtitle], this.loc.EnterYourName);
    this.nameInput = createElement(Tags.Input, [CSSClasses.NameInput]) as HTMLInputElement;
    this.nameInput.setAttribute('type', 'text');
    this.nameInput.setAttribute('spellcheck', 'false');
    this.nameInput.oninput = this.onInput.bind(this);
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
      const lobbyHeader = createElement(Tags.Div, [CSSClasses.LobbyHeader]);
      const gameLink = this.root.getGameUrl(this.gameService.currentGameId);
      lobbyHeader.innerHTML = `<h3 class="${CSSClasses.LobbySubtitle}">${this.loc.GameLink}:</h3>`;
      const gameLinkElement = createElement(Tags.Div, [CSSClasses.GameLink], `${gameLink}`);
      const copyIcon = createElement(Tags.Div, [CSSClasses.CopyIcon]);
      copyIcon.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path stroke="null" fill="#f8cfa9" fill-opacity="0.5" id="svg_2"
                              d="m16.385353,1.652503l-11.694276,0c-1.076848,0 -1.949045,0.923274
                              -1.949045,2.063182l0,14.442268l1.949045,0l0,-14.442268l11.694276,0l0,
                              -2.063182zm2.923569,4.126363l-10.719753,0c-1.076848,0 -1.949045,0.923274
                              -1.949045,2.063182l0,14.442268c0,1.139908 0.872198,2.063182 1.949045,
                              2.063182l10.719753,0c1.076848,0 1.949047,-0.923274 1.949047,-2.063182l0,
                              -14.442268c0,-1.139908 -0.872199,-2.063182 -1.949047,-2.063182zm0,16.50545l
                              -10.719753,0l0,-14.442268l10.719753,0l0,14.442268z"/>
                            </svg>`;
      copyIcon.addEventListener('click', () => {
        navigator.clipboard.writeText(gameLink)
          .then(() => {
            const tooltip = createElement(Tags.Div, [CSSClasses.CopyTooltip], this.loc.Copy);
            gameLinkElement.append(tooltip);
            setTimeout(() => tooltip.remove(), 500);
          })
          .catch(() => {
            // alert(`Something went wrong: ${e}`);
          });
      });
      gameLinkElement.append(copyIcon);
      lobbyHeader.append(gameLinkElement);
      this.element.append(lobbyHeader);

      this.startGameButton = new BaseButton(
        this.loc.StartGame,
        () => this.startGameHandler(),
        [CSSClasses.StartGameButton, CSSClasses.StartGameButtonDisabled],
      );
      this.startGameButton.disabled = true;
      lobbyButtons.append(this.startGameButton.element);
    }

    this.element.append(
      lobbyMain,
      lobbyButtons,
    );
  }

  private async startGameHandler(): Promise<void> {
    try {
      await this.gameService.startGame();
    } catch {
      await showAlert('Не удалось запустить игру...'); // TODO: заменить на локализацию
    }
  }

  private onSelect(hero: IHero): void {
    this.currentHero = hero;
    this.readyToSelect();
    playSound(Sounds.onSelectCharacter);
  }

  private onInput() {
    this.playerName = this.nameInput.value;
    if (validateName(this.playerName)) {
      this.nameInput.classList.remove(CSSClasses.NameInputInvalid);
      this.nameInput.classList.add(CSSClasses.NameInputValid);
    } else {
      this.nameInput.classList.remove(CSSClasses.NameInputValid);
      this.nameInput.classList.add(CSSClasses.NameInputInvalid);
    }
    this.readyToSelect();
  }

  private readyToSelect(): void {
    if (validateName(this.playerName) && this.currentHero) {
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
        showAlert('Не удалось создать игрока'); // TODO: заменить на локализацию
        this.disableLobby(false);
      }
    }
  }
}
