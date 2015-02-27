#!/usr/bin/env node

var hyperquest = require('hyperquest')
var concat = require('concat-stream')
var split = require('split')
var thru = require('through2')
var fs = require('fs')

var url = 'https://api.github.com/repos/iojs/io.js/contents'
var dirs = [
  '/test/parallel',
  '/test/pummel'
]

var httpOpts = {
  headers: {
    'User-Agent': null
    // auth if github rate-limits you...
    // 'Authorization': 'Basic ' + Buffer('username:password').toString('base64'),
  }
}

dirs.forEach(function (dir) {
  var req = hyperquest(url + dir, httpOpts)
  req.pipe(concat(function (data) {
    if (req.response.statusCode !== 200) {
      throw new Error(url + dir + ': ' + data.toString())
    }
    downloadBufferTests(dir, JSON.parse(data))
  }))
})

function downloadBufferTests (dir, files) {
  files.forEach(function (file) {
    if (!/test-buffer.*/.test(file.name)) return

    var path
    if (file.name !== 'test-buffer-iterator.js')
      path = __dirname + '/../test/node/' + file.name
    else
      path = __dirname + '/../test/es6/' + file.name

    hyperquest(file.download_url, httpOpts)
      .pipe(split())
      .pipe(testfixer(file.name))
      .pipe(fs.createWriteStream(path))
  })
}

function testfixer (filename) {
  var firstline = true

  return thru(function (line, enc, cb) {
    line = line.toString()

    if (firstline) {
      // require buffer explicitly
      line = 'var Buffer = require(\'../../\').Buffer\nif (process.env.OBJECT_IMPL) Buffer.TYPED_ARRAY_SUPPORT = false\n' + line
      firstline = false
    }

    // comment out require('common')
    line = line.replace(/(var common = require.*)/, '// $1')

    // require browser buffer
    line = line.replace(/(.*)require\('buffer'\)(.*)/, '$1require(\'../../\')$2')

    // smalloc is only used for kMaxLength
    line = line.replace(/require\('smalloc'\)/, '{ kMaxLength: 0x3FFFFFFF }')

    // comment out console logs
    line = line.replace(/(.*console\..*)/, '// $1')

    // we can't reliably test typed array max-sizes in the browser
    if (filename === 'test-buffer-big.js') {
      line = line.replace(/(.*new Int8Array.*RangeError.*)/, '// $1')
      line = line.replace(/(.*new ArrayBuffer.*RangeError.*)/, '// $1')
      line = line.replace(/(.*new Float64Array.*RangeError.*)/, '// $1')
    }

    // https://github.com/iojs/io.js/blob/v0.12/test/parallel/test-buffer.js#L38
    // we can't run this because we need to support
    // browsers that don't have typed arrays
    if (filename === 'test-buffer.js') {
      line = line.replace(/b\[0\] = -1;/, 'b[0] = 255;')
    }

    // https://github.com/iojs/io.js/blob/v0.12/test/parallel/test-buffer.js#L1138
    // unfortunately we can't run this as it touches
    // node streams which do an instanceof check
    // and crypto-browserify doesn't work in old
    // versions of ie
    if (filename === 'test-buffer.js') {
      line = line.replace(/^(var crypto = require.*)/, '// $1')
      line = line.replace(/(crypto.createHash.*\))/, '1 /*$1*/')
    }

    cb(null, line + '\n')
  })
}
