import { Player } from './player'

export enum UnitType {
  none,
  amphibian,
  archer,
  baby_dragon,
  battleship,
  boat,
  catapult,
  crab,
  defender,
  dragon_egg,
  fire_dragon,
  giant,
  knight,
  mind_bender,
  navalon,
  polytaur,
  rider,
  ship,
  swordsman,
  tridention,
  warrior
}

const unitNameMap = {
  [UnitType.none]: 'None',
  [UnitType.amphibian]: 'Amphibian',
  [UnitType.archer]: 'Archer',
  [UnitType.baby_dragon]: 'Baby Dragon',
  [UnitType.battleship]: 'Battleship',
  [UnitType.boat]: 'Boat',
  [UnitType.catapult]: 'Catapult',
  [UnitType.crab]: 'Crab',
  [UnitType.defender]: 'Defender',
  [UnitType.dragon_egg]: 'Dragon Egg',
  [UnitType.fire_dragon]: 'Fire Dragon',
  [UnitType.giant]: 'Giant',
  [UnitType.knight]: 'Knight',
  [UnitType.mind_bender]: 'Mind Bender',
  [UnitType.navalon]: 'Navalon',
  [UnitType.polytaur]: 'Polytaur',
  [UnitType.rider]: 'Rider',
  [UnitType.ship]: 'Ship',
  [UnitType.swordsman]: 'Swordsman',
  [UnitType.tridention]: 'Tridention',
  [UnitType.warrior]: 'Warrior'
}

export function getUnitName (unit: UnitType) {
  return unitNameMap[unit]
}

const unitAttackDefHpMap = {
  [UnitType.none]: [NaN, NaN, NaN],
  [UnitType.amphibian]: [2, 1, 10],
  [UnitType.archer]: [2, 1, 10],
  [UnitType.baby_dragon]: [3, 3, 15],
  [UnitType.battleship]: [4, 3, NaN],
  [UnitType.boat]: [1, 1, NaN],
  [UnitType.catapult]: [4, 0, 10],
  [UnitType.crab]: [4, 4, 40],
  [UnitType.defender]: [1, 3, 15],
  [UnitType.dragon_egg]: [0, 2, 10],
  [UnitType.fire_dragon]: [4, 3, 20],
  [UnitType.giant]: [5, 4, 40],
  [UnitType.knight]: [3.5, 1, 15],
  [UnitType.mind_bender]: [0, 1, 10],
  [UnitType.navalon]: [4, 4, 30],
  [UnitType.polytaur]: [3, 1, 15],
  [UnitType.rider]: [2, 1, 10],
  [UnitType.ship]: [2, 2, NaN],
  [UnitType.swordsman]: [3, 3, 15],
  [UnitType.tridention]: [3, 1, 15],
  [UnitType.warrior]: [2, 2, 10]
}

export const rangedUnits = [
  UnitType.archer,
  UnitType.fire_dragon,
  UnitType.mind_bender, // Not really, but doesn't move into a square
  UnitType.boat,
  UnitType.ship,
  UnitType.battleship
]

export const waterUnits = [
  UnitType.navalon,
  UnitType.amphibian,
  UnitType.tridention,
  UnitType.crab,
  UnitType.fire_dragon,
  UnitType.boat,
  UnitType.ship,
  UnitType.battleship
]

export const carryUnits = [
  UnitType.boat,
  UnitType.ship,
  UnitType.battleship
]

export const unitsWithoutVeteran = [
  UnitType.giant,
  UnitType.navalon,
  UnitType.dragon_egg,
  UnitType.baby_dragon,
  UnitType.fire_dragon,
  UnitType.crab
]

export class Unit {
  readonly type: UnitType

  readonly carrying?: Unit
  private _player?: Player
  private _health?: number
  private _veteran: boolean = false

  get attack () {
    return unitAttackDefHpMap[this.type][0]
  }

  get defense () {
    return unitAttackDefHpMap[this.type][1]
  }

  get maxHealth (): number {
    if (this.carrying) {
      return this.carrying.maxHealth
    }
    return this.veteran ? unitAttackDefHpMap[this.type][2] + 5 : unitAttackDefHpMap[this.type][2]
  }

  get defenseForce () {
    return this.defense * (this.health / this.maxHealth)
  }

  get attackForce () {
    return this.attack * (this.health / this.maxHealth)
  }

  get health (): number {
    if (this.carrying) {
      return this.carrying.health
    } else if (this._health == null) {
      return this._health = this.maxHealth
    }
    return this._health
  }

  set health (value: number) {
    if (this.carrying) {
      this.carrying.health = value
    } else {
      this._health = Math.min(value, this.maxHealth)
    }
  }

  get veteran (): boolean {
    return this.carrying ? this.carrying.veteran : this._veteran
  }

  set veteran (value: boolean) {
    if (this.carrying) {
      this.carrying.veteran = value
    } else if (!unitsWithoutVeteran.includes(this.type)) {
      this._veteran = value
    }
  }

  get player (): Player {
    if (this.carrying) {
      return this.carrying.player
    }
    return this._player!
  }

  set player (value: Player) {
    if (this.carrying) {
      this.carrying.player = value
    } else {
      this._player = value
    }
  }

  get isRanged () {
    return rangedUnits.includes(this.type)
  }

  constructor (type: UnitType, carrying: Unit)
  constructor (type: UnitType, player: Player, currentHp?: number)

  constructor (type: UnitType, playerOrUnit?: Player | Unit, currentHp?: number) {
    this.type = type
    if (playerOrUnit instanceof Player) {
      this.player = playerOrUnit
    } else {
      this.carrying = playerOrUnit
    }
    this.health = currentHp == null ? this.maxHealth : currentHp
  }
}
