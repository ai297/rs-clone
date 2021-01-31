import {
  MAX_CARDS_IN_HAND,
  AnimationTimes,
  CardTypes,
  createElement,
  delay,
  ICard,
  forEachAsync,
  ICallbackHandler,
  playSound,
  Sounds,
} from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { BaseComponent } from '../base-component';
import { CardBase, CardSpell, CardFake } from '../card-spell';

const MAX_CARDS_IN_HAND_ROTATION = 30;
const ANIMATION_SELECTED_TIME = 300;

export class PlayerCards extends BaseComponent {
  private readonly handCards: CardSpell[] = [];

  private readonly spellCards: CardBase[] = [];

  private isCardSelecting = false;

  private readonly handElement: HTMLElement;

  private readonly selectedCardsElement: HTMLElement;

  constructor(private readonly onSpellChange?: (cards: number) => void) {
    super([CSSClasses.PlayerCards]);

    this.handElement = createElement(Tags.Div, [CSSClasses.PlayerCardsHand]);
    this.selectedCardsElement = createElement(Tags.Div, [CSSClasses.PlayerCardsSelected]);
    this.element.append(this.selectedCardsElement, this.handElement);
  }

  getSelectedCardsId(): Array<string> {
    return this.spellCards.filter((card) => card as CardSpell).map((card) => (<CardSpell> card).id);
  }

  clearSpell = async (): Promise<void> => {
    const beforeRemoveCallbacks = this.spellCards.map((card) => card.beforeRemove(ANIMATION_SELECTED_TIME));
    this.spellCards.splice(0, this.spellCards.length);
    this.updateHandState();
    if (this.onSpellChange) this.onSpellChange(0);
    await Promise.all(beforeRemoveCallbacks);
    this.selectedCardsElement.innerHTML = '';
  };

  clearHand = async (): Promise<void> => {
    const beforeRemoveCallbacks = this.handCards.map((card) => card.beforeRemove(AnimationTimes.AddCard));
    this.handCards.splice(0, this.handCards.length);
    await Promise.all(beforeRemoveCallbacks);
    this.handElement.innerHTML = '';
  };

  addCards = async (cardsInfo: ICard[], noTimeout = false): Promise<void> => {
    const cards = cardsInfo.map((cardInfo) => new CardSpell(cardInfo));
    cards.forEach((card) => card.flip());
    if (noTimeout) await this.addToHand(cards, 0);
    else await this.addToHand(cards);
    cards.forEach((card) => card.element.classList.add(CSSClasses.CardUsed));
  };

  async addFakeSpell(cards: number): Promise<void> {
    if (cards <= 0) return;
    await this.clearSpell();
    const tasks: Array<Promise<void>> = [];
    for (let i = 0; i < cards; i++) {
      const fakeCard = new CardFake();
      this.spellCards.push(fakeCard);
      tasks.push(fakeCard.beforeAppend());
    }
    await Promise.race(tasks);
    this.selectedCardsElement.append(...this.spellCards.map((card) => card.element));
    await forEachAsync(this.spellCards, (card) => card.onAppended());
  }

  setDisable = async (disable = true): Promise<void> => {
    this.updateHandState(undefined, disable);
    this.element.classList.toggle(CSSClasses.PlayerCardsDisabled, disable);
    let delayTime = ANIMATION_SELECTED_TIME;
    await forEachAsync(this.spellCards, async (card) => {
      card.flip(disable);
      await delay(ANIMATION_SELECTED_TIME / 3);
      delayTime -= (ANIMATION_SELECTED_TIME / 3);
    });
    if (delayTime > 0) await delay(delayTime);
  };

  selectCard = async (card: CardSpell): Promise<void> => {
    if (this.isCardSelecting) return;
    this.isCardSelecting = true;
    const selectCardIndex = this.handCards.indexOf(card);
    if (selectCardIndex < 0) return;

    if (this.spellCards.findIndex((spellCard) => (<CardSpell> spellCard)?.cardType === card.cardType) >= 0) return;
    this.handCards.splice(selectCardIndex, 1);

    card.clearTransform();
    await card.beforeRemove(AnimationTimes.AddCard);
    card.element.remove();
    await card.onRemoved();

    this.rotateHandCards();
    this.updateHandState(card.cardType, true);

    card.onClick = this.returnToHand;

    await card.beforeAppend();
    const afterElement = this.spellCards
      .filter((spellCard) => spellCard as CardSpell)
      .map((spellCard) => <CardSpell> spellCard)
      .sort((cardA, cardB) => cardA.cardType - cardB.cardType)
      .find((spellCard) => spellCard.cardType > card.cardType)?.element;

    this.spellCards.push(card);
    if (this.onSpellChange) this.onSpellChange(this.spellCards.length);

    this.selectedCardsElement.insertBefore(card.element, afterElement || null);
    await card.onAppended();

    this.isCardSelecting = false;
    await playSound(Sounds.playingCardSpell);
  };

  private returnToHand = async (card: CardSpell): Promise<void> => {
    if (this.isCardSelecting) return;

    this.isCardSelecting = true;
    const selectCardIndex = this.spellCards.indexOf(card);
    if (selectCardIndex < 0) return;

    this.spellCards.splice(selectCardIndex, 1);
    if (this.onSpellChange) this.onSpellChange(this.spellCards.length);

    await card.beforeRemove(ANIMATION_SELECTED_TIME);
    card.element.remove();
    await card.onRemoved();

    this.updateHandState(card.cardType);
    await this.addToHand([card]);
    this.isCardSelecting = false;
  };

  private async addToHand(cards: CardSpell[], timeout = AnimationTimes.AddCard): Promise<void> {
    if (cards.length === 0) return;
    const card = <CardSpell> cards.pop();
    this.handCards.push(card);
    card.onClick = this.selectCard;
    await card.beforeAppend();
    this.handElement.append(card.element);
    await card.onAppended();
    this.rotateHandCards();
    await delay(timeout / 2);
    card.flip(false);
    await delay(timeout / 2);
    await this.addToHand(cards, timeout);
    playSound(Sounds.playingCardsDeck);
  }

  private rotateHandCards(): void {
    const step = Math.round((MAX_CARDS_IN_HAND_ROTATION * 10) / MAX_CARDS_IN_HAND) / 10;
    const startRotation = Math.round(this.handCards.length / 2) * step;
    this.handCards.forEach((cardInHand, index) => {
      const rotate = startRotation - step / 2 - index * step;
      const translate = `${Math.abs(rotate)}%`;
      cardInHand.clearTransform().rotate(rotate).moveY(translate);
    });
  }

  private updateHandState(cardType?: CardTypes, disable = false): void {
    this.handCards.forEach((card) => {
      // eslint-disable-next-line no-param-reassign
      if (cardType === undefined || card.cardType === cardType) card.disabled = disable;
    });
  }
}
