import './styles/style.scss';
import { GAME_ROUT_PREFIX } from '../common';
import App from './app';

const serverUrl = `${window.location.protocol}//${window.location.host}`;
const locationPath = window.location.pathname.slice(1);

const createGameUrl = (gameId: string): string => `${serverUrl}/${GAME_ROUT_PREFIX}${gameId}`;

const gameId = (locationPath.startsWith(GAME_ROUT_PREFIX)) ? locationPath.slice(GAME_ROUT_PREFIX.length) : '';
const main = document.getElementById('main');

if (main) new App(main, serverUrl, createGameUrl).start(gameId).catch((e) => console.log((<Error> e).message));
