/**
 *  Parses a file for autoguide comments
 *
 *  @param {string} filePath - path to file to parse
 *  [@param {object} options]
 *  @param {function} callback - function to call when done
 */

// requirements
var fs = require('fs');
var parseComment = require('./parseComment');

function parseFile (filePath, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err)
      if (cb)
        return cb(err, null);

    // parse data for autoguide comments
    var comments = data.match(/\/\*\*\*(\n|\r|.)+?\*\//g);
    if (!comments)
      return cb(err, null);

    for (var i = 0, len = comments.length; i < len; i++) {
      // determine content related to this comment
      var contentStart = data.indexOf(comments[i]) + comments[i].length;
      var contentEnd = comments[i + 1] ? data.indexOf(comments[i + 1]) - contentStart : data.length;
      var content = data.substr(contentStart, contentEnd - contentStart);
      // parse it all
      comments[i] = parseComment(comments[i], content);
      comments[i].filePath = filePath.split(/[\/\\]/g);
      if (!comments[i].path)
        comments[i].depth = comments[i].filePath.length - (options.startDepth || 0);
      else {
        // allow root level paths with '.' or './', then split into array
        if (!(comments[i].path instanceof Array)) {
          comments[i].path = comments[i].path.replace(/^\.+\/?/,'').split(/[\/\\]/g);
          while (comments[i].path[0] === "") {
            comments[i].path.shift();
          }
        }
        comments[i].depth = comments[i].path.length + 1;
      }
    }

    cb(err, comments);
  });
}

module.exports = parseFile;
