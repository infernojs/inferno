var crypto = require('crypto')
var fork = require('child_process').fork
var path = require('path')
var compat = require('./browser')

function asyncPBKDF2 (password, salt, iterations, keylen, digest, callback) {
  if (typeof iterations !== 'number') {
    throw new TypeError('Iterations not a number')
  }

  if (iterations < 0) {
    throw new TypeError('Bad iterations')
  }

  if (typeof keylen !== 'number') {
    throw new TypeError('Key length not a number')
  }

  if (keylen < 0) {
    throw new TypeError('Bad key length')
  }
  if (typeof password === 'string')
    password = new Buffer(password)

  if (typeof salt === 'string')
    salt = new Buffer(salt)

  var child = fork(path.resolve(__dirname, 'async-shim.js'))

  child.on('message', function (result) {
    child.kill()
    callback(null, new Buffer(result, 'hex'))
  }).on('error', function (err) {
    child.kill()
    callback(err)
  })

  child.send({
    password: password.toString('hex'),
    salt: salt.toString('hex'),
    iterations: iterations,
    keylen: keylen,
    digest: digest
  })
}

exports.pbkdf2Sync = function pbkdf2Sync (password, salt, iterations, keylen, digest) {
  digest = digest || 'sha1'

  if (isNode10()) {
    if (digest === 'sha1') {
      return crypto.pbkdf2Sync(password, salt, iterations, keylen)
    } else {
      return compat.pbkdf2Sync(password, salt, iterations, keylen, digest)
    }
  } else {
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest)
  }
}

exports.pbkdf2 = function pbkdf2 (password, salt, iterations, keylen, digest, callback) {
  if (typeof digest ===  'function') {
    callback = digest
    digest = 'sha1'
  }

  if (isNode10()) {
    if (digest === 'sha1') {
      return crypto.pbkdf2(password, salt, iterations, keylen, callback)
    } else {
      return asyncPBKDF2(password, salt, iterations, keylen, digest, callback)
    }
  } else {
    return crypto.pbkdf2(password, salt, iterations, keylen, digest, callback)
  }
}

var sha1 = '0c60c80f961f0e71f3a9b524af6012062fe037a6e0f0eb94fe8fc46bdc637164'
var isNode10Result

function isNode10 () {
  if (typeof isNode10Result === 'undefined') {
    isNode10Result = crypto.pbkdf2Sync('password', 'salt', 1, 32, 'sha256').toString('hex') === sha1
  }

  return isNode10Result
}
