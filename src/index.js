const curry = require('lodash/fp/curry')
const {
  composeLenses,
  identityLens,
  lensProp,
  mapped,
  mappedValues,
  over: _over,
  set: _set,
  view: _view
} = require('./lens')

// Token :: Prop String | Mapped | MappedValues
const Token = {
  Prop: 'Prop',
  Mapped: 'Mapped',
  MappedValues: 'MappedValues',
}

// tokenize :: String -> [Token]
const tokenize = str => {
  const tokenSeparator = '\\\\\\'
  return str
    .replace(/\{[^\}]*\}/g, x => `${tokenSeparator}${x}${tokenSeparator}`) // for {..}
    .replace(/\[[^\]]*\]/g, x => `${tokenSeparator}${x}${tokenSeparator}`) // for [..]
    .replace(/(\.|^)(?:[a-z0-9])/gi, x => `${tokenSeparator}${x.replace('.', '')}`) // for `something.other`
    .split(tokenSeparator)
    .filter(Boolean)
    .map(strFragment => {
      if (strFragment === '{..}') {
        return { type: Token.MappedValues }
      } else if (strFragment === '[..]') {
        return { type: Token.Mapped }
      } else if (strFragment.match(/^\[([0-9]*)\]$/)) {
        const [_, value] = strFragment.match(/^\[([0-9]*)\]$/)
        return { type: Token.Prop, value }
      } else {
        return { type: Token.Prop, value: strFragment }
      }
    })
}

// parse :: [Token] -> Lens
const parse = tokens =>
  tokens.reduce((acc, token) => {
    switch (token.type) {
      case Token.MappedValues: return composeLenses(acc, mappedValues)
      case Token.Mapped: return composeLenses(acc, mapped)
      case Token.Prop: return composeLenses(acc, lensProp(token.value))
      default: throw new Error(`Token with type ${token.type} is not supported`)
    }
  }, identityLens)


const pathToLens = path => parse(tokenize(path))

const over = curry((path, mapper, dataStructure) =>
  _over(pathToLens(path), mapper, dataStructure)
)

const set = curry((path, value, dataStructure) =>
  _set(pathToLens(path), value, dataStructure)
)

const view = curry((path, dataStructure) =>
  _view(pathToLens(path), dataStructure)
)

module.exports = {
  view,
  over,
  set
}
