interface State {
  x: number
  y: number
}

interface Window {
  game: import('./game').Game
  state: State
}

declare let game: import('./game').Game
declare let state: State
