/**
 *  Sorts comments into usable order
 *  Assumes Atomic workflow
 *
 *  @param {array} comments
 *  @param {array} objectOrder
 */

//var util = require('util');

// settings
var OBJECT_ORDER = [
  'colors',
  'fonts',
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

// helpers
function normalizeTitle (title) {
  return title.replace(/[A-Z]/g,function ($0) { return " " + $0.toLowerCase(); }).trim().replace(/\s+/g,' ');
}

function sortComments (comments, objectOrder) {
  var out = [];
  var sections = {};

  objectOrder = objectOrder || OBJECT_ORDER;

  // reorder by directory depth and order variable
  comments = comments.sort(function (a, b) {
    if (a.depth < b.depth)
      return -1;
    else {
      if (a.order !== undefined && b.order !== undefined) {
        if (a.order < b.order)
          return -1;
        else if (a.order > b.order)
          return 1;
      }
      else if (a.order !== undefined && b.order === undefined) {
        return -1;
      }
      else if (a.order === undefined && b.order !== undefined) {
        return 1;
      }
      // fall back to title
      return a.title < b.title ? -1 : 1;
    }
  });

  // now, let's start filling out the sections
  comments.forEach(function (c) {
    var path = c.path || c.filePath;
    var objectPath = 'sections';
    var startDepth = c.path ? 0 : path.length - c.depth;

    // path variable doesn't include file name, so stop 1 later
    for (var i = startDepth; i < (c.path ? path.length + 1 : path.length); i++) {
      var titleAtDepth = path[i] ? normalizeTitle(path[i]) : '';
      if (c.depth !== 1 && eval(objectPath) === undefined && i - startDepth > 0) {
        eval(objectPath + ' = { ' +
          'title: "' + normalizeTitle(path[i - 1]) + '",' +
          'depth: ' + (i - startDepth) + ',' +
          'generated: true }');
      }
      if (i - startDepth > 0) {
        objectPath += '.subElements';
        if (eval(objectPath) === undefined)
          eval(objectPath + ' = []');

        var found = false;
        for (var j = 0, len = eval(objectPath).length; j < len; j++) {
          if (normalizeTitle(eval(objectPath)[j].title) === titleAtDepth) {
            found = true;
            objectPath += '[' + j + ']';
            break;
          }
        }
        if (!found)
          objectPath += '[' + eval(objectPath).length + ']';
      }
      // stop digging if at end and NOT using path override
      else if (!c.path && i === path.length - 1) {
        objectPath += '["' + normalizeTitle(c.title) + '"]';
      }
      else {
        objectPath += '["' + titleAtDepth + '"]';
      }
    }

    eval(objectPath + ' = c');
  });

  // build the output array
  for (var i = 0, len = objectOrder.length; i < len; i++) {
    if (sections[objectOrder[i]])
      out.push(sections[objectOrder[i]]);
    else if (objectOrder[i] === '*')
      for (var s in sections) {
        if (objectOrder.indexOf(s) === -1)
          out.push(sections[s]);
      }
  }

  //console.log(util.inspect(sections,{showHidden: false, depth: null}));

  return out;
}

module.exports = sortComments;
