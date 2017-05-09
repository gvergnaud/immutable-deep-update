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

// type DataStructure key a = DataStructure key a
// type Lens s k = Lens s k

// createLens :: (DataStructure s, Functor f) =>
  // (k -> s k a) -> a
  // -> (k -> b -> s k a) -> s k b
  // -> k
  // -> _
  // -> _
  // -> f
  // -> s k a
  // -> f (s k b)
const createLens = curry((getter, setter, key, point, extract, f, obj) =>
  map(value => setter(key, value, obj), f(getter(key, obj)))
)

// identityLens :: (DataStructure s, Functor f) => _ -> _ -> f -> s k a -> f (s k b)
const identityLens = createLens(
  (_, obj) => obj,
  (_, value) => value,
  '_' // no key needed
)


// lensProp :: (DataStructure (Object s), Functor f) => String -> _ -> _ -> f -> s String a -> f (s String b)
const lensProp = createLens(
  (key, obj) => obj[key],
  (key, value, obj) => Object.assign({}, obj, {
    [key]: value
  })
)

// lensProps :: (DataStructure (Object s), Functor f) => [String] -> _ -> _ -> f -> s String a -> f (s String b)
const lensProps = (...keys) => composeLenses(...keys.map(key => lensProp(key)))


// immutableLens :: (DataStructure (Immutable s), Functor f) => String -> _ -> _ -> f -> s String a -> f (s String b)
const immutableLens = createLens(
  (key, x) => x.get(key),
  (key, value, x) => x.set(key, value)
)

// immutableLens :: (DataStructure [s], Functor f) => number -> _ -> _ -> f -> s number a -> f (s number b)
const num = createLens(
  (index, arr) => arr[index],
  (index, value, arr) => [ ...arr.slice(0, index), value, ...arr.slice(index + 1) ]
)

// mapped :: (DataStructure [s], Functor f) => (c -> f c) -> (f d -> d) -> (a -> f b) -> s k a -> f (s k b)
const mapped = curry((point, extract, f, xs) => point(map(compose(extract, f), xs)))

// mapped :: (DataStructure (Object s), Functor f) => (c -> f c) -> (f d -> d) -> (a -> f b) -> s k a -> f (s k b)
const mappedValues = curry((point, extract, f, obj) => point(mapValues(compose(extract, f), obj)))


/* ----------------------------------------- *
        The 3 methods
* ----------------------------------------- */
// s = data structure
// k = any type of accessor
// Lens s k = Lens of a structure with accessors of type k

// view :: Lens s k -> s k a -> a
const view = curry((lens, x) => compose(getConst, lens(Const.of, getConst, Const.of))(x))

// over :: Lens s k -> (a -> b) -> s k a -> s k b
const over = curry((lens, f, x) => compose(runIdentity, lens(Identity.of, runIdentity, compose(Identity.of, f)))(x))

// set :: Lens s k -> b -> s k a -> s k b
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
