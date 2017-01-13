const gulp = require('gulp');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const ts = require('gulp-typescript');

const chalk = require('chalk');
const through = require('through2');


const srcts = [
  './packages/*/src/**/*.{ts,tsx}',
  '!**/__tests__/**',
];

const dest = './packages';

const tsOptions = ts.createProject('tsconfig.json');

const mapDest = (path) => path.replace(/(packages\/[^/]+)\/src\//, '$1/lib/');


gulp.task('default', ['ts']);

gulp.task('ts', () =>
  gulp.src(srcts)
    .pipe(plumber())
    .pipe(through.obj((file, enc, callback) => {
      gutil.log(`Compiling ${chalk.blue(file.path)}...`);
      callback(null, file);
    }))
    .pipe(ts(tsOptions))
    .pipe(through.obj((file, enc, callback) => {
      file.path = mapDest(file.path);
      callback(null, file);
    }))
    .pipe(gulp.dest(dest)));
