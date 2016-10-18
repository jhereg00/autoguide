/**
 *  parses a file for sass vars
 *  good for displaying settings
 */
// requirements
var fs = require('fs');
var matchRE = /\.(scss|sass)$/;

function parseSassVars (string) {
  var out = {};
  var foundVars;
  var varRE = /(\$[a-zA-Z0-9_\-]+)\s*:\s*(.+?)[;\n]/;

  while (foundVars = string.match(varRE)) {
    if (/^\s*?\$/.test(foundVars[2]) && out[foundVars[2].replace(/\s+.+$/,'')]) {
      out[foundVars[1]] = out[foundVars[2].replace(/\s+.+$/,'')];
    }
    else
      out[foundVars[1]] = foundVars[2].replace(/\s*\!default/i,'');
    string = string.substr(foundVars.index + foundVars[0].length);
  }
  return out;
}

module.exports = parseSassVars;
