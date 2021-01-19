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

  private opponentCardsComponents: Map<string, OpponentsCards> = new Map<string, OpponentsCards>();

  private currentPlayerPosition?: number;

  constructor(
    private readonly gameService: GameService,
    private readonly heroesRepository: HeroesRepository,
    localization?: IGameScreenLocalization,
  ) {
    super([CSSClasses.GameScreen]);
    this.loc = localization || GAME_SCREEN_DEFAULT_LOCALIZATION;
    this.createMarkup();

    if (this.gameService.currentPlayerId) {
      const playerInfo = <IPlayerInfo> this.gameService.currentPlayers.find(
        (player: IPlayerInfo) => player.id === this.gameService.currentPlayerId,
      );
      this.currentPlayerPosition = playerInfo.position;

      this.takeCurrentPlayerInfo(playerInfo);
    }

    const currentPlayerIndex: number = this.gameService.currentPlayers
      .findIndex((player) => player.position === this.currentPlayerPosition);
    const opponentsPlacement: Array<IPlayerInfo> = Array.from(this.gameService.currentPlayers);
    const rightHandOpponents: Array<IPlayerInfo> = opponentsPlacement.splice(0, currentPlayerIndex);

    opponentsPlacement.push(...rightHandOpponents);
    opponentsPlacement.filter((player) => player.id !== this.gameService.currentPlayerId)
      .forEach((opponent) => {
        this.takeOpponentsInfo(opponent);
      });

    this.gameService.onPlayerTakeHeal = this.showPlayerHeal;
    this.gameService.onPlayerTakeDamage = this.showPlayerDamage;
    this.gameService.onGetCards = this.addCards;
    this.gameService.onPlayerSelectSpell = this.showOpponentCards;

    this.playerCards = new PlayerCards();
    this.playerCards.element.classList.add(CSSClasses.GameCardsSection);
    this.playSection.append(this.playerCards.element);
  }

  private takeCurrentPlayerInfo = async (playerInfo: IPlayerInfo): Promise<void> => {
    const heroInfo = <IHero> await this.heroesRepository.getHero(playerInfo.heroId);
    const currentPlayerInfo = new GamePlayerDisplay(
      playerInfo.userName, heroInfo.name, heroInfo.image, playerInfo.health, true,
    );

    this.currentPlayerDisplay = currentPlayerInfo;
    this.playerInfoContainer.append(currentPlayerInfo.element);
  };

  private takeOpponentsInfo = async (opponent: IPlayerInfo): Promise<void> => {
    const heroInfo = <IHero> await this.heroesRepository.getHero(opponent.heroId);
    const opponentInfo = new GamePlayerDisplay(opponent.userName, heroInfo.name, heroInfo.image, opponent.health);
    const opponentCards = new OpponentsCards();

    this.opponentCardsComponents.set(opponent.id, opponentCards);
    this.opponents.set(opponent.id, opponentInfo);

    this.addOpponent(opponentInfo, opponentCards);
  };

  private addOpponent(opponentInfo: IComponent, opponentCards: IComponent): void {
    opponentInfo.element.classList.add(CSSClasses.GameOpponentSection);
    opponentCards.element.classList.add(CSSClasses.GameOpponentSection);

    this.opponentsInfoContainer.append(opponentInfo.element);
    this.opponentsCardsContainer.append(opponentCards.element);
  }

  private showOpponentCards = async (playerId: string, cardsInSpell: number): Promise<void> => {
    this.opponentCardsComponents.get(playerId)?.showCards(cardsInSpell);
  };

  private showPlayerHeal = async (playerId: string, heal: number): Promise<void> => {
    if (playerId === this.gameService.currentPlayerId) {
      await this.currentPlayerDisplay?.addHealth(heal);
    }

    if (this.opponents.has(playerId)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerId);

      await opponent.addHealth(heal);
    }
  };

  private showPlayerDamage = async (playerId: string, damage: number): Promise<void> => {
    if (playerId === this.gameService.currentPlayerId) {
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
