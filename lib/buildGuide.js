/**
 *  Does the actual guide building
 */

// requirements
var parseDirectory = require('./parseDirectory');
var parseSassVars = require('./parseSassVars');
var sortComments = require('./sortComments');

var fs = require('fs');
var mkpath = require('mkpath');
var env = require('./nunjucksEnv');

// settings
var DEFAULT_SETTINGS = {
  src: ['./dev/scss/utilites/'],//'./dev/scss/','./dev/js/'],
  vars: ['./dev/scss/settings/'],
  template: __dirname + '/../nunjucks/index.njk',
  dest: './dist/styleguide',
  templateVars: {
    showDev: true,
    footerMessage: "Created using <a href=\"https://github.com/jhereg00/autoguide\" target=\"_blank\">Autoguide</a>."
  },
  order: null,
  assetPath: 'assets',
  assetDest: null,
  styles: ['assets/css/autoguide.css'],
  scripts: ['assets/js/autoguide.js']
}


// do the work
function buildGuide (settings, cb) {
  // rebuild nunjucks environment while in dev mode
  if (global.devMode)
    env = require('./nunjucksEnv').rebuild();
  // add default settings
  settings = settings || {};
  for (var prop in DEFAULT_SETTINGS) {
    if (settings[prop] === undefined)
      settings[prop] = DEFAULT_SETTINGS[prop];
  }
  if (settings.assetDest === null) {
    settings.assetDest = settings.dest + '/' + settings.assetPath;
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
      settings.templateVars.assetPath = settings.assetPath;
      settings.templateVars.styles = settings.styles;
      settings.templateVars.scripts = settings.scripts;
      // now make the template
      env.render(settings.template, settings.templateVars, function (err, res) {
        if (err)
          throw err;

        mkpath(settings.dest, function (err) {
          if (err)
            throw err;

          fs.writeFile(settings.dest + 'index.html', res.replace(/\n\s*\n+\s*/g,'\n'), function (err) {
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

  // meanwhile, update the assets
  function copyAssetDir (dir) {
    mkpath(settings.assetDest + dir, function (err) {
      if (err)
        throw err;
      fs.readdir(__dirname + '/../dist/assets' + dir, function (err, filenames) {
        if (err)
          throw err;

        filenames.forEach(function (f) {
          fs.createReadStream(__dirname + '/../dist/assets' + dir + '/' + f)
            .pipe(fs.createWriteStream(settings.assetDest + dir +'/' + f));
        });
      });
    });
  }
  copyAssetDir('/css');
  copyAssetDir('/js');
  copyAssetDir('/fonts');
}

module.exports = buildGuide;
