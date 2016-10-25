/***
 *  Add Modifier Filter
 *
 *  Adds a modifier to the outermost element of an HTML string.
 *
 *  code:
 *    {{ "<div>Foo</div>" | addModifier (".bar") }} == <div class="bar">Foo</div>
 */
// requirements
var wrap = require('./wrap').wrap;

var addModifier = function(str, modifier) {
  if (/\s+&/.test(modifier)) {
    return wrap(str, modifier.replace(/\s+&/,''));
  }

  // split the modifier into its components
  var mods = modifier.match(/[\.#\[][a-zA-Z\-_"]+(.?=.+?\])?/g);
  // sort the mods
  var classes = [];
  var ids = [];
  var attributes = [];
  for (var i = 0, len = mods.length; i < len; i++) {
    if (/^\./.test(mods[i])) {
      classes.push(mods[i].replace(/^\./,''));
    }
    else if (/^#/.test(mods[i])) {
      ids.push(mods[i].replace(/^#/,''));
    }
    else if (/^\[\w+/.test(mods[i])) {
      attributes.push(mods[i]);
    }
  }
  // get the first element tag
  var firstEl = /<.+?>/.exec(str);
  if (!firstEl)
    return str;
  else
    firstEl = firstEl[0];

  var out = firstEl;

  // extend existing classes attribute
  if (/class=/.test(firstEl) && classes.length) {
    var classAppend = classes.join(' ');
    out = out.replace(/class=(['"])([\w\s\-_\{\}]+)\1/i, function ($0, $1, $2) {
      return 'class=' + $1 + $2 + ' ' + classAppend + $1;
    });
  }
  else if (classes.length) {
    out = out.replace('>', ' class="' + classes.join(' ') + '">');
  }
  // set id
  if (/id=/.test(firstEl) && ids[0]) {
    out = out.replace(/id=(['"]).+?\1/, 'id="' + ids[0] + '"');
  }
  else if (ids[0]) {
    out = out.replace('>', ' id="' + ids[0] + '">');
  }
  // add arbitrary attributes
  for (var i = 0, len = attributes.length; i < len; i++) {
    var attributeParts = attributes[i].match(/^\[([a-z\-]+)([\*^~|\$]?)=(["']?)(.+?)\3\]$/);
    if (attributeParts && attributeParts.length === 5) {
      // correctly matched the attribute
      var attributeName = attributeParts[1];
      var attributeValue = attributeParts[4];
      var attributeEdit = attributeParts[2];
      if (out.indexOf(attributeName + '=') !== -1) {
        var re = new RegExp(attributeName + '=(\'")(.+?)\1');
        if (!attributeEdit) {
          out = out.replace(re, attributeName + '="' + attributeValue + '"');
        }
        else if (attributeEdit === '*' || attributeEdit === '$' || attributeEdit === '~' ) {
          // all of these work if value is at end
          out = out.replace(re, function ($0, $1, $2) {
            return attributeName + '=' + $1 + $2 + ' ' + attributeValue + $1;
          });
        }
        else {
          // value should be at beginning
          out = out.replace(re, function ($0, $1, $2) {
            return attributeName + '=' + $1 + ' ' + attributeValue + $2 + $1;
          });
        }
      }
      else {
        // setting exactly
        out = out.replace('>', ' ' + attributeName + '="' + attributeValue + '">');
      }
    }
  }

  return str.replace(/<.+?>/, out);
}


module.exports = function (env) {
  env.addFilter('addModifier', addModifier);
}
// export a utility version
module.exports.addModifier = addModifier;
