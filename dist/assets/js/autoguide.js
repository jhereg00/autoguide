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

},{"lib/util/forEach":10}],3:[function(require,module,exports){
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

},{"lib/util/forEach":10}],4:[function(require,module,exports){
/***
 * Tray
 *
 * The collapsable sidebar, with possibility of multiple tiers.
 *
 * @param {DOMElement} element
 *
 * @prop {TrayTier array} tiers
 * @prop {boolean} isOpen
 *
 * @method {void} close() - close tray and all its tiers
 * @method {void} closeTiers() - close all tiers
 * @method {void} checkShouldClose() - check if we need to close the tray due to all tiers being closed
 * @method {void} updatePosition() - update top/bottom of element, assuming fixed pos
 */
// requirements

// settings

// the class
var Tray = function (element) {
  this.element = element;
  this.offsetParent = element.parentElement;
  this.isOpen = this.element.classList.contains('is-open');
  this.tiers = [];

  var tierEls = this.element.querySelectorAll('.tray__tier');
  for (var i = 0, len = tierEls.length; i < len; i++) {
    this.tiers.push(new TrayTier (tierEls[i], this));
  }

  var _this = this;
  var lastScroll = 0;
  (function checkScroll () {
    if (window.scrollY !== lastScroll) {
      _this.updatePosition();
      lastScroll = window.scrollY;
    }
    window.requestAnimationFrame(checkScroll);
  })();
  this.updatePosition();
}
Tray.prototype = {
  setOpen: function () {
    this.element.classList.add('is-open');
  },
  setClosed: function () {
    this.element.classList.remove('is-open');
  },
  close: function () {
    this.closeTiers();
    this.setClosed();
  },
  closeTiers: function () {
    for (var i = 0, len = this.tiers.length; i < len; i++) {
      this.tiers[i].close();
    }
  },
  checkShouldClose: function () {
    for (var i = 0, len = this.tiers.length; i < len; i++) {
      if (this.tiers[i].isOpen)
        return;
    }
    this.setClosed();
  },
  updatePosition: function () {
    var clipRect = this.offsetParent.getClientRects()[0];
    var top = Math.max(clipRect.top, 0);
    var bottom = Math.max(window.innerHeight - clipRect.bottom, 0);
    this.element.style.top = top + 'px';
    this.element.style.bottom = bottom + 'px';
  }
}

/***
 * Tray Tier
 *
 * Individual tier of the tray.  Closes other tiers when opened, and marks parent
 * tray open as well.
 *
 * @param {DOMElement} element
 * @param {Tray} parentTray
 *
 * @method {void} open()
 * @method {void} close()
 * @method {void} toggle()
 *
 * @prop {boolean} isOpen
 */
var TrayTier = function (element, parentTray) {
  this.element = element;
  this.parentTray = parentTray;

  this.toggleElement = element.querySelector('.tray__opener');
  var _this = this;
  if (this.toggleElement) {
    this.toggleElement.addEventListener('click', function () {
      _this.toggle();
    });
  }
}
TrayTier.prototype = {
  open: function () {
    this.parentTray.closeTiers();
    this.element.classList.add('is-open');
    this.isOpen = true;
    this.parentTray.setOpen();
  },
  close: function () {
    this.element.classList.remove('is-open');
    this.isOpen = false;
    this.parentTray.checkShouldClose();
  },
  toggle: function () {
    return this.isOpen ? this.close() : this.open();
  }
}

// autoinit
var trayEls = document.querySelectorAll('.tray');
for (var i = 0, len = trayEls.length; i < len; i++) {
  new Tray(trayEls[i]);
}

},{}],5:[function(require,module,exports){
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

},{"lib/animateScrollTo":7,"lib/getPageOffset":9}],6:[function(require,module,exports){
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
require('app/Tray');

},{"app/Collapsable":1,"app/Copyable":2,"app/HtmlSample":3,"app/Tray":4,"app/hashchange":5}],7:[function(require,module,exports){
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

},{"lib/eases":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29sbGFwc2FibGUuanMiLCJhcHAvQ29weWFibGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL2hhc2hjaGFuZ2UuanMiLCJhdXRvZ3VpZGUuanMiLCJsaWIvYW5pbWF0ZVNjcm9sbFRvLmpzIiwibGliL2Vhc2VzLmpzIiwibGliL2dldFBhZ2VPZmZzZXQuanMiLCJsaWIvdXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKioqXG4gKiBDb2xsYXBzYWJsZVxuICpcbiAqIEF1dG8taW5pdGlhbGl6ZWQgY2xhc3MgdGhhdCBsb29rcyBmb3IgYC5qcy1jb2xsYXBzYWJsZWAgd2l0aCBgLmpzLWNvbGxhcHNhYmxlX190b2dnbGVgXG4gKiBhbmQgYC5qcy1jb2xsYXBzYWJsZV9fY29udGVudGAuXG4gKlxuICogQWRkIHRoZSBjbGFzcyBgaXMtb3BlbmAgdG8gdGhlIGAuanMtY29sbGFwc2FibGVgIGVsZW1lbnQgdG8gaGF2ZSBpdCBvcGVuIGl0c2VsZlxuICogaW1tZWRpYXRlbHkuICBgaXMtb3BlbmAgaXMgYWxzbyB0aGUgc3RhdGUgY2xhc3MgdGhhdCBnZXRzIHRvZ2dsZWQuXG4gKlxuICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50XG4gKiAgIGV4cGVjdGVkIHRvIGhhdmUgY2hpbGRyZW4gd2l0aCBgLmpzLWNvbGxhcHNhYmxlX190b2dnbGVgIGFuZCBgLmpzLWNvbGxhcHNhYmxlX19jb250ZW50YFxuICpcbiAqIEBtZXRob2Qge3ZvaWR9IHRvZ2dsZSgpIC0gdG9nZ2xlcyBvcGVuL2Nsb3NlZFxuICogQG1ldGhvZCB7dm9pZH0gb3BlbigpIC0gb3BlbnMgX19jb250ZW50LCBvciBkb2VzIG5vdGhpbmcgaWYgYWxyZWFkeSBvcGVuXG4gKiBAbWV0aG9kIHt2b2lkfSBjbG9zZSgpIC0gY2xvc2VzIF9fY29udGVudCwgb3IgZG9lcyBub3RoaW5nIGlmIGFscmVhZHkgY2xvc2VkXG4gKlxuICogQHByb3Age2Jvb2xlYW59IGlzT3BlblxuICpcbiAqIGh0bWw6XG4gKiAgIDxkaXYgY2xhc3M9XCJqcy1jb2xsYXBzYWJsZVwiPlxuICogICAgIDxidXR0b24gY2xhc3M9XCJqcy1jb2xsYXBzYWJsZV9fdG9nZ2xlXCI+VG9nZ2xlPC9idXR0b24+XG4gKiAgICAgPGRpdiBjbGFzcz1cImpzLWNvbGxhcHNhYmxlX19jb250ZW50XCI+XG4gKiAgICAgICA8dWw+PGxpPmZpbGw8L2xpPjxsaT5zb21lPC9saT48bGk+c3BhY2U8L2xpPjwvdWw+XG4gKiAgICAgPC9kaXY+XG4gKiAgIDwvZGl2PlxuICpcbiAqIGpzOlxuICogICAvLyBjcmVhdGUgKG5vdCBuZWNlc3NhcnksIHNpbmNlIGl0IGFscmVhZHkgbG9va3MgZm9yIGFsbCAuanMtY29sbGFwc2FibGUgZWxlbWVudHMpXG4gKiAgIHZhciBjb2xsYXBzYWJsZSA9IG5ldyBDb2xsYXBzYWJsZSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNvbGxhcHNhYmxlJykpO1xuICogICAvLyB0b2dnbGUgaXQgb3Blbi9jbG9zZWRcbiAqICAgY29sbGFwc2FibGUudG9nZ2xlKCk7XG4gKi9cbi8vIHJlcXVpcmVtZW50c1xuXG4vLyBzZXR0aW5nc1xuXG4vLyBtYWluIGNsYXNzXG52YXIgQ29sbGFwc2FibGUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLnRvZ2dsZUVsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jb2xsYXBzYWJsZV9fdG9nZ2xlJyk7XG4gIHRoaXMuY29udGVudEVsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jb2xsYXBzYWJsZV9fY29udGVudCcpO1xuXG4gIGlmICghdGhpcy5lbGVtZW50IHx8ICF0aGlzLnRvZ2dsZUVsZW1lbnQgfHwgIXRoaXMuY29udGVudEVsZW1lbnQpIHtcbiAgICByZXR1cm4gY29uc29sZS5lcnJvcih0aGlzLmVsZW1lbnQsIHRoaXMudG9nZ2xlRWxlbWVudCwgdGhpcy5jb250ZW50RWxlbWVudCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLnRvZ2dsZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgX3RoaXMudG9nZ2xlKCk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnaXMtb3BlbicpKSB7XG4gICAgICB0aGlzLm9wZW4oKTtcbiAgICB9XG4gIH1cbn1cbkNvbGxhcHNhYmxlLnByb3RvdHlwZSA9IHtcbiAgdG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNPcGVuID8gdGhpcy5jbG9zZSgpIDogdGhpcy5vcGVuKCk7XG4gIH0sXG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgIHRoaXMuY29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5jb250ZW50RWxlbWVudC5zY3JvbGxIZWlnaHQgKyAncHgnO1xuICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcbiAgfSxcbiAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgIHRoaXMuY29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzAnO1xuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gIH1cbn1cblxuLy8gaW5pdCB0aGVtIGFsbFxudmFyIGNvbGxhcHNhYmxlRWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNvbGxhcHNhYmxlJyk7XG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29sbGFwc2FibGVFbHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgbmV3IENvbGxhcHNhYmxlKGNvbGxhcHNhYmxlRWxzW2ldKTtcbn1cbiIsIi8qKipcbiAqICBDb3B5YWJsZVxuICpcbiAqICBNYWtlcyBhbiBlbGVtZW50IGNsaWNrYWJsZSwgY29weWluZyBhIHN0cmluZyB0byB0aGUgdXNlcidzIGNsaXBib2FyZC4gIFRvIHNlZVxuICogIGhvdyBpdCBsb29rcywgY2hlY2sgb3V0IFt0aGUgaHRtbCBzYW1wbGVdKCMvYXRvbXMvY29weWFibGUtZWxlbWVudCkuXG4gKlxuICogIEluaXRpYWxpemVzIGF1dG9tYXRpY2FsbHkgb24gZWxlbWVudHMgd2l0aCBgW2RhdGEtY29weV1gIGFzIGFuIGF0dHJpYnV0ZS5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50XG4gKiAgQHBhcmFtIHtzdHJpbmd9IHN0cmluZyB0byBjb3B5XG4gKlxuICogIEBtZXRob2Qge0RPTUVsZW1lbnR9IG1ha2VJbnB1dCgpIC0gaW50ZXJuYWwgZnVuY3Rpb24gdG8gbWFrZSB0aGUgaW5wdXQgZnJvbVxuICogICAgd2hpY2ggdGhlIHN0cmluZyB3aWxsIGJlIGNvcGllZC5cbiAqICBAbWV0aG9kIGNvcHkoKSAtIGNvcGllcyBzdHJpbmcgdG8gY2xpcGJvYXJkLiBMaXN0ZW5lciBpcyBhdXRvbWF0aWNhbGx5IGFkZGVkLFxuICogICAgc28geW91IHNob3VsZG4ndCBuZWVkIHRvIG1hbnVhbGx5IGNhbGwgdGhpcy5cbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gdGhlIGNsYXNzXG52YXIgQ29weWFibGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgc3RyaW5nKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuXG4gIGlmIChkb2N1bWVudC5leGVjQ29tbWFuZCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnY29weWFibGUtZW5hYmxlZCcpO1xuICAgIHRoaXMubWFrZUlucHV0KCk7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgX3RoaXMuY29weSgpO1xuICAgIH0pO1xuICB9XG59XG5Db3B5YWJsZS5wcm90b3R5cGUgPSB7XG4gIG1ha2VJbnB1dDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHRoaXMuaW5wdXQuY2xhc3NMaXN0LmFkZCgndmlzdWFsbHloaWRkZW4nKTtcbiAgICB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5zdHJpbmc7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQ7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5pbnB1dCwgdGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLmlucHV0LnNlbGVjdCgpO1xuICAgIHRyeSB7XG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgIH0gY2F0Y2ggKGVycikge307XG4gICAgdGhpcy5pbnB1dC5ibHVyKCk7XG4gICAgdGhpcy5pbnB1dC5yZW1vdmUoKTtcbiAgfVxufVxuXG4vLyBhdXRvLWdlbmVyYXRlXG52YXIgY29weWFibGVzID0gW107XG52YXIgY29weWFibGVFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1jb3B5XScpO1xuZm9yRWFjaChjb3B5YWJsZUVscywgZnVuY3Rpb24gKGVsKSB7XG4gIGNvcHlhYmxlcy5wdXNoKG5ldyBDb3B5YWJsZSAoZWwsIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jb3B5JykpKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvcHlhYmxlO1xuIiwiLyoqKlxuICogSFRNTCBTYW1wbGVcbiAqXG4gKiBUaGUgaWZyYW1lcyB0aGF0IHNob3cgYW4gZXhhbXBsZSBvZiB0aGUgb3V0cHV0IG9mIGEgY29tcG9uZW50LlxuICovXG5cbi8qKipcbiAqICBNYWtlIEFsbCBIdG1sIFNhbXBsZXNcbiAqXG4gKiAgU2VhcmNoZXMgZm9yIGFsbCBgPG1ha2UtaWZyYW1lPmAgZWxlbWVudHMgYW5kIGRvZXMganVzdCB0aGF0OiBtYWtlcyB0aGVtIGlmcmFtZXMuXG4gKiAgSXQgYWxzbyBpbmNsdWRlcyB0aGUgc3R5bGVzaGVldHMgYW5kIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2BcbiAqICBvYmplY3QuICBUaG9zZSBzaG91bGQgYmUgcG9wdWxhdGVkIGJ5IHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiAganM6XG4gKiAgICByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLm1ha2VBbGwoKTsgLy8gZ29lcyB0aHJvdWdoIHRoZSB3aG9sZSBwYWdlIGFuZCBkb2VzIGl0cyB0aGluZ1xuICpcbiAqICBwYXRoOiAuL2FwcC9odG1sX3NhbXBsZVxuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuXG4vLyBzZXR0aW5nc1xuXG4vLyBoZWxwZXJzXG4vKipcbiAqIEdldCBkb2N1bWVudCBoZWlnaHQgKHN0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTQ1ODUwLylcbiAqXG4gKiBAcGFyYW0gIHtEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldERvY3VtZW50SGVpZ2h0IChkb2MpIHtcbiAgZG9jID0gZG9jIHx8IGRvY3VtZW50O1xuICB2YXIgYm9keSA9IGRvYy5ib2R5O1xuICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgaWYgKCFib2R5IHx8ICFodG1sKVxuICAgIHJldHVybiAwO1xuXG4gIHJldHVybiBNYXRoLm1heChcbiAgICBib2R5Lm9mZnNldEhlaWdodCxcbiAgICBodG1sLm9mZnNldEhlaWdodFxuICApO1xufVxuXG4vLyBkbyB0aGluZ3MhXG4vLyBnZXQgc29tZSBtZXRhIHRhZ3NcbnZhciBtZXRhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGEnKTtcbnZhciBzdHlsZXMsIHNjcmlwdHM7XG52YXIgc2FtcGxlcyA9IFtdO1xuXG4vKioqXG4gKiAgYEh0bWxTYW1wbGVgIENsYXNzXG4gKlxuICogIENvbnRyb2xzIGFuIGluZGl2aWR1YWwgSFRNTCBTYW1wbGUsIHdoaWNoIGlzIGFuIGlmcmFtZSB0aGF0IGxvYWRzIHRoZSBjc3MgYW5kXG4gKiAgc2NyaXB0cyB0aGF0IHRoZSBzdHlsZWd1aWRlIGlzIG1lYW50IHRvIHNob3cuIEl0IGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmRcbiAqICBzY3JpcHRzIHByZXNlbnQgaW4gdGhlIHdpbmRvdyBsZXZlbCBgYWdgIG9iamVjdC5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSBzb3VyY2VFbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gdHVybiBpbnRvIGFuIGlmcmFtZVxuICpcbiAqICBAbWV0aG9kIHt2b2lkfSBidWlsZENvbnRlbnQoKSAtIGJ1aWxkcyBhIHN0cmluZyBvZiB0aGUgZWxlbWVudCBhcyBhIGZ1bGwgaHRtbCBkb2N1bWVudFxuICogICAgYW5kIGFzc2lnbnMgaXQgYXMgdGhlIGRvY3VtZW50IG9mIHRoZSBpZnJhbWUuXG4gKiAgQG1ldGhvZCB7dm9pZH0gYXV0b0hlaWdodCgpIC0gYWx0ZXJzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBiZSB0aGUgbWluaW11bSBuZWVkZWQgdG9cbiAqICAgIGVsaW1pbmF0ZSBhIHNjcm9sbGJhci4gIEF1dG9tYXRpY2FsbHkgY2FsbGVkIG9uIGEgcGVyIGFuaW1hdGlvbiBmcmFtZSBiYXNpcy5cbiAqICBAbWV0aG9kIHtET01FbGVtZW50fSBnZXREb2N1bWVudCgpIC0gcmV0dXJucyB0aGUgaWZyYW1lJ3MgZG9jdW1lbnQgb2JqZWN0XG4gKiAgQG1ldGhvZCB7dm9pZH0gdG9nZ2xlR3JpZCgpIC0gYWRkcy9yZW1vdmVzIHRoZSAnc2hvdy1ncmlkJyBjbGFzcyB0byB0aGUgPGh0bWw+IGVsZW1lbnRcbiAqICAgIHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gKiAgQG1ldGhvZCB7dm9pZH0gc2V0V2lkdGgod2lkdGgpIC0gc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nXG4gKiAgICBtZWRpYSBxdWVyaWVzXG4gKiAgICBAcGFyYW0ge2ludH0gd2lkdGggLSB3aWR0aCBpbiBwaXhlbHMuIFJlc2V0cyB0byBkZWZhdWx0IHNpemUgaWYgZmFsc3lcbiAqXG4gKiAgQHByb3AgZWxlbWVudCAtIHRoZSBhY3R1YWwgaWZyYW1lIGVsZW1lbnRcbiAqXG4gKiAgcGF0aDogLi9hcHAvaHRtbF9zYW1wbGVcbiAqICBvcmRlcjogMFxuICovXG52YXIgSHRtbFNhbXBsZSA9IGZ1bmN0aW9uIChzb3VyY2VFbGVtZW50KSB7XG4gIHRoaXMuc291cmNlRWxlbWVudCA9IHNvdXJjZUVsZW1lbnQ7XG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsIHRoaXMuc291cmNlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykpO1xuXG4gIHRoaXMuYnVpbGRDb250ZW50KCk7XG4gIHRoaXMuc291cmNlRWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh0aGlzLmVsZW1lbnQsIHRoaXMuc291cmNlRWxlbWVudCk7XG5cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgKGZ1bmN0aW9uIGNoZWNrSWZyYW1lSGVpZ2h0ICgpIHtcbiAgICBfdGhpcy5hdXRvSGVpZ2h0KCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrSWZyYW1lSGVpZ2h0KTtcbiAgfSkoKTtcblxuICBzYW1wbGVzLnB1c2godGhpcyk7XG59XG5IdG1sU2FtcGxlLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqICBidWlsZENvbnRlbnQgY3JlYXRlcyBhIHN0cmluZyB0byB1c2UgYXMgdGhlIGRvY3VtZW50IGZvciB0aGUgaWZyYW1lXG4gICAqL1xuICBidWlsZENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGVudCA9ICc8IWRvY3R5cGUgaHRtbD4nO1xuICAgIGNvbnRlbnQgKz0gJzxodG1sIGNsYXNzPVwic2hvdy1kZXYgJyArICh0aGlzLnNvdXJjZUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmcycpID8gJ2ZzJyA6ICdub3QtZnMnKSArICdcIj48aGVhZD4nO1xuICAgIGZvckVhY2gobWV0YXMsZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgIGNvbnRlbnQgKz0gbWV0YS5vdXRlckhUTUw7XG4gICAgfSk7XG4gICAgZm9yRWFjaChzdHlsZXMsZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICBjb250ZW50ICs9ICc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIicgKyBzdHlsZSArICdcIj4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gJzwvaGVhZD48Ym9keT4nO1xuICAgIGNvbnRlbnQgKz0gdGhpcy5zb3VyY2VFbGVtZW50LmlubmVySFRNTDtcbiAgICBmb3JFYWNoKHNjcmlwdHMsZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgY29udGVudCArPSAnPHNjcmlwdCBzcmM9XCInICsgc2NyaXB0ICsgJ1wiPjwvc2NyaXB0Pic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSBcIjwvYm9keT48L2h0bWw+XCI7XG4gICAgdGhpcy5lbGVtZW50LnNyY2RvYyA9IGNvbnRlbnQ7XG4gIH0sXG4gIC8qKlxuICAgKiAgYXV0b0hlaWdodCB1cGRhdGVzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBleGFjdGx5IGNvbnRhaW4gaXRzIGNvbnRlbnRcbiAgICovXG4gIGF1dG9IZWlnaHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9jID0gdGhpcy5nZXREb2N1bWVudCgpO1xuICAgIGlmIChkb2MpIHtcbiAgICAgIHZhciBkb2NIZWlnaHQgPSBnZXREb2N1bWVudEhlaWdodChkb2MpO1xuICAgICAgaWYgKGRvY0hlaWdodCAhPSB0aGlzLmVsZW1lbnQuaGVpZ2h0KVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBkb2NIZWlnaHQpO1xuICAgIH1cbiAgfSxcbiAgLyoqXG4gICAqICBnZXREb2N1bWVudCBnZXRzIHRoZSBpbnRlcm5hbCBkb2N1bWVudCBvZiB0aGUgaWZyYW1lXG4gICAqL1xuICBnZXREb2N1bWVudDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50IHx8ICh0aGlzLmVsZW1lbnQuY29udGVudFdpbmRvdyAmJiB0aGlzLmVsZW1lbnQuY29udGVudFdpbmRvdy5kb2N1bWVudCk7XG4gIH0sXG4gIC8qKlxuICAgKiAgYWRkcy9yZW1vdmVzIHRoZSAnc2hvdy1ncmlkJyBjbGFzcyB0byB0aGUgPGh0bWw+IGVsZW1lbnQgc28gd2UgY2FuIHNob3cgYSBncmlkIG92ZXJsYXlcbiAgICovXG4gIHRvZ2dsZUdyaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdldERvY3VtZW50KCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKVswXS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93LWdyaWQnKTtcbiAgfSxcbiAgLyoqXG4gICAqICBzZXRzIHRoZSB3aWR0aCBvZiB0aGUgaWZyYW1lLCB1c2VmdWwgZm9yIHNob3dpbmcgbWVkaWEgcXVlcmllc1xuICAgKi9cbiAgc2V0V2lkdGg6IGZ1bmN0aW9uICh3KSB7XG4gICAgaWYgKHcpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHcgKyAncHgnO1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZWQnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSAnJztcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdyZXNpemVkJyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VIdG1sU2FtcGxlcyAoKSB7XG4gIC8vIGdldCBzdHlsZXMgYW5kIHNjcmlwdHNcbiAgc3R5bGVzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zdHlsZXMgfHwgW107XG4gIHNjcmlwdHMgPSB3aW5kb3cuYWcgJiYgd2luZG93LmFnLnNjcmlwdHMgfHwgW107XG4gIC8vIGdldCBhbGwgb3VyIGN1c3RvbSBlbGVtZW50c1xuICB2YXIgZWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ha2UtaWZyYW1lJyk7XG4gIGZvciAodmFyIGkgPSBlbHMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICBuZXcgSHRtbFNhbXBsZShlbHNbaV0pO1xuICB9O1xufVxuXG4vKipcbiAqICBUb2dnbGUgSFRNTCBTYW1wbGUgR3JpZHNcbiAqXG4gKiAgVG9nZ2xlcyBhIGAuc2hvdy1ncmlkYCBjbGFzcyBvbiB0aGUgYDxodG1sPmAgZWxlbWVudCBpbnNpZGUgYWxsIHRoZVxuICogIGlmcmFtZXMuICBXaXRoIHRoZSBpbi1mcmFtZS5jc3Mgc3R5bGVzaGVldCBpbmNsdWRlZCwgdGhpcyB3aWxsIHR1cm4gb24gYSAxMlxuICogIGNvbHVtbiBncmlkIG92ZXJsYXkuXG4gKlxuICogIGpzOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS50b2dnbGVHcmlkcygpXG4gKlxuICogIHBhdGg6IC4vYXBwL2h0bWxfc2FtcGxlXG4gKi9cbnZhciB0b2dnbGVHcmlkcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yRWFjaChzYW1wbGVzLCBmdW5jdGlvbiAocykge1xuICAgIHMudG9nZ2xlR3JpZCgpO1xuICB9KTtcbn1cblxuLyoqKlxuICogIHNldFdpZHRoc1xuICpcbiAqICBTZXRzIGFsbCBgSHRtbFNhbXBsZWBzIHRvIHRoZSBwcm92aWRlZCB3aWR0aC5cbiAqXG4gKiAganM6XG4gKiAgICByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLnNldFdpZHRocyh3aWR0aCk7XG4gKlxuICogIEBwYXJhbSB7aW50fSB3aWR0aFxuICpcbiAqICBwYXRoOiAuL2FwcC9odG1sX3NhbXBsZVxuICovXG52YXIgc2V0V2lkdGhzID0gZnVuY3Rpb24gKHcpIHtcbiAgZm9yRWFjaChzYW1wbGVzLCBmdW5jdGlvbiAocykge1xuICAgIHMuc2V0V2lkdGgodyk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEh0bWxTYW1wbGU7XG5tb2R1bGUuZXhwb3J0cy5tYWtlQWxsID0gbWFrZUh0bWxTYW1wbGVzO1xubW9kdWxlLmV4cG9ydHMudG9nZ2xlR3JpZHMgPSB0b2dnbGVHcmlkcztcbm1vZHVsZS5leHBvcnRzLnNldFdpZHRocyA9IHNldFdpZHRocztcbiIsIi8qKipcbiAqIFRyYXlcbiAqXG4gKiBUaGUgY29sbGFwc2FibGUgc2lkZWJhciwgd2l0aCBwb3NzaWJpbGl0eSBvZiBtdWx0aXBsZSB0aWVycy5cbiAqXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnRcbiAqXG4gKiBAcHJvcCB7VHJheVRpZXIgYXJyYXl9IHRpZXJzXG4gKiBAcHJvcCB7Ym9vbGVhbn0gaXNPcGVuXG4gKlxuICogQG1ldGhvZCB7dm9pZH0gY2xvc2UoKSAtIGNsb3NlIHRyYXkgYW5kIGFsbCBpdHMgdGllcnNcbiAqIEBtZXRob2Qge3ZvaWR9IGNsb3NlVGllcnMoKSAtIGNsb3NlIGFsbCB0aWVyc1xuICogQG1ldGhvZCB7dm9pZH0gY2hlY2tTaG91bGRDbG9zZSgpIC0gY2hlY2sgaWYgd2UgbmVlZCB0byBjbG9zZSB0aGUgdHJheSBkdWUgdG8gYWxsIHRpZXJzIGJlaW5nIGNsb3NlZFxuICogQG1ldGhvZCB7dm9pZH0gdXBkYXRlUG9zaXRpb24oKSAtIHVwZGF0ZSB0b3AvYm90dG9tIG9mIGVsZW1lbnQsIGFzc3VtaW5nIGZpeGVkIHBvc1xuICovXG4vLyByZXF1aXJlbWVudHNcblxuLy8gc2V0dGluZ3NcblxuLy8gdGhlIGNsYXNzXG52YXIgVHJheSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMub2Zmc2V0UGFyZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICB0aGlzLmlzT3BlbiA9IHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLW9wZW4nKTtcbiAgdGhpcy50aWVycyA9IFtdO1xuXG4gIHZhciB0aWVyRWxzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50cmF5X190aWVyJyk7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aWVyRWxzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdGhpcy50aWVycy5wdXNoKG5ldyBUcmF5VGllciAodGllckVsc1tpXSwgdGhpcykpO1xuICB9XG5cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdmFyIGxhc3RTY3JvbGwgPSAwO1xuICAoZnVuY3Rpb24gY2hlY2tTY3JvbGwgKCkge1xuICAgIGlmICh3aW5kb3cuc2Nyb2xsWSAhPT0gbGFzdFNjcm9sbCkge1xuICAgICAgX3RoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgIGxhc3RTY3JvbGwgPSB3aW5kb3cuc2Nyb2xsWTtcbiAgICB9XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjaGVja1Njcm9sbCk7XG4gIH0pKCk7XG4gIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbn1cblRyYXkucHJvdG90eXBlID0ge1xuICBzZXRPcGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgfSxcbiAgc2V0Q2xvc2VkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgfSxcbiAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNsb3NlVGllcnMoKTtcbiAgICB0aGlzLnNldENsb3NlZCgpO1xuICB9LFxuICBjbG9zZVRpZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMudGllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRoaXMudGllcnNbaV0uY2xvc2UoKTtcbiAgICB9XG4gIH0sXG4gIGNoZWNrU2hvdWxkQ2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy50aWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMudGllcnNbaV0uaXNPcGVuKVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0Q2xvc2VkKCk7XG4gIH0sXG4gIHVwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNsaXBSZWN0ID0gdGhpcy5vZmZzZXRQYXJlbnQuZ2V0Q2xpZW50UmVjdHMoKVswXTtcbiAgICB2YXIgdG9wID0gTWF0aC5tYXgoY2xpcFJlY3QudG9wLCAwKTtcbiAgICB2YXIgYm90dG9tID0gTWF0aC5tYXgod2luZG93LmlubmVySGVpZ2h0IC0gY2xpcFJlY3QuYm90dG9tLCAwKTtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdG9wICsgJ3B4JztcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYm90dG9tID0gYm90dG9tICsgJ3B4JztcbiAgfVxufVxuXG4vKioqXG4gKiBUcmF5IFRpZXJcbiAqXG4gKiBJbmRpdmlkdWFsIHRpZXIgb2YgdGhlIHRyYXkuICBDbG9zZXMgb3RoZXIgdGllcnMgd2hlbiBvcGVuZWQsIGFuZCBtYXJrcyBwYXJlbnRcbiAqIHRyYXkgb3BlbiBhcyB3ZWxsLlxuICpcbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtUcmF5fSBwYXJlbnRUcmF5XG4gKlxuICogQG1ldGhvZCB7dm9pZH0gb3BlbigpXG4gKiBAbWV0aG9kIHt2b2lkfSBjbG9zZSgpXG4gKiBAbWV0aG9kIHt2b2lkfSB0b2dnbGUoKVxuICpcbiAqIEBwcm9wIHtib29sZWFufSBpc09wZW5cbiAqL1xudmFyIFRyYXlUaWVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIHBhcmVudFRyYXkpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5wYXJlbnRUcmF5ID0gcGFyZW50VHJheTtcblxuICB0aGlzLnRvZ2dsZUVsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50cmF5X19vcGVuZXInKTtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgaWYgKHRoaXMudG9nZ2xlRWxlbWVudCkge1xuICAgIHRoaXMudG9nZ2xlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzLnRvZ2dsZSgpO1xuICAgIH0pO1xuICB9XG59XG5UcmF5VGllci5wcm90b3R5cGUgPSB7XG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBhcmVudFRyYXkuY2xvc2VUaWVycygpO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuICAgIHRoaXMucGFyZW50VHJheS5zZXRPcGVuKCk7XG4gIH0sXG4gIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgIHRoaXMucGFyZW50VHJheS5jaGVja1Nob3VsZENsb3NlKCk7XG4gIH0sXG4gIHRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmlzT3BlbiA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICB9XG59XG5cbi8vIGF1dG9pbml0XG52YXIgdHJheUVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50cmF5Jyk7XG5mb3IgKHZhciBpID0gMCwgbGVuID0gdHJheUVscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICBuZXcgVHJheSh0cmF5RWxzW2ldKTtcbn1cbiIsIi8qKlxuICogIGhhbmRsZSBoYXNoY2hhbmdlXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIGFuaW1hdGVTY3JvbGwgPSByZXF1aXJlKCdsaWIvYW5pbWF0ZVNjcm9sbFRvJyk7XG52YXIgZ2V0UGFnZU9mZnNldCA9IHJlcXVpcmUoJ2xpYi9nZXRQYWdlT2Zmc2V0Jyk7XG5cbi8vIHNldHRpbmdzXG52YXIgT0ZGU0VUID0gMzI7XG5cbi8vIGxpc3RlbmVyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQod2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCcnKSk7XG4gIGFuaW1hdGVTY3JvbGwoZ2V0UGFnZU9mZnNldChlbCkudG9wIC0gT0ZGU0VUKTtcbn0pO1xuIiwiLyoqXG4gKiAgd2hvbGUgZGFtbiBzY3JpcHRcbiAqXG4gKiAgVGhpcyBzaG91bGQgaW5jbHVkZSBvYmplY3RzLCB3aGljaCBpbiB0dXJuIGluY2x1ZGUgdGhlIGxpYiBmaWxlcyB0aGV5IG5lZWQuXG4gKiAgVGhpcyBrZWVwcyB1cyB1c2luZyBhIG1vZHVsYXIgYXBwcm9hY2ggdG8gZGV2IHdoaWxlIGFsc28gb25seSBpbmNsdWRpbmcgdGhlXG4gKiAgcGFydHMgb2YgdGhlIGxpYnJhcnkgd2UgbmVlZC5cbiAqL1xucmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5tYWtlQWxsKCk7XG5yZXF1aXJlKCdhcHAvaGFzaGNoYW5nZScpO1xucmVxdWlyZSgnYXBwL0NvcHlhYmxlJyk7XG5yZXF1aXJlKCdhcHAvQ29sbGFwc2FibGUnKTtcbnJlcXVpcmUoJ2FwcC9UcmF5Jyk7XG4iLCIvKipcbiAqICBBbmltYXRlIFNjcm9sbCB0byBQb3NpdGlvblxuICpcbiAqICBBbmltYXRlcyB3aW5kb3cgc2Nyb2xsIHBvc2l0aW9uXG4gKlxuICogIEBwYXJhbSB7aW50fSAtIGVuZCBwb3NpdGlvbiBpbiBwaXhlbHNcbiAqXG4gKiAganM6XG4gKiAgICB2YXIgYW5pbWF0ZVNjcm9sbCA9IHJlcXVpcmUoJ2xpYi9hbmltYXRlU2Nyb2xsVG8nKTtcbiAqICAgIGFuaW1hdGVTY3JvbGwodG9wKTtcbiAqL1xuXG4vLyByZXF1aXJlbWVudHNcbnZhciBlYXNlcyA9IHJlcXVpcmUoJ2xpYi9lYXNlcycpO1xuXG4vLyBzZXR0aW5nc1xudmFyIG1pbkR1cmF0aW9uID0gMTAwMDtcblxuLy8gdGhlIGFuaW1hdGlvbiBjb250cm9sbGVyXG52YXIgc3RhcnRUaW1lLFxuICAgIGR1cmF0aW9uLFxuICAgIHN0YXJ0UG9zLFxuICAgIGRlbHRhU2Nyb2xsLFxuICAgIGxhc3RTY3JvbGxcbiAgICA7XG5cbihmdW5jdGlvbiB1cGRhdGVTY3JvbGwgKCkge1xuICBsYXN0U2Nyb2xsID0gd2luZG93LnNjcm9sbFk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGVTY3JvbGwpO1xufSkoKTtcblxudmFyIGFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcbiAgdmFyIGRlbHRhVGltZSA9IGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lO1xuICBpZiAoZGVsdGFUaW1lIDwgZHVyYXRpb24pIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgZWFzZXMuZWFzZUluT3V0KHN0YXJ0UG9zLCBkZWx0YVNjcm9sbCwgZGVsdGFUaW1lIC8gZHVyYXRpb24pKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgYW5pbWF0ZVNjcm9sbChuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIHN0YXJ0UG9zICsgZGVsdGFTY3JvbGwpO1xuICB9XG59XG5cbnZhciBzdGFydEFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbiAoZW5kU2Nyb2xsKSB7XG4gIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICBzdGFydFBvcyA9IGxhc3RTY3JvbGw7XG4gIGRlbHRhU2Nyb2xsID0gZW5kU2Nyb2xsIC0gc3RhcnRQb3M7XG4gIGR1cmF0aW9uID0gTWF0aC5tYXgobWluRHVyYXRpb24sIE1hdGguYWJzKGRlbHRhU2Nyb2xsKSAqIC4xKTtcbiAgYW5pbWF0ZVNjcm9sbChzdGFydFRpbWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0QW5pbWF0ZVNjcm9sbDtcbiIsIi8qKlxuICogIGEgYnVuY2ggb2YgZWFzaW5nIGZ1bmN0aW9ucyBmb3IgbWFraW5nIGFuaW1hdGlvbnNcbiAqICB0ZXN0aW5nIGlzIGZhaXJseSBzdWJqZWN0aXZlLCBzbyBub3QgYXV0b21hdGVkXG4gKi9cblxudmFyIGVhc2VzID0ge1xuICAnZWFzZUluT3V0JyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIGlmIChwIDwgLjUpIHtcbiAgICAgIHJldHVybiBzICsgYyAqICgyICogcCAqIHApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBzICsgYyAqICgtMiAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gICAgfVxuICB9LFxuICAnZWFzZUluT3V0Q3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgaWYgKHAgPCAuNSkge1xuICAgICAgcmV0dXJuIHMgKyBjICogKDQgKiBwICogcCAqIHApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBzICsgYyAqICg0ICogKHAgLSAxKSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSlcbiAgICB9XG4gIH0sXG4gICdlYXNlSW4nIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogcCAqIHA7XG4gIH0sXG4gICdlYXNlSW5DdWJpYycgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiAocCAqIHAgKiBwKTtcbiAgfSxcbiAgJ2Vhc2VPdXQnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKC0xICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKTtcbiAgfSxcbiAgJ2Vhc2VPdXRDdWJpYycgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiAoKHAgLSAxKSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gIH0sXG4gICdsaW5lYXInIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogcDtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBlYXNlcztcbiIsIi8qKipcbiAqICBHZXQgUGFnZSBPZmZzZXRcbiAqXG4gKiAgR2V0IGEgRE9NRWxlbWVudCdzIG9mZnNldCBmcm9tIHBhZ2VcbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fVxuICogIEByZXR1cm5zIG9iamVjdFxuICogICAgQHByb3Age251bWJlcn0gbGVmdFxuICogICAgQHByb3Age251bWJlcn0gdG9wXG4gKlxuICogIGpzOlxuICogICAgdmFyIGdldFBhZ2VPZmZzZXQgPSByZXF1aXJlKCdsaWIvZ2V0UGFnZU9mZnNldCcpO1xuICogICAgZ2V0UGFnZU9mZnNldChzb21lRWxlbWVudCk7XG4gKi9cbmZ1bmN0aW9uIGdldFBhZ2VPZmZzZXQgKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgdGhyb3cgJ2dldFBhZ2VPZmZzZXQgcGFzc2VkIGFuIGludmFsaWQgZWxlbWVudCc7XG4gIH1cbiAgdmFyIHBhZ2VPZmZzZXRYID0gZWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgICAgcGFnZU9mZnNldFkgPSBlbGVtZW50Lm9mZnNldFRvcDtcblxuICB3aGlsZSAoZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50KSB7XG4gICAgcGFnZU9mZnNldFggKz0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIHBhZ2VPZmZzZXRZICs9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsZWZ0IDogcGFnZU9mZnNldFgsXG4gICAgdG9wIDogcGFnZU9mZnNldFlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFBhZ2VPZmZzZXQ7XG4iLCIvKioqXG4gKiBmb3JFYWNoIEZ1bmN0aW9uXG4gKlxuICogSXRlcmF0ZSBvdmVyIGFuIGFycmF5LCBwYXNzaW5nIHRoZSB2YWx1ZSB0byB0aGUgcGFzc2VkIGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gdG8gY2FsbFxuICpcbiAqIGpzOlxuICogICB2YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcbiAqICAgZm9yRWFjaChzb21lQXJyYXksIGZ1bmN0aW9uIChpdGVtKSB7IGFsZXJ0KGl0ZW0pIH0pO1xuICovXG5mdW5jdGlvbiBmb3JFYWNoIChhcnIsIGZuKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBmbi5jYWxsKGFycltpXSxhcnJbaV0sYXJyKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2g7XG4iXX0=
