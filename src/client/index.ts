import './styles/style.scss';
import App from './app';

const serverUrl = `${window.location.protocol}//${window.location.host}`;
const locationPath = window.location.pathname.slice(1);

const createGameUrl = (gameId: string): string => `${serverUrl}/game-${gameId}`;

const gameId = (locationPath.startsWith('game-')) ? locationPath.replace(/^game-/, '') : '';
const main = document.getElementById('main');

if (main) new App(main, serverUrl, createGameUrl).start(gameId).catch((e) => console.log((<Error> e).message));
