var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  sass = require('gulp-sass'),
  mainBowerFiles = require('main-bower-files');

gulp.task('sass', function () {
  gulp.src('./public/css/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('./public/css/*.scss', ['sass']);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js jade coffee',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed(__dirname);
    }, 500);
  });
});

gulp.task("bower-files", function(){
    gulp.src(mainBowerFiles({
      paths: {
        bowerDirectory: './public/components',
        bowerrc: './.bowerrc',
        bowerJson: './bower.json'
      }
    })).pipe(gulp.dest("./public/vendor"));
});

gulp.task('default', [
  'bower-files',
  'sass',
  'develop',
  'watch'
]);
