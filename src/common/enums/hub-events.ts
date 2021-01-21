export enum HubEventsServer {
  NewGame = 'new-game',
  JoinGame = 'join-game',
  StartGame = 'start-game',
  AddPlayer = 'add-player',
  SelectSpell = 'select-spell',
  AddBot = 'add-ai-player',
}

export enum HubEventsClient {
  GoOut = 'go-out',
  AddPlayer = 'add-player',
  RemovePlayer = 'remove-player',
  StartGame = 'start-game',
  EndGame = 'end-game',
  GetCards = 'get-cards',
  DiceRoll = 'dice-roll',
  UpdateHealath = 'update-haalth',
  SpellSelected = 'spell-selected',
  SelectTarget = 'select-target',
  CastSpell = 'cast-spell',
  CastCard = 'cast-card',
  NextMove = 'next-move',
}
