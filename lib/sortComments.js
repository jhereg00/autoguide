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
  'utilities'
]

function sortComments (comments, objectOrder) {
  var out = [];
  var sections = {};

  objectOrder = objectOrder || OBJECT_ORDER;

  // first, let's switch filepaths to arrays
  comments.forEach(function (c) {
    c.filePath = c.filePath.split(/[\/\\]/);
  });

  // second, let's reorder by directory depth
  comments = comments.sort(function (a, b) {
    if (a.filePath.length < b.filePath.length)
      return -1;
    else if (a.filePath.length === b.filePath.length)
      return a.title < b.title ? -1 : 1;
    else
      return 1;
  });

  // now, let's start filling out the sections
  var startDepth = comments[0].filePath.length - 1; // comment[0] will have the shortest path at this point
  comments.forEach(function (c) {
    var objectPath = 'sections';
    for (var i = startDepth; i < c.filePath.length; i++) {
      if (eval(objectPath) === undefined)
        eval(objectPath + ' = {}');
      if (i - startDepth > 0) {
        objectPath += '.subElements';
        if (eval(objectPath) === undefined)
          eval(objectPath + ' = []');

        objectPath += '[' + eval(objectPath).length + ']';
      }
      else if (i == c.filePath.length - 1) {
        objectPath += '["' + c.title.toLowerCase() + '"]';
      }
      else {
        objectPath += '["' + c.filePath[i] + '"]';
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
