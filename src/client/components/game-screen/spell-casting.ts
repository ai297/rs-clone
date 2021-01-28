import {
  CardTypes,
  createElement,
  delay,
  forEachAsync,
  ICard,
  IPlayerInfo,
} from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { CardSpell } from '../card-spell/card-spell';
import { IComponent } from '../component';
import { PlayerMessage } from '../player-message/player-message';
import { ActionLayer } from './action-layer';

const CARD_ANIMATION_TIME = 500;

export class SpellCasting extends ActionLayer {
  private cards: Array<CardSpell> = [];

  private completeCards: Array<CardSpell> = [];

  private cardsContainer!: HTMLElement;

  private messageContainer!: HTMLElement;

  private message?: IComponent;

  constructor() {
    super(1, CSSClasses.SpellCasting);
    this.createMarkup();
  }

  async showSpell(cards: Array<ICard>, playerInfo: IPlayerInfo, heroName: string): Promise<void> {
    if (cards.length === 0) return;

    if (this.message && this.message.beforeRemove) await this.message.beforeRemove();
    this.message?.element.remove();
    if (this.message && this.message.onRemoved) await this.message.onRemoved();

    const sourceCard = cards.find((card) => card.type === CardTypes.source)?.title || '';
    const qualityCard = cards.find((card) => card.type === CardTypes.quality)?.title || '';
    const actionCard = cards.find((card) => card.type === CardTypes.action)?.title || '';

    const info = new PlayerMessage(playerInfo);
    info.setMessage(`
      <p>${heroName} (${playerInfo.userName}) применяет заклинание:</p>
      <span class="source">${sourceCard}</span>
      <span class="quality">${qualityCard}</span>
      <span class="action">${actionCard}</span>
    `);
    this.message = info;
    if (this.message.beforeAppend) await this.message.beforeAppend();
    this.messageContainer.append(this.message.element);
    if (this.message.onAppended) await this.message.onAppended();

    const timeOut = CARD_ANIMATION_TIME / cards.length;
    await forEachAsync(cards, async (cardInfo) => {
      this.addCard(cardInfo);
      await delay(timeOut);
    });
  }

  async clearSpell(): Promise<void> {
    const allCards = [...this.completeCards, ...this.cards];
    this.cards = [];
    this.completeCards = [];
    if (allCards.length === 0) return;

    if (this.message && this.message.beforeRemove) this.message?.beforeRemove();

    const timeOut = CARD_ANIMATION_TIME / allCards.length;
    await forEachAsync(allCards, async (card) => {
      card.beforeRemove();
      setTimeout(() => {
        card.element.remove();
        card.onRemoved();
      }, CARD_ANIMATION_TIME);
      await delay(timeOut);
    });

    this.message?.element.remove();
    if (this.message && this.message.onRemoved) await this.message?.onRemoved();
    this.cardsContainer.innerHTML = '';
    this.messageContainer.innerHTML = '';
  }

  private async addCard(card: ICard, before?: string): Promise<void> {
    const spellCard = new CardSpell(card);
    spellCard.flip();
    this.cards.push(spellCard);
    await spellCard.beforeAppend();
    const beforeCard = this.cards.find((playingCard) => playingCard.id === before);
    this.cardsContainer.insertBefore(spellCard.element, beforeCard?.element || null);
    await spellCard.onAppended(CARD_ANIMATION_TIME);
    spellCard.flip();
  }

  private createMarkup(): void {
    this.cardsContainer = createElement(Tags.Div, [CSSClasses.SpellCastingCards]);
    this.messageContainer = createElement(Tags.Div, [CSSClasses.SpellCastingMessage]);
    this.element.append(this.cardsContainer, this.messageContainer);
  }
}
