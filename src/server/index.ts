import express from 'express';
import { createServer } from 'http';
import App from './app';
import { PUBLIC_PATH } from '../../public/path';

const PORT = process.env.PORT || 3000;

const exp = express();
const server = createServer(exp);

// configure middleware
exp.use(express.static(PUBLIC_PATH));
// eslint-disable-next-line no-console
console.log(`Public path: ${PUBLIC_PATH}`);

// application entry point and start server
new App(server, PUBLIC_PATH).start(Number(PORT));
