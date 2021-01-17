import { createElement, IPlayerInfo } from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { IComponent } from '../component';
import { BaseComponent } from '../base-component';
import { PlayerCards } from '../player-cards/player-cards';
import { GameService } from '../../services/game-service';
import { GamePlayerDisplay } from '../player-display/player-display';
import { HeroesRepository } from '../../services';
import { OpponentsCards } from '../opponents-cards/opponents-cards';

export class GameScreen extends BaseComponent {
  private opponentsInfoContainer!: HTMLElement;

  private opponentsCardsContainer!: HTMLElement;

  private playerInfoContainer!: HTMLElement;

  private playSection!: HTMLElement;

  private controlsContainer!: HTMLElement;

  private readonly playerCards: PlayerCards;

  private currentPlayer!: IPlayerInfo;

  private opponents: Map<string, GamePlayerDisplay> = new Map<string, GamePlayerDisplay>();

  constructor(private readonly gameService: GameService, private readonly heroesRepository: HeroesRepository) {
    super([CSSClasses.GameScreen]);
    this.createMarkup();

    this.currentPlayer = this.gameService.currentPlayers.find(
      (player) => player.id === this.gameService.currentPlayerId,
    );

    this.gameService.currentPlayers.filter((player) => player.id !== this.gameService.currentPlayerId)
      .forEach((opponent) => {
        this.getOpponentsInfo(opponent);
      });

    this.gameService.onPlayerTakeHeal = this.showPlayerHeal;
    this.gameService.onPlayerTakeDamage = this.showPlayerDamage;

    this.playerCards = new PlayerCards();
    this.playerCards.element.classList.add(CSSClasses.GameCardsSection);
    this.playSection.append(this.playerCards.element);
  }

  private getCurrentPlayerInfo = async (): Promise<GamePlayerDisplay> => {
    const heroInfo = await this.heroesRepository.getHero(this.currentPlayer.heroId);
    const currentPlayerInfo = new GamePlayerDisplay(
      this.currentPlayer.userName, heroInfo.name, heroInfo.image, this.currentPlayer.health, true,
    );

    this.playerInfoContainer.append(currentPlayerInfo.element);

    return currentPlayerInfo;
  };

  private currentPlayerDisplay = this.getCurrentPlayerInfo();

  private getOpponentsInfo = async (opponent: IPlayerInfo): Promise<void> => {
    const heroInfo = await this.heroesRepository.getHero(opponent.heroId);
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

  showPlayerHeal = async (playerId: string, heal: number): Promise<void> => {
    if (playerId === this.gameService.currentPlayerId) {
      (await this.currentPlayerDisplay).addHealth(heal);
    }

    if (this.opponents.has(playerId)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerId);

      await opponent.addHealth(heal);
    }
  };

  private showPlayerDamage = async (playerId: string, damage: number): Promise<void> => {
    if (this.opponents.has(playerId)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerId);

      await opponent.bringDamage(damage);
    }
  };

  private createMarkup(): void {
    const UILayer = createElement(Tags.Div, [CSSClasses.GameUILayer]);

    this.playSection = createElement(Tags.Div, [CSSClasses.GamePlaySection]);
    this.opponentsCardsContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsCards]);
    this.opponentsInfoContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsInfo]);
    this.playerInfoContainer = createElement(Tags.Div, [CSSClasses.GamePlayerInfo], 'player info');
    this.controlsContainer = createElement(Tags.Div, [CSSClasses.GameControls], 'controls');

    UILayer.append(this.opponentsInfoContainer, this.playerInfoContainer, this.controlsContainer);
    this.element.append(this.opponentsCardsContainer, this.playSection, UILayer);
  }
}
