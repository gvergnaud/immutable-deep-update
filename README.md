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

over('friends[0].location.city', city => city + ' City', user)
/* =>  {
  firstname: 'Han',
  location: { city: 'Paris' }
  friends: [
    { fisrtname: 'Luke', location: { city: 'New York City' } },
    { fisrtname: 'Darth Vador', location: { city: 'Dark star' } }
  ]
} */

over('friends', friends => friends.concat({
  firstname: 'Chewi',
  location: { city: '?' }
}), user)
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

view('friends[..].location.city', user)
// => [ 'New York', 'Dark star' ]

set('friends[..].location.city', 'Tokyo', user)
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

view('usersById{..}.firstname', state)
// => { a: 'Rick', b: 'Morty' }

over('usersById{..}', user => `${user.firstname} - ${user.id}`, state)
// => { usersById: { a: 'Rick - a', b: 'Morty - b' } }
```

## Supported path
- `'aze.rty'` => compose (prop 'aze') (prop 'rty')
- `'aze[0].aze'` => compose (prop 'aze') (prop '0') (prop 'rty')
- `'[..]'` => map over all the items of an array
- `'{..}'` => map over all values of an object

### Roadmap
- Add support for ranges
  - `'[x..y]'` => range from x to y
  - `'[x..]'` => range from x to Infinity
- Test coverage
- Nice error handling
