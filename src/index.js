const curry = require('lodash/fp/curry')
const {
  composeLenses,
  identityLens,
  lensProp,
  num,
  mapped,
  mappedValues,
  over: _over,
  set: _set,
  view: _view
} = require('./lens')

// Token :: Prop String | Num number | Mapped | MappedValues
const Token = {
  Prop: 'Prop',
  Num: 'Num',
  Mapped: 'Mapped',
  MappedValues: 'MappedValues',
}


const quotesRegexp = /(^('|")|('|")$)/g
const curlyBracketsRegexp = /\{[^\}]*\}/g
const squareBracketsRegexp = /\[[^\]]*\]/g
const objectPropertyRegexp = /(\.|^)(?:[a-z0-9])/gi
const squareBracketsPropertyRegexp = /^\[(?:"|')([^\]]+)(?:"|')\]$/
const squareBracketsIndexRegexp = /^\[([0-9]*)\]$/

// tokenize :: String -> [Token]
const tokenize = str => {
  const separator = '\\\\\\'
  return str
    .replace(curlyBracketsRegexp, x => `${separator}${x}${separator}`) // for {..}
    .replace(squareBracketsRegexp, x => `${separator}${x}${separator}`) // for [..]
    .replace(objectPropertyRegexp, x => `${separator}${x.replace('.', '')}`) // for `something.other`
    .split(separator)
    .filter(Boolean)
    .map(strFragment => {
      if (strFragment === '{..}') return { type: Token.MappedValues }

      if (strFragment === '[..]') return { type: Token.Mapped }

      const [_, value] = (strFragment.match(squareBracketsIndexRegexp) || [])
      if (value) return { type: Token.Num, value: parseInt(value) }

      const intValue = parseInt(strFragment)
      if (intValue == strFragment) return { type: Token.Num, value: intValue }

      const [__, propertyName] = (strFragment.match(squareBracketsPropertyRegexp) || [])
      if (propertyName) return { type: Token.Prop, value: propertyName.replace(quotesRegexp, '') }

      return { type: Token.Prop, value: strFragment }
    })
}

// parse :: [Token] -> Lens
const parse = tokens =>
  tokens.reduce((acc, token) => {
    switch (token.type) {
      case Token.MappedValues: return composeLenses(acc, mappedValues)
      case Token.Mapped: return composeLenses(acc, mapped)
      case Token.Num: return composeLenses(acc, num(token.value))
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
