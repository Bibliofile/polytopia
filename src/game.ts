import { Map, SquareFlags, Square } from './map'
import { Player } from './player'
import { Unit, UnitType, waterUnits } from './unit'

export class Game {
  static readonly ACCELERATOR = 4.5

  readonly map: Map
  readonly player1: Player
  readonly player2: Player

  constructor (size: number) {
    this.map = new Map(size)
    this.player1 = new Player()
    this.player2 = new Player()
  }

  /**
   * Note: Ignores movement restrictions
   * @param fromX
   * @param fromY
   * @param toX
   * @param toY
   */
  move (fromX: number, fromY: number, toX: number, toY: number) {
    const from = this.map.getSquare(fromX, fromY)
    if (!from.unit) {
      return
    }

    const to = this.map.getSquare(toX, toY)

    if (!to.unit) {
      this.moveUnit(from, to)
      return
    }

    if (from.unit.player === to.unit.player) {
      return
    }

    const defenseForce = to.getDefenseForce()
    const totalDamage = from.unit.attackForce + defenseForce
    if (from.unit.type === UnitType.mind_bender) {
      to.unit.player = from.unit.player
      return
    } else {
      to.unit.health -= Math.round(from.unit.attackForce / totalDamage * from.unit.attack * Game.ACCELERATOR)
    }

    // Killed
    if (to.unit.health <= 0) {
      to.unit = undefined
      this.moveUnit(from, to)
      return
    }

    // Survived, retaliate if adjacent
    if (Math.abs(fromX - toX) < 2 && Math.abs(fromY - toY) < 2) {
      from.unit.health -= Math.round(defenseForce / totalDamage * to.unit.defense * Game.ACCELERATOR)
      if (from.unit.health <= 0) {
        from.unit = undefined
      }
    }
  }

  private moveUnit (from: Square, to: Square) {
    if (!from.unit) return

    if (!from.isLand && to.isLand) {
      to.unit = from.unit.carrying || from.unit
    } else if (from.isLand && !to.isLand) {
      to.unit = waterUnits.includes(from.unit.type) ? from.unit : new Unit(UnitType.boat, from.unit)
    } else {
      to.unit = from.unit
    }
    from.unit = undefined
  }
}
