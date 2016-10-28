/***
 *  Highlight Syntax filter
 *
 *  Filters content through the [syntax-highlighter](https://www.npmjs.com/package/syntax-highlighter)
 *  module.  Used on code blocks.
 *
 *  code:
 *    {{ ".a-code #string { color: red; }" | highlight('css') }}
 */
var hl = require('highlight.js');
module.exports = function (env) {
  env.addFilter('highlight', function(str, language) {
    var hlObj;
    if (language) {
      hlObj = hl.highlight(language.toLowerCase(), str);
    }
    else {
      hlObj = hl.highlightAuto(str);
    }
    return '<code class="lang-' + hlObj.language + '">' + hlObj.value + '</code>';
  });
}
