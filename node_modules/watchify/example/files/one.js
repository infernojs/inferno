var two = require('./two');

module.exports = function (x) { return x * two(x + 5) };
