import { ILobbyLocalization } from './lobby-localization';
import { IGameEndLocalization } from './game-end-localization';

export const LOBBY_DEFAULT_LOCALIZATION: ILobbyLocalization = {
  EnterYourName: 'Введите имя',
  SelectHero: 'Выбрать персонажа',
  StartGame: 'Начать игру',
  GameLink: 'Ссылка на присоединение к игре',
  GameId: 'Ключ игры',
  PlayerList: 'Список игроков',
};

export const GAME_END_DEFAULT_LOCALIZATION: IGameEndLocalization = {
  WinnerTitle: 'Победитель',
  LosersTitle: 'Проиграли',
};
