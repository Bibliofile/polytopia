import { Game } from './game'
import { SquareFlags } from './map'
import { UnitType, Unit } from './unit'

const squareFlagMap: { [c: string]: SquareFlags } = {
  C: SquareFlags.city,
  W: SquareFlags.walledCity,
  L: SquareFlags.field,
  F: SquareFlags.forest,
  M: SquareFlags.mountain,
  O: SquareFlags.ocean,
  D: SquareFlags.dock
}

const squareFlagToStringMap = {
  [SquareFlags.city]: 'C',
  [SquareFlags.walledCity]: 'W',
  [SquareFlags.field]: 'L',
  [SquareFlags.forest]: 'F',
  [SquareFlags.mountain]: 'M',
  [SquareFlags.ocean]: 'O',
  [SquareFlags.dock]: 'D'
}

declare global {
  interface Window {
    importTiles (s: string): void
    exportTilesToString (): string
    importUnits (s: string): void
    exportUnitsToString (): string
  }
}

window.importTiles = function (s: string) {
  const rows = s.trim().split('\n')
  const maxSize = Math.max(rows.length, rows.reduce((m, r) => Math.max(m, r.length), 0))
  if (maxSize > window.game.map.size) {
    window.game = new Game(maxSize)
  }

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]
    for (let x = 0; x < row.length; x++) {
      const char = row[x]
      const flag = squareFlagMap[char]
      if (flag != null) {
        game.map.getSquare(x, y).flags = flag
      }
    }
  }
}

window.exportTilesToString = function (): string {
  const rows: string[] = []
  for (let y = 0; y < window.game.map.size; y++) {
    let row = ''
    for (let x = 0; x < window.game.map.size; x++) {
      row += squareFlagToStringMap[window.game.map.getSquare(x, y).flags]
    }
    rows.push(row)
  }
  return rows.join('\n')
}

/**
 * Format:
 * (<carry_id>|null)/<id>/<vet>/<player 1>/<health><space>*
 * Use anything else (_ is recommended) for no unit
 */
window.importUnits = function (s: string) {
  const rows = s.trim().split('\n')
  const maxSize = Math.max(rows.length, rows.reduce((m, r) => Math.max(m, r.split(/\s+/).length), 0))
  if (maxSize > game.map.size) {
    window.game = new Game(maxSize)
  }

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y].split(/\s+/)
    for (let x = 0; x < row.length; x++) {
      if (!/(null|\d+)\/\d+\/[10]\/[10]\/\d+/.test(row[x])) continue

      const [ , carryId, id, vet, p1, health] = row[x].match(/(null|\d+)\/(\d+)\/([10])\/([10])\/(\d+)/)!
      const unitId = UnitType[+id]
      if (!unitId) continue // Unknown unit

      const unitType = UnitType[unitId as keyof typeof UnitType]
      let unit = new Unit(unitType, +p1 ? game.player1 : game.player2, +health)
      unit.veteran = !!+vet
      if (carryId !== 'null') {
        const carryUnitId = UnitType[+carryId]
        if (!carryUnitId) continue
        const carryUnitType = UnitType[carryUnitId as keyof typeof UnitType]
        unit = new Unit(carryUnitType, unit)
      }
      game.map.getSquare(x, y).unit = unit
    }
  }
}

window.exportUnitsToString = function (): string {
  const rows: string[] = []

  for (let y = 0; y < game.map.size; y++) {
    let row: string[] = []
    for (let x = 0; x < game.map.size; x++) {
      const square = game.map.getSquare(x, y)
      if (!square.unit) {
        row.push('_')
      } else {
        const carryId = square.unit.carrying ? square.unit.type : 'null'
        const id = carryId === 'null' ? square.unit.type : square.unit.carrying!.type
        const isP1 = square.unit.player === game.player1
        row.push(`${carryId}/${id}/${+square.unit.veteran}/${+isP1}/${square.unit.health}`)
      }
    }
    rows.push(row.join(' '))
  }

  return rows.join('\n')
}
