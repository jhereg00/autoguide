/***
 *  Contains filter
 *
 *  Returns a boolean if string or array contains passed value.
 *
 *  code:
 *    {{ [1,2,3] | contains(2) }} == true
 */
module.exports = function (env) {
  env.addFilter('contains', function(val, check) {
    return val.indexOf(check) !== -1;
  });
}
