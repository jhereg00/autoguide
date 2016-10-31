# Autoguide

Node module to automatically build a styleguide/developer guide/whatever from comments in sass files.

By default, the template is built for an Atomic design workflow. [Mine](https://github.com/jhereg00/startup-library), specifically.

Biggest TODO: Template customization through variables.

## Comment Format

Note the 3 \*'s to start the comment block, which tells Autoguide to include the comment.

```scss
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
$sass-variables: 'will also be passed as an object: sassVars';
```

## Use

Once included in your file, you can simply call it as a function. You may pass it a few parameters:

* `settings` - optional object of settings to use. Defaults are in place for each of these.
  * `src` - directories to parse for comments. Default: `['./dev/scss/','./dev/js/']`
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
  * `sassPrepend` - string or array of file(s) to import into the **guide's** css.  Useful for variable overrides or custom component templating.
* `callback` - callback function. Passed `error` and `success` as a boolean

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
* `wrap:` - element(s) to wrap the html content in. Written similar to [Emmet](http://emmet.io/), but significantly less robust. Really just handles tags, classes, and ids. Example: `wrap: div.outer>section.inner` would wrap the html content so that it outputs `<div class="outer"><section class="inner">{{ content }}</section></div>`.  This is useful for elements that inherit styles or when javascript only inits components within certain other elements.
* `path:` - define a path for where to place this within the styleguide.  This overrides the default of placing a component based on it's file location.  Use `.` or `./` to make it top level.
* `order:` - integer of order this component should appear compared to others in the same relative location. If order is defined, it will always be before components without it defined.

## Attributes

* `@modifier .class - description` - description is optional. Each of these adds another html sample to the element's section with the modifier added to the outermost element.
  Additionally, can write a sass style nest. For example: `@modifier .parent &`.
* `@default name - description` - description is optional. If modifiers are present, changes the title 'Default' to name and adds the description before the first, unmodified sample.
* `@param {type} name - description` - type and description are optional. Used to describe parameters/arguments for functions or mixins.
* `@returns {type} name - description` - all components optional, but should probably have at least one.

# Change Log

### 0.3.0
New template, which is much more thorough and exposes many more options.  New features include:
* path override
* arbitrary variable documentation (color palettes, sizing, etc.)
* nested modifiers

**This also includes some breaking changes:**
* `vars` is no longer an option. Instead, comment the areas with your sass variables as you would a component. For example:
  ```scss
  /***
   * Colors
   *
   * Stick only to these approved colors.
   */
  $red: #e01033;
  $blue: #00129a;
  ```
* ..

---

### 0.2
Basic usable version. MVP. Adequate for internal use.

#### 0.2.5
Added `\r` to regex in parser in order to better support Windows.

#### 0.2.4
More cleanup.

#### 0.2.3
**Bugfix:** iframes for html samples can now shrink as well as grow when their contents' size changes.

#### 0.2.2
Client side js cleanup.

#### 0.2.1
Console call cleanup.

#### 0.2.0
Added support for `wrap` variable to wrap samples.

---

### 0.1
Proof of concept and basic parsing.

#### 0.1.3
Added support for defining variables with other variables. For example:
```scss
$black: #070707;
$text: $black;
```
will output a swatch with $text showing the value '#070707'.  Only looks within same file.

#### 0.1.2
Added icons to predicted atomic nav items.  Added buttons to automatically copy the value or variable of color swatches.

#### 0.1.1
First public release.
