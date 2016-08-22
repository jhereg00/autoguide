/**
 *  Sorts comments into usable order
 *  Assumes Atomic workflow
 *
 *  @param {array} comments
 *  @param {array} objectOrder
 */

// settings
var OBJECT_ORDER = [
  'quarks',
  'atoms',
  'molecules',
  'organisms',
  '*',
  'utilities',
  'scss',
  'nunjucks filters',
  'scripts',
  'lib',
  'app',
  'objects',
  'js'
]

function sortComments (comments, objectOrder) {
  var out = [];
  var sections = {};

  objectOrder = objectOrder || OBJECT_ORDER;

  // reorder by directory depth
  comments = comments.sort(function (a, b) {
    if (a.depth < b.depth)
      return -1;
    else if (a.depth === b.depth)
      return a.title < b.title ? -1 : 1;
    else
      return 1;
  });

  // now, let's start filling out the sections
  comments.forEach(function (c) {
    var objectPath = 'sections';
    var startDepth = c.filePath.length - c.depth;
    for (var i = c.filePath.length - c.depth; i < c.filePath.length; i++) {
      if (eval(objectPath) === undefined && i - startDepth > 0)
        eval(objectPath + ' = { title: "' + c.filePath[i - 1].replace(/[A-Z]/g,function ($0) { return " " + $0.toLowerCase(); }) + '"}');
      if (i - startDepth > 0) {
        objectPath += '.subElements';
        if (eval(objectPath) === undefined)
          eval(objectPath + ' = []');

        objectPath += '[' + eval(objectPath).length + ']';
      }
      else if (i === c.filePath.length - 1) {
        objectPath += '["' + c.title.toLowerCase() + '"]';
      }
      else {
        objectPath += '["' + c.filePath[i].replace(/[A-Z]/g,function ($0) { return " " + $0.toLowerCase(); }) + '"]';
      }
    }

    eval(objectPath + ' = c');
  });

  // build the output array
  for (var i = 0, len = objectOrder.length; i < len; i++) {
    if (sections[objectOrder[i]])
      out.push(sections[objectOrder[i]]);
    else if (objectOrder[i] === '*')
      for (var s in sections)
        if (objectOrder.indexOf(s) === -1)
          out.push(sections[s]);
  }

  return out;
}

module.exports = sortComments;
