import { ILobbyLocalization } from './lobby-localization';
import { IStartScreenLocalization } from './start-screen-localization';
import { IGameEndLocalization } from './game-end-localization';
import { IGameScreenLocalization } from './game-screen-localization';

export const LOBBY_DEFAULT_LOCALIZATION: ILobbyLocalization = {
  EnterYourName: 'Введите имя',
  SelectHero: 'Выбрать персонажа',
  StartGame: 'Начать игру',
  GameLink: 'Ссылка на присоединение к игре',
  GameId: 'Ключ игры',
  PlayerList: 'Список игроков',
};

export const START_SCREEN_DEFAULT_LOCALIZATION: IStartScreenLocalization = {
  NewGame: 'Новый замес',
  Join: 'Заскочить на замес',
  Rules: 'Правила',
  Settings: 'Настройки',
};

export const GAME_END_DEFAULT_LOCALIZATION: IGameEndLocalization = {
  WinnerTitle: 'Победитель',
  LosersTitle: 'Проиграли',
};

export const GAME_SCREEN_DEFAULT_LOCALIZATION: IGameScreenLocalization = {
  ReadyButton: 'Заклинание готово',
};
