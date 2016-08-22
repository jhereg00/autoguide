/**
 *  Sets up the Nunjucks environment
 */
// requirements
var nunjucks = require('nunjucks');

// settings

// set up the actual environment
function build () {
  var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(), {
    noCache: true
  });
  /***
   *  Nunjucks Filters
   *
   *  Additional filters built into Nunjucks to help generate the styleguide.
   */
  require('./nunjucksFilters/split')(env);
  require('./nunjucksFilters/join')(env);

  return env;
}

module.exports = build();
module.exports.rebuild = build;
