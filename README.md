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
 * @attribute {type} name - description
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
    * `showDev` - boolean for if sections with only code components should show by default. Default: `true`.
    * `footerMessage` - string to put in the footer, parsed with markdown. I appreciate attribution...
  * `order` - array with the order to sort elements into. Default works for my [startup-library](https://github.com/jhereg00/startup-library)
  * `assetPath` - server path to autoguide specific assets, with the path relative to the value of `dest`. Default: `assets`
  * `assetDest` - file path to autoguide specific assets (will contain `css`, `js`, and `images` folders). Default: assetPath from dest
  * `styles` - array of path(s) to css file(s) for the elements. These are the stylesheets that will be included _within_ the iframes that the html samples are placed in.  The paths need to be what you'd put in the `href` attibute of your `link` tag. Default: ['assets/css/autoguide.css'].
  * `scripts` - array of path(s) to javascript file(s) for the elements. These are the scripts that will be included _within_ the iframes that the html samples are placed in.  The paths need to be what you'd put in the `src` attibute of your `script` tag. Default: ['assets/js/autoguide.js'].
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

# Builtin Components

These components will output to the styleguide when using the default template.

## Vars

* `html:` - code to use in creating a sample iframe.
* `code:` - code to output in a code block. Good for examples of scripts or mixin usage.

## Attributes

* `@modifier .class - description` - description is optional. Each of these adds another html sample to the element's section with the modifier added to the outermost element.
* `@default name - description` - description is optional. If modifiers are present, changes the title 'Default' to name and adds the description before the first, unmodified sample.
* `@param {type} name - description` - type and description are optional. Used to describe parameters/arguments for functions or mixins.
* `@returns {type} name - description` - all components optional, but should probably have at least one.

# Improvements

No promises on when I'd get to such things, but some additional features I'd like to add:
* theming / better customization options
* sorting support for other common systems
* more "branding" type sections, similar to the color and font sections
