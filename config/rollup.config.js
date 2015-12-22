import * as p from 'path';
import * as fs from 'fs';
import zlib from 'zlib';
import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'uglify-js';
import pack from '../package.json';

const copyright =
    '/*!\n' +
    ' * ' + pack.name + ' v' + pack.version + '\n' +
    ' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
    ' * Released under the ' + pack.license + ' License.\n' +
    ' */'
	
function createBundle() {
    let bundle = rollup.rollup({
        entry: p.resolve('src/index.js'),
        plugins: [
            babel({
                babelrc: false,
                presets: [
                    'es2015-rollup'
                ],
                plugins: [
                    'transform-object-rest-spread',
                ],
            }),
            npm({
                jsnext: true,
                skip: [
                    'react',
                ],
            }),
            commonjs({
                sourceMap: false,
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            }),
        ],
    });

    // Cast as native Promise.
    return Promise.resolve(bundle);
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

function write(dest, code) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(dest, code, function(err) {
            if (err) {
                return reject(err);
            }
            console.log('\x1b[1m\x1b[34m' + dest + '\x1b[39m\x1b[22m' + ' ' + (code.length / 1024).toFixed(2) + 'kb')
            resolve()
        })
    })
}

function writeBundle(bundle, {
    minify = true
}) {
    const filename = minify ? pack.name + '.min.js' : pack.name + '.js';
    const dest = p.resolve(`dist/${filename}`);

    let result = bundle.generate({
        format: 'umd',
        moduleName: 'Inferno',
        banner: copyright,
        sourceMap: true,
        sourceMapFile: dest,
        globals: {
        },
    });

    if (minify) {
        result = uglify.minify(result.code, {
            fromString: true,
            inSourceMap: result.map,
            outSourceMap: `${filename}.map`,
            warnings: false,
        });

        result.map = JSON.parse(result.map);
    } else {
        result.code += `\n//# sourceMappingURL=${filename}.map`;
    }

    let {
        code,
        map
    } = result;

    write(dest, code)
    write(`${dest}.map`, JSON.stringify(map))
}

// -----------------------------------------------------------------------------

process.on('unhandledRejection', (reason) => {
    throw reason;
});

createBundle().then((bundle) => {
    writeBundle(bundle, {
        minify: false
    }); // Development
    writeBundle(bundle, {
        minify: true
    }); // Production
	
	zip(); // gZip
})
