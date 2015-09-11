var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {
  console.log("Building inferno.min.js to 'dist' directory");
  gulp.src('./dist/inferno.js')
      .pipe(uglify())
      .pipe(rename('inferno.min.js'))
      .pipe(gulp.dest('./dist'))
      .on('error', function (error) {
          console.error('' + error);
      });
});

gulp.task('watch', function() {
    gulp.start('default');
    gulp.watch('./dist/inferno.js', ['default']);
});
