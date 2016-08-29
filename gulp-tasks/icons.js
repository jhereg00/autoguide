var gulp = require('gulp'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    rename = require('gulp-rename');

var icons = function () {
  return gulp.src(global.devPath + ['/icons/*.svg'])
    .pipe(rename(function (path) {
      path.basename = path.basename.replace(/^.*_+/,'');
    }))
    .pipe(iconfontCss({
      fontName: 'icons',
      path: 'scss',
      targetPath: '../scss/utilities/_icons.scss',
      fontPath: '../fonts/'
    }))
    .pipe(iconfont({
      fontName: 'icons',
      formats: ['ttf','eot','woff','woff2','svg']
    }))
    .pipe(gulp.dest(global.devPath + '/fonts'));
}

module.exports = icons;
