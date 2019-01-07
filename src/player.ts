export class Player {
  hasAquatism = true
  hasMeditation = true
  hasArchery = true

  constructor (player?: Player) {
    Object.assign(this, player)
  }
}
