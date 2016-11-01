/***
 *  Markdown filter
 *
 *  Filters content through the [marked](https://www.npmjs.com/package/marked)
 *  module.  Used on descriptions like this one.
 *
 *  Can be passed any options that marked supports.
 *
 *  Remember to also use the `safe` filter if you want the html to actually
 *  render as expected.
 *
 *  code:
 *    {{ "Some _markdown_ string" | markdown }} == "Some <em>markdown</em> string"
 */
var marked = require('marked');
module.exports = function (env) {
  env.addFilter('markdown', function(str, options) {
    return str ? marked(str, options) : '';
  });
}
