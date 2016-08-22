var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps')
    ;

module.exports = function sassTask () {
  return gulp.src(global.devPath + '/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      indentType : 'tab',
      indentWidth : 1
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions','ie >= 10']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(global.distPath + '/css/'));
}
