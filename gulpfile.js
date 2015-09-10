var gulp = require('gulp');
var webpack = require('gulp-webpack');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
//TODO get sourcemaps working again...

gulp.task('default', function() {
  gulp.src('src/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(gulp.dest('./build'))
      .pipe(webpack())
      .pipe(concat('inferno.js'))
      .pipe(gulp.dest('./dist'))
      .pipe(uglify())
      .pipe(rename('inferno.min.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./dist'))
      .on('error', function (error) {
          console.error('' + error);
      });
});

gulp.task('watch', function() {
    gulp.start('default');
    gulp.watch('src/**', ['default']);
});
