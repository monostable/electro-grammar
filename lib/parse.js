'use strict';

var nearley = require('nearley');
var grammar = require('./grammar');

function parse(str) {
  var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart, { keepHistory: true });
  var words = str.split(' ');
  var info = parser.save();
  var unmatched = [];
  var matched = words.reduce(function (prev, word) {
    word = word.replace(/,|;/, '') + ' ';
    //if it fails, roll it back
    try {
      parser.feed(word);
    } catch (e) {
      unmatched.push(word.trim());
      parser.restore(info);
    }
    info = parser.save();
    //return the latest valid result
    return parser.results[0] || prev;
  }, {});

  matched.unmatched = unmatched;
  return matched;
}

module.exports = parse;