/***
 *  Split filter
 *
 *  Splits a string using the basic javascript String.prototype.split(separator).
 *
 *  code:
 *    {% set arr = myString | split(',') %}
 */
module.exports = function (env) {
  env.addFilter('split', function(str, separator) {
    return str.split(separator);
  });
}
