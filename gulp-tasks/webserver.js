var gulp = require('gulp'),
    webserver = require('gulp-webserver');

var webserverTask = function () {
  return gulp.src("./sample")
    .pipe(webserver({
      directoryListing : false,
      port : global.serverPort,
      open : "http://localhost:" + global.serverPort
    }));
}
module.exports = webserverTask;
