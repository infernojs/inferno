const gulp = require('gulp');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const ts = require('gulp-typescript');

const chalk = require('chalk');
const through = require('through2');


const IGNORE = [
  '!**/__tests__/**',
  '!**/__benchmarks__/**',
  '!**/benchmarks/**',
];

const srcts = IGNORE.concat('./packages/*/src/**/*.{ts,tsx}');

const srcjs = IGNORE.concat('./packages/*/src/**/*.js');

const dest = './packages';

const tsOptions = ts.createProject('tsconfig.json');


function mapThroughDest(file, enc, callback) {
  file.path = file.path.replace(/(packages\/[^/]+)\/src\//, '$1/lib/');
  callback(null, file);
}


gulp.task('default', ['ts', 'js']);

gulp.task('ts', () =>
  gulp.src(srcts)
    .pipe(plumber())
    .pipe(through.obj((file, enc, callback) => {
      gutil.log(`Compiling ${chalk.blue(file.path)}...`);
      callback(null, file);
    }))
    .pipe(ts(tsOptions))
    .pipe(through.obj(mapThroughDest))
    .pipe(gulp.dest(dest)));

gulp.task('js', () =>
  gulp.src(srcjs)
    .pipe(plumber())
    .pipe(through.obj((file, enc, callback) => {
      gutil.log(`Copying ${chalk.yellow(file.path)}...`);
      callback(null, file);
    }))
    .pipe(through.obj(mapThroughDest))
    .pipe(gulp.dest(dest)));
