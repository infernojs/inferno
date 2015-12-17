const fs = require('fs')
const zlib = require('zlib')
const rollup = require('rollup')
const uglify = require('uglify-js')
const babel = require('rollup-plugin-babel')
const npm = require('rollup-plugin-npm');
const pack = require('../package.json')

const version = process.env.VERSION || pack.version

const banner =
    '/*!\n' +
    ' * ' + pack.name + ' v' + version + '\n' +
    ' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
    ' * Released under the ' + pack.license + ' License.\n' +
    ' */'

// update main file
const main = fs
    .readFileSync('src/index.js', 'utf-8')
    .replace(/boily\.version = '[\d\.]+'/, "boily.version = '" + pack.version + "'")
fs.writeFileSync('src/index.js', main)


function write(dest, code) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(dest, code, function(err) {
            if (err) return reject(err)
            console.log('\x1b[1m\x1b[34m' + dest + '\x1b[39m\x1b[22m' + ' ' + (code.length / 1024).toFixed(2) + 'kb')
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

rollup.rollup({

        entry: 'src/index.js',
        plugins: [
            babel({
                presets: ['es2015-rollup']
            }),
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
    .then(function() {
        // Standalone Production Build
        return rollup.rollup({
                entry: 'src/index.js',
                plugins: [
                    babel({
                        presets: ['es2015-rollup']
                    }),
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
                const minified = uglify.minify(code, {
                      fromString: true,
                    unused: true,
                    dead_code: true,
                    warnings: false,
                    screw_ie8: true
                }).code
                return write('dist/' + pack.name + '.min.js', minified)
            })
            .then(zip)
    })
    .catch(function(e) {
        console.log(e)
    })