const fs = require('fs')
const rollup = require('rollup')
const uglify = require('uglify-js')
const npm = require('rollup-plugin-npm');
const babel = require('rollup-plugin-babel')
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

// rollup
return rollup.rollup({
        format: 'es6',
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
        return write('dist/' + pack.name + '.js', bundle.generate({
            format: 'umd',
            banner: banner,
            moduleName: pack.name
        }).code)
    })
    .catch(function(e) {
        console.log(e)
    })