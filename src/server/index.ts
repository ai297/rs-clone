import express from 'express';
import path from 'path';
import * as fs from 'fs';
import { createServer } from 'http';
import App from './app';
import { GAME_ROUT_PREFIX } from '../common';

const PORT = process.env.PORT || 3000;
const PATH = process.env.PUBLIC_PATH;
const PUBLIC_PATH = PATH ? path.resolve(__dirname, PATH) : path.resolve(__dirname, './public');

// eslint-disable-next-line no-console
console.log(`Public path: ${PUBLIC_PATH}`);

const exp = express();
const server = createServer(exp);

// configure middleware
exp.use((req, res, next) => {
  if (req.originalUrl.startsWith(`/${GAME_ROUT_PREFIX}`)) {
    res.sendFile(path.join(PUBLIC_PATH, 'index.html'));
  } else if (!fs.existsSync(path.join(PUBLIC_PATH, req.originalUrl))) {
    res.statusCode = 404;
    res.send('Sorry, this page is not found');
  } else next();
});

exp.use(express.static(PUBLIC_PATH));

// application entry point and start server
new App(server, PUBLIC_PATH).start(Number(PORT));
