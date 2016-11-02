/**
 *  Does the actual guide building
 */

// requirements
var parseDirectory = require('./parseDirectory');
var sortComments = require('./sortComments');

var fs = require('fs');
var mkpath = require('mkpath');
var env = require('./nunjucksEnv');
var sass = require('node-sass');

// settings
var DEFAULT_SETTINGS = {
  src: ['./dev/scss/','./dev/js/'],
  template: __dirname + '/../nunjucks/index.njk',
  dest: './dist/styleguide',
  templateVars: {
    showDev: true,
    footerMessage: "Created using <a href=\"https://github.com/jhereg00/autoguide\" target=\"_blank\">Autoguide</a>."
  },
  order: null,
  assetPath: 'assets',
  assetDest: null,
  styles: ['https://fonts.googleapis.com/css?family=Droid+Serif|Lato:300,700|Source+Code+Pro','assets/css/autoguide.css'],
  scripts: ['assets/js/autoguide.js'],
  sassPrepend: null
}

// helper
function extend (a, b) {
  var out = {};
  for (var prop in a) {
    if (b[prop] !== undefined) {
      if (typeof a[prop] === 'object')
        out[prop] = extend(a[prop], b[prop]);
      else
        out[prop] = b[prop];
    }
    else {
      out[prop] = a[prop];
    }
  }
  for (var prop in b) {
    if (out[prop] === undefined)
      out[prop] = b[prop];
  }
  return out;
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
    else if (typeof settings[prop] === 'object' && !(settings[prop] instanceof Array)) {
      settings[prop] = extend(DEFAULT_SETTINGS[prop], settings[prop]);
    }
  }
  if (settings.assetDest === null) {
    settings.assetDest = settings.dest + '/' + settings.assetPath;
  }

  if (!/\/$/.test(settings.dest))
    settings.dest += '/';

  // go get our shit
  var done = 0,
      toCheck = settings.src.length,
      elements = [],
      vars = [];
  function checkDone () {
    ++done;
    if (done === toCheck) {
      // actually done
      // sort the elements
      elements = sortComments(elements, settings.order);
      settings.templateVars.elements = elements;
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
  function buildSass () {
    // dynamically rerender our sass with sassPrepend included
    var fauxFile = '';
    if (settings.sassPrepend instanceof Array) {
      for (var i = 0, len = settings.sassPrepend.length; i < len; i++) {
        fauxFile += '@import "' + settings.sassPrepend[i] + '";\n';
      }
    }
    else
      fauxFile += '@import "' + settings.sassPrepend + '";\n';
    fauxFile += '@import "' + __dirname + '/../dev/scss/autoguide.scss";\n';
    sass.render({
      data: fauxFile,
      includePaths: [__dirname + '/../dev/scss/', './']
    }, function (err, result) {
      if (err) {
        console.error(err);
      }
      else {
        mkpath(settings.assetDest + '/css', function (err) {
          if (err)
            throw err;
          fs.createWriteStream(settings.assetDest + '/css/autoguide.css')
            .end(result.css.toString(), 'utf8');
        });
      }
    })
  }
  if (!settings.sassPrepend)
    copyAssetDir('/css');
  else
    buildSass();
  copyAssetDir('/js');
  copyAssetDir('/fonts');
}

module.exports = buildGuide;
