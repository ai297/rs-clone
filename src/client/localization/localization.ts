import { ILobbyLocalization } from './lobby-localization';
import { IStartScreenLocalization } from './start-screen-localization';
import { IGameEndLocalization } from './game-end-localization';
import { IGameScreenLocalization } from './game-screen-localization';

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
  Settings: 'Настройки',
};

export const GAME_END_DEFAULT_LOCALIZATION: IGameEndLocalization = {
  WinnerTitle: 'Победитель',
  LosersTitle: 'Проиграли',
};

export const GAME_SCREEN_DEFAULT_LOCALIZATION: IGameScreenLocalization = {
  ReadyButton: 'Заклинание готово',
};
