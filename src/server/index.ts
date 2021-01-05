import path from 'path';
import App from './app';

const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = path.resolve(__dirname, './public');

new App(PUBLIC_PATH).start(Number(PORT));
