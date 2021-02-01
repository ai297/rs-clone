import { ILobbyLocalization } from './lobby-localization';
import { IStartScreenLocalization } from './start-screen-localization';
import { IGameEndLocalization } from './game-end-localization';
import { IGameScreenLocalization } from './game-screen-localization';
import { IAboutLocalization } from './about-localization';
import { IRulesLocalization } from './rules-localization';

export const LOBBY_DEFAULT_LOCALIZATION: ILobbyLocalization = {
  EnterYourName: 'Представься:',
  SelectHero: 'Готов!',
  StartGame: 'Погнали!',
  GameLink: 'Позови врагов',
  PlayerList: 'Готовы к бою',
  AddBot: 'Добавить бота',
  Copy: 'Ссылка скопирована',
};

export const START_SCREEN_DEFAULT_LOCALIZATION: IStartScreenLocalization = {
  NewGame: 'Новый замес',
  Join: 'Заскочить на замес',
  Rules: 'Правила',
  About: 'О проекте',
};

export const GAME_END_DEFAULT_LOCALIZATION: IGameEndLocalization = {
  WinnerTitle: 'Ты укокошил всех врагов',
  LoserTitle: 'Ты двинул копыта',
  NoWinnersTitle: 'Упс, в этой битве никто не выжил',
  HomeButton: 'На главную',
};

export const GAME_SCREEN_DEFAULT_LOCALIZATION: IGameScreenLocalization = {
  ReadyButton: 'Готов!',
  TargetSelection: 'ВЫБЕРИ ЦЕЛЬ:',
  ALlEnemies: 'ВСЕ ВРАГИ',
  SpellCast: 'применяет заклинание',
  RollBonus: 'Бонус к броску',
  MakeDiceRoll: 'бросает кубики',
  SelectSpellError: 'Не удалось выбрать заклинание',
};

export const ABOUT_DEFAULT_LOCALIZATION: IAboutLocalization = {
  BackButton: 'На главную',
};

export const RULES_DEFAULT_LOCALIZATION: IRulesLocalization = {
  BackButton: 'На главную',
};
