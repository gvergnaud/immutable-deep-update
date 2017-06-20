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

## API

This package exports only 3 functions:
```js
import { over, set, view } from 'immutable-deep-update'
```

### set(path, value, dataStructure): dataStructure
```js
const state = { location: { city: 'NYC' }, /* other properties */ }

const newState = set('location.city', 'Paris', state)

// newState === { location: { city: 'Paris' }, /* other properties */ }
```

### over(path, transformer, dataStructure): dataStructure
```js
const state = { counter: { count: 1 }, /* other properties */ }

const newState = over('counter.count', x => x + 1, state)

// newState === { counter: { count: 2 }, /* other properties */ }
```

### view(path, dataStructure): value
```js
const state = { users: [ { location: { city: 'NYC' } }, { location: { city: 'Paris' } } ] }

const cities = view('users[..].location.city', state)

// cities === ['NYC', 'Paris']
```

### Supported path
- `'azerty'` => prop 'azerty'
- `'aze.rty'` => compose (prop 'aze') (prop 'rty')
- `'aze["rty"]'` => compose (prop 'aze') (prop 'rty')
- `'0'` => index 0
- `'[0]'` => index 0
- `'aze[0].rty'` => compose (prop 'aze') (index 0) (prop 'rty')
- `'aze.0.rty'` => compose (prop 'aze') (index 0) (prop 'rty')
- `'[..]'` => map over all items of an array
- `'{..}'` => map over all values of an object

## Curried and Composable
`view`, `over` and `set` are *curried* functions. It means that if you don't supply all
arguments to them, they will return a function taking the remaining arguments.

Sometimes it's easier to divide complex state mutations in simple functions and
then compose everything together like this:

```js
import { over, set, view } from 'immutable-deep-update'
import compose from 'lodash/fp/compose'

const removeDoneTodos = over('todos', todos => todos.filter(t => !t.isDone))
const setActiveFilter = set('activeFilter')
const cleanTodos = compose(removeDoneTodos, setActiveFilter('all'))

const state = {
  todos: [{ text: '...', isDone: false }, { text: '...', isDone: true }],
  activeFilter: 'done'
}
const newState = cleanTodos(state)
// newState === { todos: [{ text: '...', isDone: false }], activeFilter: 'all' }
```

## Examples
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

### Roadmap
- ~~Support for mapping over arrays and objects~~
- ~~Good test coverage~~
- Nicer error handling when the object given doesn't have the right shape
