/**
 * Recursive array iteration with async handler function
 * @param array - source array
 * @param handler - async handler
 * @param counter - array items counter
 *
 * @example
 * const players: Array<Player> = [player1, player2, player3]
 * const diceRolls: Array<number> = [];
 * await forEachAsync(players, async (player) => {
 *    const roll = await player.makeDiceRoll();
 *    diceRolls.push(roll);
 * });
 */
export const forEachAsync = async <T>(
  array: Array<T>,
  handler: (item: T, index: number) => Promise<void>,
  counter = 0,
): Promise<void> => {
  if (array.length === 0) return;
  const item = <T> array[0];
  await handler(item, counter);
  await forEachAsync(array.slice(1), handler, counter + 1);
};
