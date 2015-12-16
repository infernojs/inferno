const fs = require('fs')
const zlib = require('zlib')
const rollup = require('rollup')
const uglify = require('uglify-js')
const npm = require('rollup-plugin-npm');
const babel = require('rollup-plugin-babel')
const replace = require('rollup-plugin-replace')
const pack = require('../package.json')
const banner = require('./banner')
const main = fs.readFileSync('src/index.js', 'utf-8')
    // NOTE! replace 'boily' with current name on the library
    .replace(/boily\.version = '[\d\.]+'/, "boily.version = '" + pack.version + "'")

fs.writeFileSync('src/index.js', main)

function write(dest, code) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(dest, code, function(err) {
            if (err) return reject(err)
            console.log('\x1b[1m\x1b[34m' + dest + '\x1b[39m\x1b[22m' + ' ' + (code.length / 1024).toFixed(2) + 'kb');
            resolve()
        })
    })
}

function zip() {
    return new Promise(function(resolve, reject) {
        fs.readFile('dist/' + pack.name + '.min.js', function(err, buf) {
            if (err) return reject(err)
            zlib.gzip(buf, function(err, buf) {
                if (err) return reject(err)
                write('dist/' + pack.name + '.min.js.gz', buf).then(resolve)
            })
        })
    })
}


// rollup

        // Production Build
        return rollup.rollup({
                entry: 'src/index.js',
                plugins: [
                    babel(),
                    npm({
                        main: true,
                        jsnext: true
                    })
                ]
            })
            .then(function(bundle) {

                const code = bundle.generate({
                    format: 'umd',
                    moduleName: pack.name
                }).code

                const minified = banner + '\n' + uglify.minify(code, {
                    fromString: true,
                    unused: true,
                    dead_code: true,
                    warnings: false,
                    screw_ie8: true
                }).code

                return write('dist/' + pack.name + '.min.js', minified)
            })
            .then(zip)
    .catch(function(e) {
        console.log(e)
    })