import { Game } from '../game'
import { getUnitName } from '../unit'
import { SquareFlags } from '../map'

export const CANVAS_SIZE = 1000

const tileColors = {
  [SquareFlags.city]: '#bcbcbc',
  [SquareFlags.dock]: '#35cfff',
  [SquareFlags.field]: '#1cad00',
  [SquareFlags.forest]: '#115e02',
  [SquareFlags.mountain]: '#191919',
  [SquareFlags.ocean]: '#0d0082',
  [SquareFlags.walledCity]: '#545454'
}

export function render (game: Game, context: CanvasRenderingContext2D) {
  const { map, player1 } = game

  const cellSize = CANVAS_SIZE / map.size
  const quarterCell = cellSize / 4

  for (let x = 0; x < map.size; x++) {
    for (let y = 0; y < map.size; y++) {
      if (x !== window.state.x || y !== window.state.y) {
        renderSquare(x, y)
      }
    }
  }
  renderSquare(window.state.x, window.state.y)

  function renderSquare (x: number, y: number) {
    const cellX = x * cellSize
    const cellY = y * cellSize
    const square = map.getSquare(x, y)

    // Tile indicator
    context.fillStyle = tileColors[square.flags]
    context.fillRect(cellX + 2, cellY + 2, cellSize - 2, cellSize - 2)

    // Border
    if (window.state.x === x && window.state.y === y) {
      context.strokeStyle = 'red'
    } else {
      context.strokeStyle = 'white'
    }
    context.beginPath()
    context.lineWidth = 2
    context.rect(cellX, cellY, cellSize, cellSize)
    context.stroke()

    // Text
    if (square.unit) {
      context.fillStyle = context.strokeStyle = square.unit.player === player1 ? '#ff0000' : '#ffee00'
      context.font = `${quarterCell}px sans-serif`
      context.fillText(
        getUnitName(square.unit.type).substr(0, 3) + ` (${square.unit.health}/${square.unit.maxHealth})`,
        cellX + 2,
        cellY + quarterCell,
        cellSize - 4
      )
    }
  }
}
