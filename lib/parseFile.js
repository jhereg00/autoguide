/**
 *  Parses a file for autoguide comments
 *
 *  @param {string} filePath - path to file to parse
 *  @param {function} callback - function to call when done
 */

// requirements
var fs = require('fs');
var parseComment = require('./parseComment');

function parseFile (filePath, cb) {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err)
      if (cb)
        return cb(err, null);

    // parse data for autoguide comments
    var comments = data.match(/\/\*\*\*(\n|.)+?\*\//g);
    if (!comments)
      return cb(err, null);

    for (var i = 0, len = comments.length; i < len; i++) {
      comments[i] = parseComment(comments[i]);
      comments[i].filePath = filePath;
    }

    cb(err, comments);
  });
}

module.exports = parseFile;
