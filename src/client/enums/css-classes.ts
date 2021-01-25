export enum CSSClasses {
  // base
  Component = 'component',
  Button = 'button',
  Avatar = 'avatar',
  // start screen
  StartScreen = 'start-screen',
  StartScreenHidden = 'start-screen--hidden',
  StartScreenButtons = 'start-screen__buttons',
  StartScreenButton = 'start-screen__button',
  StartScreenLogo = 'start-screen__logo',
  // player list
  PlayerListWrapper = 'player-list-wrapper',
  PlayerList = 'player-list',
  PlayerListItem = 'player-list__item',
  EmptyItem = 'empty-item',
  PlayerAvatar = 'player__avatar',
  PlayerName = 'player__name',
  PlayerHero = 'player__hero',
  PlayerInfo = 'player__info',
  AddBotButton = 'bot-button',
  // cards spell
  Сard = 'card',
  СardBackside = 'card__backside',
  СardСontainer = 'card-container',
  CardFlipped = 'card-container--flipped',
  СardType = 'card-type',
  СardElement = 'card-element',
  СardContent = 'card__content',
  СardImage = 'card__image',
  СardTitle = 'card__title',
  СardText = 'card__text',
  // hero selection
  HeroSelection = 'hero-selection',
  HeroSelectionFullHero = 'hero-selection__full-hero',
  FullHeroHidden = 'full-hero--hidden',
  HeroSelectionHeroesWrapper = 'hero-selection__heroes-wrapper',
  HeroSelectionHeroes = 'hero-selection__heroes',
  HeroSelectionDisabled = 'hero-selection--disabled',
  Hero = 'hero',
  HeroImage = 'hero__image',
  HeroName = 'hero__name',
  HeroDisabled = 'hero--disabled',
  HeroSelected = 'hero--selected',
  // opponents cards
  OpponentsCards = 'opponents-cards',
  OpponentsCardsEmpty = 'opponents-cards--empty',
  OpponentCardItem = 'opponents-cards__item',
  // player display (game screen)
  GamePlayerDisplayContainer = 'game-player__container',
  GamePlayerDisplayContainerOpponent = 'game-player__container--opponent',
  GamePlayerDisplayContainerCurrent = 'game-player__container--current',
  GamePlayerName = 'game-player__name',
  GamePlayerHero = 'game-player__hero',
  GamePlayerAvatar = 'game-player__avatar',
  GamePlayerHealth = 'game-player__health',
  // animations classes
  InGameAddHealthAnimation = 'game-player__animation--recovery',
  InGameBringDamageAnimation = 'game-player__animation--damage',
  GamePlayerPointsAnimation = 'game-player__animation--container',
  GamePlayerPointsHidden = 'game-player__animation--hidden',
  // lobby
  Lobby = 'lobby',
  LobbyHeader = 'lobby-header',
  LobbyMain = 'lobby-main',
  LobbyMainLeft = 'lobby-main__left',
  LobbyMainRight = 'lobby-main__right',
  LobbyButtons = 'lobby-buttons',
  LobbyTitle = 'lobby__title',
  LobbySubtitle = 'lobby__subtitle',
  GameLinkWrapper = 'lobby__link-wrapper',
  GameLink = 'lobby__game-link',
  CopyIcon = 'copy-icon',
  CopyTooltip = 'copy-tooltip',
  NameLabel = 'lobby__name-label',
  NameInput = 'lobby__name-input',
  SelectHeroButton = 'lobby__select-hero',
  StartGameButton = 'lobby__start-game',
  StartGameButtonDisabled = 'lobby__start-game--disabled',
  // game screen
  GameScreen = 'game-screen',
  GameOpponentsCards = 'game-screen__opponent-cards',
  GamePlaySection = 'game-screen__play-section',
  GameCardsSection = 'game-screen__card-section',
  GameUILayer = 'game-screen__ui-layer',
  GameOpponentsInfo = 'game-screen__opponents-info-container',
  GameOpponentSection = 'game-screen__opponent-section',
  GameOpponentSectionDead = 'game-screen__opponent-section--dead',
  GamePlayerInfo = 'game-screen__player-info-container',
  GameControls = 'game-screen__game-buttons-container',
  // player cards
  PlayerCards = 'player-cards',
  PlayerCardsHand = 'player-cards__hand-container',
  PlayerCardsSelected = 'player-cards__selected-cards-container',
  PlayingCardDisabled = 'card-container--disable',
  PlayingCardBeforeAppend = 'card-container--before-append',
  PlayingCardBeforeRemove = 'card-container--before-remove',
  // overlay
  Overlay = 'overlay',
  BeforeAppend = 'overlay--before-append',
  BeforeRemove = 'overlay--before-remove',
  // win screen
  GameEndScreen = 'game-end-screen',
  WinnerContainer = 'game-end__winner',
  ItemName = 'item__name',
  ItemHeroName = 'item__hero-name',
  ItemAvatar = 'item__avatar',
  LosersContainer = 'game-end__losers',
  LoserItem = 'loser',
  // game screen
  GameScreenButton = 'game-button__ready',
  // dice roller
  Dice = 'dice',
  DiceContainer = 'dice-container',
  DiceRoller = 'dice-roller',
  DiceRollerShow = 'dice-roller--show',
  DiceRollingAnimation = 'dice--rolling',
}
