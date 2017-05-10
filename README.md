# Immutable Deep Update

Immutably update deeply nested data structures with ease.

## example
```js
const { over, set, view } = require('./src')

const user = {
  firstname: 'Han',
  location: { city: 'Paris' }
  friends: [
    { fisrtname: 'Luke', location: { city: 'New York' } }
    { fisrtname: 'Darth Vador', location: { city: 'Dark star' } }
  ]
}

console.log(
  over('friends[0].location.city', city => city + ' City', user)
)
/* =>  {
  firstname: 'Han',
  location: { city: 'Paris' }
  friends: [
    { fisrtname: 'Luke', location: { city: 'New York City' } },
    { fisrtname: 'Darth Vador', location: { city: 'Dark star' } }
  ]
} */

console.log(
  over('friends', friends => friends.concat({
    firstname: 'Chewi',
    location: { city: '?' }
  }), user)
)
/* =>  {
  firstname: 'Han',
  location: { city: 'Paris' }
  friends: [
    { fisrtname: 'Luke', location: { city: 'New York' } },
    { fisrtname: 'Darth Vador', location: { city: 'Dark star' } },
    { fisrtname: 'Chewi' location: { city: '?' } }
  ]
} */
```

### Map over array values
```js

console.log(
  view('friends[..].location.city', user)
)
// => [ 'New York', 'Dark star' ]

console.log(
  set('friends[..].location.city', 'Tokyo', user)
)
/* =>  {
  firstname: 'Han',
  location: { city: 'Paris' }
  friends: [
    { fisrtname: 'Luke', location: { city: 'Tokyo' } },
    { fisrtname: 'Darth Vador', location: { city: 'Tokyo' } }
  ]
} */
```

### Map over object values
```js
const state = {
  usersById: {
    'a': { firstname: 'Rick', id: 'a' },
    'b': { firstname: 'Morty', id: 'b' }
  }
}

console.log(
  view('usersById{..}.firstname', state)
)
// => { a: 'Rick', b: 'Morty' }

console.log(
  over('usersById{..}', user => `${user.firstname} - ${user.id}`, state)
)
// => { usersById: { a: 'Rick - a', b: 'Morty - b' } }
```

## Supported path
- `'azerty'` => prop 'azerty'
- `'aze.rty'` => compose (prop 'aze') (prop 'rty')
- `'aze['rty']'` => compose (prop 'aze') (prop 'rty')
- `'0'` => index 0
- `'[0]'` => index 0
- `'aze[0].rty'` => compose (prop 'aze') (index 0) (prop 'rty')
- `'aze.0.rty'` => compose (prop 'aze') (index 0) (prop 'rty')
- `'[..]'` => map over all the items of an array
- `'{..}'` => map over all values of an object

### Roadmap
- Nice error handling
