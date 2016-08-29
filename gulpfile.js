global.devPath = 'dev';
global.distPath = 'dist/assets';

global.serverPort = 8001;

var gulp = require('gulp');
var autoguide = require('./index');

gulp.task('sass',['fonts'],require('./gulp-tasks/sass'));
gulp.task('scripts',require('./gulp-tasks/scripts'));
gulp.task('icons',require('./gulp-tasks/icons'));
gulp.task('autoguide',['sass','scripts'],function (done) {
  autoguide({
    src: [global.devPath + "/scss",global.devPath + "/js","./lib"],
    vars: [global.devPath + "/scss/settings"],
    dest: "./sample"
  }, function (err, success) {
    done();
  });
});
gulp.task('fonts', ['icons'], function () {
  return gulp.src(global.devPath + '/fonts/**/*')
          .pipe(gulp.dest(global.distPath + '/fonts'));
});

// start a server for easy dev
gulp.task('server',require('./gulp-tasks/webserver'));

// watch
gulp.task('watch',['build'], function () {
  global.devMode = true;
  gulp.watch([global.devPath + '/scss/**/*',global.devPath + '/js/**/*','nunjucks/**/*'],['autoguide']);
});
// watch alias
gulp.task('dev',['watch','server']);

// build
gulp.task('build',['sass','scripts','autoguide']);
