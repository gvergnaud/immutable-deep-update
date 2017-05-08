class Identity {

  constructor(v) {
    this.value = v
  }

  static of(v) {
    return new Identity(v)
  }

  run() {
    return this.value
  }

  map(f) {
    return Identity.of(f(this.value))
  }
}


const runIdentity = i => i.run()

module.exports = {
  default: Identity,
  runIdentity
}
