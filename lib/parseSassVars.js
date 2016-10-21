/**
 *  parses a file for sass vars
 *  good for displaying settings
 */

var allFound = {};

function parseSassVars (string) {
  var out;
  var foundVars;
  var varRE = /(\$[a-zA-Z0-9_\-]+)\s*:\s*(.+?)[;\n\r]/;

  while (foundVars = string.match(varRE)) {
    if (!out)
      out = {};

    // if (/^\s*?\$/.test(foundVars[2]) && allFound[foundVars[2].replace(/\s+.+$/,'')]) {
    //   out[foundVars[1]] = allFound[foundVars[2].replace(/\s+.+$/,'')];
    // }
    var varInValue = foundVars[2].match(/\$[a-zA-Z0-9_\-]+/g);
    if (varInValue) {
      for (var i = 0, len = varInValue.length; i < len; i++) {
        if (allFound[varInValue[i]]) {
          foundVars[2] = foundVars[2].replace(varInValue[i], allFound[varInValue[i]]);
        }
      }
    }

    out[foundVars[1]] = foundVars[2].replace(/\s*\!default/i,'');
    allFound[foundVars[1]] = out[foundVars[1]];

    string = string.substr(foundVars.index + foundVars[0].length);
  }
  return out;
}

module.exports = parseSassVars;
