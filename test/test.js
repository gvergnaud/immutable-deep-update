const expect = require('expect')
const {
  lensProp,
  view: _view,
  over: _over,
  set: _set,
  num,
  mapped,
  mappedValues,
  composeLenses: compose
} = require('../src/lens')
const { view, over, set } = require('../src')


describe('Lens', () => {

  const user = {
    name: 'Gabriel',
    age: 22,
    friends: [
      { name: 'Stachmou' },
      { name: 'HugoGuiillouu' }
    ]
  }

  const userById = {
    1: { name: 'Gabriel', age: 22 },
    2: { name: 'Stachmou', age: 12 },
    3: { name: 'HugoGuiillouu', age: 19 }
  }

  it('should view the content of a lens', () => {

    const nameL = lensProp('name')

    expect(_view(nameL, user)).toBe('Gabriel')

  })

  it('should be composable', () => {

    const secondFriendNameL = compose(lensProp('friends'), num(1), lensProp('name'))

    expect(_view(secondFriendNameL, user)).toBe('HugoGuiillouu')

  })

  it('should over the content of a lens', () => {

    const nameL = lensProp('name')

    expect(_over(nameL, (name) => `${name} Vergnaud`, user)).toEqual(Object.assign({}, user, {
      name: 'Gabriel Vergnaud'
    }))

  })

  it('should over the content of a mapped lens', () => {

    const friendsL = compose(lensProp('friends'), mapped, lensProp('name'))

    expect(_over(friendsL, name => `${name} Familly`, user)).toEqual(Object.assign({}, user, {
      friends: [
        { name: 'Stachmou Familly' },
        { name: 'HugoGuiillouu Familly' }
      ]
    }))

  })

  it('should over the content of a mappedValues lens', () => {

    const allNamesL = compose(mappedValues, lensProp('name'))

    expect(_set(allNamesL, 'Gabz', userById)).toEqual({
      1: { name: 'Gabz', age: 22 },
      2: { name: 'Gabz', age: 12 },
      3: { name: 'Gabz', age: 19 },
    })

  })

  it('should set the value of a lens with Set', () => {

    const nameL = lensProp('name')

    expect(_set(nameL, 'Gabz', user)).toEqual(Object.assign({}, user, {
      name: 'Gabz'
    }))

  })
})


describe('Immutable Deep Update', () => {
  const user = {
    firstname: 'Han',
    location: { city: 'Paris' },
    friends: [
      { fisrtname: 'Luke', location: { city: 'New York' } },
      { fisrtname: 'Darth Vador', location: { city: 'Dark star' } },
    ]
  }

  it('should work for chained properties', () => {

    expect(view('location.city', user)).toEqual('Paris')

    expect(over('location.city', x => 'Le bon ' + x, user)).toEqual(Object.assign({}, user, {
      location: Object.assign({}, user.location, {
        city: 'Le bon Paris'
      })
    }))

    expect(set('location.city', 'wooooot', user)).toEqual(Object.assign({}, user, {
      location: Object.assign({}, user.location, {
        city: 'wooooot'
      })
    }))

  })

  it('should understand `xxx[0].yyy` syntax to access an index', () => {

    expect(view('friends[0].location.city', user)).toBe('New York')

    expect(over('friends[0].location.city', city => city + ' City', user)).toEqual({
      firstname: 'Han',
      location: { city: 'Paris' },
      friends: [
        { fisrtname: 'Luke', location: { city: 'New York City' } },
        { fisrtname: 'Darth Vador', location: { city: 'Dark star' } }
      ]
    })

    expect(set('friends[0].location.city', 'woootCity', user)).toEqual({
      firstname: 'Han',
      location: { city: 'Paris' },
      friends: [
        { fisrtname: 'Luke', location: { city: 'woootCity' } },
        { fisrtname: 'Darth Vador', location: { city: 'Dark star' } }
      ]
    })

  })

  it('should understand `xxx.0.yyy` syntax to access an index', () => {

    expect(view('friends.0.location.city', user)).toBe('New York')

    expect(over('friends.0.location.city', city => city + ' City', user)).toEqual({
      firstname: 'Han',
      location: { city: 'Paris' },
      friends: [
        { fisrtname: 'Luke', location: { city: 'New York City' } },
        { fisrtname: 'Darth Vador', location: { city: 'Dark star' } }
      ]
    })

    expect(set('friends.0.location.city', 'woootCity', user)).toEqual({
      firstname: 'Han',
      location: { city: 'Paris' },
      friends: [
        { fisrtname: 'Luke', location: { city: 'woootCity' } },
        { fisrtname: 'Darth Vador', location: { city: 'Dark star' } }
      ]
    })

  })

  it('should map over values of an array with [..] syntax', () => {

    expect(view('friends[..].location.city', user)).toEqual(['New York', 'Dark star'])

    expect(over('friends[..].location.city', x => x + ' 👍', user)).toEqual({
      firstname: 'Han',
      location: { city: 'Paris' },
      friends: [
        { fisrtname: 'Luke', location: { city: 'New York 👍' } },
        { fisrtname: 'Darth Vador', location: { city: 'Dark star 👍' } }
      ]
    })

    expect(set('friends[..].location.city', 'Tokyo', user)).toEqual({
      firstname: 'Han',
      location: { city: 'Paris' },
      friends: [
        { fisrtname: 'Luke', location: { city: 'Tokyo' } },
        { fisrtname: 'Darth Vador', location: { city: 'Tokyo' } }
      ]
    })

  })

  it('should work when the path ends with [..] (eg `friends[..]`)', () => {

    expect(set('friends[..]', 'none', user)).toEqual({
      firstname: 'Han',
      location: { city: 'Paris' },
      friends: [ 'none', 'none' ]
    })

  })


  it('should map over values of an object with the {..} syntax', () => {

    const state = {
      usersById: {
        'a': { firstname: 'Rick', id: 'a' },
        'b': { firstname: 'Morty', id: 'b' }
      }
    }

    expect(view('usersById{..}.firstname', state)).toEqual({
      a: 'Rick', b: 'Morty'
    })

    expect(over('usersById{..}', user => `${user.firstname} - ${user.id}`, state)).toEqual({
      usersById: { a: 'Rick - a', b: 'Morty - b' }
    })

  })

})
