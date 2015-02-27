var fs = require('fs')
var test = require('tape')

var algorithms = ['sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'md5', 'rmd160']
var encodings = [/*'binary',*/ 'hex', 'base64'];
var vectors = require('hash-test-vectors')

var createHash = require('./browser')

algorithms.forEach(function (algorithm) {
  test('test ' + algorithm + ' against test vectors', function (t) {
    vectors.forEach(function (obj, i) {
      var input = new Buffer(obj.input, 'base64')
      var node = obj[algorithm]
      var js = createHash(algorithm).update(input).digest('hex')
      t.equal(js, node, algorithm + '(testVector['+i+']) == ' + node)
    })

    encodings.forEach(function (encoding) {
        vectors.forEach(function (obj, i) {
          var input = new Buffer(obj.input, 'base64').toString(encoding)
          var node = obj[algorithm]
          var js = createHash(algorithm).update(input, encoding).digest('hex')
          t.equal(js, node, algorithm + '(testVector['+i+'], '+encoding+') == ' + node)
        })
    });
    vectors.forEach(function (obj, i) {
      var input = new Buffer(obj.input, 'base64')
      var node = obj[algorithm]
      var hash = createHash(algorithm);
      hash.end(input)
      var js = hash.read().toString('hex')
      t.equal(js, node, algorithm + '(testVector['+i+']) == ' + node)
    })
    t.end()
  })
});
