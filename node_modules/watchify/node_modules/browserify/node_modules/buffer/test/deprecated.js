var B = require('../').Buffer
var test = require('tape')
if (process.env.OBJECT_IMPL) B.TYPED_ARRAY_SUPPORT = false

test('.get (deprecated)', function (t) {
  var b = new B([7, 42])
  t.equal(b.get(0), 7)
  t.equal(b.get(1), 42)
  t.end()
})

test('.set (deprecated)', function (t) {
  var b = new B(2)
  b.set(7, 0)
  b.set(42, 1)
  t.equal(b[0], 7)
  t.equal(b[1], 42)
  t.end()
})
