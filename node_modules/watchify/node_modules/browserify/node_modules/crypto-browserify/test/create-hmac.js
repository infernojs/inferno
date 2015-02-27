
var test = require('tape')

var algorithms = ['sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'md5', 'rmd160']
var vectors = require('hash-test-vectors/hmac')
testLib('createHmac in crypto-browserify',require('../').createHmac);
testLib('create-hmac/browser',require('create-hmac/browser'));
function testLib(name, createHmac) {
  test(name, function (t){
    algorithms.forEach(function (alg) {

      t.test('hmac('+alg+')', function (t) {
        vectors.forEach(function (input, i) {
          var output = createHmac(alg, new Buffer(input.key, 'hex'))
              .update(input.data, 'hex').digest()

          output = input.truncate ? output.slice(0, input.truncate) : output
          t.equal(output.toString('hex'), input[alg])
        })
        t.end()
      })

      t.test('hmac('+alg+')', function (t) {
        vectors.forEach(function (input, i) {
          var hmac = createHmac(alg, new Buffer(input.key, 'hex'))

          hmac.end(input.data, 'hex')
          var output = hmac.read()

          output = input.truncate ? output.slice(0, input.truncate) : output
          t.equal(output.toString('hex'), input[alg])
        })
        t.end()
      })

    })
  })

}
