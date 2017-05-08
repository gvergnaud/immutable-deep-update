const { over, set, view } = require('../src')

const user = {
  firstname: 'Han',
  location: { city: 'Paris' },
  friends: [
    { fisrtname: 'Luke', location: { city: 'New York' } },
    { fisrtname: 'Darth Vador', location: { city: 'Dark star' } },
  ]
}

console.log(over('friends.0.location.city', city => city + ' City', user))
/* =>  {
  firstname: 'Han',
  location: { city: 'Paris' }
  friends: [
    { fisrtname: 'Luke', location: { city: 'New York City' } },
    { fisrtname: 'Darth Vador', location: { city: 'Dark star' } }
  ]
} */

console.log(over(
  'friends',
  friends => friends.concat({ firstname: 'Chewi', location: { city: '?' } }),
  user
))
/* =>  {
  firstname: 'Han',
  location: { city: 'Paris' }
  friends: [
    { fisrtname: 'Luke', location: { city: 'New York' } },
    { fisrtname: 'Darth Vador', location: { city: 'Dark star' } },
    { fisrtname: 'Chewi' location: { city: '?' } }
  ]
} */

console.log(set('friends[..].location.city', 'Tokyo', user))
/* =>  {
  firstname: 'Han',
  location: { city: 'Paris' }
  friends: [
    { fisrtname: 'Luke', location: { city: 'Tokyo' } },
    { fisrtname: 'Darth Vador', location: { city: 'Tokyo' } }
  ]
} */

console.log(view('friends.0.location.city', user))
console.log(view('friends[0].location.city', user))
// => New York


console.log(view('friends[..].location.city', user))
// => [ 'New York', 'Dark star' ]

console.log(set('friends[..]', 'none', user))
// => { firstname: 'Han',
//      location: { city: 'Paris' },
//      friends: [ 'none', 'none' ] }


const state = {
  usersById: {
    'a': { firstname: 'Rick', id: 'a' },
    'b': { firstname: 'Morty', id: 'b' }
  }
}

console.log(view('usersById{..}.firstname', state))
// => { a: 'Rick', b: 'Morty' }

console.log(over('usersById{..}', user => `${user.firstname} - ${user.id}`, state))
// => { usersById: { a: 'Rick - a', b: 'Morty - b' } }
