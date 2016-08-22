/**
 *  Parses a whole directory
 */

// requirements
var fs = require('fs');
var parseFile = require('./parseFile');

function parseDirectory (dirPath, options, cb) {
  if (!/\/$/.test(dirPath))
    dirPath += '/';
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  options.startDepth = options.startDepth || dirPath.split(/[\/\\]/g).length - 1;

  var extRE;
  if (options && options.extensions)
    extRE = new RegExp ('.(' + options.extensions.join('|') + ')$');

  fs.readdir(dirPath, function (err, files) {
    if (err)
      if (cb)
        return cb (err, null);

    var done = 0,
        toCheck = files.length,
        out = [];

    function checkDone () {
      // check if we're done with our async stuff
      ++done;
      if (done === toCheck) {
        return cb (null, out);
      }
    }

    // iterate through each file
    files.forEach(function (fName) {
      fs.stat(dirPath + fName, function (err, data) {
        if (err)
          throw err;

        if (data.isDirectory()) {
          parseDirectory (dirPath + fName, options, function (err, data) {
            if (err)
              throw err;
            if (data)
              out = out.concat(data);
            checkDone();
          });
        }
        else if (!extRE || extRE.test(fName)) {
          parseFile (dirPath + fName, options, function (err, data) {
            if (err)
              throw err;
            if (data)
              out = out.concat(data);
            checkDone();
          });
        }
        else {
          // skip this
          checkDone();
        }
      });
    });
  });
}

module.exports = parseDirectory;
