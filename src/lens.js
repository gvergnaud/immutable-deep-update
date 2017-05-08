const compose = require('lodash/fp/compose')
const curry = require('lodash/fp/curry')
const { getConst, default: Const } = require('./functors/Const')
const { runIdentity, default: Identity } = require('./functors/Identity')

const map = curry((mapper, x) => x.map(mapper))
const mapValues = curry((mapper, obj) =>
  Object.keys(obj).reduce((acc, k) => Object.assign(acc, {
    [k]: mapper(obj[k], k, obj)
  }), {}))

const composeLenses = (...lenses) => curry((point, extract, x) =>
  lenses.map(l => l(point, extract)).reduceRight((acc, l) => l(acc), x))

/* ----------------------------------------- *
        Lenses définition
* ----------------------------------------- */

// Getter :: (Key, Object) -> a
// Setter :: (Key, a, Object) -> Object

// createLens :: Functor f =>
  // Getter
  // -> Setter
  // -> Key
  // -> (a -> f a)
  // -> (f a -> a)
  // -> f a
  // -> Object
  // -> Lens a
const createLens = curry((getter, setter, key, point, extract, f, obj) =>
  map(value => setter(key, value, obj), f(getter(key, obj)))
)

// identityLens :: Functor f -> a -> f a
const identityLens = createLens(
  (_, obj) => obj,
  (_, value) => value,
  '_' // no key needed
)


// lensProp :: String -> Functor f -> Object -> f Object
const lensProp = createLens(
  (key, obj) => obj[key],
  (key, value, obj) => Object.assign({}, obj, {
    [key]: value
  })
)

// lensProps :: [String] -> Functor f -> Object -> f Object

const lensProps = (...keys) => composeLenses(...keys.map(key => lensProp(key)))


// immutableLens :: Key -> Functor f -> Map -> f Map
const immutableLens = createLens(
  (key, x) => x.get(key),
  (key, value, x) => x.set(key, value)
)

// num :: Number -> Functor f -> [x] -> f [x]
const num = createLens(
  (index, arr) => arr[index],
  (index, value, arr) => [ ...arr.split(0, index), value, ...arr.split(index + 1) ]
)

// mapped :: Functor f -> Setter (f a) (f b) a b
const mapped = curry((point, extract, f, xs) => point(map(compose(extract, f), xs)))
// const mapped = curry((f, xs) => Identity.of(map(compose(runIdentity, f), xs)))

// // mappedValues :: Functor f -> Setter (f a) (f b) a b
const mappedValues = curry((point, extract, f, obj) => point(mapValues(compose(extract, f), obj)))



/* ----------------------------------------- *
        The 3 methods
* ----------------------------------------- */
// s = data structure
// a = value of a specific key or index
// Lens s a = Lens of a defined data structure (Object, Array...) and a defined key or index

// view :: Lens s a -> s -> a
const view = curry((lens, x) => compose(getConst, lens(Const.of, getConst, Const.of))(x))

// over :: Lens s a -> (a -> a) -> s -> s
const over = curry((lens, f, x) => compose(runIdentity, lens(Identity.of, runIdentity, compose(Identity.of, f)))(x))

// set :: Lens s a -> a -> s -> s
const set = curry((lens, v, x) => over(lens, () => v, x))




module.exports = {
  identityLens,
  lensProp,
  lensProps,
  immutableLens,
  num,
  mapped,
  mappedValues,
  view,
  over,
  set,
  composeLenses
}
