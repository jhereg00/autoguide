/***
 *  Dump function
 *
 *  Outputs variable contents.
 *
 *  code:
 *    {{ dump(myVar) }}
 */
module.exports = function (env) {
  env.addGlobal('dump', function(data) {
    if (typeof data == 'object') {
      return "<pre>" + JSON.stringify(data, null, '  ') + "</pre>";
    }
    else {
      return "<pre>" + data + " (" + (typeof data) + ")</pre>";
    }
  });
}
