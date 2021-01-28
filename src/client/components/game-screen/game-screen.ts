import {
  SELECT_SPELL_TIME,
  SELECT_TARGET_TIME,
  delay,
  createElement,
  ICard,
  IHero,
  IPlayerInfo,
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
import { Timer } from '../timer/timer';
import { ActionLayer } from './action-layer';

export class GameScreen extends BaseComponent {
  private loc: IGameScreenLocalization;

  private opponentsInfoContainer!: HTMLElement;

  private opponentsCardsContainer!: HTMLElement;

  private playerInfoContainer!: HTMLElement;

  private playSection!: HTMLElement;

  private controlsContainer!: HTMLElement;

  private playerCards: PlayerCards;

  private currentPlayerDisplay?: GamePlayerDisplay;

  private opponents: Map<string, GamePlayerDisplay> = new Map<string, GamePlayerDisplay>();

  private opponentCards: Map<string, OpponentsCards> = new Map<string, OpponentsCards>();

  private readyButton!: BaseButton;

  private timer!: Timer;

  constructor(
    private readonly gameService: GameService,
    private readonly heroesRepository: HeroesRepository,
    localization?: IGameScreenLocalization,
  ) {
    super([CSSClasses.GameScreen]);
    this.loc = localization || GAME_SCREEN_DEFAULT_LOCALIZATION;
    this.createMarkup();
    this.createPlayersInfo([...this.gameService.currentPlayers], this.gameService.currentPlayerId);

    this.gameService.onNextMove = () => this.nextMove();
    this.gameService.onGetCards = (cards) => this.addCards(cards);
    this.gameService.onPlayerSelectSpell = (playerInfo, cards) => this.showOpponentCards(playerInfo, cards);
    this.gameService.onSpellCast = (player, cards) => this.showSpellCast(player, cards);
    this.gameService.onCardCast = (player, card) => this.showCardCast(player, card);
    this.gameService.onPlayerTakeHeal = (playerInfo, heal) => this.showPlayerHeal(playerInfo, heal);
    this.gameService.onPlayerTakeDamage = (playerInfo, damage) => this.showPlayerDamage(playerInfo, damage);
    this.gameService.onPlayerMakeDiceRoll = (playerInfo, rolls, bonus) => this.showDiceRoll(playerInfo, rolls, bonus);
    this.gameService.onSelectTarget = (targets, numberOfTargets) => this.showTargetSelection(targets, numberOfTargets);

    this.playerCards = new PlayerCards();
    this.addCards(this.gameService.currentPlayerCards, 0);
    this.playerCards.element.classList.add(CSSClasses.GameCardsSection);
    this.playSection.append(this.playerCards.element);
    this.disableControls = true;

    const castSpell = new ActionLayer();
    this.playSection.append(castSpell.element);
  }

  get disableControls(): boolean { return this.controlsContainer.classList.contains(CSSClasses.GameControlsDisabled); }

  set disableControls(value: boolean) {
    this.controlsContainer.classList.toggle(CSSClasses.GameControlsDisabled, value);
    this.readyButton.disabled = value;
  }

  get isSpellCast(): boolean { return this.element.classList.contains(CSSClasses.GameScreenCasting); }

  set isSpellCast(value: boolean) {
    this.element.classList.toggle(CSSClasses.GameScreenCasting, value);
  }

  nextMove(): void {
    const player = this.gameService.getPlayerInfo(this.gameService.currentPlayerId);
    if (player?.health) this.playerCards.setDisable(false);
    this.isSpellCast = false;
    this.opponentsCardsContainer.classList.add(CSSClasses.GameOpponentCardsHide);
    console.log('Следующий ход');
  }

  async addCards(cards: Array<ICard>, timer = SELECT_SPELL_TIME): Promise<void> {
    // console.log('Раздача карт');
    await this.playerCards.addCards(...cards);
    this.disableControls = false;
    this.timer.start(timer / 1000);
  }

  async showOpponentCards(playerInfo: IPlayerInfo, cardsInSpell: number): Promise<void> {
    this.opponentCards.get(playerInfo?.id)?.showCards(cardsInSpell);
    console.log(`${playerInfo?.userName} приготовил заклинание из ${cardsInSpell} карт.`);
  }

  async showSpellCast(playerInfo: IPlayerInfo, cards: Array<ICard>): Promise<void> {
    this.timer.stop();
    this.disableControls = true;
    this.isSpellCast = true;

    const spellName = cards.sort((cardA, cardB) => cardA.type - cardB.type).map((card) => card.title);
    console.log(`${playerInfo?.userName} кастует заклинание "${spellName.join(' ')}"!`);

    if (this.gameService.currentPlayerId === playerInfo.id) await this.playerCards.clearSpell();
    else this.opponentCards.get(playerInfo.id)?.removeCards();
  }

  // eslint-disable-next-line class-methods-use-this
  showCardCast(playerInfo: IPlayerInfo, card: ICard): Promise<void> {
    console.log(`Начинаем применять эффекты карты '${card?.title}'`);
    return Promise.resolve();
  }

  async showTargetSelection(targets: Array<string>, numberOfTargets = 1): Promise<Array<string>> {
    const targetNames = targets.map((playerId) => this.gameService.getPlayerInfo(playerId)?.userName || playerId);
    console.log(`Вы должны выбрать ${numberOfTargets} целей из: ${targetNames.join(', ')}`);
    await delay(SELECT_TARGET_TIME);
    console.log('Время на выбор цели истекло');
    return [targetNames[0]];
  }

  async showPlayerHeal(playerInfo: IPlayerInfo, heal: number): Promise<void> {
    console.log(`${playerInfo?.userName} получает ${heal} очков лечения (${playerInfo?.health})`);

    if (playerInfo.id === this.gameService.currentPlayerId) {
      await this.currentPlayerDisplay?.addHealth(playerInfo.health, heal);
    }
    if (this.opponents.has(playerInfo.id)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerInfo.id);
      await opponent.addHealth(playerInfo.health, heal);
    }
  }

  async showPlayerDamage(playerInfo: IPlayerInfo, damage: number): Promise<void> {
    console.log(`${playerInfo?.userName} получает ${damage} очков урона (${playerInfo?.health})`);

    if (playerInfo.id === this.gameService.currentPlayerId) {
      if (playerInfo.health <= 0) {
        this.readyButton.element.remove(); // current player loose.
        this.playerCards.clearHand();
      }
      await this.currentPlayerDisplay?.bringDamage(playerInfo.health, damage);
    }
    if (this.opponents.has(playerInfo.id)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerInfo.id);
      await opponent.bringDamage(playerInfo.health, damage);
      if (playerInfo.health <= 0) this.opponentCards.get(playerInfo.id)?.removeCards();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  showDiceRoll(playerInfo: IPlayerInfo, rolls: Array<number>, bonus = 0): Promise<void> {
    console.log(`${playerInfo?.userName} кидает кубики и выбрасывает ${rolls.join(', ')}. Бонус к броску - ${bonus}`);
    return Promise.resolve();
  }

  private async selectSpell(): Promise<void> {
    this.readyButton.disabled = true;
    await this.playerCards.setDisable();
    try {
      await this.gameService.selectSpell(this.playerCards.getSelectedCardsId());
      this.opponentsCardsContainer.classList.remove(CSSClasses.GameOpponentCardsHide);
    } catch {
      alert('Не удалось выбрать заклинание');
      this.readyButton.disabled = false;
      this.playerCards.setDisable(false);
    }
  }

  // #region markup

  private createPlayersInfo(players: Array<IPlayerInfo>, currentPlayerId: string): void {
    const playerIndex = players.findIndex((player) => player.id === currentPlayerId);
    if (playerIndex >= 0) this.createCurrentPlayerInfo(players[playerIndex]);

    const opponentsPlacement: Array<IPlayerInfo> = Array.from(players);
    const rightHandOpponents: Array<IPlayerInfo> = opponentsPlacement.splice(0, playerIndex);

    opponentsPlacement.push(...rightHandOpponents);
    opponentsPlacement.filter((player) => player.id !== currentPlayerId)
      .forEach((opponent) => {
        this.createOpponentsInfo(opponent);
      });
  }

  private createCurrentPlayerInfo = async (playerInfo: IPlayerInfo): Promise<void> => {
    const heroInfo = <IHero> await this.heroesRepository.getHero(playerInfo.heroId);
    const currentPlayerInfo = new GamePlayerDisplay(
      playerInfo.userName, heroInfo.name, heroInfo.image, playerInfo.health, true,
    );
    if (playerInfo.spellLength > 0) this.readyButton.disabled = true;
    this.currentPlayerDisplay = currentPlayerInfo;
    this.playerInfoContainer.append(currentPlayerInfo.element);
  };

  private createOpponentsInfo = async (opponent: IPlayerInfo): Promise<void> => {
    const heroInfo = <IHero> await this.heroesRepository.getHero(opponent.heroId);
    const opponentInfo = new GamePlayerDisplay(opponent.userName, heroInfo.name, heroInfo.image, opponent.health);
    const opponentCards = new OpponentsCards();
    opponentCards.showCards(opponent.spellLength);

    this.opponentCards.set(opponent.id, opponentCards);
    this.opponents.set(opponent.id, opponentInfo);

    this.addOpponent(opponentInfo, opponentCards);
  };

  private createMarkup(): void {
    const UILayer = createElement(Tags.Div, [CSSClasses.GameUILayer]);

    this.playSection = createElement(Tags.Div, [CSSClasses.GamePlaySection]);
    this.opponentsCardsContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsCards]);
    this.opponentsInfoContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsInfo]);
    this.playerInfoContainer = createElement(Tags.Div, [CSSClasses.GamePlayerInfo]);
    this.controlsContainer = createElement(Tags.Div, [CSSClasses.GameControls]);

    this.readyButton = new BaseButton(
      this.loc.ReadyButton,
      () => this.selectSpell(),
      [CSSClasses.GameScreenButton],
    );
    const buttonContainer = createElement(Tags.Div, [CSSClasses.GameButtonsContainer]);
    buttonContainer.append(this.readyButton.element);

    this.timer = new Timer();

    this.controlsContainer.append(this.timer.element, buttonContainer);
    UILayer.append(this.opponentsInfoContainer, this.playerInfoContainer, this.controlsContainer);
    const vignette = createElement(Tags.Div, [CSSClasses.GameScreenVignette]);
    this.element.append(this.opponentsCardsContainer, this.playSection, vignette, UILayer);
  }

  private addOpponent(opponentInfo: IComponent, opponentCards: IComponent): void {
    opponentInfo.element.classList.add(CSSClasses.GameOpponentSection);
    opponentCards.element.classList.add(CSSClasses.GameOpponentSection);

    this.opponentsInfoContainer.append(opponentInfo.element);
    this.opponentsCardsContainer.append(opponentCards.element);
  }
  // #endregion
}
