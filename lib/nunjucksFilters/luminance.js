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
 *    {{ "#7f7f7f" | luminance }} == 0.5
 */
// requirements
var Color = require('color');
var simplifyColor = require('./colors.js').simplifyColor;

module.exports = function (env) {
  env.addFilter('luminance', function (str) {
    var c = Color(simplifyColor(str));
    try {
      if (c.values.alpha < 1.0)
        return (100 - ((100 - c.hsl().l) * c.values.alpha)) / 100;
      return c.hsl().l / 100;
    } catch (err) {
      return 1.0;
    }
  });
}
