import {
  SELECT_SPELL_TIME,
  createElement,
  ICard,
  IHero,
  IPlayerInfo,
  CardTypes,
  forEachAsync,
  TARGET_ALL,
  playSound,
  Sounds,
} from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { IGameScreenLocalization, GAME_SCREEN_DEFAULT_LOCALIZATION } from '../../localization';
import { BaseComponent } from '../base-component';
import { PlayerCards } from '../player-cards/player-cards';
import { GameService } from '../../services/game-service';
import { GamePlayerDisplay } from '../player-display/player-display';
import { HeroesRepository } from '../../services';
import { OpponentsCards } from '../opponents-cards/opponents-cards';
import { BaseButton } from '../base-button/base-button';
import { Timer } from '../timer/timer';
import { SpellCasting } from './spell-casting';
import { GameMessages } from './game-messages';
import { PlayerMessage } from '../player-message/player-message';
import { DiceRolling } from './dice-rolling';
import { Overlay } from '../overlay';
import { showAlert } from '../show-alert';
import { getTarget, TargetForSelection } from '../target-selection';

async function playSpellSound(cards: Array<ICard>): Promise<void> {
  const quality = cards.filter((qual) => qual.type === CardTypes.quality);
  const action = cards.filter((qual) => qual.type === CardTypes.action);
  const source = cards.filter((qual) => qual.type === CardTypes.source);
  if (quality.length === 1) await playSound(Sounds[`${quality[0].id}` as keyof typeof Sounds]);
  if (action.length === 1) await playSound(Sounds[`${action[0].id}` as keyof typeof Sounds]);
  if (source.length === 1) await playSound(Sounds[`${source[0].id}` as keyof typeof Sounds]);
}

export class GameScreen extends BaseComponent {
  private loc: IGameScreenLocalization;

  private opponentsInfoContainer!: HTMLElement;

  private opponentsCardsContainer!: HTMLElement;

  private playerInfoContainer!: HTMLElement;

  private playSection!: HTMLElement;

  private controlsContainer!: HTMLElement;

  private playerCards!: PlayerCards;

  private currentPlayerDisplay?: GamePlayerDisplay;

  private opponents: Map<string, GamePlayerDisplay> = new Map<string, GamePlayerDisplay>();

  private opponentCards: Map<string, OpponentsCards> = new Map<string, OpponentsCards>();

  private readyButton!: BaseButton;

  private timer!: Timer;

  private spellCasting!: SpellCasting;

  private diceRolling!: DiceRolling;

  private messages!: GameMessages;

  private castingMessage?: PlayerMessage;

  private overlay!: Overlay;

  constructor(
    private readonly gameService: GameService,
    private readonly heroesRepository: HeroesRepository,
    timeout = -1,
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
    this.gameService.onCardCast = (player, card, addon) => this.showCardCast(player, card, addon);
    this.gameService.onPlayerTakeHeal = (playerInfo, heal) => this.showPlayerHeal(playerInfo, heal);
    this.gameService.onPlayerTakeDamage = (playerInfo, damage) => this.showPlayerDamage(playerInfo, damage);
    this.gameService.onPlayerMakeDiceRoll = (playerInfo, rolls, bonus) => this.showDiceRoll(playerInfo, rolls, bonus);
    this.gameService.onSelectTarget = (targets) => this.showTargetSelection(targets);

    const spellLength = this.gameService.getPlayerInfo(this.gameService.currentPlayerId)?.spellLength || 0;
    this.addCards(this.gameService.currentPlayerCards, 0, spellLength)
      .then(() => {
        if (this.gameService.isCasting) this.playerCards.setDisable(true);
      });
    this.disableControls = true;
    this.readyButton.disabled = true;

    // for test and make markup of spell casting and dice rolling:
    // const player = <IPlayerInfo> this.gameService.getPlayerInfo(this.gameService.currentPlayerId);
    // const cards = this.gameService.currentPlayerCards.slice(0, 3);
    // this.showSpellCast(player, cards);
    // setTimeout(() => {
    //   this.showDiceRoll(player, [1, 2, 3]);
    //   this.spellCasting.showCard(cards[1]);
    // }, 2000);
    if (!this.gameService.isCasting && timeout >= 0) {
      setTimeout(() => this.timer.start((SELECT_SPELL_TIME - timeout - 1000) / 1000), 1000);
    }
  }

  get disableControls(): boolean { return this.controlsContainer.classList.contains(CSSClasses.GameControlsDisabled); }

  set disableControls(value: boolean) {
    this.controlsContainer.classList.toggle(CSSClasses.GameControlsDisabled, value);
  }

  async setSpellCast(value: boolean): Promise<void> {
    this.element.classList.toggle(CSSClasses.GameScreenCasting, value);
    await this.spellCasting.clearSpell();
    await this.playerCards.setDisable(value);
  }

  nextMove(): void {
    this.overlay.hide();
    const player = this.gameService.getPlayerInfo(this.gameService.currentPlayerId);
    if (player?.health) this.playerCards.setDisable(false);
    this.opponentsCardsContainer.classList.add(CSSClasses.GameOpponentCardsHide);
    // console.log('Следующий ход');
    this.setSpellCast(false);
  }

  async addCards(cards: Array<ICard>, timer = SELECT_SPELL_TIME, spellLength = 0): Promise<void> {
    if (this.castingMessage) await this.messages.removeMessage(<PlayerMessage> this.castingMessage);
    await this.playerCards.addCards(cards, timer === 0);
    this.disableControls = false;
    if (spellLength > 0) {
      await this.playerCards.setDisable(true);
      this.playerCards.addFakeSpell(spellLength);
      this.opponentsCardsContainer.classList.remove(CSSClasses.GameOpponentCardsHide);
    }
    this.timer.start(timer / 1000);
  }

  async showOpponentCards(playerInfo: IPlayerInfo, cardsInSpell: number): Promise<void> {
    this.opponentCards.get(playerInfo?.id)?.showCards(cardsInSpell);
    // console.log(`${playerInfo?.userName} приготовил заклинание из ${cardsInSpell} карт.`);
  }

  async showSpellCast(playerInfo: IPlayerInfo, cards: Array<ICard>): Promise<void> {
    this.overlay.hide();
    this.timer.stop();
    this.disableControls = true;
    await this.playerCards.clearSpell();
    await this.setSpellCast(true);

    if (this.castingMessage) await this.messages.removeMessage(<PlayerMessage> this.castingMessage);

    if (this.gameService.currentPlayerId === playerInfo.id) await this.playerCards.clearSpell();
    else this.opponentCards.get(playerInfo.id)?.removeCards();

    // show message about spell casting
    const hero = await this.heroesRepository.getHero(playerInfo.heroId);
    const sourceCard = cards.find((card) => card.type === CardTypes.source)?.title || '';
    const qualityCard = cards.find((card) => card.type === CardTypes.quality)?.title || '';
    const actionCard = cards.find((card) => card.type === CardTypes.action)?.title || '';

    this.castingMessage = await this.messages.newMessage(playerInfo, hero?.name || '', `${this.loc.SpellCast}:`, `
      <span class="source">${sourceCard}</span>
      <span class="quality">${qualityCard}</span>
      <span class="action">${actionCard}</span>
    `);
    await this.spellCasting.showSpell(cards);
    await playSpellSound(cards);
  }

  async showCardCast(playerInfo: IPlayerInfo, cardInfo: ICard, addon = false): Promise<void> {
    this.overlay.hide();
    await this.spellCasting.showCard(cardInfo, addon);
  }

  async showTargetSelection(targetIDs: Array<string>): Promise<Array<string>> {
    const targets: TargetForSelection[] = [];
    let isContainseAll = false;
    await forEachAsync(targetIDs, async (targetId) => {
      if (targetId === TARGET_ALL) {
        isContainseAll = true;
        return;
      }
      const playerInfo = this.gameService.getPlayerInfo(targetId);
      const hero = await this.heroesRepository.getHero(String(playerInfo?.heroId));
      if (hero) {
        targets.push({
          id: targetId,
          name: hero.name,
          image: hero.image,
        });
      }
    });
    const result = await getTarget(this.overlay, targets, isContainseAll);
    return result;
  }

  async showPlayerHeal(playerInfo: IPlayerInfo, heal: number): Promise<void> {
    // console.log(`${playerInfo?.userName} получает ${heal} очков лечения (${playerInfo?.health})`);
    playSound(Sounds.heal);

    if (playerInfo.id === this.gameService.currentPlayerId) {
      await this.currentPlayerDisplay?.addHealth(playerInfo.health, heal);
    }
    if (this.opponents.has(playerInfo.id)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerInfo.id);
      await opponent.addHealth(playerInfo.health, heal);
    }
  }

  async showPlayerDamage(playerInfo: IPlayerInfo, damage: number): Promise<void> {
    // console.log(`${playerInfo?.userName} получает ${damage} очков урона (${playerInfo?.health})`);
    playSound(Sounds.damage);

    if (playerInfo.id === this.gameService.currentPlayerId) {
      if (playerInfo.health <= 0) {
        this.readyButton.element.remove(); // current player loose.
        this.playerCards.clearHand();
        this.playerCards.getSelectedCardsId();
        this.playerCards.clearSpell();
      }
      await this.currentPlayerDisplay?.bringDamage(playerInfo.health, damage);
    }
    if (this.opponents.has(playerInfo.id)) {
      const opponent = <GamePlayerDisplay> this.opponents.get(playerInfo.id);
      await opponent.bringDamage(playerInfo.health, damage);
      if (playerInfo.health <= 0) this.opponentCards.get(playerInfo.id)?.removeCards();
    }
  }

  async showDiceRoll(playerInfo: IPlayerInfo, rolls: Array<number>, bonusValue = 0): Promise<void> {
    const hero = await this.heroesRepository.getHero(playerInfo.heroId);
    const bonus = bonusValue > 0 ? `<p>${this.loc.RollBonus}: <b class="success">+${bonusValue}</b></p>` : '';
    let playerDisplay: GamePlayerDisplay | undefined;
    if (playerInfo.id === this.gameService.currentPlayerId) {
      playerDisplay = this.currentPlayerDisplay;
    } else playerDisplay = this.opponents.get(playerInfo.id);
    playerDisplay?.setSelected();
    const message = await this.messages.newMessage(playerInfo, hero?.name || '', `${this.loc.MakeDiceRoll}...`, bonus);
    playSound(Sounds.diceRoll);
    await this.diceRolling.showRolls(rolls);
    playerDisplay?.setSelected(false);
    await this.messages.removeMessage(message);
  }

  private async selectSpell(): Promise<void> {
    this.readyButton.disabled = true;
    const cardIds = this.playerCards.getSelectedCardsId();
    await this.playerCards.setDisable();
    try {
      await this.gameService.selectSpell(cardIds);
      this.opponentsCardsContainer.classList.remove(CSSClasses.GameOpponentCardsHide);
    } catch {
      await showAlert(this.loc.SelectSpellError);
      this.readyButton.disabled = false;
      this.playerCards.setDisable(false);
    }
  }

  private spellChange(cardsNumber: number): void {
    this.readyButton.disabled = (cardsNumber === 0);
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
    if (opponent.spellLength) opponentCards.showCards(opponent.spellLength);

    this.opponentCards.set(opponent.id, opponentCards);
    this.opponents.set(opponent.id, opponentInfo);

    opponentInfo.element.classList.add(CSSClasses.GameOpponentSection);
    opponentCards.element.classList.add(CSSClasses.GameOpponentSection);
    this.opponentsInfoContainer.append(opponentInfo.element);
    this.opponentsCardsContainer.append(opponentCards.element);
  };

  private createMarkup(): void {
    const UILayer = createElement(Tags.Div, [CSSClasses.GameUILayer]);
    this.playSection = createElement(Tags.Div, [CSSClasses.GamePlaySection]);
    this.opponentsCardsContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsCards]);
    if (!this.gameService.isCasting) this.opponentsCardsContainer.classList.add(CSSClasses.GameOpponentCardsHide);
    this.opponentsInfoContainer = createElement(Tags.Div, [CSSClasses.GameOpponentsInfo]);
    this.playerInfoContainer = createElement(Tags.Div, [CSSClasses.GamePlayerInfo]);
    this.controlsContainer = createElement(Tags.Div, [CSSClasses.GameControls]);
    const buttonContainer = createElement(Tags.Div, [CSSClasses.GameButtonsContainer]);
    const vignette = createElement(Tags.Div, [CSSClasses.GameScreenVignette]);

    this.readyButton = new BaseButton(
      this.loc.ReadyButton,
      () => this.selectSpell(),
      [CSSClasses.GameScreenButton],
    );

    this.timer = new Timer();

    this.playerCards = new PlayerCards((cardsNum) => this.spellChange(cardsNum));
    this.playerCards.element.classList.add(CSSClasses.GameCardsSection);

    this.spellCasting = new SpellCasting();
    this.diceRolling = new DiceRolling();
    this.messages = new GameMessages();
    this.overlay = new Overlay();

    buttonContainer.append(this.readyButton.element);
    this.playSection.append(
      this.playerCards.element,
      this.spellCasting.element,
      this.diceRolling.element,
      this.messages.element,
    );
    this.controlsContainer.append(this.timer.element, buttonContainer);
    UILayer.append(this.opponentsInfoContainer, this.playerInfoContainer, this.controlsContainer);
    this.element.append(this.opponentsCardsContainer, this.playSection, vignette, UILayer);
  }
  // #endregion
}
