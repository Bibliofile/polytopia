import './helpers'
import { Game } from './game'
import { UnitType, waterUnits, Unit, carryUnits, getUnitName } from './unit'
import { SquareFlags } from './map'
import { render, CANVAS_SIZE } from './renderer/canvas'
import { Player } from './player'

window.game = new Game(18)
window.state = { x: 0, y: 0 }

// Build dropdowns
const tileDisp = document.querySelector('[data-for=tileTitle]') as HTMLHeadElement
const tileSelect = document.querySelector('[data-for=tile]') as HTMLSelectElement
const unitAllowed = document.querySelector('[data-for=unitAllowed]') as HTMLSelectElement
const veteranCheckmark = document.querySelector('[data-for=veteran]') as HTMLInputElement
const carryingContainer = document.querySelector('[data-for=carrying]') as HTMLElement
const carryingDropdown = document.querySelector('[data-for=unitCarry]') as HTMLSelectElement
const healthInput = document.querySelector('[data-for=health]') as HTMLInputElement
const playerOne = document.querySelector('[data-for=player]') as HTMLInputElement

const canvas = document.querySelector('canvas')!
canvas.width = canvas.height = CANVAS_SIZE
const context = canvas.getContext('2d')

function copy (text: string) {
  const el = document.body.appendChild(document.createElement('textarea'))
  el.value = text
  el.select()
  document.execCommand('copy')
  el.remove()
}

document.querySelector('[data-for=copyTiles]')!.addEventListener('click', () => {
  copy(window.exportTilesToString())
})
document.querySelector('[data-for=copyUnits]')!.addEventListener('click', () => {
  copy(window.exportUnitsToString())
})

if (!context) {
  throw new Error('Failed to get canvas context.')
}
document.querySelector('[data-for=clearState]')!.addEventListener('click', () => {
  localStorage.clear()
  window.game = new Game(game.map.size)
  updateEditor()
})

function niceTitle (title: string): string {
  return title[0].toUpperCase() + title.substr(1).replace(/([A-Z])/g, ' $1')
}

for (const tile of Object.keys(SquareFlags).filter(key => !isNaN(+key))) {
  const el = tileSelect.appendChild(document.createElement('option'))
  el.value = tile
  el.textContent = niceTitle(SquareFlags[tile as any])
}

for (const unit of Object.keys(UnitType).filter(key => !isNaN(+key))) {
  const el = unitAllowed.appendChild(document.createElement('option'))
  el.value = unit
  el.textContent = getUnitName(+unit as UnitType)
}

const carryableUnits = Object.keys(UnitType)
  .filter(key => !isNaN(+key))
  .filter(type => {
    return !waterUnits.includes(+type) && +type !== UnitType.none
  })
for (const unit of carryableUnits) {
  const el = carryingDropdown.appendChild(document.createElement('option'))
  el.value = unit
  el.textContent = getUnitName(+unit)
}

document.addEventListener('input', () => {
  const tile = +tileSelect.value as SquareFlags
  const vet = veteranCheckmark.checked
  const unit = +unitAllowed.value as UnitType
  const carryUnit = +carryingDropdown.value as UnitType
  const health = +healthInput.value || undefined

  carryingContainer.hidden = !carryUnits.includes(unit)

  const square = game.map.getSquare(state.x, state.y!)
  square.flags = tile

  const gameUnit = unit === UnitType.none ? undefined :
    carryUnits.includes(unit) ?
      new Unit(unit, new Unit(carryUnit, game.player1, health)) :
      new Unit(unit, game.player1, health)
  if (gameUnit) {
    gameUnit.veteran = vet
    if (!square.isLand && !waterUnits.includes(gameUnit.type)) {
      square.unit = new Unit(UnitType.boat, gameUnit)
    } else {
      square.unit = gameUnit
    }
    square.unit.player = playerOne.checked ? game.player1 : game.player2
  } else {
    square.unit = undefined
  }

  updatePlayer(game.player1, document.querySelector('[data-for=player1]')!)
  updatePlayer(game.player2, document.querySelector('[data-for=player2]')!)

  updateEditor()
})

function updatePlayer (player: Player, container: Element) {
  player.hasArchery = container.querySelector<HTMLInputElement>('[data-for="archery"]')!.checked
  player.hasAquatism = container.querySelector<HTMLInputElement>('[data-for="aquatism"]')!.checked
  player.hasMeditation = container.querySelector<HTMLInputElement>('[data-for="meditation"]')!.checked
}

function updateEditor () {
  const square = game.map.getSquare(state.x, state.y)
  tileSelect.value = square.flags as any

  tileDisp.textContent = `Tile (${state.x}, ${state.y})`

  if (square.unit) {
    unitAllowed.value = square.unit.type + ''
    veteranCheckmark.checked = square.unit.veteran
    playerOne.checked = square.unit.player === game.player1
    carryingContainer.hidden = !carryUnits.includes(square.unit.type)
    if (!carryingContainer.hidden) {
      carryingDropdown.value = square.unit.carrying!.type + ''
    }
    healthInput.value = square.unit.health + ''
  } else {
    unitAllowed.value = UnitType.none + ''
    carryingContainer.hidden = true
    veteranCheckmark.checked = false
    healthInput.value = '0'
  }
  updatePlayerDisplay(game.player1, document.querySelector('[data-for=player1]')!)
  updatePlayerDisplay(game.player2, document.querySelector('[data-for=player2]')!)

  localStorage.setItem('unit_map', window.exportUnitsToString())
  localStorage.setItem('tile_map', window.exportTilesToString())
  localStorage.setItem('player1', JSON.stringify(game.player1))
  localStorage.setItem('player2', JSON.stringify(game.player2))

  render(game, context!)
}

function updatePlayerDisplay (player: Player, container: Element) {
  container.querySelector<HTMLInputElement>('[data-for="archery"]')!.checked = player.hasArchery
  container.querySelector<HTMLInputElement>('[data-for="aquatism"]')!.checked = player.hasAquatism
  container.querySelector<HTMLInputElement>('[data-for="meditation"]')!.checked = player.hasMeditation
}

canvas.addEventListener('click', ({ clientX, clientY }: MouseEvent) => {
  state = getPosFromClientCoords(clientX, clientY)
  updateEditor()
})

function getPosFromClientCoords (clientX: number , clientY: number) {
  const { width, height, left, top } = canvas.getBoundingClientRect()
  const clickX = clientX - left
  const clickY = clientY - top
  const x = Math.floor(clickX / width * game.map.size)
  const y = Math.floor(clickY / height * game.map.size)
  return { x, y }
}

let downPos = state
canvas.addEventListener('mousedown', event => {
  downPos = getPosFromClientCoords(event.clientX, event.clientY)
})

canvas.addEventListener('mouseup', event => {
  const upPos = getPosFromClientCoords(event.clientX, event.clientY)
  if (upPos.x !== downPos.x || upPos.y !== downPos.y) {
    game.move(downPos.x, downPos.y, upPos.x, upPos.y)
  }
})

console.log('Available globals: `state`, `game`, `importTiles`, `exportTilesToString`, `importUnits`, `exportUnitsToString`')

const defaultTileMap = `
LLDOOOOOOOOODLFFFF
LCDOOOOOOOODCLFCFF
LLDOOOOOOOODLMFLLF
MLMDDOOOOOODFLMLLM
LWLMCDOODOOOODLLLL
LLLMLDODWDOOOODWLM
MLLLLDOODOOOOOODLM
LWLLWLOOOOOOOOOODL
LMLLDLDLOOODDDODLL
MLDDDLLMDOODCLDCLL
LCDOODCFFOOODDDFLL
LLLDOOOFLFDOOODLFL
LMLDOOOFLDOOOOODCL
LLLDOOODLWDOOOOODD
LLCDOODFMDOODOOOOO
LLLOODCMFDODCMDDDM
LLOOODFLLOODLFLCLM
LOOOODFFMOOFMLLLLL
`
const defaultUnitMap = `
_ _ _ _ 4/12/0/0/15 4/8/0/0/15 4/8/0/0/15 _ _ _ _ _ _ _ _ _ _ _
_ null/12/0/0/15 _ 4/12/0/0/15 4/8/0/0/15 4/8/0/0/15 4/8/0/0/15 _ _ _ _ _ _ _ _ _ _ _
null/18/0/0/15 null/18/0/0/15 _ _ 4/18/0/0/15 4/8/0/0/15 _ _ _ _ _ _ _ _ _ _ _ _
null/18/0/1/15 _ null/18/0/1/15 _ _ _ 4/8/0/0/15 4/8/0/0/15 _ _ _ _ _ _ _ _ _ _
_ null/18/0/1/15 _ _ null/18/0/0/15 _ _ 4/8/0/0/15 _ _ _ _ _ _ _ _ _ _
null/6/0/1/10 _ _ _ _ _ _ 4/8/0/0/15 null/13/0/0/10 _ _ _ _ _ _ _ _ _
null/12/0/1/15 null/6/0/1/10 null/6/0/1/10 _ _ _ _ 4/8/0/0/15 4/8/0/0/15 _ _ _ _ _ _ _ _ _
null/6/0/1/10 null/18/0/1/15 null/6/0/1/10 _ null/18/0/1/15 _ _ _ _ 4/8/0/0/15 4/8/0/0/15 _ _ _ _ _ _ _
null/12/0/1/15 _ null/12/0/1/15 _ _ _ _ _ _ 4/8/0/0/15 _ 4/8/0/0/15 _ _ _ _ _ _
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
_ null/12/0/1/15 _ 4/8/0/1/15 _ _ null/18/0/1/15 _ _ _ _ _ _ _ _ _ _ _
_ _ _ 17/11/0/1/40 4/8/0/1/15 4/8/0/1/15 _ _ _ _ _ 4/8/0/0/15 _ _ _ _ _ _
_ _ null/13/0/1/10 4/8/0/1/15 _ 4/11/0/1/40 _ _ _ _ _ 4/8/0/0/15 _ _ _ _ _ _
_ _ _ _ 4/8/0/1/15 _ _ _ _ null/11/0/0/40 _ 4/8/0/0/15 _ _ _ _ _ _
_ _ null/12/0/1/15 _ _ _ 4/11/0/1/40 _ _ _ _ _ _ _ _ _ _ _
_ _ _ _ _ _ _ null/18/0/1/15 _ _ _ _ _ _ _ _ _ _
_ _ _ _ _ _ null/6/0/1/10 _ _ _ 4/8/0/0/15 4/8/0/0/15 _ _ _ _ _ _
_ _ _ _ _ _ null/6/0/1/10 _ _ _ 4/8/0/0/15 _ _ _ _ _ _ _
`

window.importTiles(localStorage.getItem('tile_map') || defaultTileMap)
window.importUnits(localStorage.getItem('unit_map') || defaultUnitMap)
for (const [k, v] of Object.entries(JSON.parse(localStorage.getItem('player1') || '{}'))) {
  (game.player1 as any)[k] = v
}
for (const [k, v] of Object.entries(JSON.parse(localStorage.getItem('player2') || '{}'))) {
  (game.player2 as any)[k] = v
}

updateEditor()
