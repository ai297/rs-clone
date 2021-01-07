import './styles/style.scss';
import App from './app';
import { StaticScreens } from './enums';

const main = document.getElementById('main');
if (main) {
  const app = new App(main);
  app.showStaticScreen(StaticScreens.Start);
}
