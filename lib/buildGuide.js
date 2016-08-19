/**
 *  Does the actual guide building
 */

// requirements
var parseDirectory = require('./parseDirectory');
var parseSassVars = require('./parseSassVars');
var sortComments = require('./sortComments');

var fs = require('fs');
var nunjucks = require('nunjucks');
var mkpath = require('mkpath');

// settings
var DEFAULT_SETTINGS = {
  src: ['./dev/scss/','./dev/js/'],
  vars: ['./dev/scss/settings/'],
  template: __dirname + '/../nunjucks/index.njk',
  dest: './dist/styleguide',
  templateVars: {},
  order: null
}

// do the work
function buildGuide (settings, cb) {
  // add default settings
  settings = settings || {};
  for (var prop in DEFAULT_SETTINGS) {
    if (settings[prop] === undefined)
      settings[prop] = DEFAULT_SETTINGS[prop];
  }

  if (!/\/$/.test(settings.dest))
    settings.dest += '/';

  // go get our shit
  var done = 0,
      toCheck = settings.src.length + settings.vars.length,
      elements = [],
      vars = [];
  function checkDone () {
    ++done;
    if (done === toCheck) {
      // actually done
      // sort the elements
      elements = sortComments(elements, settings.order);
      settings.templateVars.elements = elements;
      settings.templateVars.vars = vars;
      // now make the template
      nunjucks.render(settings.template, settings.templateVars, function (err, res) {
        if (err)
          throw err;

        mkpath(settings.dest, function (err) {
          if (err)
            throw err;

          fs.writeFile(settings.dest + 'index.html', res, function (err) {
            if (err)
              throw err;

            if (cb)
              cb (err, true);
          });
        });
      });
    }
  }

  settings.src.forEach(function (src) {
    parseDirectory(src, function (err, data) {
      if (err)
        throw err;

      if (data && data.length) {
        elements = elements.concat(data);
      }
      checkDone();
    });
  });
  settings.vars.forEach(function (src) {
    parseSassVars(src, function (err, data) {
      if (err)
        throw err;

      if (data && data.length) {
        vars = vars.concat(data);
      }
      checkDone();
    });
  });
}

module.exports = buildGuide;
