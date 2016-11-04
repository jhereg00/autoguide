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

},{"lib/util/forEach":11}],3:[function(require,module,exports){
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

// listen for input change
var sizeInput = document.getElementsByName('htmlSampleSize')[0];
if (sizeInput) {
  sizeInput.addEventListener('change', function (e) {
    setWidths(this.value);
  });
}

module.exports = HtmlSample;
module.exports.makeAll = makeHtmlSamples;
module.exports.toggleGrids = toggleGrids;
module.exports.setWidths = setWidths;

},{"lib/util/forEach":11}],4:[function(require,module,exports){
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
/***
 * Update Input
 *
 * Automatically update an input's value on click of an element.
 *
 * The element is expected to have `[data-update={inputName}]`. If it has the class
 * `js-update-input`, it will be initialized automatically.
 *
 * @param {DOMElement} element
 *
 * html:
 *   <input name="example">
 *   <button class="button js-update-input" data-update="example" value="200">Make 200</button>
 *
 * js:
 *   var updateBtn = new UpdateInput(document.querySelector('[data-update]'));
 */
// requirements

// settings

// class
var UpdateInput = function (element) {
  this.element = element;
  this.input = document.querySelector('[name="' + element.getAttribute('data-update') + '"]');

  if (this.element && this.input) {
    var _this = this;
    this.element.addEventListener('click', function (e) {
      e.preventDefault();
      _this.input.value = this.value;
      if ("createEvent" in document) {
          var evt = document.createEvent("HTMLEvents");
          evt.initEvent("change", false, true);
          _this.input.dispatchEvent(evt);
      }
      else
          _this.input.fireEvent("onchange");
    });
  }
}

// auto init
var updateInputEls = document.querySelectorAll('.js-update-input');
for (var i = 0, len = updateInputEls.length; i < len; i++) {
  new UpdateInput(updateInputEls[i]);
}

},{}],6:[function(require,module,exports){
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

},{"lib/animateScrollTo":8,"lib/getPageOffset":10}],7:[function(require,module,exports){
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
require('app/UpdateInput');

},{"app/Collapsable":1,"app/Copyable":2,"app/HtmlSample":3,"app/Tray":4,"app/UpdateInput":5,"app/hashchange":6}],8:[function(require,module,exports){
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

},{"lib/eases":9}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29sbGFwc2FibGUuanMiLCJhcHAvQ29weWFibGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL1VwZGF0ZUlucHV0LmpzIiwiYXBwL2hhc2hjaGFuZ2UuanMiLCJhdXRvZ3VpZGUuanMiLCJsaWIvYW5pbWF0ZVNjcm9sbFRvLmpzIiwibGliL2Vhc2VzLmpzIiwibGliL2dldFBhZ2VPZmZzZXQuanMiLCJsaWIvdXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKipcbiAqIENvbGxhcHNhYmxlXG4gKlxuICogQXV0by1pbml0aWFsaXplZCBjbGFzcyB0aGF0IGxvb2tzIGZvciBgLmpzLWNvbGxhcHNhYmxlYCB3aXRoIGAuanMtY29sbGFwc2FibGVfX3RvZ2dsZWBcbiAqIGFuZCBgLmpzLWNvbGxhcHNhYmxlX19jb250ZW50YC5cbiAqXG4gKiBBZGQgdGhlIGNsYXNzIGBpcy1vcGVuYCB0byB0aGUgYC5qcy1jb2xsYXBzYWJsZWAgZWxlbWVudCB0byBoYXZlIGl0IG9wZW4gaXRzZWxmXG4gKiBpbW1lZGlhdGVseS4gIGBpcy1vcGVuYCBpcyBhbHNvIHRoZSBzdGF0ZSBjbGFzcyB0aGF0IGdldHMgdG9nZ2xlZC5cbiAqXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnRcbiAqICAgZXhwZWN0ZWQgdG8gaGF2ZSBjaGlsZHJlbiB3aXRoIGAuanMtY29sbGFwc2FibGVfX3RvZ2dsZWAgYW5kIGAuanMtY29sbGFwc2FibGVfX2NvbnRlbnRgXG4gKlxuICogQG1ldGhvZCB7dm9pZH0gdG9nZ2xlKCkgLSB0b2dnbGVzIG9wZW4vY2xvc2VkXG4gKiBAbWV0aG9kIHt2b2lkfSBvcGVuKCkgLSBvcGVucyBfX2NvbnRlbnQsIG9yIGRvZXMgbm90aGluZyBpZiBhbHJlYWR5IG9wZW5cbiAqIEBtZXRob2Qge3ZvaWR9IGNsb3NlKCkgLSBjbG9zZXMgX19jb250ZW50LCBvciBkb2VzIG5vdGhpbmcgaWYgYWxyZWFkeSBjbG9zZWRcbiAqXG4gKiBAcHJvcCB7Ym9vbGVhbn0gaXNPcGVuXG4gKlxuICogaHRtbDpcbiAqICAgPGRpdiBjbGFzcz1cImpzLWNvbGxhcHNhYmxlXCI+XG4gKiAgICAgPGJ1dHRvbiBjbGFzcz1cImpzLWNvbGxhcHNhYmxlX190b2dnbGVcIj5Ub2dnbGU8L2J1dHRvbj5cbiAqICAgICA8ZGl2IGNsYXNzPVwianMtY29sbGFwc2FibGVfX2NvbnRlbnRcIj5cbiAqICAgICAgIDx1bD48bGk+ZmlsbDwvbGk+PGxpPnNvbWU8L2xpPjxsaT5zcGFjZTwvbGk+PC91bD5cbiAqICAgICA8L2Rpdj5cbiAqICAgPC9kaXY+XG4gKlxuICoganM6XG4gKiAgIC8vIGNyZWF0ZSAobm90IG5lY2Vzc2FyeSwgc2luY2UgaXQgYWxyZWFkeSBsb29rcyBmb3IgYWxsIC5qcy1jb2xsYXBzYWJsZSBlbGVtZW50cylcbiAqICAgdmFyIGNvbGxhcHNhYmxlID0gbmV3IENvbGxhcHNhYmxlIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY29sbGFwc2FibGUnKSk7XG4gKiAgIC8vIHRvZ2dsZSBpdCBvcGVuL2Nsb3NlZFxuICogICBjb2xsYXBzYWJsZS50b2dnbGUoKTtcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG5cbi8vIHNldHRpbmdzXG5cbi8vIG1haW4gY2xhc3NcbnZhciBDb2xsYXBzYWJsZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMudG9nZ2xlRWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNvbGxhcHNhYmxlX190b2dnbGUnKTtcbiAgdGhpcy5jb250ZW50RWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNvbGxhcHNhYmxlX19jb250ZW50Jyk7XG5cbiAgaWYgKCF0aGlzLmVsZW1lbnQgfHwgIXRoaXMudG9nZ2xlRWxlbWVudCB8fCAhdGhpcy5jb250ZW50RWxlbWVudCkge1xuICAgIHJldHVybiBjb25zb2xlLmVycm9yKHRoaXMuZWxlbWVudCwgdGhpcy50b2dnbGVFbGVtZW50LCB0aGlzLmNvbnRlbnRFbGVtZW50KTtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMudG9nZ2xlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy50b2dnbGUoKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1vcGVuJykpIHtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgIH1cbiAgfVxufVxuQ29sbGFwc2FibGUucHJvdG90eXBlID0ge1xuICB0b2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pc09wZW4gPyB0aGlzLmNsb3NlKCkgOiB0aGlzLm9wZW4oKTtcbiAgfSxcbiAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgdGhpcy5jb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmNvbnRlbnRFbGVtZW50LnNjcm9sbEhlaWdodCArICdweCc7XG4gICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgdGhpcy5jb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMCc7XG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgfVxufVxuXG4vLyBpbml0IHRoZW0gYWxsXG52YXIgY29sbGFwc2FibGVFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY29sbGFwc2FibGUnKTtcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2xsYXBzYWJsZUVscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICBuZXcgQ29sbGFwc2FibGUoY29sbGFwc2FibGVFbHNbaV0pO1xufVxuIiwiLyoqKlxuICogIENvcHlhYmxlXG4gKlxuICogIE1ha2VzIGFuIGVsZW1lbnQgY2xpY2thYmxlLCBjb3B5aW5nIGEgc3RyaW5nIHRvIHRoZSB1c2VyJ3MgY2xpcGJvYXJkLiAgVG8gc2VlXG4gKiAgaG93IGl0IGxvb2tzLCBjaGVjayBvdXQgW3RoZSBodG1sIHNhbXBsZV0oIy9hdG9tcy9jb3B5YWJsZS1lbGVtZW50KS5cbiAqXG4gKiAgSW5pdGlhbGl6ZXMgYXV0b21hdGljYWxseSBvbiBlbGVtZW50cyB3aXRoIGBbZGF0YS1jb3B5XWAgYXMgYW4gYXR0cmlidXRlLlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnRcbiAqICBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIHRvIGNvcHlcbiAqXG4gKiAgQG1ldGhvZCB7RE9NRWxlbWVudH0gbWFrZUlucHV0KCkgLSBpbnRlcm5hbCBmdW5jdGlvbiB0byBtYWtlIHRoZSBpbnB1dCBmcm9tXG4gKiAgICB3aGljaCB0aGUgc3RyaW5nIHdpbGwgYmUgY29waWVkLlxuICogIEBtZXRob2QgY29weSgpIC0gY29waWVzIHN0cmluZyB0byBjbGlwYm9hcmQuIExpc3RlbmVyIGlzIGF1dG9tYXRpY2FsbHkgYWRkZWQsXG4gKiAgICBzbyB5b3Ugc2hvdWxkbid0IG5lZWQgdG8gbWFudWFsbHkgY2FsbCB0aGlzLlxuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuXG4vLyBzZXR0aW5nc1xuXG4vLyB0aGUgY2xhc3NcbnZhciBDb3B5YWJsZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBzdHJpbmcpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG5cbiAgaWYgKGRvY3VtZW50LmV4ZWNDb21tYW5kKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdjb3B5YWJsZS1lbmFibGVkJyk7XG4gICAgdGhpcy5tYWtlSW5wdXQoKTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy5jb3B5KCk7XG4gICAgfSk7XG4gIH1cbn1cbkNvcHlhYmxlLnByb3RvdHlwZSA9IHtcbiAgbWFrZUlucHV0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgdGhpcy5pbnB1dC5jbGFzc0xpc3QuYWRkKCd2aXN1YWxseWhpZGRlbicpO1xuICAgIHRoaXMuaW5wdXQudmFsdWUgPSB0aGlzLnN0cmluZztcbiAgICByZXR1cm4gdGhpcy5pbnB1dDtcbiAgfSxcbiAgY29weTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmlucHV0LCB0aGlzLmVsZW1lbnQpO1xuICAgIHRoaXMuaW5wdXQuc2VsZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7fTtcbiAgICB0aGlzLmlucHV0LmJsdXIoKTtcbiAgICB0aGlzLmlucHV0LnJlbW92ZSgpO1xuICB9XG59XG5cbi8vIGF1dG8tZ2VuZXJhdGVcbnZhciBjb3B5YWJsZXMgPSBbXTtcbnZhciBjb3B5YWJsZUVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWNvcHldJyk7XG5mb3JFYWNoKGNvcHlhYmxlRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgY29weWFibGVzLnB1c2gobmV3IENvcHlhYmxlIChlbCwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNvcHknKSkpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29weWFibGU7XG4iLCIvKioqXG4gKiBIVE1MIFNhbXBsZVxuICpcbiAqIFRoZSBpZnJhbWVzIHRoYXQgc2hvdyBhbiBleGFtcGxlIG9mIHRoZSBvdXRwdXQgb2YgYSBjb21wb25lbnQuXG4gKi9cblxuLyoqKlxuICogIE1ha2UgQWxsIEh0bWwgU2FtcGxlc1xuICpcbiAqICBTZWFyY2hlcyBmb3IgYWxsIGA8bWFrZS1pZnJhbWU+YCBlbGVtZW50cyBhbmQgZG9lcyBqdXN0IHRoYXQ6IG1ha2VzIHRoZW0gaWZyYW1lcy5cbiAqICBJdCBhbHNvIGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmQgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYFxuICogIG9iamVjdC4gIFRob3NlIHNob3VsZCBiZSBwb3B1bGF0ZWQgYnkgdGhlIHRlbXBsYXRlLlxuICpcbiAqICBqczpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykubWFrZUFsbCgpOyAvLyBnb2VzIHRocm91Z2ggdGhlIHdob2xlIHBhZ2UgYW5kIGRvZXMgaXRzIHRoaW5nXG4gKlxuICogIHBhdGg6IC4vYXBwL2h0bWxfc2FtcGxlXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGhlbHBlcnNcbi8qKlxuICogR2V0IGRvY3VtZW50IGhlaWdodCAoc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExNDU4NTAvKVxuICpcbiAqIEBwYXJhbSAge0RvY3VtZW50fSBkb2NcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RG9jdW1lbnRIZWlnaHQgKGRvYykge1xuICBkb2MgPSBkb2MgfHwgZG9jdW1lbnQ7XG4gIHZhciBib2R5ID0gZG9jLmJvZHk7XG4gIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcblxuICBpZiAoIWJvZHkgfHwgIWh0bWwpXG4gICAgcmV0dXJuIDA7XG5cbiAgcmV0dXJuIE1hdGgubWF4KFxuICAgIGJvZHkub2Zmc2V0SGVpZ2h0LFxuICAgIGh0bWwub2Zmc2V0SGVpZ2h0XG4gICk7XG59XG5cbi8vIGRvIHRoaW5ncyFcbi8vIGdldCBzb21lIG1ldGEgdGFnc1xudmFyIG1ldGFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YScpO1xudmFyIHN0eWxlcywgc2NyaXB0cztcbnZhciBzYW1wbGVzID0gW107XG5cbi8qKipcbiAqICBgSHRtbFNhbXBsZWAgQ2xhc3NcbiAqXG4gKiAgQ29udHJvbHMgYW4gaW5kaXZpZHVhbCBIVE1MIFNhbXBsZSwgd2hpY2ggaXMgYW4gaWZyYW1lIHRoYXQgbG9hZHMgdGhlIGNzcyBhbmRcbiAqICBzY3JpcHRzIHRoYXQgdGhlIHN0eWxlZ3VpZGUgaXMgbWVhbnQgdG8gc2hvdy4gSXQgaW5jbHVkZXMgdGhlIHN0eWxlc2hlZXRzIGFuZFxuICogIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2Agb2JqZWN0LlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IHNvdXJjZUVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byB0dXJuIGludG8gYW4gaWZyYW1lXG4gKlxuICogIEBtZXRob2Qge3ZvaWR9IGJ1aWxkQ29udGVudCgpIC0gYnVpbGRzIGEgc3RyaW5nIG9mIHRoZSBlbGVtZW50IGFzIGEgZnVsbCBodG1sIGRvY3VtZW50XG4gKiAgICBhbmQgYXNzaWducyBpdCBhcyB0aGUgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZS5cbiAqICBAbWV0aG9kIHt2b2lkfSBhdXRvSGVpZ2h0KCkgLSBhbHRlcnMgdGhlIGhlaWdodCBvZiB0aGUgaWZyYW1lIHRvIGJlIHRoZSBtaW5pbXVtIG5lZWRlZCB0b1xuICogICAgZWxpbWluYXRlIGEgc2Nyb2xsYmFyLiAgQXV0b21hdGljYWxseSBjYWxsZWQgb24gYSBwZXIgYW5pbWF0aW9uIGZyYW1lIGJhc2lzLlxuICogIEBtZXRob2Qge0RPTUVsZW1lbnR9IGdldERvY3VtZW50KCkgLSByZXR1cm5zIHRoZSBpZnJhbWUncyBkb2N1bWVudCBvYmplY3RcbiAqICBAbWV0aG9kIHt2b2lkfSB0b2dnbGVHcmlkKCkgLSBhZGRzL3JlbW92ZXMgdGhlICdzaG93LWdyaWQnIGNsYXNzIHRvIHRoZSA8aHRtbD4gZWxlbWVudFxuICogICAgc28gd2UgY2FuIHNob3cgYSBncmlkIG92ZXJsYXlcbiAqICBAbWV0aG9kIHt2b2lkfSBzZXRXaWR0aCh3aWR0aCkgLSBzZXRzIHRoZSB3aWR0aCBvZiB0aGUgaWZyYW1lLCB1c2VmdWwgZm9yIHNob3dpbmdcbiAqICAgIG1lZGlhIHF1ZXJpZXNcbiAqICAgIEBwYXJhbSB7aW50fSB3aWR0aCAtIHdpZHRoIGluIHBpeGVscy4gUmVzZXRzIHRvIGRlZmF1bHQgc2l6ZSBpZiBmYWxzeVxuICpcbiAqICBAcHJvcCBlbGVtZW50IC0gdGhlIGFjdHVhbCBpZnJhbWUgZWxlbWVudFxuICpcbiAqICBwYXRoOiAuL2FwcC9odG1sX3NhbXBsZVxuICogIG9yZGVyOiAwXG4gKi9cbnZhciBIdG1sU2FtcGxlID0gZnVuY3Rpb24gKHNvdXJjZUVsZW1lbnQpIHtcbiAgdGhpcy5zb3VyY2VFbGVtZW50ID0gc291cmNlRWxlbWVudDtcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgdGhpcy5zb3VyY2VFbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKSk7XG5cbiAgdGhpcy5idWlsZENvbnRlbnQoKTtcbiAgdGhpcy5zb3VyY2VFbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRoaXMuZWxlbWVudCwgdGhpcy5zb3VyY2VFbGVtZW50KTtcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuICAoZnVuY3Rpb24gY2hlY2tJZnJhbWVIZWlnaHQgKCkge1xuICAgIF90aGlzLmF1dG9IZWlnaHQoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2hlY2tJZnJhbWVIZWlnaHQpO1xuICB9KSgpO1xuXG4gIHNhbXBsZXMucHVzaCh0aGlzKTtcbn1cbkh0bWxTYW1wbGUucHJvdG90eXBlID0ge1xuICAvKipcbiAgICogIGJ1aWxkQ29udGVudCBjcmVhdGVzIGEgc3RyaW5nIHRvIHVzZSBhcyB0aGUgZG9jdW1lbnQgZm9yIHRoZSBpZnJhbWVcbiAgICovXG4gIGJ1aWxkQ29udGVudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ZW50ID0gJzwhZG9jdHlwZSBodG1sPic7XG4gICAgY29udGVudCArPSAnPGh0bWwgY2xhc3M9XCJzaG93LWRldiAnICsgKHRoaXMuc291cmNlRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZzJykgPyAnZnMnIDogJ25vdC1mcycpICsgJ1wiPjxoZWFkPic7XG4gICAgZm9yRWFjaChtZXRhcyxmdW5jdGlvbiAobWV0YSkge1xuICAgICAgY29udGVudCArPSBtZXRhLm91dGVySFRNTDtcbiAgICB9KTtcbiAgICBmb3JFYWNoKHN0eWxlcyxmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIGNvbnRlbnQgKz0gJzxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiJyArIHN0eWxlICsgJ1wiPic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSAnPC9oZWFkPjxib2R5Pic7XG4gICAgY29udGVudCArPSB0aGlzLnNvdXJjZUVsZW1lbnQuaW5uZXJIVE1MO1xuICAgIGZvckVhY2goc2NyaXB0cyxmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICBjb250ZW50ICs9ICc8c2NyaXB0IHNyYz1cIicgKyBzY3JpcHQgKyAnXCI+PC9zY3JpcHQ+JztcbiAgICB9KTtcbiAgICBjb250ZW50ICs9IFwiPC9ib2R5PjwvaHRtbD5cIjtcbiAgICB0aGlzLmVsZW1lbnQuc3JjZG9jID0gY29udGVudDtcbiAgfSxcbiAgLyoqXG4gICAqICBhdXRvSGVpZ2h0IHVwZGF0ZXMgdGhlIGhlaWdodCBvZiB0aGUgaWZyYW1lIHRvIGV4YWN0bHkgY29udGFpbiBpdHMgY29udGVudFxuICAgKi9cbiAgYXV0b0hlaWdodDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkb2MgPSB0aGlzLmdldERvY3VtZW50KCk7XG4gICAgaWYgKGRvYykge1xuICAgICAgdmFyIGRvY0hlaWdodCA9IGdldERvY3VtZW50SGVpZ2h0KGRvYyk7XG4gICAgICBpZiAoZG9jSGVpZ2h0ICE9IHRoaXMuZWxlbWVudC5oZWlnaHQpXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGRvY0hlaWdodCk7XG4gICAgfVxuICB9LFxuICAvKipcbiAgICogIGdldERvY3VtZW50IGdldHMgdGhlIGludGVybmFsIGRvY3VtZW50IG9mIHRoZSBpZnJhbWVcbiAgICovXG4gIGdldERvY3VtZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jb250ZW50RG9jdW1lbnQgfHwgKHRoaXMuZWxlbWVudC5jb250ZW50V2luZG93ICYmIHRoaXMuZWxlbWVudC5jb250ZW50V2luZG93LmRvY3VtZW50KTtcbiAgfSxcbiAgLyoqXG4gICAqICBhZGRzL3JlbW92ZXMgdGhlICdzaG93LWdyaWQnIGNsYXNzIHRvIHRoZSA8aHRtbD4gZWxlbWVudCBzbyB3ZSBjYW4gc2hvdyBhIGdyaWQgb3ZlcmxheVxuICAgKi9cbiAgdG9nZ2xlR3JpZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2V0RG9jdW1lbnQoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpWzBdLmNsYXNzTGlzdC50b2dnbGUoJ3Nob3ctZ3JpZCcpO1xuICB9LFxuICAvKipcbiAgICogIHNldHMgdGhlIHdpZHRoIG9mIHRoZSBpZnJhbWUsIHVzZWZ1bCBmb3Igc2hvd2luZyBtZWRpYSBxdWVyaWVzXG4gICAqL1xuICBzZXRXaWR0aDogZnVuY3Rpb24gKHcpIHtcbiAgICBpZiAodykge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdyArICdweCc7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgncmVzaXplZCcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9ICcnO1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Jlc2l6ZWQnKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZUh0bWxTYW1wbGVzICgpIHtcbiAgLy8gZ2V0IHN0eWxlcyBhbmQgc2NyaXB0c1xuICBzdHlsZXMgPSB3aW5kb3cuYWcgJiYgd2luZG93LmFnLnN0eWxlcyB8fCBbXTtcbiAgc2NyaXB0cyA9IHdpbmRvdy5hZyAmJiB3aW5kb3cuYWcuc2NyaXB0cyB8fCBbXTtcbiAgLy8gZ2V0IGFsbCBvdXIgY3VzdG9tIGVsZW1lbnRzXG4gIHZhciBlbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWFrZS1pZnJhbWUnKTtcbiAgZm9yICh2YXIgaSA9IGVscy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgIG5ldyBIdG1sU2FtcGxlKGVsc1tpXSk7XG4gIH07XG59XG5cbi8qKlxuICogIFRvZ2dsZSBIVE1MIFNhbXBsZSBHcmlkc1xuICpcbiAqICBUb2dnbGVzIGEgYC5zaG93LWdyaWRgIGNsYXNzIG9uIHRoZSBgPGh0bWw+YCBlbGVtZW50IGluc2lkZSBhbGwgdGhlXG4gKiAgaWZyYW1lcy4gIFdpdGggdGhlIGluLWZyYW1lLmNzcyBzdHlsZXNoZWV0IGluY2x1ZGVkLCB0aGlzIHdpbGwgdHVybiBvbiBhIDEyXG4gKiAgY29sdW1uIGdyaWQgb3ZlcmxheS5cbiAqXG4gKiAganM6XG4gKiAgICByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLnRvZ2dsZUdyaWRzKClcbiAqXG4gKiAgcGF0aDogLi9hcHAvaHRtbF9zYW1wbGVcbiAqL1xudmFyIHRvZ2dsZUdyaWRzID0gZnVuY3Rpb24gKCkge1xuICBmb3JFYWNoKHNhbXBsZXMsIGZ1bmN0aW9uIChzKSB7XG4gICAgcy50b2dnbGVHcmlkKCk7XG4gIH0pO1xufVxuXG4vKioqXG4gKiAgc2V0V2lkdGhzXG4gKlxuICogIFNldHMgYWxsIGBIdG1sU2FtcGxlYHMgdG8gdGhlIHByb3ZpZGVkIHdpZHRoLlxuICpcbiAqICBqczpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykuc2V0V2lkdGhzKHdpZHRoKTtcbiAqXG4gKiAgQHBhcmFtIHtpbnR9IHdpZHRoXG4gKlxuICogIHBhdGg6IC4vYXBwL2h0bWxfc2FtcGxlXG4gKi9cbnZhciBzZXRXaWR0aHMgPSBmdW5jdGlvbiAodykge1xuICBmb3JFYWNoKHNhbXBsZXMsIGZ1bmN0aW9uIChzKSB7XG4gICAgcy5zZXRXaWR0aCh3KTtcbiAgfSk7XG59XG5cbi8vIGxpc3RlbiBmb3IgaW5wdXQgY2hhbmdlXG52YXIgc2l6ZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoJ2h0bWxTYW1wbGVTaXplJylbMF07XG5pZiAoc2l6ZUlucHV0KSB7XG4gIHNpemVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgIHNldFdpZHRocyh0aGlzLnZhbHVlKTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSHRtbFNhbXBsZTtcbm1vZHVsZS5leHBvcnRzLm1ha2VBbGwgPSBtYWtlSHRtbFNhbXBsZXM7XG5tb2R1bGUuZXhwb3J0cy50b2dnbGVHcmlkcyA9IHRvZ2dsZUdyaWRzO1xubW9kdWxlLmV4cG9ydHMuc2V0V2lkdGhzID0gc2V0V2lkdGhzO1xuIiwiLyoqKlxuICogVHJheVxuICpcbiAqIFRoZSBjb2xsYXBzYWJsZSBzaWRlYmFyLCB3aXRoIHBvc3NpYmlsaXR5IG9mIG11bHRpcGxlIHRpZXJzLlxuICpcbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudFxuICpcbiAqIEBwcm9wIHtUcmF5VGllciBhcnJheX0gdGllcnNcbiAqIEBwcm9wIHtib29sZWFufSBpc09wZW5cbiAqXG4gKiBAbWV0aG9kIHt2b2lkfSBjbG9zZSgpIC0gY2xvc2UgdHJheSBhbmQgYWxsIGl0cyB0aWVyc1xuICogQG1ldGhvZCB7dm9pZH0gY2xvc2VUaWVycygpIC0gY2xvc2UgYWxsIHRpZXJzXG4gKiBAbWV0aG9kIHt2b2lkfSBjaGVja1Nob3VsZENsb3NlKCkgLSBjaGVjayBpZiB3ZSBuZWVkIHRvIGNsb3NlIHRoZSB0cmF5IGR1ZSB0byBhbGwgdGllcnMgYmVpbmcgY2xvc2VkXG4gKiBAbWV0aG9kIHt2b2lkfSB1cGRhdGVQb3NpdGlvbigpIC0gdXBkYXRlIHRvcC9ib3R0b20gb2YgZWxlbWVudCwgYXNzdW1pbmcgZml4ZWQgcG9zXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xuXG4vLyBzZXR0aW5nc1xuXG4vLyB0aGUgY2xhc3NcbnZhciBUcmF5ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5vZmZzZXRQYXJlbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gIHRoaXMuaXNPcGVuID0gdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnaXMtb3BlbicpO1xuICB0aGlzLnRpZXJzID0gW107XG5cbiAgdmFyIHRpZXJFbHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRyYXlfX3RpZXInKTtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRpZXJFbHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB0aGlzLnRpZXJzLnB1c2gobmV3IFRyYXlUaWVyICh0aWVyRWxzW2ldLCB0aGlzKSk7XG4gIH1cblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB2YXIgbGFzdFNjcm9sbCA9IDA7XG4gIChmdW5jdGlvbiBjaGVja1Njcm9sbCAoKSB7XG4gICAgaWYgKHdpbmRvdy5zY3JvbGxZICE9PSBsYXN0U2Nyb2xsKSB7XG4gICAgICBfdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgbGFzdFNjcm9sbCA9IHdpbmRvdy5zY3JvbGxZO1xuICAgIH1cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrU2Nyb2xsKTtcbiAgfSkoKTtcbiAgdGhpcy51cGRhdGVQb3NpdGlvbigpO1xufVxuVHJheS5wcm90b3R5cGUgPSB7XG4gIHNldE9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICB9LFxuICBzZXRDbG9zZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2xvc2VUaWVycygpO1xuICAgIHRoaXMuc2V0Q2xvc2VkKCk7XG4gIH0sXG4gIGNsb3NlVGllcnM6IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy50aWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGhpcy50aWVyc1tpXS5jbG9zZSgpO1xuICAgIH1cbiAgfSxcbiAgY2hlY2tTaG91bGRDbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnRpZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy50aWVyc1tpXS5pc09wZW4pXG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRDbG9zZWQoKTtcbiAgfSxcbiAgdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2xpcFJlY3QgPSB0aGlzLm9mZnNldFBhcmVudC5nZXRDbGllbnRSZWN0cygpWzBdO1xuICAgIHZhciB0b3AgPSBNYXRoLm1heChjbGlwUmVjdC50b3AsIDApO1xuICAgIHZhciBib3R0b20gPSBNYXRoLm1heCh3aW5kb3cuaW5uZXJIZWlnaHQgLSBjbGlwUmVjdC5ib3R0b20sIDApO1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5ib3R0b20gPSBib3R0b20gKyAncHgnO1xuICB9XG59XG5cbi8qKipcbiAqIFRyYXkgVGllclxuICpcbiAqIEluZGl2aWR1YWwgdGllciBvZiB0aGUgdHJheS4gIENsb3NlcyBvdGhlciB0aWVycyB3aGVuIG9wZW5lZCwgYW5kIG1hcmtzIHBhcmVudFxuICogdHJheSBvcGVuIGFzIHdlbGwuXG4gKlxuICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1RyYXl9IHBhcmVudFRyYXlcbiAqXG4gKiBAbWV0aG9kIHt2b2lkfSBvcGVuKClcbiAqIEBtZXRob2Qge3ZvaWR9IGNsb3NlKClcbiAqIEBtZXRob2Qge3ZvaWR9IHRvZ2dsZSgpXG4gKlxuICogQHByb3Age2Jvb2xlYW59IGlzT3BlblxuICovXG52YXIgVHJheVRpZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgcGFyZW50VHJheSkge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLnBhcmVudFRyYXkgPSBwYXJlbnRUcmF5O1xuXG4gIHRoaXMudG9nZ2xlRWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRyYXlfX29wZW5lcicpO1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICBpZiAodGhpcy50b2dnbGVFbGVtZW50KSB7XG4gICAgdGhpcy50b2dnbGVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMudG9nZ2xlKCk7XG4gICAgfSk7XG4gIH1cbn1cblRyYXlUaWVyLnByb3RvdHlwZSA9IHtcbiAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGFyZW50VHJheS5jbG9zZVRpZXJzKCk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgdGhpcy5wYXJlbnRUcmF5LnNldE9wZW4oKTtcbiAgfSxcbiAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5wYXJlbnRUcmF5LmNoZWNrU2hvdWxkQ2xvc2UoKTtcbiAgfSxcbiAgdG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNPcGVuID8gdGhpcy5jbG9zZSgpIDogdGhpcy5vcGVuKCk7XG4gIH1cbn1cblxuLy8gYXV0b2luaXRcbnZhciB0cmF5RWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRyYXknKTtcbmZvciAodmFyIGkgPSAwLCBsZW4gPSB0cmF5RWxzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gIG5ldyBUcmF5KHRyYXlFbHNbaV0pO1xufVxuIiwiLyoqKlxuICogVXBkYXRlIElucHV0XG4gKlxuICogQXV0b21hdGljYWxseSB1cGRhdGUgYW4gaW5wdXQncyB2YWx1ZSBvbiBjbGljayBvZiBhbiBlbGVtZW50LlxuICpcbiAqIFRoZSBlbGVtZW50IGlzIGV4cGVjdGVkIHRvIGhhdmUgYFtkYXRhLXVwZGF0ZT17aW5wdXROYW1lfV1gLiBJZiBpdCBoYXMgdGhlIGNsYXNzXG4gKiBganMtdXBkYXRlLWlucHV0YCwgaXQgd2lsbCBiZSBpbml0aWFsaXplZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudFxuICpcbiAqIGh0bWw6XG4gKiAgIDxpbnB1dCBuYW1lPVwiZXhhbXBsZVwiPlxuICogICA8YnV0dG9uIGNsYXNzPVwiYnV0dG9uIGpzLXVwZGF0ZS1pbnB1dFwiIGRhdGEtdXBkYXRlPVwiZXhhbXBsZVwiIHZhbHVlPVwiMjAwXCI+TWFrZSAyMDA8L2J1dHRvbj5cbiAqXG4gKiBqczpcbiAqICAgdmFyIHVwZGF0ZUJ0biA9IG5ldyBVcGRhdGVJbnB1dChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS11cGRhdGVdJykpO1xuICovXG4vLyByZXF1aXJlbWVudHNcblxuLy8gc2V0dGluZ3NcblxuLy8gY2xhc3NcbnZhciBVcGRhdGVJbnB1dCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMuaW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cIicgKyBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS11cGRhdGUnKSArICdcIl0nKTtcblxuICBpZiAodGhpcy5lbGVtZW50ICYmIHRoaXMuaW5wdXQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy5pbnB1dC52YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICBpZiAoXCJjcmVhdGVFdmVudFwiIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgdmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTtcbiAgICAgICAgICBldnQuaW5pdEV2ZW50KFwiY2hhbmdlXCIsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBfdGhpcy5pbnB1dC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgICB9XG4gICAgICBlbHNlXG4gICAgICAgICAgX3RoaXMuaW5wdXQuZmlyZUV2ZW50KFwib25jaGFuZ2VcIik7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gYXV0byBpbml0XG52YXIgdXBkYXRlSW5wdXRFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtdXBkYXRlLWlucHV0Jyk7XG5mb3IgKHZhciBpID0gMCwgbGVuID0gdXBkYXRlSW5wdXRFbHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgbmV3IFVwZGF0ZUlucHV0KHVwZGF0ZUlucHV0RWxzW2ldKTtcbn1cbiIsIi8qKlxuICogIGhhbmRsZSBoYXNoY2hhbmdlXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIGFuaW1hdGVTY3JvbGwgPSByZXF1aXJlKCdsaWIvYW5pbWF0ZVNjcm9sbFRvJyk7XG52YXIgZ2V0UGFnZU9mZnNldCA9IHJlcXVpcmUoJ2xpYi9nZXRQYWdlT2Zmc2V0Jyk7XG5cbi8vIHNldHRpbmdzXG52YXIgT0ZGU0VUID0gMzI7XG5cbi8vIGxpc3RlbmVyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQod2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCcnKSk7XG4gIGFuaW1hdGVTY3JvbGwoZ2V0UGFnZU9mZnNldChlbCkudG9wIC0gT0ZGU0VUKTtcbn0pO1xuIiwiLyoqXG4gKiAgd2hvbGUgZGFtbiBzY3JpcHRcbiAqXG4gKiAgVGhpcyBzaG91bGQgaW5jbHVkZSBvYmplY3RzLCB3aGljaCBpbiB0dXJuIGluY2x1ZGUgdGhlIGxpYiBmaWxlcyB0aGV5IG5lZWQuXG4gKiAgVGhpcyBrZWVwcyB1cyB1c2luZyBhIG1vZHVsYXIgYXBwcm9hY2ggdG8gZGV2IHdoaWxlIGFsc28gb25seSBpbmNsdWRpbmcgdGhlXG4gKiAgcGFydHMgb2YgdGhlIGxpYnJhcnkgd2UgbmVlZC5cbiAqL1xucmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5tYWtlQWxsKCk7XG5yZXF1aXJlKCdhcHAvaGFzaGNoYW5nZScpO1xucmVxdWlyZSgnYXBwL0NvcHlhYmxlJyk7XG5yZXF1aXJlKCdhcHAvQ29sbGFwc2FibGUnKTtcbnJlcXVpcmUoJ2FwcC9UcmF5Jyk7XG5yZXF1aXJlKCdhcHAvVXBkYXRlSW5wdXQnKTtcbiIsIi8qKlxuICogIEFuaW1hdGUgU2Nyb2xsIHRvIFBvc2l0aW9uXG4gKlxuICogIEFuaW1hdGVzIHdpbmRvdyBzY3JvbGwgcG9zaXRpb25cbiAqXG4gKiAgQHBhcmFtIHtpbnR9IC0gZW5kIHBvc2l0aW9uIGluIHBpeGVsc1xuICpcbiAqICBqczpcbiAqICAgIHZhciBhbmltYXRlU2Nyb2xsID0gcmVxdWlyZSgnbGliL2FuaW1hdGVTY3JvbGxUbycpO1xuICogICAgYW5pbWF0ZVNjcm9sbCh0b3ApO1xuICovXG5cbi8vIHJlcXVpcmVtZW50c1xudmFyIGVhc2VzID0gcmVxdWlyZSgnbGliL2Vhc2VzJyk7XG5cbi8vIHNldHRpbmdzXG52YXIgbWluRHVyYXRpb24gPSAxMDAwO1xuXG4vLyB0aGUgYW5pbWF0aW9uIGNvbnRyb2xsZXJcbnZhciBzdGFydFRpbWUsXG4gICAgZHVyYXRpb24sXG4gICAgc3RhcnRQb3MsXG4gICAgZGVsdGFTY3JvbGwsXG4gICAgbGFzdFNjcm9sbFxuICAgIDtcblxuKGZ1bmN0aW9uIHVwZGF0ZVNjcm9sbCAoKSB7XG4gIGxhc3RTY3JvbGwgPSB3aW5kb3cuc2Nyb2xsWTtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZVNjcm9sbCk7XG59KSgpO1xuXG52YXIgYW5pbWF0ZVNjcm9sbCA9IGZ1bmN0aW9uIChjdXJyZW50VGltZSkge1xuICB2YXIgZGVsdGFUaW1lID0gY3VycmVudFRpbWUgLSBzdGFydFRpbWU7XG4gIGlmIChkZWx0YVRpbWUgPCBkdXJhdGlvbikge1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCBlYXNlcy5lYXNlSW5PdXQoc3RhcnRQb3MsIGRlbHRhU2Nyb2xsLCBkZWx0YVRpbWUgLyBkdXJhdGlvbikpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICBhbmltYXRlU2Nyb2xsKG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgc3RhcnRQb3MgKyBkZWx0YVNjcm9sbCk7XG4gIH1cbn1cblxudmFyIHN0YXJ0QW5pbWF0ZVNjcm9sbCA9IGZ1bmN0aW9uIChlbmRTY3JvbGwpIHtcbiAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIHN0YXJ0UG9zID0gbGFzdFNjcm9sbDtcbiAgZGVsdGFTY3JvbGwgPSBlbmRTY3JvbGwgLSBzdGFydFBvcztcbiAgZHVyYXRpb24gPSBNYXRoLm1heChtaW5EdXJhdGlvbiwgTWF0aC5hYnMoZGVsdGFTY3JvbGwpICogLjEpO1xuICBhbmltYXRlU2Nyb2xsKHN0YXJ0VGltZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhcnRBbmltYXRlU2Nyb2xsO1xuIiwiLyoqXG4gKiAgYSBidW5jaCBvZiBlYXNpbmcgZnVuY3Rpb25zIGZvciBtYWtpbmcgYW5pbWF0aW9uc1xuICogIHRlc3RpbmcgaXMgZmFpcmx5IHN1YmplY3RpdmUsIHNvIG5vdCBhdXRvbWF0ZWRcbiAqL1xuXG52YXIgZWFzZXMgPSB7XG4gICdlYXNlSW5PdXQnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgaWYgKHAgPCAuNSkge1xuICAgICAgcmV0dXJuIHMgKyBjICogKDIgKiBwICogcCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHMgKyBjICogKC0yICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKTtcbiAgICB9XG4gIH0sXG4gICdlYXNlSW5PdXRDdWJpYycgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICBpZiAocCA8IC41KSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoNCAqIHAgKiBwICogcCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHMgKyBjICogKDQgKiAocCAtIDEpICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKVxuICAgIH1cbiAgfSxcbiAgJ2Vhc2VJbicgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiBwICogcDtcbiAgfSxcbiAgJ2Vhc2VJbkN1YmljJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIChwICogcCAqIHApO1xuICB9LFxuICAnZWFzZU91dCcgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiAoLTEgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICB9LFxuICAnZWFzZU91dEN1YmljJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqICgocCAtIDEpICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKTtcbiAgfSxcbiAgJ2xpbmVhcicgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiBwO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGVhc2VzO1xuIiwiLyoqKlxuICogIEdldCBQYWdlIE9mZnNldFxuICpcbiAqICBHZXQgYSBET01FbGVtZW50J3Mgb2Zmc2V0IGZyb20gcGFnZVxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9XG4gKiAgQHJldHVybnMgb2JqZWN0XG4gKiAgICBAcHJvcCB7bnVtYmVyfSBsZWZ0XG4gKiAgICBAcHJvcCB7bnVtYmVyfSB0b3BcbiAqXG4gKiAganM6XG4gKiAgICB2YXIgZ2V0UGFnZU9mZnNldCA9IHJlcXVpcmUoJ2xpYi9nZXRQYWdlT2Zmc2V0Jyk7XG4gKiAgICBnZXRQYWdlT2Zmc2V0KHNvbWVFbGVtZW50KTtcbiAqL1xuZnVuY3Rpb24gZ2V0UGFnZU9mZnNldCAoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQpIHtcbiAgICB0aHJvdyAnZ2V0UGFnZU9mZnNldCBwYXNzZWQgYW4gaW52YWxpZCBlbGVtZW50JztcbiAgfVxuICB2YXIgcGFnZU9mZnNldFggPSBlbGVtZW50Lm9mZnNldExlZnQsXG4gICAgICBwYWdlT2Zmc2V0WSA9IGVsZW1lbnQub2Zmc2V0VG9wO1xuXG4gIHdoaWxlIChlbGVtZW50ID0gZWxlbWVudC5vZmZzZXRQYXJlbnQpIHtcbiAgICBwYWdlT2Zmc2V0WCArPSBlbGVtZW50Lm9mZnNldExlZnQ7XG4gICAgcGFnZU9mZnNldFkgKz0gZWxlbWVudC5vZmZzZXRUb3A7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGxlZnQgOiBwYWdlT2Zmc2V0WCxcbiAgICB0b3AgOiBwYWdlT2Zmc2V0WVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UGFnZU9mZnNldDtcbiIsIi8qKipcbiAqIGZvckVhY2ggRnVuY3Rpb25cbiAqXG4gKiBJdGVyYXRlIG92ZXIgYW4gYXJyYXksIHBhc3NpbmcgdGhlIHZhbHVlIHRvIHRoZSBwYXNzZWQgZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiB0byBjYWxsXG4gKlxuICoganM6XG4gKiAgIHZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuICogICBmb3JFYWNoKHNvbWVBcnJheSwgZnVuY3Rpb24gKGl0ZW0pIHsgYWxlcnQoaXRlbSkgfSk7XG4gKi9cbmZ1bmN0aW9uIGZvckVhY2ggKGFyciwgZm4pIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGZuLmNhbGwoYXJyW2ldLGFycltpXSxhcnIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiJdfQ==
