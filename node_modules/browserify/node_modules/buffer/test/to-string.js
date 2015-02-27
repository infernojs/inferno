var B = require('../').Buffer
var test = require('tape')
if (process.env.OBJECT_IMPL) B.TYPED_ARRAY_SUPPORT = false

test('utf8 buffer to base64', function (t) {
  t.equal(
    new B('Ձאab', 'utf8').toString('base64'),
    '1YHXkGFi'
  )
  t.end()
})

test('utf8 buffer to hex', function (t) {
  t.equal(
    new B('Ձאab', 'utf8').toString('hex'),
    'd581d7906162'
  )
  t.end()
})

test('utf8 to utf8', function (t) {
  t.equal(
    new B('öäüõÖÄÜÕ', 'utf8').toString('utf8'),
    'öäüõÖÄÜÕ'
  )
  t.end()
})

test('utf16le to utf16', function (t) {
  t.equal(
    new B(new B('abcd', 'utf8').toString('utf16le'), 'utf16le').toString('utf8'),
    'abcd'
  )
  t.end()
})

test('utf16le to hex', function (t) {
  t.equal(
    new B('abcd', 'utf16le').toString('hex'),
    '6100620063006400'
  )
  t.end()
})

test('ascii buffer to base64', function (t) {
  t.equal(
    new B('123456!@#$%^', 'ascii').toString('base64'),
    'MTIzNDU2IUAjJCVe'
  )
  t.end()
})

test('ascii buffer to hex', function (t) {
  t.equal(
    new B('123456!@#$%^', 'ascii').toString('hex'),
    '31323334353621402324255e'
  )
  t.end()
})

test('base64 buffer to utf8', function (t) {
  t.equal(
    new B('1YHXkGFi', 'base64').toString('utf8'),
    'Ձאab'
  )
  t.end()
})

test('hex buffer to utf8', function (t) {
  t.equal(
    new B('d581d7906162', 'hex').toString('utf8'),
    'Ձאab'
  )
  t.end()
})

test('base64 buffer to ascii', function (t) {
  t.equal(
    new B('MTIzNDU2IUAjJCVe', 'base64').toString('ascii'),
    '123456!@#$%^'
  )
  t.end()
})

test('hex buffer to ascii', function (t) {
  t.equal(
    new B('31323334353621402324255e', 'hex').toString('ascii'),
    '123456!@#$%^'
  )
  t.end()
})

test('base64 buffer to binary', function (t) {
  t.equal(
    new B('MTIzNDU2IUAjJCVe', 'base64').toString('binary'),
    '123456!@#$%^'
  )
  t.end()
})

test('hex buffer to binary', function (t) {
  t.equal(
    new B('31323334353621402324255e', 'hex').toString('binary'),
    '123456!@#$%^'
  )
  t.end()
})

test('utf8 to binary', function (t) {
  /* jshint -W100 */
  t.equal(
    new B('öäüõÖÄÜÕ', 'utf8').toString('binary'),
    'Ã¶Ã¤Ã¼ÃµÃÃÃÃ'
  )
  /* jshint +W100 */
  t.end()
})
