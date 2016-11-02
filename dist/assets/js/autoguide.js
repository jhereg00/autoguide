(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/***
 * Collapsable
 *
 * Auto-initialized class that looks for `.js-collapsable` with `.js-collapsable__toggle`
 * and `.js-collapsable__content`.
 *
 * Add the class `is-open` to the `.js-collapsable` element to have it open itself
 * immediately.  `is-open` is also the state class that gets toggled.
 *
 * @param {DOMElement} element
 *   expected to have children with `.js-collapsable__toggle` and `.js-collapsable__content`
 *
 * @method {void} toggle() - toggles open/closed
 * @method {void} open() - opens __content, or does nothing if already open
 * @method {void} close() - closes __content, or does nothing if already closed
 *
 * @prop {boolean} isOpen
 *
 * html:
 *   <div class="js-collapsable">
 *     <button class="js-collapsable__toggle">Toggle</button>
 *     <div class="js-collapsable__content">
 *       <ul><li>fill</li><li>some</li><li>space</li></ul>
 *     </div>
 *   </div>
 *
 * js:
 *   // create (not necessary, since it already looks for all .js-collapsable elements)
 *   var collapsable = new Collapsable (document.querySelector('.js-collapsable'));
 *   // toggle it open/closed
 *   collapsable.toggle();
 */
// requirements

// settings

// main class
var Collapsable = function (element) {
  this.element = element;
  this.toggleElement = element.querySelector('.js-collapsable__toggle');
  this.contentElement = element.querySelector('.js-collapsable__content');

  if (!this.element || !this.toggleElement || !this.contentElement) {
    return console.error(this.element, this.toggleElement, this.contentElement);
  }
  else {
    var _this = this;
    this.toggleElement.addEventListener('click', function (e) {
      e.preventDefault();
      _this.toggle();
    });

    if (this.element.classList.contains('is-open')) {
      this.open();
    }
  }
}
Collapsable.prototype = {
  toggle: function () {
    return this.isOpen ? this.close() : this.open();
  },
  open: function () {
    this.element.classList.add('is-open');
    this.contentElement.style.height = this.contentElement.scrollHeight + 'px';
    this.isOpen = true;
  },
  close: function () {
    this.element.classList.remove('is-open');
    this.contentElement.style.height = '0';
    this.isOpen = false;
  }
}

// init them all
var collapsableEls = document.querySelectorAll('.js-collapsable');
for (var i = 0, len = collapsableEls.length; i < len; i++) {
  new Collapsable(collapsableEls[i]);
}

},{}],2:[function(require,module,exports){
/***
 *  Copyable
 *
 *  Makes an element clickable, copying a string to the user's clipboard.  To see
 *  how it looks, check out [the html sample](#/atoms/copyable-element).
 *
 *  Initializes automatically on elements with `[data-copy]` as an attribute.
 *
 *  @param {DOMElement} element
 *  @param {string} string to copy
 *
 *  @method {DOMElement} makeInput() - internal function to make the input from
 *    which the string will be copied.
 *  @method copy() - copies string to clipboard. Listener is automatically added,
 *    so you shouldn't need to manually call this.
 */
// requirements
var forEach = require('lib/util/forEach');

// settings

// the class
var Copyable = function (element, string) {
  this.element = element;
  this.string = string;

  if (document.execCommand) {
    document.body.classList.add('copyable-enabled');
    this.makeInput();
    var _this = this;
    this.element.addEventListener('click', function (e) {
      e.preventDefault();
      _this.copy();
    });
  }
}
Copyable.prototype = {
  makeInput: function () {
    this.input = document.createElement('input');
    this.input.classList.add('visuallyhidden');
    this.input.value = this.string;
    return this.input;
  },
  copy: function () {
    this.element.parentNode.insertBefore(this.input, this.element);
    this.input.select();
    try {
      document.execCommand('copy');
    } catch (err) {};
    this.input.blur();
    this.input.remove();
  }
}

// auto-generate
var copyables = [];
var copyableEls = document.querySelectorAll('[data-copy]');
forEach(copyableEls, function (el) {
  copyables.push(new Copyable (el, el.getAttribute('data-copy')));
});

module.exports = Copyable;

},{"lib/util/forEach":9}],3:[function(require,module,exports){
/***
 * HTML Sample
 *
 * The iframes that show an example of the output of a component.
 */

/***
 *  Make All Html Samples
 *
 *  Searches for all `<make-iframe>` elements and does just that: makes them iframes.
 *  It also includes the stylesheets and scripts present in the window level `ag`
 *  object.  Those should be populated by the template.
 *
 *  js:
 *    require('app/HtmlSample').makeAll(); // goes through the whole page and does its thing
 *
 *  path: ./app/html_sample
 */
// requirements
var forEach = require('lib/util/forEach');

// settings

// helpers
/**
 * Get document height (stackoverflow.com/questions/1145850/)
 *
 * @param  {Document} doc
 * @return {Number}
 */
function getDocumentHeight (doc) {
  doc = doc || document;
  var body = doc.body;
  var html = doc.documentElement;

  if (!body || !html)
    return 0;

  return Math.max(
    body.offsetHeight,
    html.offsetHeight
  );
}

// do things!
// get some meta tags
var metas = document.querySelectorAll('meta');
var styles, scripts;
var samples = [];

/***
 *  `HtmlSample` Class
 *
 *  Controls an individual HTML Sample, which is an iframe that loads the css and
 *  scripts that the styleguide is meant to show. It includes the stylesheets and
 *  scripts present in the window level `ag` object.
 *
 *  @param {DOMElement} sourceElement - the element to turn into an iframe
 *
 *  @method {void} buildContent() - builds a string of the element as a full html document
 *    and assigns it as the document of the iframe.
 *  @method {void} autoHeight() - alters the height of the iframe to be the minimum needed to
 *    eliminate a scrollbar.  Automatically called on a per animation frame basis.
 *  @method {DOMElement} getDocument() - returns the iframe's document object
 *  @method {void} toggleGrid() - adds/removes the 'show-grid' class to the <html> element
 *    so we can show a grid overlay
 *  @method {void} setWidth(width) - sets the width of the iframe, useful for showing
 *    media queries
 *    @param {int} width - width in pixels. Resets to default size if falsy
 *
 *  @prop element - the actual iframe element
 *
 *  path: ./app/html_sample
 *  order: 0
 */
var HtmlSample = function (sourceElement) {
  this.sourceElement = sourceElement;
  this.element = document.createElement('iframe');
  this.element.setAttribute('class', this.sourceElement.getAttribute('class'));

  this.buildContent();
  this.sourceElement.parentNode.replaceChild(this.element, this.sourceElement);

  var _this = this;
  (function checkIframeHeight () {
    _this.autoHeight();
    requestAnimationFrame(checkIframeHeight);
  })();

  samples.push(this);
}
HtmlSample.prototype = {
  /**
   *  buildContent creates a string to use as the document for the iframe
   */
  buildContent: function () {
    var content = '<!doctype html>';
    content += '<html class="show-dev ' + (this.sourceElement.classList.contains('fs') ? 'fs' : 'not-fs') + '"><head>';
    forEach(metas,function (meta) {
      content += meta.outerHTML;
    });
    forEach(styles,function (style) {
      content += '<link rel="stylesheet" href="' + style + '">';
    });
    content += '</head><body>';
    content += this.sourceElement.innerHTML;
    forEach(scripts,function (script) {
      content += '<script src="' + script + '"></script>';
    });
    content += "</body></html>";
    this.element.srcdoc = content;
  },
  /**
   *  autoHeight updates the height of the iframe to exactly contain its content
   */
  autoHeight: function () {
    var doc = this.getDocument();
    if (doc) {
      var docHeight = getDocumentHeight(doc);
      if (docHeight != this.element.height)
        this.element.setAttribute('height', docHeight);
    }
  },
  /**
   *  getDocument gets the internal document of the iframe
   */
  getDocument: function () {
    return this.element.contentDocument || (this.element.contentWindow && this.element.contentWindow.document);
  },
  /**
   *  adds/removes the 'show-grid' class to the <html> element so we can show a grid overlay
   */
  toggleGrid: function () {
    this.getDocument().getElementsByTagName('html')[0].classList.toggle('show-grid');
  },
  /**
   *  sets the width of the iframe, useful for showing media queries
   */
  setWidth: function (w) {
    if (w) {
      this.element.style.width = w + 'px';
      this.element.classList.add('resized');
    }
    else {
      this.element.style.width = '';
      this.element.classList.remove('resized');
    }
  }
}

function makeHtmlSamples () {
  // get styles and scripts
  styles = window.ag && window.ag.styles || [];
  scripts = window.ag && window.ag.scripts || [];
  // get all our custom elements
  var els = document.getElementsByTagName('make-iframe');
  for (var i = els.length - 1; i > -1; i--) {
    new HtmlSample(els[i]);
  };
}

/**
 *  Toggle HTML Sample Grids
 *
 *  Toggles a `.show-grid` class on the `<html>` element inside all the
 *  iframes.  With the in-frame.css stylesheet included, this will turn on a 12
 *  column grid overlay.
 *
 *  js:
 *    require('app/HtmlSample').toggleGrids()
 *
 *  path: ./app/html_sample
 */
var toggleGrids = function () {
  forEach(samples, function (s) {
    s.toggleGrid();
  });
}

/***
 *  setWidths
 *
 *  Sets all `HtmlSample`s to the provided width.
 *
 *  js:
 *    require('app/HtmlSample').setWidths(width);
 *
 *  @param {int} width
 *
 *  path: ./app/html_sample
 */
var setWidths = function (w) {
  forEach(samples, function (s) {
    s.setWidth(w);
  });
}

module.exports = HtmlSample;
module.exports.makeAll = makeHtmlSamples;
module.exports.toggleGrids = toggleGrids;
module.exports.setWidths = setWidths;

},{"lib/util/forEach":9}],4:[function(require,module,exports){
/**
 *  handle hashchange
 */
// requirements
var animateScroll = require('lib/animateScrollTo');
var getPageOffset = require('lib/getPageOffset');

// settings
var OFFSET = 32;

// listener
window.addEventListener('hashchange', function (e) {
  e.preventDefault();
  var el = document.getElementById(window.location.hash.replace(/^#/,''));
  animateScroll(getPageOffset(el).top - OFFSET);
});

},{"lib/animateScrollTo":6,"lib/getPageOffset":8}],5:[function(require,module,exports){
/**
 *  whole damn script
 *
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */
require('app/HtmlSample').makeAll();
require('app/hashchange');
require('app/Copyable');
require('app/Collapsable');

},{"app/Collapsable":1,"app/Copyable":2,"app/HtmlSample":3,"app/hashchange":4}],6:[function(require,module,exports){
/**
 *  Animate Scroll to Position
 *
 *  Animates window scroll position
 *
 *  @param {int} - end position in pixels
 *
 *  js:
 *    var animateScroll = require('lib/animateScrollTo');
 *    animateScroll(top);
 */

// requirements
var eases = require('lib/eases');

// settings
var minDuration = 1000;

// the animation controller
var startTime,
    duration,
    startPos,
    deltaScroll,
    lastScroll
    ;

(function updateScroll () {
  lastScroll = window.scrollY;
  requestAnimationFrame(updateScroll);
})();

var animateScroll = function (currentTime) {
  var deltaTime = currentTime - startTime;
  if (deltaTime < duration) {
    window.scrollTo(0, eases.easeInOut(startPos, deltaScroll, deltaTime / duration));
    requestAnimationFrame(function () {
      animateScroll(new Date().getTime());
    });
  }
  else {
    window.scrollTo(0, startPos + deltaScroll);
  }
}

var startAnimateScroll = function (endScroll) {
  startTime = new Date().getTime();
  startPos = lastScroll;
  deltaScroll = endScroll - startPos;
  duration = Math.max(minDuration, Math.abs(deltaScroll) * .1);
  animateScroll(startTime);
}

module.exports = startAnimateScroll;

},{"lib/eases":7}],7:[function(require,module,exports){
/**
 *  a bunch of easing functions for making animations
 *  testing is fairly subjective, so not automated
 */

var eases = {
  'easeInOut' : function (s,c,p) {
    if (p < .5) {
      return s + c * (2 * p * p);
    }
    else {
      return s + c * (-2 * (p - 1) * (p - 1) + 1);
    }
  },
  'easeInOutCubic' : function (s,c,p) {
    if (p < .5) {
      return s + c * (4 * p * p * p);
    }
    else {
      return s + c * (4 * (p - 1) * (p - 1) * (p - 1) + 1)
    }
  },
  'easeIn' : function (s,c,p) {
    return s + c * p * p;
  },
  'easeInCubic' : function (s,c,p) {
    return s + c * (p * p * p);
  },
  'easeOut' : function (s,c,p) {
    return s + c * (-1 * (p - 1) * (p - 1) + 1);
  },
  'easeOutCubic' : function (s,c,p) {
    return s + c * ((p - 1) * (p - 1) * (p - 1) + 1);
  },
  'linear' : function (s,c,p) {
    return s + c * p;
  }
}
module.exports = eases;

},{}],8:[function(require,module,exports){
/***
 *  Get Page Offset
 *
 *  Get a DOMElement's offset from page
 *
 *  @param {DOMElement}
 *  @returns object
 *    @prop {number} left
 *    @prop {number} top
 *
 *  js:
 *    var getPageOffset = require('lib/getPageOffset');
 *    getPageOffset(someElement);
 */
function getPageOffset (element) {
  if (!element) {
    throw 'getPageOffset passed an invalid element';
  }
  var pageOffsetX = element.offsetLeft,
      pageOffsetY = element.offsetTop;

  while (element = element.offsetParent) {
    pageOffsetX += element.offsetLeft;
    pageOffsetY += element.offsetTop;
  }

  return {
    left : pageOffsetX,
    top : pageOffsetY
  }
}

module.exports = getPageOffset;

},{}],9:[function(require,module,exports){
/***
 * forEach Function
 *
 * Iterate over an array, passing the value to the passed function
 *
 * @param {Array} array to iterate
 * @param {function} fn to call
 *
 * js:
 *   var forEach = require('lib/util/forEach');
 *   forEach(someArray, function (item) { alert(item) });
 */
function forEach (arr, fn) {
  for (var i = 0, len = arr.length; i < len; i++) {
    fn.call(arr[i],arr[i],arr);
  }
}

module.exports = forEach;

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29sbGFwc2FibGUuanMiLCJhcHAvQ29weWFibGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9oYXNoY2hhbmdlLmpzIiwiYXV0b2d1aWRlLmpzIiwibGliL2FuaW1hdGVTY3JvbGxUby5qcyIsImxpYi9lYXNlcy5qcyIsImxpYi9nZXRQYWdlT2Zmc2V0LmpzIiwibGliL3V0aWwvZm9yRWFjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqKlxuICogQ29sbGFwc2FibGVcbiAqXG4gKiBBdXRvLWluaXRpYWxpemVkIGNsYXNzIHRoYXQgbG9va3MgZm9yIGAuanMtY29sbGFwc2FibGVgIHdpdGggYC5qcy1jb2xsYXBzYWJsZV9fdG9nZ2xlYFxuICogYW5kIGAuanMtY29sbGFwc2FibGVfX2NvbnRlbnRgLlxuICpcbiAqIEFkZCB0aGUgY2xhc3MgYGlzLW9wZW5gIHRvIHRoZSBgLmpzLWNvbGxhcHNhYmxlYCBlbGVtZW50IHRvIGhhdmUgaXQgb3BlbiBpdHNlbGZcbiAqIGltbWVkaWF0ZWx5LiAgYGlzLW9wZW5gIGlzIGFsc28gdGhlIHN0YXRlIGNsYXNzIHRoYXQgZ2V0cyB0b2dnbGVkLlxuICpcbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudFxuICogICBleHBlY3RlZCB0byBoYXZlIGNoaWxkcmVuIHdpdGggYC5qcy1jb2xsYXBzYWJsZV9fdG9nZ2xlYCBhbmQgYC5qcy1jb2xsYXBzYWJsZV9fY29udGVudGBcbiAqXG4gKiBAbWV0aG9kIHt2b2lkfSB0b2dnbGUoKSAtIHRvZ2dsZXMgb3Blbi9jbG9zZWRcbiAqIEBtZXRob2Qge3ZvaWR9IG9wZW4oKSAtIG9wZW5zIF9fY29udGVudCwgb3IgZG9lcyBub3RoaW5nIGlmIGFscmVhZHkgb3BlblxuICogQG1ldGhvZCB7dm9pZH0gY2xvc2UoKSAtIGNsb3NlcyBfX2NvbnRlbnQsIG9yIGRvZXMgbm90aGluZyBpZiBhbHJlYWR5IGNsb3NlZFxuICpcbiAqIEBwcm9wIHtib29sZWFufSBpc09wZW5cbiAqXG4gKiBodG1sOlxuICogICA8ZGl2IGNsYXNzPVwianMtY29sbGFwc2FibGVcIj5cbiAqICAgICA8YnV0dG9uIGNsYXNzPVwianMtY29sbGFwc2FibGVfX3RvZ2dsZVwiPlRvZ2dsZTwvYnV0dG9uPlxuICogICAgIDxkaXYgY2xhc3M9XCJqcy1jb2xsYXBzYWJsZV9fY29udGVudFwiPlxuICogICAgICAgPHVsPjxsaT5maWxsPC9saT48bGk+c29tZTwvbGk+PGxpPnNwYWNlPC9saT48L3VsPlxuICogICAgIDwvZGl2PlxuICogICA8L2Rpdj5cbiAqXG4gKiBqczpcbiAqICAgLy8gY3JlYXRlIChub3QgbmVjZXNzYXJ5LCBzaW5jZSBpdCBhbHJlYWR5IGxvb2tzIGZvciBhbGwgLmpzLWNvbGxhcHNhYmxlIGVsZW1lbnRzKVxuICogICB2YXIgY29sbGFwc2FibGUgPSBuZXcgQ29sbGFwc2FibGUgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jb2xsYXBzYWJsZScpKTtcbiAqICAgLy8gdG9nZ2xlIGl0IG9wZW4vY2xvc2VkXG4gKiAgIGNvbGxhcHNhYmxlLnRvZ2dsZSgpO1xuICovXG4vLyByZXF1aXJlbWVudHNcblxuLy8gc2V0dGluZ3NcblxuLy8gbWFpbiBjbGFzc1xudmFyIENvbGxhcHNhYmxlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy50b2dnbGVFbGVtZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY29sbGFwc2FibGVfX3RvZ2dsZScpO1xuICB0aGlzLmNvbnRlbnRFbGVtZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY29sbGFwc2FibGVfX2NvbnRlbnQnKTtcblxuICBpZiAoIXRoaXMuZWxlbWVudCB8fCAhdGhpcy50b2dnbGVFbGVtZW50IHx8ICF0aGlzLmNvbnRlbnRFbGVtZW50KSB7XG4gICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IodGhpcy5lbGVtZW50LCB0aGlzLnRvZ2dsZUVsZW1lbnQsIHRoaXMuY29udGVudEVsZW1lbnQpO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy50b2dnbGVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIF90aGlzLnRvZ2dsZSgpO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLW9wZW4nKSkge1xuICAgICAgdGhpcy5vcGVuKCk7XG4gICAgfVxuICB9XG59XG5Db2xsYXBzYWJsZS5wcm90b3R5cGUgPSB7XG4gIHRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmlzT3BlbiA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICB9LFxuICBvcGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICB0aGlzLmNvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuY29udGVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcbiAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gIH0sXG4gIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICB0aGlzLmNvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcwJztcbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICB9XG59XG5cbi8vIGluaXQgdGhlbSBhbGxcbnZhciBjb2xsYXBzYWJsZUVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jb2xsYXBzYWJsZScpO1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvbGxhcHNhYmxlRWxzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gIG5ldyBDb2xsYXBzYWJsZShjb2xsYXBzYWJsZUVsc1tpXSk7XG59XG4iLCIvKioqXG4gKiAgQ29weWFibGVcbiAqXG4gKiAgTWFrZXMgYW4gZWxlbWVudCBjbGlja2FibGUsIGNvcHlpbmcgYSBzdHJpbmcgdG8gdGhlIHVzZXIncyBjbGlwYm9hcmQuICBUbyBzZWVcbiAqICBob3cgaXQgbG9va3MsIGNoZWNrIG91dCBbdGhlIGh0bWwgc2FtcGxlXSgjL2F0b21zL2NvcHlhYmxlLWVsZW1lbnQpLlxuICpcbiAqICBJbml0aWFsaXplcyBhdXRvbWF0aWNhbGx5IG9uIGVsZW1lbnRzIHdpdGggYFtkYXRhLWNvcHldYCBhcyBhbiBhdHRyaWJ1dGUuXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudFxuICogIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgdG8gY29weVxuICpcbiAqICBAbWV0aG9kIHtET01FbGVtZW50fSBtYWtlSW5wdXQoKSAtIGludGVybmFsIGZ1bmN0aW9uIHRvIG1ha2UgdGhlIGlucHV0IGZyb21cbiAqICAgIHdoaWNoIHRoZSBzdHJpbmcgd2lsbCBiZSBjb3BpZWQuXG4gKiAgQG1ldGhvZCBjb3B5KCkgLSBjb3BpZXMgc3RyaW5nIHRvIGNsaXBib2FyZC4gTGlzdGVuZXIgaXMgYXV0b21hdGljYWxseSBhZGRlZCxcbiAqICAgIHNvIHlvdSBzaG91bGRuJ3QgbmVlZCB0byBtYW51YWxseSBjYWxsIHRoaXMuXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIHRoZSBjbGFzc1xudmFyIENvcHlhYmxlID0gZnVuY3Rpb24gKGVsZW1lbnQsIHN0cmluZykge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcblxuICBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2NvcHlhYmxlLWVuYWJsZWQnKTtcbiAgICB0aGlzLm1ha2VJbnB1dCgpO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIF90aGlzLmNvcHkoKTtcbiAgICB9KTtcbiAgfVxufVxuQ29weWFibGUucHJvdG90eXBlID0ge1xuICBtYWtlSW5wdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICB0aGlzLmlucHV0LmNsYXNzTGlzdC5hZGQoJ3Zpc3VhbGx5aGlkZGVuJyk7XG4gICAgdGhpcy5pbnB1dC52YWx1ZSA9IHRoaXMuc3RyaW5nO1xuICAgIHJldHVybiB0aGlzLmlucHV0O1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuaW5wdXQsIHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5pbnB1dC5zZWxlY3QoKTtcbiAgICB0cnkge1xuICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcbiAgICB9IGNhdGNoIChlcnIpIHt9O1xuICAgIHRoaXMuaW5wdXQuYmx1cigpO1xuICAgIHRoaXMuaW5wdXQucmVtb3ZlKCk7XG4gIH1cbn1cblxuLy8gYXV0by1nZW5lcmF0ZVxudmFyIGNvcHlhYmxlcyA9IFtdO1xudmFyIGNvcHlhYmxlRWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtY29weV0nKTtcbmZvckVhY2goY29weWFibGVFbHMsIGZ1bmN0aW9uIChlbCkge1xuICBjb3B5YWJsZXMucHVzaChuZXcgQ29weWFibGUgKGVsLCBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29weScpKSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb3B5YWJsZTtcbiIsIi8qKipcbiAqIEhUTUwgU2FtcGxlXG4gKlxuICogVGhlIGlmcmFtZXMgdGhhdCBzaG93IGFuIGV4YW1wbGUgb2YgdGhlIG91dHB1dCBvZiBhIGNvbXBvbmVudC5cbiAqL1xuXG4vKioqXG4gKiAgTWFrZSBBbGwgSHRtbCBTYW1wbGVzXG4gKlxuICogIFNlYXJjaGVzIGZvciBhbGwgYDxtYWtlLWlmcmFtZT5gIGVsZW1lbnRzIGFuZCBkb2VzIGp1c3QgdGhhdDogbWFrZXMgdGhlbSBpZnJhbWVzLlxuICogIEl0IGFsc28gaW5jbHVkZXMgdGhlIHN0eWxlc2hlZXRzIGFuZCBzY3JpcHRzIHByZXNlbnQgaW4gdGhlIHdpbmRvdyBsZXZlbCBgYWdgXG4gKiAgb2JqZWN0LiAgVGhvc2Ugc2hvdWxkIGJlIHBvcHVsYXRlZCBieSB0aGUgdGVtcGxhdGUuXG4gKlxuICogIGpzOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5tYWtlQWxsKCk7IC8vIGdvZXMgdGhyb3VnaCB0aGUgd2hvbGUgcGFnZSBhbmQgZG9lcyBpdHMgdGhpbmdcbiAqXG4gKiAgcGF0aDogLi9hcHAvaHRtbF9zYW1wbGVcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gaGVscGVyc1xuLyoqXG4gKiBHZXQgZG9jdW1lbnQgaGVpZ2h0IChzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTE0NTg1MC8pXG4gKlxuICogQHBhcmFtICB7RG9jdW1lbnR9IGRvY1xuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXREb2N1bWVudEhlaWdodCAoZG9jKSB7XG4gIGRvYyA9IGRvYyB8fCBkb2N1bWVudDtcbiAgdmFyIGJvZHkgPSBkb2MuYm9keTtcbiAgdmFyIGh0bWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG4gIGlmICghYm9keSB8fCAhaHRtbClcbiAgICByZXR1cm4gMDtcblxuICByZXR1cm4gTWF0aC5tYXgoXG4gICAgYm9keS5vZmZzZXRIZWlnaHQsXG4gICAgaHRtbC5vZmZzZXRIZWlnaHRcbiAgKTtcbn1cblxuLy8gZG8gdGhpbmdzIVxuLy8gZ2V0IHNvbWUgbWV0YSB0YWdzXG52YXIgbWV0YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhJyk7XG52YXIgc3R5bGVzLCBzY3JpcHRzO1xudmFyIHNhbXBsZXMgPSBbXTtcblxuLyoqKlxuICogIGBIdG1sU2FtcGxlYCBDbGFzc1xuICpcbiAqICBDb250cm9scyBhbiBpbmRpdmlkdWFsIEhUTUwgU2FtcGxlLCB3aGljaCBpcyBhbiBpZnJhbWUgdGhhdCBsb2FkcyB0aGUgY3NzIGFuZFxuICogIHNjcmlwdHMgdGhhdCB0aGUgc3R5bGVndWlkZSBpcyBtZWFudCB0byBzaG93LiBJdCBpbmNsdWRlcyB0aGUgc3R5bGVzaGVldHMgYW5kXG4gKiAgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYCBvYmplY3QuXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH0gc291cmNlRWxlbWVudCAtIHRoZSBlbGVtZW50IHRvIHR1cm4gaW50byBhbiBpZnJhbWVcbiAqXG4gKiAgQG1ldGhvZCB7dm9pZH0gYnVpbGRDb250ZW50KCkgLSBidWlsZHMgYSBzdHJpbmcgb2YgdGhlIGVsZW1lbnQgYXMgYSBmdWxsIGh0bWwgZG9jdW1lbnRcbiAqICAgIGFuZCBhc3NpZ25zIGl0IGFzIHRoZSBkb2N1bWVudCBvZiB0aGUgaWZyYW1lLlxuICogIEBtZXRob2Qge3ZvaWR9IGF1dG9IZWlnaHQoKSAtIGFsdGVycyB0aGUgaGVpZ2h0IG9mIHRoZSBpZnJhbWUgdG8gYmUgdGhlIG1pbmltdW0gbmVlZGVkIHRvXG4gKiAgICBlbGltaW5hdGUgYSBzY3JvbGxiYXIuICBBdXRvbWF0aWNhbGx5IGNhbGxlZCBvbiBhIHBlciBhbmltYXRpb24gZnJhbWUgYmFzaXMuXG4gKiAgQG1ldGhvZCB7RE9NRWxlbWVudH0gZ2V0RG9jdW1lbnQoKSAtIHJldHVybnMgdGhlIGlmcmFtZSdzIGRvY3VtZW50IG9iamVjdFxuICogIEBtZXRob2Qge3ZvaWR9IHRvZ2dsZUdyaWQoKSAtIGFkZHMvcmVtb3ZlcyB0aGUgJ3Nob3ctZ3JpZCcgY2xhc3MgdG8gdGhlIDxodG1sPiBlbGVtZW50XG4gKiAgICBzbyB3ZSBjYW4gc2hvdyBhIGdyaWQgb3ZlcmxheVxuICogIEBtZXRob2Qge3ZvaWR9IHNldFdpZHRoKHdpZHRoKSAtIHNldHMgdGhlIHdpZHRoIG9mIHRoZSBpZnJhbWUsIHVzZWZ1bCBmb3Igc2hvd2luZ1xuICogICAgbWVkaWEgcXVlcmllc1xuICogICAgQHBhcmFtIHtpbnR9IHdpZHRoIC0gd2lkdGggaW4gcGl4ZWxzLiBSZXNldHMgdG8gZGVmYXVsdCBzaXplIGlmIGZhbHN5XG4gKlxuICogIEBwcm9wIGVsZW1lbnQgLSB0aGUgYWN0dWFsIGlmcmFtZSBlbGVtZW50XG4gKlxuICogIHBhdGg6IC4vYXBwL2h0bWxfc2FtcGxlXG4gKiAgb3JkZXI6IDBcbiAqL1xudmFyIEh0bWxTYW1wbGUgPSBmdW5jdGlvbiAoc291cmNlRWxlbWVudCkge1xuICB0aGlzLnNvdXJjZUVsZW1lbnQgPSBzb3VyY2VFbGVtZW50O1xuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCB0aGlzLnNvdXJjZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpKTtcblxuICB0aGlzLmJ1aWxkQ29udGVudCgpO1xuICB0aGlzLnNvdXJjZUVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQodGhpcy5lbGVtZW50LCB0aGlzLnNvdXJjZUVsZW1lbnQpO1xuXG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIChmdW5jdGlvbiBjaGVja0lmcmFtZUhlaWdodCAoKSB7XG4gICAgX3RoaXMuYXV0b0hlaWdodCgpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjaGVja0lmcmFtZUhlaWdodCk7XG4gIH0pKCk7XG5cbiAgc2FtcGxlcy5wdXNoKHRoaXMpO1xufVxuSHRtbFNhbXBsZS5wcm90b3R5cGUgPSB7XG4gIC8qKlxuICAgKiAgYnVpbGRDb250ZW50IGNyZWF0ZXMgYSBzdHJpbmcgdG8gdXNlIGFzIHRoZSBkb2N1bWVudCBmb3IgdGhlIGlmcmFtZVxuICAgKi9cbiAgYnVpbGRDb250ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnRlbnQgPSAnPCFkb2N0eXBlIGh0bWw+JztcbiAgICBjb250ZW50ICs9ICc8aHRtbCBjbGFzcz1cInNob3ctZGV2ICcgKyAodGhpcy5zb3VyY2VFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnZnMnKSA/ICdmcycgOiAnbm90LWZzJykgKyAnXCI+PGhlYWQ+JztcbiAgICBmb3JFYWNoKG1ldGFzLGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICBjb250ZW50ICs9IG1ldGEub3V0ZXJIVE1MO1xuICAgIH0pO1xuICAgIGZvckVhY2goc3R5bGVzLGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgY29udGVudCArPSAnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCInICsgc3R5bGUgKyAnXCI+JztcbiAgICB9KTtcbiAgICBjb250ZW50ICs9ICc8L2hlYWQ+PGJvZHk+JztcbiAgICBjb250ZW50ICs9IHRoaXMuc291cmNlRWxlbWVudC5pbm5lckhUTUw7XG4gICAgZm9yRWFjaChzY3JpcHRzLGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgIGNvbnRlbnQgKz0gJzxzY3JpcHQgc3JjPVwiJyArIHNjcmlwdCArICdcIj48L3NjcmlwdD4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gXCI8L2JvZHk+PC9odG1sPlwiO1xuICAgIHRoaXMuZWxlbWVudC5zcmNkb2MgPSBjb250ZW50O1xuICB9LFxuICAvKipcbiAgICogIGF1dG9IZWlnaHQgdXBkYXRlcyB0aGUgaGVpZ2h0IG9mIHRoZSBpZnJhbWUgdG8gZXhhY3RseSBjb250YWluIGl0cyBjb250ZW50XG4gICAqL1xuICBhdXRvSGVpZ2h0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRvYyA9IHRoaXMuZ2V0RG9jdW1lbnQoKTtcbiAgICBpZiAoZG9jKSB7XG4gICAgICB2YXIgZG9jSGVpZ2h0ID0gZ2V0RG9jdW1lbnRIZWlnaHQoZG9jKTtcbiAgICAgIGlmIChkb2NIZWlnaHQgIT0gdGhpcy5lbGVtZW50LmhlaWdodClcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgZG9jSGVpZ2h0KTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiAgZ2V0RG9jdW1lbnQgZ2V0cyB0aGUgaW50ZXJuYWwgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZVxuICAgKi9cbiAgZ2V0RG9jdW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudCB8fCAodGhpcy5lbGVtZW50LmNvbnRlbnRXaW5kb3cgJiYgdGhpcy5lbGVtZW50LmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQpO1xuICB9LFxuICAvKipcbiAgICogIGFkZHMvcmVtb3ZlcyB0aGUgJ3Nob3ctZ3JpZCcgY2xhc3MgdG8gdGhlIDxodG1sPiBlbGVtZW50IHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gICAqL1xuICB0b2dnbGVHcmlkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nZXREb2N1bWVudCgpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJylbMF0uY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy1ncmlkJyk7XG4gIH0sXG4gIC8qKlxuICAgKiAgc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nIG1lZGlhIHF1ZXJpZXNcbiAgICovXG4gIHNldFdpZHRoOiBmdW5jdGlvbiAodykge1xuICAgIGlmICh3KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB3ICsgJ3B4JztcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdyZXNpemVkJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJyc7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplZCcpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlSHRtbFNhbXBsZXMgKCkge1xuICAvLyBnZXQgc3R5bGVzIGFuZCBzY3JpcHRzXG4gIHN0eWxlcyA9IHdpbmRvdy5hZyAmJiB3aW5kb3cuYWcuc3R5bGVzIHx8IFtdO1xuICBzY3JpcHRzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zY3JpcHRzIHx8IFtdO1xuICAvLyBnZXQgYWxsIG91ciBjdXN0b20gZWxlbWVudHNcbiAgdmFyIGVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYWtlLWlmcmFtZScpO1xuICBmb3IgKHZhciBpID0gZWxzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgbmV3IEh0bWxTYW1wbGUoZWxzW2ldKTtcbiAgfTtcbn1cblxuLyoqXG4gKiAgVG9nZ2xlIEhUTUwgU2FtcGxlIEdyaWRzXG4gKlxuICogIFRvZ2dsZXMgYSBgLnNob3ctZ3JpZGAgY2xhc3Mgb24gdGhlIGA8aHRtbD5gIGVsZW1lbnQgaW5zaWRlIGFsbCB0aGVcbiAqICBpZnJhbWVzLiAgV2l0aCB0aGUgaW4tZnJhbWUuY3NzIHN0eWxlc2hlZXQgaW5jbHVkZWQsIHRoaXMgd2lsbCB0dXJuIG9uIGEgMTJcbiAqICBjb2x1bW4gZ3JpZCBvdmVybGF5LlxuICpcbiAqICBqczpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykudG9nZ2xlR3JpZHMoKVxuICpcbiAqICBwYXRoOiAuL2FwcC9odG1sX3NhbXBsZVxuICovXG52YXIgdG9nZ2xlR3JpZHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnRvZ2dsZUdyaWQoKTtcbiAgfSk7XG59XG5cbi8qKipcbiAqICBzZXRXaWR0aHNcbiAqXG4gKiAgU2V0cyBhbGwgYEh0bWxTYW1wbGVgcyB0byB0aGUgcHJvdmlkZWQgd2lkdGguXG4gKlxuICogIGpzOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5zZXRXaWR0aHMod2lkdGgpO1xuICpcbiAqICBAcGFyYW0ge2ludH0gd2lkdGhcbiAqXG4gKiAgcGF0aDogLi9hcHAvaHRtbF9zYW1wbGVcbiAqL1xudmFyIHNldFdpZHRocyA9IGZ1bmN0aW9uICh3KSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnNldFdpZHRoKHcpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIdG1sU2FtcGxlO1xubW9kdWxlLmV4cG9ydHMubWFrZUFsbCA9IG1ha2VIdG1sU2FtcGxlcztcbm1vZHVsZS5leHBvcnRzLnRvZ2dsZUdyaWRzID0gdG9nZ2xlR3JpZHM7XG5tb2R1bGUuZXhwb3J0cy5zZXRXaWR0aHMgPSBzZXRXaWR0aHM7XG4iLCIvKipcbiAqICBoYW5kbGUgaGFzaGNoYW5nZVxuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciBhbmltYXRlU2Nyb2xsID0gcmVxdWlyZSgnbGliL2FuaW1hdGVTY3JvbGxUbycpO1xudmFyIGdldFBhZ2VPZmZzZXQgPSByZXF1aXJlKCdsaWIvZ2V0UGFnZU9mZnNldCcpO1xuXG4vLyBzZXR0aW5nc1xudmFyIE9GRlNFVCA9IDMyO1xuXG4vLyBsaXN0ZW5lclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoL14jLywnJykpO1xuICBhbmltYXRlU2Nyb2xsKGdldFBhZ2VPZmZzZXQoZWwpLnRvcCAtIE9GRlNFVCk7XG59KTtcbiIsIi8qKlxuICogIHdob2xlIGRhbW4gc2NyaXB0XG4gKlxuICogIFRoaXMgc2hvdWxkIGluY2x1ZGUgb2JqZWN0cywgd2hpY2ggaW4gdHVybiBpbmNsdWRlIHRoZSBsaWIgZmlsZXMgdGhleSBuZWVkLlxuICogIFRoaXMga2VlcHMgdXMgdXNpbmcgYSBtb2R1bGFyIGFwcHJvYWNoIHRvIGRldiB3aGlsZSBhbHNvIG9ubHkgaW5jbHVkaW5nIHRoZVxuICogIHBhcnRzIG9mIHRoZSBsaWJyYXJ5IHdlIG5lZWQuXG4gKi9cbnJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykubWFrZUFsbCgpO1xucmVxdWlyZSgnYXBwL2hhc2hjaGFuZ2UnKTtcbnJlcXVpcmUoJ2FwcC9Db3B5YWJsZScpO1xucmVxdWlyZSgnYXBwL0NvbGxhcHNhYmxlJyk7XG4iLCIvKipcbiAqICBBbmltYXRlIFNjcm9sbCB0byBQb3NpdGlvblxuICpcbiAqICBBbmltYXRlcyB3aW5kb3cgc2Nyb2xsIHBvc2l0aW9uXG4gKlxuICogIEBwYXJhbSB7aW50fSAtIGVuZCBwb3NpdGlvbiBpbiBwaXhlbHNcbiAqXG4gKiAganM6XG4gKiAgICB2YXIgYW5pbWF0ZVNjcm9sbCA9IHJlcXVpcmUoJ2xpYi9hbmltYXRlU2Nyb2xsVG8nKTtcbiAqICAgIGFuaW1hdGVTY3JvbGwodG9wKTtcbiAqL1xuXG4vLyByZXF1aXJlbWVudHNcbnZhciBlYXNlcyA9IHJlcXVpcmUoJ2xpYi9lYXNlcycpO1xuXG4vLyBzZXR0aW5nc1xudmFyIG1pbkR1cmF0aW9uID0gMTAwMDtcblxuLy8gdGhlIGFuaW1hdGlvbiBjb250cm9sbGVyXG52YXIgc3RhcnRUaW1lLFxuICAgIGR1cmF0aW9uLFxuICAgIHN0YXJ0UG9zLFxuICAgIGRlbHRhU2Nyb2xsLFxuICAgIGxhc3RTY3JvbGxcbiAgICA7XG5cbihmdW5jdGlvbiB1cGRhdGVTY3JvbGwgKCkge1xuICBsYXN0U2Nyb2xsID0gd2luZG93LnNjcm9sbFk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGVTY3JvbGwpO1xufSkoKTtcblxudmFyIGFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcbiAgdmFyIGRlbHRhVGltZSA9IGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lO1xuICBpZiAoZGVsdGFUaW1lIDwgZHVyYXRpb24pIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgZWFzZXMuZWFzZUluT3V0KHN0YXJ0UG9zLCBkZWx0YVNjcm9sbCwgZGVsdGFUaW1lIC8gZHVyYXRpb24pKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgYW5pbWF0ZVNjcm9sbChuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIHN0YXJ0UG9zICsgZGVsdGFTY3JvbGwpO1xuICB9XG59XG5cbnZhciBzdGFydEFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbiAoZW5kU2Nyb2xsKSB7XG4gIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICBzdGFydFBvcyA9IGxhc3RTY3JvbGw7XG4gIGRlbHRhU2Nyb2xsID0gZW5kU2Nyb2xsIC0gc3RhcnRQb3M7XG4gIGR1cmF0aW9uID0gTWF0aC5tYXgobWluRHVyYXRpb24sIE1hdGguYWJzKGRlbHRhU2Nyb2xsKSAqIC4xKTtcbiAgYW5pbWF0ZVNjcm9sbChzdGFydFRpbWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0QW5pbWF0ZVNjcm9sbDtcbiIsIi8qKlxuICogIGEgYnVuY2ggb2YgZWFzaW5nIGZ1bmN0aW9ucyBmb3IgbWFraW5nIGFuaW1hdGlvbnNcbiAqICB0ZXN0aW5nIGlzIGZhaXJseSBzdWJqZWN0aXZlLCBzbyBub3QgYXV0b21hdGVkXG4gKi9cblxudmFyIGVhc2VzID0ge1xuICAnZWFzZUluT3V0JyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIGlmIChwIDwgLjUpIHtcbiAgICAgIHJldHVybiBzICsgYyAqICgyICogcCAqIHApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBzICsgYyAqICgtMiAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gICAgfVxuICB9LFxuICAnZWFzZUluT3V0Q3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgaWYgKHAgPCAuNSkge1xuICAgICAgcmV0dXJuIHMgKyBjICogKDQgKiBwICogcCAqIHApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBzICsgYyAqICg0ICogKHAgLSAxKSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSlcbiAgICB9XG4gIH0sXG4gICdlYXNlSW4nIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogcCAqIHA7XG4gIH0sXG4gICdlYXNlSW5DdWJpYycgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiAocCAqIHAgKiBwKTtcbiAgfSxcbiAgJ2Vhc2VPdXQnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKC0xICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKTtcbiAgfSxcbiAgJ2Vhc2VPdXRDdWJpYycgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiAoKHAgLSAxKSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gIH0sXG4gICdsaW5lYXInIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogcDtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBlYXNlcztcbiIsIi8qKipcbiAqICBHZXQgUGFnZSBPZmZzZXRcbiAqXG4gKiAgR2V0IGEgRE9NRWxlbWVudCdzIG9mZnNldCBmcm9tIHBhZ2VcbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fVxuICogIEByZXR1cm5zIG9iamVjdFxuICogICAgQHByb3Age251bWJlcn0gbGVmdFxuICogICAgQHByb3Age251bWJlcn0gdG9wXG4gKlxuICogIGpzOlxuICogICAgdmFyIGdldFBhZ2VPZmZzZXQgPSByZXF1aXJlKCdsaWIvZ2V0UGFnZU9mZnNldCcpO1xuICogICAgZ2V0UGFnZU9mZnNldChzb21lRWxlbWVudCk7XG4gKi9cbmZ1bmN0aW9uIGdldFBhZ2VPZmZzZXQgKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgdGhyb3cgJ2dldFBhZ2VPZmZzZXQgcGFzc2VkIGFuIGludmFsaWQgZWxlbWVudCc7XG4gIH1cbiAgdmFyIHBhZ2VPZmZzZXRYID0gZWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgICAgcGFnZU9mZnNldFkgPSBlbGVtZW50Lm9mZnNldFRvcDtcblxuICB3aGlsZSAoZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50KSB7XG4gICAgcGFnZU9mZnNldFggKz0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIHBhZ2VPZmZzZXRZICs9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsZWZ0IDogcGFnZU9mZnNldFgsXG4gICAgdG9wIDogcGFnZU9mZnNldFlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFBhZ2VPZmZzZXQ7XG4iLCIvKioqXG4gKiBmb3JFYWNoIEZ1bmN0aW9uXG4gKlxuICogSXRlcmF0ZSBvdmVyIGFuIGFycmF5LCBwYXNzaW5nIHRoZSB2YWx1ZSB0byB0aGUgcGFzc2VkIGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gdG8gY2FsbFxuICpcbiAqIGpzOlxuICogICB2YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcbiAqICAgZm9yRWFjaChzb21lQXJyYXksIGZ1bmN0aW9uIChpdGVtKSB7IGFsZXJ0KGl0ZW0pIH0pO1xuICovXG5mdW5jdGlvbiBmb3JFYWNoIChhcnIsIGZuKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBmbi5jYWxsKGFycltpXSxhcnJbaV0sYXJyKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2g7XG4iXX0=
