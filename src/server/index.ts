import express from 'express';
import path from 'path';
import { createServer } from 'http';
import App from './app';

const PORT = process.env.PORT || 3000;
const PATH = process.env.PUBLIC_PATH;
const PUBLIC_PATH = PATH ? path.resolve(__dirname, PATH) : path.resolve(__dirname, './public');

const exp = express();
const server = createServer(exp);

// configure middleware
exp.use(express.static(PUBLIC_PATH));
// eslint-disable-next-line no-console
console.log(`Public path: ${PUBLIC_PATH}`);

// application entry point and start server
new App(server, PUBLIC_PATH).start(Number(PORT));
