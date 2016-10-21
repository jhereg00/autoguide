/***
 * Color String Filter
 *
 * Converts a string to an rgba() string for use. Handles a few basic sass color
 * functions.  Internal logic is handled with the [color](https://www.npmjs.com/package/color)
 * node module.
 *
 * Warning, darken and lighten sometimes experience some rounding errors.
 *
 * Sass functions implemented:
 * - mix
 * - darken
 * - lighten
 * - rgba with hex as first argument
 *
 * code:
 *   {{ "#333" | color }} == "rgba(51,51,51,1)"
 *   {{ "rgba(#333, .5)" | color }} == "rgba(51,51,51,1)"
 *   {{ "mix(#000, #fff, 50%)" | color }} == "rgba(127,127,127,1)"
 */
// requirements
var Color = require('color');

// regexes
var re = {
  // $1: function name, $2: arguments (not split)
  fn: /^(\w+)\((.+?)\);?$/,
  hex: /^#?([0-9a-f]{3}|[0-9a-f]{6})$/
}

function returnString (color) {
  if (color.values.alpha < 1)
    return color.rgbString();
  else
    return color.hexString();
}

// handlers
var handlers = {
  'rgb': function (args) {
    args = args.split(/\s*,\s*/g);
    if (args.length === 3) {
      return Color().rgb(args).hexString();
    }
    else if (args.length === 1) {
      try {
        return Color(args[0]).hexString();
      } catch (err) {
        return err.toString();
      }
    }
    else {
      return 'unexpected arguments passed to rgb';
    }
  },
  'rgba': function (args) {
    args = args.split(/\s*,\s*/g);
    if (args.length === 4) {
      return 'rgb(' + args.join(',') + ')';
    }
    else if (args.length === 2) {
      try {
        return returnString(Color(args[0]).alpha(args[1]));
      } catch (err) {
        return err.toString();
      }
    }
    else {
      return 'unexpected arguments passed to rgb';
    }
  },
  'mix': function (args) {
    args = args.match(/[^,]+?(\(.+?\))?(?=(,|$))/g);
    args[0] = Color(passToHandler(args[0]));
    args[1] = Color(passToHandler(args[1]));
    var weight = .5;
    if (args[2]) {
      weight = parseInt(args[2],10) / 100;
    }
    var color = args[0].mix(args[1], weight);
    return returnString(color);
  },
  'darken': function (args) {
    args = args.match(/[^,]+?(\(.+?\))?(?=(,|$))/g);
    args[0] = Color(passToHandler(args[0]));
    args[1] = parseFloat(args[1],10);
    var color = args[0].lightness(args[0].hsl().l - args[1]);
    return returnString(color);
  },
  'lighten': function (args) {
    args = args.match(/[^,]+?(\(.+?\))?(?=(,|$))/g);
    args[0] = Color(passToHandler(args[0]));
    args[1] = parseFloat(args[1],10);
    var color = args[0].lightness(args[0].hsl().l + args[1]);
    return returnString(color);
  }
}

// actual filter
// parses `string` and sends to handler
function passToHandler (string) {
  var fnMatch = string.match(re.fn);
  var hexMatch = string.match(re.hex);
  if (fnMatch) {
    if (handlers[fnMatch[1].toLowerCase()]) {
      return handlers[fnMatch[1].toLowerCase()](fnMatch[2]);
    }
  }
  else if (hexMatch) {
    var color = Color(hexMatch[0]);
    return returnString(color);
  }
  try {
    return returnString(Color(string));
  } catch (err) {
    return 'white';
  }
}

module.exports = function (env) {
  env.addFilter('color', function (str) {
    return passToHandler(str);
  });
}
module.exports.simplifyColor = passToHandler;
