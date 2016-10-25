/***
 *  Wrap Filter
 *
 *  Wraps content in a new element.
 *
 *  code:
 *    {{ "<div>Foo</div>" | wrap ("div.bar") }} == <div class="bar"><div>Foo</div></div>
 *    {{ "Foo" | wrap ("div.bar>span#baz") }} == <div class="bar"><span id="baz">Foo</span></div>
 */

var wrap = function (content, wrapper) {
  var addModifier = require('./addModifier').addModifier;
  // parse elements from inside out, leaning on addModifier for classes/ids
  var wrapperEls = wrapper.split(/[>\s]/g);
  for (var i = wrapperEls.length - 1; i > -1; i--) {
    var str = wrapperEls[i];
    // type of element?
    var tagName = /^\w+/.exec(str);
    if (tagName)
      tagName = tagName[0];
    else
      tagName = 'div';

    content = '<' + tagName + '>' + content + '</' + tagName + '>';
    var mods = str.replace(/^\w*/,'');
    if (mods)
      content = addModifier(content, mods);
  }
  return content;
}

module.exports = function (env) {
  env.addFilter('wrap', wrap);
}
module.exports.wrap = wrap;
