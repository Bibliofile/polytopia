import { Map, Square, SquareFlags } from '../map'
import { UnitType } from '../unit'

/**
 * | T_ | T_ |
 * | U_ | U_ |
 * @param map
 * @param indent
 */
export function render (map: Map, indent = ' '.repeat(5), writeSep = true) {
  const write = (s: string) => console.log(indent + s)

  const rowSep = '-'.repeat(map.size * 5 + 1)
  if (writeSep) write(rowSep)
  for (const row of map.squares) {
    const top: string[] = []
    const bottom: string[] = []
    for (const square of row) {
      const [ t, b ] = renderSquare(square)
      top.push(t)
      bottom.push(b)
    }
    write('| ' + top.join(' | ') + ' |')
    write('| ' + bottom.join(' | ') + ' |')
    if (writeSep) write(rowSep)
  }
}

const squareFlagMap = {
  [SquareFlags.city]: 'C',
  [SquareFlags.walledCity]: 'W',
  [SquareFlags.field]: 'L',
  [SquareFlags.forest]: 'F',
  [SquareFlags.mountain]: 'M',
  [SquareFlags.ocean]: 'O',
  [SquareFlags.dock]: 'D'
}

const unitMap = {
  [UnitType.none]: 'ER',
  [UnitType.amphibian]: 'Am',
  [UnitType.archer]: 'Ar',
  [UnitType.baby_dragon]: 'Bd',
  [UnitType.battleship]: 'Bs',
  [UnitType.boat]: 'Bo',
  [UnitType.catapult]: 'Ca',
  [UnitType.crab]: 'Cr',
  [UnitType.defender]: 'De',
  [UnitType.dragon_egg]: 'Eg',
  [UnitType.fire_dragon]: 'Dr',
  [UnitType.giant]: 'Gi',
  [UnitType.knight]: 'Kn',
  [UnitType.mind_bender]: 'Mb',
  [UnitType.navalon]: 'Na',
  [UnitType.polytaur]: 'Po',
  [UnitType.rider]: 'Ri',
  [UnitType.ship]: 'Sh',
  [UnitType.swordsman]: 'Sw',
  [UnitType.tridention]: 'Tr',
  [UnitType.warrior]: 'Wa'
}

function renderSquare (square: Square): [string, string] {
  const sq = squareFlagMap[square.flags] + ' '
  const unit = square.unit ? unitMap[square.unit.type] : '  '
  return [ sq, unit ]
}
