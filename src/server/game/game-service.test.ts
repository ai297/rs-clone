import { GameService } from './game-service';

const deckFactoryMock = () => [];

test('newGame(id).isSuccess shold be true if new game created.', () => {
  const target = new GameService(deckFactoryMock);
  expect(target.newGame('123').isSuccess).toBe(true);
});

test('newGame(id).isSuccess should be false if game already exists.', () => {
  const target = new GameService(deckFactoryMock);
  const id = 'abc';
  target.newGame(id);
  expect(target.newGame(id).isSuccess).toBe(false);
});

test('joinGame(id).isSuccess should be false if game not exists.', () => {
  const target = new GameService(deckFactoryMock);
  expect(target.joinGame('123').isSuccess).toBe(false);
});

test('joinGame(id).isSuccess should be true if game exists.', () => {
  const target = new GameService(deckFactoryMock);
  const id = 'abc';
  target.newGame(id);
  expect(target.joinGame(id).isSuccess).toBe(true);
});

test('startGame(id).isSuccess should be false if game not exists', () => {
  const target = new GameService(deckFactoryMock);
  expect(target.startGame('id').isSuccess).toBe(false);
});

test('startGame(id).isSuccess should be false if game has no players', () => {
  const target = new GameService(deckFactoryMock);
  const id = 'abc';
  target.newGame(id);
  expect(target.startGame(id).isSuccess).toBe(false);
});

test('startGame(id).isSuccess should be true if game has two players', () => {
  const target = new GameService(deckFactoryMock);
  const id = '123';
  target.newGame(id);
  // const game = target.getGame(id);
  // game.addPlayer(null);
  // game.addPlayer(null);
  expect(target.startGame('id').isSuccess).toBe(true);
});
