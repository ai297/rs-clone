import express from 'express';
import http from 'http';
import path from 'path';
import { Game } from './game';
import { cards } from './test2';
import { Player } from './player';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = process.env.PUBLIC_PATH ? path.resolve(__dirname, process.env.PUBLIC_PATH)
  : path.resolve(__dirname, './public');

app.use(express.static(PUBLIC_PATH));

server.listen(PORT, () => {
  /* eslint-disable */
  console.log(`Server started on port ${PORT}`);
  console.log(`Public path: ${PUBLIC_PATH}`);
  /* eslint-enable */
});

const game = new Game(cards.slice(0, 24));

const player1 = new Player();
const player2 = new Player();
const player3 = new Player();

game.addPlayer(player1);
game.addPlayer(player2);
game.addPlayer(player3);

player1.isReady = true;
player2.isReady = true;
player3.isReady = true;

game.startGame();
