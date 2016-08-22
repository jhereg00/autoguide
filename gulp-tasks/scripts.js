/**
 * Browserifies and minifies scripts
 */

var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    fs = require('fs')
    ;

function browserifyScript (fileName) {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './'+fileName,
    debug: true,
    basedir: global.devPath + '/js/',
    paths: ['./node_modules','./']
  });

  var bStream = b.bundle()
    .on('error', function (err) {
      gutil.log(err);
      this.emit('end');
    })
    .pipe(source(fileName))
    .pipe(buffer())
    .pipe(gulp.dest(global.distPath + '/js/'));

  return bStream;
}

module.exports = function (cb) {
  var doneCount = 0;
  var fileCount;
  function checkDone () {
    doneCount++;
    if (doneCount === fileCount && cb) {
      cb();
    }
  }

  fs.readdir(global.devPath + '/js/',function (err, data) {
    if (err)
      return cb();

    fileCount = data.length;
    for (var f in data) {
      var fileName = data[f];
      if (/^[^_].*\.js$/.test(fileName)) {
        // is a js file that doesn't start with '_'
        // assume it's an entry
        var stream = browserifyScript(fileName)
          .on('end',checkDone);
      }
      else {
        // not a valid name, perhaps a directory
        // don't do anything with this
        checkDone();
      }
    }
  });

  // copy any vendor scripts
  gulp.src(global.devPath + '/js/vendor/*')
    .pipe(gulp.dest(global.distPath + '/js/vendor'));
}
