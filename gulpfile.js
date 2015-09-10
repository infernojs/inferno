var gulp = require('gulp');
var webpack = require('gulp-webpack');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {
  gulp.src('./src/bootstrap.js')
      .pipe(webpack())
      .pipe(gulp.dest('./build'))
      .pipe(babel())
      .pipe(concat('inferno.js'))
      .pipe(gulp.dest('./dist'))
      .pipe(uglify())
      .pipe(rename('inferno.min.js'))
      .pipe(gulp.dest('./dist'))
      .on('error', function (error) {
          console.error('' + error);
      });
});

gulp.task('watch', function() {
    gulp.start('default');
    gulp.watch('src/**', ['default']);
});
