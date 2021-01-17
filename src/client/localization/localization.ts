import { ILobbyLocalization } from './lobby-localization';
import { IStartScreenLocalization } from './start-screen-localization';
import { IGameEndLocalization } from './game-end-localization';

export const LOBBY_DEFAULT_LOCALIZATION: ILobbyLocalization = {
  EnterYourName: 'Введите имя',
  SelectHero: 'Выбрать персонажа',
  StartGame: 'Начать игру',
  GameLink: 'Ссылка на присоединение к игре',
  GameId: 'Ключ игры',
  PlayerList: 'Список игроков',
};

export const START_SCREEN_DEFAULT_LOCALIZATION: IStartScreenLocalization = {
  NewGame: 'Новая игра',
  Join: 'Присоединиться',
  Rules: 'Правила',
  Settings: 'Настройки',
};

export const GAME_END_DEFAULT_LOCALIZATION: IGameEndLocalization = {
  WinnerTitle: 'Победитель',
  LosersTitle: 'Проиграли',
};