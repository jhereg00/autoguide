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

    if (/^\s*?\$/.test(foundVars[2]) && allFound[foundVars[2].replace(/\s+.+$/,'')]) {
      out[foundVars[1]] = allFound[foundVars[2].replace(/\s+.+$/,'')];
    }
    else {
      out[foundVars[1]] = foundVars[2].replace(/\s*\!default/i,'');
      allFound[foundVars[1]] = out[foundVars[1]];
    }
    string = string.substr(foundVars.index + foundVars[0].length);
  }
  return out;
}

module.exports = parseSassVars;
