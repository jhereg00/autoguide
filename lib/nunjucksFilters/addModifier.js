/***
 *  Add Modifier Filter
 *
 *  Adds a modifier to the outermost element of an HTML string.
 *
 *  code:
 *    {{ "<div>Foo</div>" | addModifier (".bar") }} == <div class="bar">Foo</div>
 */
var addModifier = function(str, modifier) {
  // split the modifier into its components
  var mods = modifier.match(/[\.#\[][a-zA-Z\-_"]+/g);
  // sort the mods
  var classes = [];
  var ids = [];
  for (var i = 0, len = mods.length; i < len; i++) {
    if (/^\./.test(mods[i])) {
      classes.push(mods[i].replace(/^\./,''));
    }
    else if (/^#/.test(mods[i])) {
      ids.push(mods[i].replace(/^#/,''));
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

  return str.replace(/<.+?>/, out);
}


module.exports = function (env) {
  env.addFilter('addModifier', addModifier);
}
// export a utility version
module.exports.addModifier = addModifier;
