/***
 *  Luminance filter
 *
 *  Returns a luminance value between 0 and 1 of a color.
 *
 *  Accepts formats "#000", "#000000", "rgb(0,0,0)", and "rgba(0,0,0,1)". The
 *  alpha channel is ignored for rgba.
 *
 *  code:
 *    {{ "#fff" | luminance }} == 1.0
 *    {{ "#888" | luminance }} == 0.5
 */

// helpers
function hexToRgb (hex) {
  // make sure hex is a nice, readable 6 digit string
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbStringToRgb (str) {
  var result = /^rgba?\((\d{1,3})\s?,\s?(\d{1,3})\s?,\s?(\d{1,3})\s?(,\s?[\.\d]+)\)$/i.exec(str);
  return result ? {
    r: result[1],
    g: result[2],
    b: result[3]
  } : null
}

function yiq (rgb) {
  return ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000 / 255;
}

module.exports = function (env) {
  env.addFilter('luminance', function (str) {
    var rgb = hexToRgb(str) || rgbStringToRgb(str) || null;
    if (rgb !== null) {
      return yiq (rgb);
    }
    return -1.0;
  });
}
