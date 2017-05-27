# Immutable Deep Update

Immutably update deeply nested data structures with ease.

## Why
When trying to go immutable with plain javascript
objects you often end up writing this kind of code:
```js
const updateUserName = (userId, newName, state) => ({
  ...state,
  usersById: {
    ...state.usersById,
    [userId]: {
      ...state.usersById[userId],
      name: newName
    }
  }
})
```
what if you could write this instead ?

```js
const updateUserName = (userId, newName, state) =>
  set(`usersById.${userId}.name`, newName, state)
```

That's what this package does.

## Installation

```
npm install --save immutable-deep-update
```

## example
```js
import { over, set, view } from 'immutable-deep-update'

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

## With React
It works great with React's `setState` method too!

```jsx
<button onClick={() => this.setState(over('count', c => c + 1))}>
  clicked {this.state.count} times!
</button>
```

```jsx
class MyComponent extends React.Component {

  state = {
    users: [ { name: 'Jake', isFollowing: false } ]
  }

  toggleFollow(userIndex) {
    this.setState(over(`users[${userIndex}].isFollowing`, isFollowing => !isFollowing))
  }

  render() {
    return (
      <ul>
        {this.state.users.map((user, index) =>
          <li>
            {user.name}
            <button onClick={() => this.toggleFollow(index)}>
              {user.isFollowing ? 'Following!' : 'Follow'}
            </button>
          </li>
        )}
      </ul>
    )
  }

}
```


## Supported path
- `'azerty'` => prop 'azerty'
- `'aze.rty'` => compose (prop 'aze') (prop 'rty')
- `'aze["rty"]'` => compose (prop 'aze') (prop 'rty')
- `'0'` => index 0
- `'[0]'` => index 0
- `'aze[0].rty'` => compose (prop 'aze') (index 0) (prop 'rty')
- `'aze.0.rty'` => compose (prop 'aze') (index 0) (prop 'rty')
- `'[..]'` => map over all the items of an array
- `'{..}'` => map over all values of an object

### Roadmap
- Nicer error handling when the object given doesn't have the right shape
