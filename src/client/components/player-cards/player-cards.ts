import {
  CardTypes,
  MagicSigns,
  createElement,
  delay,
  ICard,
} from '../../../common';
import { CSSClasses, Tags } from '../../enums';
import { BaseComponent } from '../base-component';
import { PlayingCard } from './playing-card';

const MAX_HAND_CARDS = 8;
const MAX_HAND_CARDS_ROTATION = 30;

export class PlayerCards extends BaseComponent {
  private readonly handCards: PlayingCard[] = [];

  private readonly spellCards: PlayingCard[] = [];

  private isCardSelecting = false;

  private readonly handElement: HTMLElement;

  private readonly selectedCardsElement: HTMLElement;

  constructor() {
    super([CSSClasses.PlayerCards]);

    this.handElement = createElement(Tags.Div, [CSSClasses.PlayerCardsHand]);
    this.selectedCardsElement = createElement(Tags.Div, [CSSClasses.PlayerCardsSelected]);
    this.element.append(this.selectedCardsElement, this.handElement);

    const cards: Array<ICard> = [
      {
        id: 'chrono_walker',
        title: 'хроно йокер',
        type: CardTypes.source,
        magicSign: MagicSigns.illusion,
        src: 'chrono_walker',
        text: '<p>Все кидают кость. Вы +1 к своему броску за каждый различный «ЗНАК» в своем заклятии. 3 повреждения получит выбросивший наименьший результат.</p>',
        initiative: 0,
      },
      {
        id: 'sphinx',
        title: 'сфинксшин',
        type: CardTypes.source,
        magicSign: MagicSigns.illusion,
        src: 'sphinx',
        text: '<p>Выберите и украдите Сокровище, принадлежащее любому противнику.</p>',
        initiative: 0,
      },
      {
        id: 'chuk_geck',
        title: 'чук и гек',
        type: CardTypes.source,
        magicSign: MagicSigns.illusion,
        src: 'chuk_geck',
        text: '<p>Снимите 4 верхние карты Основной Колоды. Добавьте любые из открытых карт «Качество» в ваше заклятие, остальные сбросьте.</p>',
        initiative: 0,
      },
      {
        id: 'chrono_walker',
        title: 'хроно йокер',
        type: CardTypes.source,
        magicSign: MagicSigns.illusion,
        src: 'chrono_walker',
        text: '<p>Все кидают кость. Вы +1 к своему броску за каждый различный «ЗНАК» в своем заклятии. 3 повреждения получит выбросивший наименьший результат.</p>',
        initiative: 0,
      },
      {
        id: 'cat_trouble',
        title: 'кот-а-строфный',
        type: CardTypes.quality,
        magicSign: MagicSigns.illusion,
        src: 'cat_trouble',
        text: '<p>Все бросают кость. Вы +2 к своему броску. У кого наивысший результат, берут по сокровищу, остальные получают повреждения, у кого сколько выпало на костях.</p>',
        initiative: 0,
      },
      {
        id: 'disco',
        title: 'диско-шарный',
        type: CardTypes.quality,
        magicSign: MagicSigns.illusion,
        src: 'disco',
        text: '<p>Эта карта копирует текст карты «Источник» или «Действие» вашего заклятия.</p>',
        initiative: 0,
      },
      {
        id: 'acid_shower',
        title: 'душ кислоты',
        type: CardTypes.action,
        magicSign: MagicSigns.mystery,
        src: 'acid_shower',
        text: '<p><b>Цель: </b>Противники слева и справа</p><p><b>Проверка силы</b></p><ul><li><span>1-4</span>1 повреждение.</li><li><span>5-9</span>2 повреждения.</li><li><span>10+</span>4 повреждения, вы получаете Сокровище.</li></ul>',
        initiative: 4,
      },
      {
        id: 'vortex_force',
        title: 'вихрь силы',
        type: CardTypes.action,
        magicSign: MagicSigns.mystery,
        src: 'vortex_force',
        text: '<p><b>Цель: </b>Все противники</p><p><b>Проверка силы</b></p><ul><li><span>1-4</span>Вы сбрасываете карту.</li><li><span>5-9</span>2 повреждения, вы сбрасываете 2 карты.</li><li><span>10+</span>Как и выше, + вы получаете Сокровище.</li></ul>',
        initiative: 16,
      },
    ];

    const addCard = async () => {
      const cardInfo = <ICard> cards.pop();
      await this.newCard(cardInfo);
      await delay(1000);
      if (cards.length > 0) addCard();
    };

    addCard();
  }

  newCard = async (cardInfo: ICard): Promise<void> => {
    const card = new PlayingCard(cardInfo, this.selectCard);
    this.handCards.push(card);

    await card.beforeAppend();
    this.handElement.append(card.element);
    await card.onAppended();
    this.rotateHandCards();
  };

  selectCard = async (cardId: string): Promise<void> => {
    if (this.isCardSelecting) return;

    this.isCardSelecting = true;
    const selectCardIndex = this.handCards.findIndex((card) => card.id === cardId);
    if (selectCardIndex < 0) return;

    const card = <PlayingCard> this.handCards[selectCardIndex];
    if (this.spellCards.findIndex((spellCard) => spellCard.cardType === card.cardType) >= 0) return;

    this.handCards.splice(selectCardIndex, 1);
    const afterElement = this.spellCards.find((spellCard) => spellCard.cardType > card.cardType)?.element;
    this.spellCards.push(card);

    await card.beforeRemove();
    card.element.remove();
    await card.onRemoved();

    this.rotateHandCards();
    this.disableHandCards(card.cardType);
    card.clearTransform();

    await card.beforeAppend();
    this.selectedCardsElement.insertBefore(card.element, afterElement || null);
    await card.onAppended();

    this.isCardSelecting = false;
  };

  private rotateHandCards(): void {
    const step = Math.round((MAX_HAND_CARDS_ROTATION * 10) / MAX_HAND_CARDS) / 10;
    const startRotation = Math.round(this.handCards.length / 2) * step;
    this.handCards.forEach((cardInHand, index) => {
      const rotate = startRotation - step / 2 - index * step;
      const translate = `${Math.abs(rotate)}%`;
      cardInHand.clearTransform().rotate(rotate).moveY(translate);
    });
  }

  private disableHandCards(cardType: CardTypes) {
    this.handCards.filter((card) => card.cardType === cardType).forEach((card) => card.disable());
  }
}
