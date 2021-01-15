import { createElement } from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { IComponent } from '../component';
import { BaseComponent } from '../base-component';
import { PlayerCards } from '../player-cards/player-cards';

export class GameScreen extends BaseComponent {
  private opponentsCardsContainer!: HTMLElement;

  private opponentsInfoContainer!: HTMLElement;

  private playerInfoContainer!: HTMLElement;

  private playSection!: HTMLElement;

  private controlsContainer!: HTMLElement;

  private readonly playerCards: PlayerCards;

  constructor() {
    super([CSSClasses.GameScreen]);
    this.createMarkup();

    this.playerCards = new PlayerCards();
    this.playerCards.element.classList.add(CSSClasses.GameCardsSection);
    this.playSection.append(this.playerCards.element);
  }

  private addOpponent(opponentInfo: IComponent, opponentCards: IComponent): void {
    opponentInfo.element.classList.add(CSSClasses.GameOpponentSection);
    opponentCards.element.classList.add(CSSClasses.GameOpponentSection);
    this.opponentsInfoContainer.append(opponentInfo.element);
    this.opponentsCardsContainer.append(opponentCards.element);
  }

  private createMarkup(): void {
    this.playSection = createElement(Tags.Div, [CSSClasses.GamePlaySection]);
    const UILayer = createElement(Tags.Div, [CSSClasses.GameUILayer]);
    this.opponentsCardsContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsCards]);
    this.opponentsInfoContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsInfo]);
    this.playerInfoContainer = createElement(Tags.Div, [CSSClasses.GamePlayerInfo], 'player info');
    this.controlsContainer = createElement(Tags.Div, [CSSClasses.GameControls], 'controls');
    UILayer.append(this.opponentsInfoContainer, this.playerInfoContainer, this.controlsContainer);
    this.element.append(this.opponentsCardsContainer, this.playSection, UILayer);
  }
}
