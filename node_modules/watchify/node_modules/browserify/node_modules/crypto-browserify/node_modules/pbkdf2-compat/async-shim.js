var compat = require('./browser')

process.on('message', function (m) {
  var result = compat.pbkdf2Sync(new Buffer(m.password, 'hex'), new Buffer(m.salt, 'hex'), m.iterations, m.keylen, m.digest)

  process.send(result.toString('hex'))
})
