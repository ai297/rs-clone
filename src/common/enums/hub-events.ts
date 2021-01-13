export enum HubEventsServer {
  NewGame = 'new-game',
  JoinGame = 'join-game',
  StartGame = 'start-game',
  AddPlayer = 'add-player',
  SelectSpell = 'select-spell',
}

export enum HubEventsClient {
  GoOut = 'go-out',
  AddPlayer = 'add-player',
  RemovePlayer = 'remove-player',
  StartGame = 'start-game',
  GetCards = 'get-cards',
  DiceRoll = 'dice-roll',
  UpdateHealath = 'update-haalth',
  SpellSelected = 'spell-selected',
}
