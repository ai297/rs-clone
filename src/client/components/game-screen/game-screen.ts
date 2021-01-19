import {
  createElement, ICard, IHero, IPlayerInfo,
} from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { IGameScreenLocalization, GAME_SCREEN_DEFAULT_LOCALIZATION } from '../../localization';
import { IComponent } from '../component';
import { BaseComponent } from '../base-component';
import { PlayerCards } from '../player-cards/player-cards';
import { GameService } from '../../services/game-service';
import { GamePlayerDisplay } from '../player-display/player-display';
import { HeroesRepository } from '../../services';
import { OpponentsCards } from '../opponents-cards/opponents-cards';
import { BaseButton } from '../base-button/base-button';

// test
const PLAYERS: Array<IPlayerInfo> = [
  {
    id: '111',
    userName: 'Вася',
    health: 11,
    heroId: 'lady_lazervere',
    position: 0,
  },
  {
    id: '222',
    userName: 'Петя',
    health: 22,
    heroId: 'fey_ticklebottom',
    position: 1,
  },
  {
    id: '333',
    userName: 'Маша',
    health: 3,
    heroId: 'hogs_house',
    position: 2,
  },
  {
    id: '444',
    userName: 'Аня',
    health: 4,
    heroId: 'jung_jung',
    position: 3,
  },
];

const CURRENT_PLAYER_ID = '222';

export class GameScreen extends BaseComponent {
  private loc!: IGameScreenLocalization;

  private opponentsInfoContainer!: HTMLElement;

  private opponentsCardsContainer!: HTMLElement;

  private playerInfoContainer!: HTMLElement;

  private playSection!: HTMLElement;

  private controlsContainer!: HTMLElement;

  private readonly playerCards: PlayerCards;

  private currentPlayerDisplay?: GamePlayerDisplay;

  private opponents: Map<string, GamePlayerDisplay> = new Map<string, GamePlayerDisplay>();

  // test
  private players = PLAYERS; // this.gameService.currentPlayers;

  // test
  private currentPlayerId = CURRENT_PLAYER_ID; // this.gameService.currentPlayerId;

  private currentPlayerPosition?: number;

  constructor(
    private readonly gameService: GameService,
    private readonly heroesRepository: HeroesRepository,
    localization?: IGameScreenLocalization,
  ) {
    super([CSSClasses.GameScreen]);
    this.loc = localization || GAME_SCREEN_DEFAULT_LOCALIZATION;
    this.createMarkup();

    if (this.currentPlayerId) {
      const playerInfo = <IPlayerInfo> this.players.find(
        (player: IPlayerInfo) => player.id === this.currentPlayerId,
      );

      const getCurrentPlayerInfo = async (): Promise<GamePlayerDisplay> => {
        const heroInfo = <IHero> await this.heroesRepository.getHero(playerInfo.heroId);
        const currentPlayerInfo = new GamePlayerDisplay(
          playerInfo.userName, heroInfo.name, heroInfo.image, playerInfo.health, true,
        );

        this.playerInfoContainer.append(currentPlayerInfo.element);

        return currentPlayerInfo;
      };

      getCurrentPlayerInfo().then((playerDisplay) => {
        this.currentPlayerDisplay = playerDisplay;
      });

      this.currentPlayerPosition = playerInfo.position;
    }

    this.players.sort((a, b) => a.position - b.position);

    const currentPlayerIndex: number = this.players
      .findIndex((player) => player.position === this.currentPlayerPosition);
    const rightHandOpponents: Array<IPlayerInfo> = this.players.splice(0, currentPlayerIndex);

    this.players.push(...rightHandOpponents);
    this.players.filter((player) => player.id !== this.currentPlayerId)
      .forEach((opponent) => {
        this.getOpponentsInfo(opponent);
      });

    this.gameService.onPlayerTakeHeal = this.showPlayerHeal;
    this.gameService.onPlayerTakeDamage = this.showPlayerDamage;
    this.gameService.onGetCards = this.addCards;

    this.playerCards = new PlayerCards();
    this.playerCards.element.classList.add(CSSClasses.GameCardsSection);
    this.playSection.append(this.playerCards.element);
    // test
    setTimeout(() => this.showPlayerDamage('222', 5), 5000);
    setTimeout(() => this.showPlayerHeal('333', 10), 5000);
  }

  private getOpponentsInfo = async (opponent: IPlayerInfo): Promise<void> => {
    const heroInfo = <IHero> await this.heroesRepository.getHero(opponent.heroId);
    const opponentInfo = new GamePlayerDisplay(opponent.userName, heroInfo.name, heroInfo.image, opponent.health);
    const opponentCards = new OpponentsCards();

    this.opponents.set(opponent.id, opponentInfo);
    this.addOpponent(opponentInfo, opponentCards);
  };

  private addOpponent(opponentInfo: IComponent, opponentCards: IComponent): void {
    opponentInfo.element.classList.add(CSSClasses.GameOpponentSection);
    opponentCards.element.classList.add(CSSClasses.GameOpponentSection);

    this.opponentsInfoContainer.append(opponentInfo.element);
    this.opponentsCardsContainer.append(opponentCards.element);
  }

  private showPlayerHeal = async (playerId: string, heal: number): Promise<void> => {
    if (playerId === this.currentPlayerId) {
      await this.currentPlayerDisplay?.addHealth(heal);
    }

    if (this.opponents.has(playerId)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerId);

      await opponent.addHealth(heal);
    }
  };

  private showPlayerDamage = async (playerId: string, damage: number): Promise<void> => {
    if (playerId === this.currentPlayerId) {
      await this.currentPlayerDisplay?.bringDamage(damage);
    }

    if (this.opponents.has(playerId)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerId);

      await opponent.bringDamage(damage);
    }
  };

  private addCards = async (cards: Array<ICard>): Promise<void> => {
    await this.playerCards.addCards(...cards);
  };

  private selectedCards = (): Array<string> => this.playerCards.getSelectedCardsId();

  private setSelectSpell = async (): Promise<void> => {
    await this.gameService.selectSpell(this.selectedCards());
  };

  private createMarkup(): void {
    const UILayer = createElement(Tags.Div, [CSSClasses.GameUILayer]);

    this.playSection = createElement(Tags.Div, [CSSClasses.GamePlaySection]);
    this.opponentsCardsContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsCards]);
    this.opponentsInfoContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsInfo]);
    this.playerInfoContainer = createElement(Tags.Div, [CSSClasses.GamePlayerInfo], 'player info');
    this.controlsContainer = createElement(Tags.Div, [CSSClasses.GameControls], 'controls');

    const readyButton = new BaseButton(
      this.loc.ReadyButton,
      this.setSelectSpell,
      [CSSClasses.GameScreenButton],
    );

    this.controlsContainer.append(readyButton.element);
    UILayer.append(this.opponentsInfoContainer, this.playerInfoContainer, this.controlsContainer);
    this.element.append(this.opponentsCardsContainer, this.playSection, UILayer);
  }
}
