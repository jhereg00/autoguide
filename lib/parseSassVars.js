/**
 *  parses a file for sass vars
 *  good for displaying settings
 */
// requirements
var fs = require('fs');
var matchRE = /\.(scss|sass)$/;

function parseSassVars (path, cb) {
  var out = [];
  try {
    fs.lstat(path, function (err, stats) {
      if (err)
        throw err;

      if (stats.isDirectory()) {
        if (!/\/$/.test(path))
          path += '/';
        fs.readdir(path, function handleSassDir (err, fileNames) {
          if (err)
            throw err;

          var done = 0,
              toCheck = fileNames.length;
          function checkDone () {
            ++done;
            if (done === toCheck) {
              return cb(null, out);
            }
          }
          fileNames.forEach(function (name) {
            parseSassVars(path + name, function sassDirAttempt (err, data) {
              if (data && data.length) {
                out = out.concat(data);
              }
              checkDone();

              if (err)
                throw err;
            });
          });
        })
      }
      else if (matchRE.test(path)) {
        // got a sass file, so let's actually parse it
        fs.readFile(path, 'utf8', function (err, data) {
          if (err)
            throw err;

          var foundVars;
          var varRE = /(\$[a-zA-Z0-9_\-]+)\s*:\s*(.+?)[;\n]/;
          var fileOut = {};

          while (foundVars = data.match(varRE)) {
            if (!fileOut.vars)
              fileOut.vars = {};
            fileOut.vars[foundVars[1]] = foundVars[2];
            data = data.substr(foundVars.index + foundVars[0].length);
          }
          if (fileOut.vars) {
            // we got something!
            fileOut.filePath = path;

            return cb (err, [fileOut]);
          }

          return cb (err, null);
        });
      }
      else {
        return cb (err, null);
      }
    });
  } catch (err) { throw err; }
}

module.exports = parseSassVars;
