import { SquareFlags } from './map'
import { render } from './renderer/console'
import { Unit, UnitType } from './unit'
import { Game } from './game'

const game = new Game(11)

game.map.getSquare(4, 5).flags = SquareFlags.city
game.map.getSquare(10, 10).unit = new Unit(UnitType.giant, game.player1)

render(game.map)
