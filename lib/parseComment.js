/**
 *  Parses a comment string
 */
//requirements
var parseSassVars = require('./parseSassVars');

function parseComment (comment, content) {
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
  var preTrimRE = new RegExp('^\\s{' + (preTrimLength) + '}');
  for (var i = 0, len = comment.length; i < len; i++) {
    comment[i] = comment[i].replace(/\t/,'\s\s').replace(preTrimRE, '');
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

    // in code?
    if (prop === 'code' || prop === 'html') {
      // then strip a bit more whitespace
      comment[i] = comment[i].replace(preTrimRE,'').replace(/^ ([^ ])/,function ($0, $1) { return $1; });
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

  // if we have content, check it for vars
  var sassVars = content ? parseSassVars(content) : null;
  if (sassVars) {
    out.sassVars = sassVars;
  }

  // cleanup
  out = cleanup(out);

  return out;
}

function cleanup (out) {
  for (var prop in out) {
    if (typeof out[prop] === 'string')
      out[prop] = out[prop].trim().replace(/\n$/,'');
    else if (out[prop] instanceof Array){
      for (var i = 0, len = out[prop].length; i < len; i++) {
        out[prop][i] = out[prop][i].trim().replace(/^\n|\n$/g,'');
        var itemObj = {};
        type = out[prop][i].match(/^\{.+\}/);
        if (type) {
          itemObj.type = type[0].replace(/^\{|\}$/g,'');
          out[prop][i] = out[prop][i].replace(type[0],'').trim();
        }
        out[prop][i] = out[prop][i].replace(/(\s+\-\s+)|\n/,'%split%').split('%split%');
        if (out[prop][i][0]) {
          itemObj.name = out[prop][i][0];
        }
        if (out[prop][i][1]) {
          // parse sub arrays
          var descriptionLines = out[prop][i][1].split('\n');
          itemObj.description = "";
          // somewhat repeats the above parsing, but only looking for @props
          var jprop = 'description';
          var arrIndex = null;
          for (var j = 0, jlen = descriptionLines.length; j < jlen; j++) {
            var line = descriptionLines[j];
            var m = /^\s*(\@([a-zA-Z0-9_\$]+))/.exec(line);
            if (m) {
              jprop = m[2];
              if (!itemObj[jprop])
                itemObj[jprop] = [];
              arrIndex = itemObj[jprop].length;
              line = line.replace('@' + jprop, '');
            }
            if (arrIndex !== null) {
              if (!itemObj[jprop][arrIndex] && line !== '') {
                itemObj[jprop][arrIndex] = line;
              }
              else
                itemObj[jprop][arrIndex] += line;
            }
            else {
              itemObj[jprop] += '\n' + line;
            }
          }
        }
        out[prop][i] = cleanup(itemObj);
      }
    }
  }

  return out;
}

module.exports = parseComment;
