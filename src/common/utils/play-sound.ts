import { Sounds } from '../enums';

export const playSound = (sound: Sounds): Promise<void> => new Promise((resolve) => {
  const audio = new Audio(`./${sound}`);

  audio.addEventListener('canplaythrough', () => {
    audio.play();
  });

  audio.addEventListener('ended', () => {
    console.log('rock-and-roll');
    resolve();
  });
});
