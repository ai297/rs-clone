import { createElement } from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { BaseComponent, IComponent } from '../base-component';

export class GameScreen extends BaseComponent {
  private opponentsCardsContainer!: HTMLElement;

  private opponentsInfoContainer!: HTMLElement;

  private playerInfoContainer!: HTMLElement;

  private playerCardsContainer!: HTMLElement;

  private controlsContainer!: HTMLElement;

  constructor() {
    super([CSSClasses.GameScreen]);
    this.createMarkup();
  }

  private addOpponent(opponentInfo: IComponent, opponentCards: IComponent): void {
    opponentInfo.element.classList.add(CSSClasses.GameOpponentSection);
    opponentCards.element.classList.add(CSSClasses.GameOpponentSection);
    this.opponentsInfoContainer.append(opponentInfo.element);
    this.opponentsCardsContainer.append(opponentCards.element);
  }

  private createMarkup(): void {
    const playSection = createElement(Tags.Div, [CSSClasses.GamePlaySection]);
    const UILayer = createElement(Tags.Div, [CSSClasses.GameUILayer]);
    this.opponentsCardsContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsCards]);
    this.opponentsInfoContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsInfo]);
    this.playerCardsContainer = createElement(Tags.Div, [CSSClasses.GameCardsSection], 'user selected cards here');
    playSection.append(this.playerCardsContainer);
    this.playerInfoContainer = createElement(Tags.Div, [CSSClasses.GamePlayerInfo], 'player info');
    this.controlsContainer = createElement(Tags.Div, [CSSClasses.GameControls], 'controls');
    UILayer.append(this.opponentsInfoContainer, this.playerInfoContainer, this.controlsContainer);
    this.element.append(this.opponentsCardsContainer, playSection, UILayer);
  }
}
