# Autoguide

Node module to automatically build a styleguide/developer guide/whatever from comments in sass files.

By default, the template is built for an Atomic design workflow. [Mine](https://github.com/jhereg00/startup-library), specifically.

Biggest TODO: Template customization through variables.

## Comment Format

Note the 3 \*'s to start the comment block, which tells Autoguide to include the comment.

```
/***
 * Item Title
 *
 * Item Description
 * this can be any number of lines until a variable
 * definition is found.
 *
 * Can also contain _markdown_.
 *
 * variable: value (see below for things the template
 *   listens for, but can be any key/value pair)
 *
 * @attribute name - description
 */
```

## Use

Once included in your file, you can simply call it as a function. You may pass it a few parameters:

* `settings` - optional object of settings to use. Defaults are in place for each of these.
  * `src` - directories to parse for comments. Default: `['./dev/scss/','./dev/js/']`
  * `vars` - directories or files to parse for sass vars. Default: `['./dev/scss/settings/']`
  * `template` - template file to use for [nunjucks](http://mozilla.github.io/nunjucks) rendering. There's one built into the module.
  * `dest` - directory to place a new `index.html` file into. Default: `'./dist/styleguide'`
  * `templateVars` - an object of extra variables to pass to the template
  * `order` - array with the order to sort elements into. Default works for my [startup-library](https://github.com/jhereg00/startup-library)
  * `assetDest` - directory for autoguide specific assets (will contain `css`, `js`, and `images` folders), with the path relative to the value of `dest`. Default: `assets`
* `callback` - callback function. Passed `error` and `true`

#### Example Usage:

```
var autoguide = require('autoguide');

autoguide({
  src: [
    'sass',
    'scripts',
    'notes'
  ],
  dest: 'public/styleguide',
  templateVars: {
    title: 'Super Awesome Styleguide'
  }
}, function (err, success) {
  if (!err)
    console.log ('Super Awesome Styleguide created!');
});
```
