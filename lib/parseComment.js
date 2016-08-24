/**
 *  Parses a comment string
 */

function parseComment (comment) {
  // first, strip beginning and end
  comment = comment.replace('/\*\*\*','');
  comment = comment.replace('*/','');
  // next, split into lines
  comment = comment.split(/\n\s*\*/g);
  if (!comment.length) {
    return null;
  }

  // make an object to return
  var out = {};

  // clear useless artifacts
  while (comment[0] === '') {
    comment.shift();
  }

  // start parsing
  var prop = 'description';
  var arrIndex = null;
  var preTrimLength = comment[0].match(/^\s*/)[0].length;
  var preTrimRE = new RegExp('^\\s{' + (preTrimLength) + ',' + (preTrimLength + 2) + '}');
  for (var i = 0, len = comment.length; i < len; i++) {
    comment[i] = comment[i].replace(/\t/,'  ').replace(preTrimRE, '');
    // first thing is title, dummy
    if (!out.title) {
      out.title = comment[i];
      continue;
    }

    // is this declaring a new prop?
    var possibleNewProp = comment[i].match(/^[a-zA-Z0-9_\$]+\s?:\s*/);
    if (possibleNewProp) {
      prop = possibleNewProp[0].replace(/\s?:\s*$/,'');
      comment[i] = comment[i].replace(possibleNewProp[0], '');
      arrIndex = null;
    }

    // adding to an array?
    possibleNewProp = comment[i].match(/^@[a-zA-Z0-9_\$]+(\s+|$)/);
    if (possibleNewProp) {
      prop = possibleNewProp[0].trim().replace('@','');
      comment[i] = comment[i].replace(possibleNewProp[0], '');
      if (!out[prop])
        out[prop] = [];
      arrIndex = out[prop].length;
    }

    // add string prop if we still have a value
    if (arrIndex === null) {
      if (!out[prop] && comment[i] !== '') {
        out[prop] = comment[i];
      }
      else if (out[prop]) {
        out[prop] += '\n' + comment[i];
      }
    }
    else {
      // dealing with an array
      if (!out[prop][arrIndex] && comment[i] !== '') {
        out[prop][arrIndex] = comment[i];
      }
      else if (out[prop][arrIndex]) {
        out[prop][arrIndex] += '\n' + comment[i];
      }
    }
  }

  // cleanup
  for (var prop in out) {
    if (typeof out[prop] === 'string')
      out[prop] = out[prop].trim().replace(/\n$/,'');
    else {
      for (var i = 0, len = out[prop].length; i < len; i++) {
        out[prop][i] = out[prop][i].trim().replace(/^\n|\n$/g,'');
        var itemObj = {};
        type = out[prop][i].match(/^\{\w+\}/);
        if (type) {
          itemObj.type = type[0].replace(/^\{|\}$/g,'');
          out[prop][i] = out[prop][i].replace(type[0],'').trim();
        }
        out[prop][i] = out[prop][i].replace(/(\s+\-\s+)|\n/,'%split%').split('%split%');
        if (out[prop][i][0]) {
          itemObj.name = out[prop][i][0];
        }
        if (out[prop][i][1]) {
          itemObj.description = out[prop][i][1];
        }
        out[prop][i] = itemObj;
      }
    }
  }

  return out;
}

module.exports = parseComment;
