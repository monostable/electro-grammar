const nearley = require('nearley')
const grammar = require('./grammar')

function parse(str) {
  const parser = new nearley.Parser(
    grammar.ParserRules,
    grammar.ParserStart,
    {keepHistory: true}
  )
  const words = str.split(' ')
  let info = parser.save()
  let unmatched = []
  let matched = words.reduce((prev, word) => {
    word = word.replace(/,|;/, '') + ' '
    //if it fails, roll it back
    try {
      parser.feed(word)
    } catch(e) {
      unmatched.push(word.trim())
      parser.restore(info)
    }
    info = parser.save()
    //return the latest valid result
    return parser.results[0] || prev
  }, {})

  matched.unmatched = unmatched
  return matched
}

module.exports = parse
