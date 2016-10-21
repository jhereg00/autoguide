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
  require('./nunjucksFilters/dump')(env);
  require('./nunjucksFilters/split')(env);
  require('./nunjucksFilters/join')(env);
  require('./nunjucksFilters/markdown')(env);
  require('./nunjucksFilters/luminance')(env);
  require('./nunjucksFilters/addModifier')(env);
  require('./nunjucksFilters/contains')(env);
  require('./nunjucksFilters/wrap')(env);
  require('./nunjucksFilters/colors')(env);

  return env;
}

module.exports = build();
module.exports.rebuild = build;
