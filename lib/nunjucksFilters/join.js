/***
 *  Join filter
 *
 *  Replaces the default Nunjucks join filter with one that doesn't error out if
 *  passed a string.  Instead, just returns the string itself.
 *
 *  code:
 *    {{ [1,2,3] | join('-') }} == "1-2-3"
 *    {{ "1,2,3" | join('-') }} == "1,2,3"
 */
// override default join that sucks at error handling
module.exports = function (env) {
  env.addFilter('join', function(str, joiner) {
    if (str instanceof Array)
      return str.join(joiner);
    else
      return str;
  });
}
