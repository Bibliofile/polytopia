import { Unit, UnitType } from './unit'

export enum SquareFlags {
  city = 1,
  walledCity = 1 << 1,
  mountain = 1 << 2,
  forest = 1 << 3,
  field = 1 << 4,
  ocean = 1 << 5,
  dock = 1 << 6
}

export class Square {
  flags: SquareFlags
  unit?: Unit

  getDefenseForce (): number {
    if (!this.unit) return 0

    let multiplier = 1
    if (this.flags & SquareFlags.walledCity) {
      // Some units don't receive wall bonuses
      if (![UnitType.navalon, UnitType.amphibian, UnitType.crab, UnitType.tridention].includes(this.unit.type)) {
        multiplier = 4
      }
    } else if (this.flags & (SquareFlags.ocean | SquareFlags.dock) && this.unit.player.hasAquatism) {
      multiplier = 1.5
    } else if (this.flags & SquareFlags.forest && this.unit.player.hasAquatism) {
      multiplier = 1.5
    } else if (this.flags & SquareFlags.mountain && this.unit.player.hasMeditation) {
      multiplier = 1.5
    } else if (this.flags & SquareFlags.city) {
      multiplier = 1.5
    }
    return this.unit.defenseForce * multiplier
  }

  get isLand () {
    return (this.flags & (SquareFlags.ocean | SquareFlags.dock)) === 0
  }

  constructor (flags: SquareFlags = SquareFlags.field, unit?: Unit) {
    this.flags = flags
    this.unit = unit
  }
}

export class Map {
  size: number
  squares: Square[][]

  constructor (size: number) {
    if (size < 0 || size > 30) { // 900 squares = a lot...
      throw new Error('size is out of bounds.')
    }

    this.size = size
    this.squares = Array.from({ length: size })
      .map(() => Array.from({ length: size }).map(() => new Square()))
  }

  getSquare (x: number, y: number) {
    if (x < 0 || x >= this.size) {
      throw new Error('x is out of bounds')
    }
    if (y < 0 || y >= this.size) {
      throw new Error('y is out of bounds')
    }
    return this.squares[x][y]
  }
}
