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
  if (sourceElement.dataset && sourceElement.dataset.heightLimit) {
    this.element.style.maxHeight = sourceElement.dataset.heightLimit;
  }

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
    content += '<html class="show-dev ' + (this.sourceElement.classList.contains('fs') ? 'fs' : 'not-fs') + (this.sourceElement.dataset && this.sourceElement.dataset.heightLimit ? ' scrollable' : ' not-scrollable') + '"><head>';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29sbGFwc2FibGUuanMiLCJhcHAvQ29weWFibGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL1VwZGF0ZUlucHV0LmpzIiwiYXBwL2hhc2hjaGFuZ2UuanMiLCJhdXRvZ3VpZGUuanMiLCJsaWIvYW5pbWF0ZVNjcm9sbFRvLmpzIiwibGliL2Vhc2VzLmpzIiwibGliL2dldFBhZ2VPZmZzZXQuanMiLCJsaWIvdXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKipcbiAqIENvbGxhcHNhYmxlXG4gKlxuICogQXV0by1pbml0aWFsaXplZCBjbGFzcyB0aGF0IGxvb2tzIGZvciBgLmpzLWNvbGxhcHNhYmxlYCB3aXRoIGAuanMtY29sbGFwc2FibGVfX3RvZ2dsZWBcbiAqIGFuZCBgLmpzLWNvbGxhcHNhYmxlX19jb250ZW50YC5cbiAqXG4gKiBBZGQgdGhlIGNsYXNzIGBpcy1vcGVuYCB0byB0aGUgYC5qcy1jb2xsYXBzYWJsZWAgZWxlbWVudCB0byBoYXZlIGl0IG9wZW4gaXRzZWxmXG4gKiBpbW1lZGlhdGVseS4gIGBpcy1vcGVuYCBpcyBhbHNvIHRoZSBzdGF0ZSBjbGFzcyB0aGF0IGdldHMgdG9nZ2xlZC5cbiAqXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnRcbiAqICAgZXhwZWN0ZWQgdG8gaGF2ZSBjaGlsZHJlbiB3aXRoIGAuanMtY29sbGFwc2FibGVfX3RvZ2dsZWAgYW5kIGAuanMtY29sbGFwc2FibGVfX2NvbnRlbnRgXG4gKlxuICogQG1ldGhvZCB7dm9pZH0gdG9nZ2xlKCkgLSB0b2dnbGVzIG9wZW4vY2xvc2VkXG4gKiBAbWV0aG9kIHt2b2lkfSBvcGVuKCkgLSBvcGVucyBfX2NvbnRlbnQsIG9yIGRvZXMgbm90aGluZyBpZiBhbHJlYWR5IG9wZW5cbiAqIEBtZXRob2Qge3ZvaWR9IGNsb3NlKCkgLSBjbG9zZXMgX19jb250ZW50LCBvciBkb2VzIG5vdGhpbmcgaWYgYWxyZWFkeSBjbG9zZWRcbiAqXG4gKiBAcHJvcCB7Ym9vbGVhbn0gaXNPcGVuXG4gKlxuICogaHRtbDpcbiAqICAgPGRpdiBjbGFzcz1cImpzLWNvbGxhcHNhYmxlXCI+XG4gKiAgICAgPGJ1dHRvbiBjbGFzcz1cImpzLWNvbGxhcHNhYmxlX190b2dnbGVcIj5Ub2dnbGU8L2J1dHRvbj5cbiAqICAgICA8ZGl2IGNsYXNzPVwianMtY29sbGFwc2FibGVfX2NvbnRlbnRcIj5cbiAqICAgICAgIDx1bD48bGk+ZmlsbDwvbGk+PGxpPnNvbWU8L2xpPjxsaT5zcGFjZTwvbGk+PC91bD5cbiAqICAgICA8L2Rpdj5cbiAqICAgPC9kaXY+XG4gKlxuICoganM6XG4gKiAgIC8vIGNyZWF0ZSAobm90IG5lY2Vzc2FyeSwgc2luY2UgaXQgYWxyZWFkeSBsb29rcyBmb3IgYWxsIC5qcy1jb2xsYXBzYWJsZSBlbGVtZW50cylcbiAqICAgdmFyIGNvbGxhcHNhYmxlID0gbmV3IENvbGxhcHNhYmxlIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY29sbGFwc2FibGUnKSk7XG4gKiAgIC8vIHRvZ2dsZSBpdCBvcGVuL2Nsb3NlZFxuICogICBjb2xsYXBzYWJsZS50b2dnbGUoKTtcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG5cbi8vIHNldHRpbmdzXG5cbi8vIG1haW4gY2xhc3NcbnZhciBDb2xsYXBzYWJsZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMudG9nZ2xlRWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNvbGxhcHNhYmxlX190b2dnbGUnKTtcbiAgdGhpcy5jb250ZW50RWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNvbGxhcHNhYmxlX19jb250ZW50Jyk7XG5cbiAgaWYgKCF0aGlzLmVsZW1lbnQgfHwgIXRoaXMudG9nZ2xlRWxlbWVudCB8fCAhdGhpcy5jb250ZW50RWxlbWVudCkge1xuICAgIHJldHVybiBjb25zb2xlLmVycm9yKHRoaXMuZWxlbWVudCwgdGhpcy50b2dnbGVFbGVtZW50LCB0aGlzLmNvbnRlbnRFbGVtZW50KTtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMudG9nZ2xlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy50b2dnbGUoKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1vcGVuJykpIHtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgIH1cbiAgfVxufVxuQ29sbGFwc2FibGUucHJvdG90eXBlID0ge1xuICB0b2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pc09wZW4gPyB0aGlzLmNsb3NlKCkgOiB0aGlzLm9wZW4oKTtcbiAgfSxcbiAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgdGhpcy5jb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmNvbnRlbnRFbGVtZW50LnNjcm9sbEhlaWdodCArICdweCc7XG4gICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgdGhpcy5jb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMCc7XG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgfVxufVxuXG4vLyBpbml0IHRoZW0gYWxsXG52YXIgY29sbGFwc2FibGVFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY29sbGFwc2FibGUnKTtcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2xsYXBzYWJsZUVscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICBuZXcgQ29sbGFwc2FibGUoY29sbGFwc2FibGVFbHNbaV0pO1xufVxuIiwiLyoqKlxuICogIENvcHlhYmxlXG4gKlxuICogIE1ha2VzIGFuIGVsZW1lbnQgY2xpY2thYmxlLCBjb3B5aW5nIGEgc3RyaW5nIHRvIHRoZSB1c2VyJ3MgY2xpcGJvYXJkLiAgVG8gc2VlXG4gKiAgaG93IGl0IGxvb2tzLCBjaGVjayBvdXQgW3RoZSBodG1sIHNhbXBsZV0oIy9hdG9tcy9jb3B5YWJsZS1lbGVtZW50KS5cbiAqXG4gKiAgSW5pdGlhbGl6ZXMgYXV0b21hdGljYWxseSBvbiBlbGVtZW50cyB3aXRoIGBbZGF0YS1jb3B5XWAgYXMgYW4gYXR0cmlidXRlLlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnRcbiAqICBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIHRvIGNvcHlcbiAqXG4gKiAgQG1ldGhvZCB7RE9NRWxlbWVudH0gbWFrZUlucHV0KCkgLSBpbnRlcm5hbCBmdW5jdGlvbiB0byBtYWtlIHRoZSBpbnB1dCBmcm9tXG4gKiAgICB3aGljaCB0aGUgc3RyaW5nIHdpbGwgYmUgY29waWVkLlxuICogIEBtZXRob2QgY29weSgpIC0gY29waWVzIHN0cmluZyB0byBjbGlwYm9hcmQuIExpc3RlbmVyIGlzIGF1dG9tYXRpY2FsbHkgYWRkZWQsXG4gKiAgICBzbyB5b3Ugc2hvdWxkbid0IG5lZWQgdG8gbWFudWFsbHkgY2FsbCB0aGlzLlxuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuXG4vLyBzZXR0aW5nc1xuXG4vLyB0aGUgY2xhc3NcbnZhciBDb3B5YWJsZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBzdHJpbmcpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG5cbiAgaWYgKGRvY3VtZW50LmV4ZWNDb21tYW5kKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdjb3B5YWJsZS1lbmFibGVkJyk7XG4gICAgdGhpcy5tYWtlSW5wdXQoKTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy5jb3B5KCk7XG4gICAgfSk7XG4gIH1cbn1cbkNvcHlhYmxlLnByb3RvdHlwZSA9IHtcbiAgbWFrZUlucHV0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgdGhpcy5pbnB1dC5jbGFzc0xpc3QuYWRkKCd2aXN1YWxseWhpZGRlbicpO1xuICAgIHRoaXMuaW5wdXQudmFsdWUgPSB0aGlzLnN0cmluZztcbiAgICByZXR1cm4gdGhpcy5pbnB1dDtcbiAgfSxcbiAgY29weTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmlucHV0LCB0aGlzLmVsZW1lbnQpO1xuICAgIHRoaXMuaW5wdXQuc2VsZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7fTtcbiAgICB0aGlzLmlucHV0LmJsdXIoKTtcbiAgICB0aGlzLmlucHV0LnJlbW92ZSgpO1xuICB9XG59XG5cbi8vIGF1dG8tZ2VuZXJhdGVcbnZhciBjb3B5YWJsZXMgPSBbXTtcbnZhciBjb3B5YWJsZUVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWNvcHldJyk7XG5mb3JFYWNoKGNvcHlhYmxlRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgY29weWFibGVzLnB1c2gobmV3IENvcHlhYmxlIChlbCwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNvcHknKSkpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29weWFibGU7XG4iLCIvKioqXG4gKiBIVE1MIFNhbXBsZVxuICpcbiAqIFRoZSBpZnJhbWVzIHRoYXQgc2hvdyBhbiBleGFtcGxlIG9mIHRoZSBvdXRwdXQgb2YgYSBjb21wb25lbnQuXG4gKi9cblxuLyoqKlxuICogIE1ha2UgQWxsIEh0bWwgU2FtcGxlc1xuICpcbiAqICBTZWFyY2hlcyBmb3IgYWxsIGA8bWFrZS1pZnJhbWU+YCBlbGVtZW50cyBhbmQgZG9lcyBqdXN0IHRoYXQ6IG1ha2VzIHRoZW0gaWZyYW1lcy5cbiAqICBJdCBhbHNvIGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmQgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYFxuICogIG9iamVjdC4gIFRob3NlIHNob3VsZCBiZSBwb3B1bGF0ZWQgYnkgdGhlIHRlbXBsYXRlLlxuICpcbiAqICBqczpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykubWFrZUFsbCgpOyAvLyBnb2VzIHRocm91Z2ggdGhlIHdob2xlIHBhZ2UgYW5kIGRvZXMgaXRzIHRoaW5nXG4gKlxuICogIHBhdGg6IC4vYXBwL2h0bWxfc2FtcGxlXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGhlbHBlcnNcbi8qKlxuICogR2V0IGRvY3VtZW50IGhlaWdodCAoc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExNDU4NTAvKVxuICpcbiAqIEBwYXJhbSAge0RvY3VtZW50fSBkb2NcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RG9jdW1lbnRIZWlnaHQgKGRvYykge1xuICBkb2MgPSBkb2MgfHwgZG9jdW1lbnQ7XG4gIHZhciBib2R5ID0gZG9jLmJvZHk7XG4gIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcblxuICBpZiAoIWJvZHkgfHwgIWh0bWwpXG4gICAgcmV0dXJuIDA7XG5cbiAgcmV0dXJuIE1hdGgubWF4KFxuICAgIGJvZHkub2Zmc2V0SGVpZ2h0LFxuICAgIGh0bWwub2Zmc2V0SGVpZ2h0XG4gICk7XG59XG5cbi8vIGRvIHRoaW5ncyFcbi8vIGdldCBzb21lIG1ldGEgdGFnc1xudmFyIG1ldGFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YScpO1xudmFyIHN0eWxlcywgc2NyaXB0cztcbnZhciBzYW1wbGVzID0gW107XG5cbi8qKipcbiAqICBgSHRtbFNhbXBsZWAgQ2xhc3NcbiAqXG4gKiAgQ29udHJvbHMgYW4gaW5kaXZpZHVhbCBIVE1MIFNhbXBsZSwgd2hpY2ggaXMgYW4gaWZyYW1lIHRoYXQgbG9hZHMgdGhlIGNzcyBhbmRcbiAqICBzY3JpcHRzIHRoYXQgdGhlIHN0eWxlZ3VpZGUgaXMgbWVhbnQgdG8gc2hvdy4gSXQgaW5jbHVkZXMgdGhlIHN0eWxlc2hlZXRzIGFuZFxuICogIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2Agb2JqZWN0LlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IHNvdXJjZUVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byB0dXJuIGludG8gYW4gaWZyYW1lXG4gKlxuICogIEBtZXRob2Qge3ZvaWR9IGJ1aWxkQ29udGVudCgpIC0gYnVpbGRzIGEgc3RyaW5nIG9mIHRoZSBlbGVtZW50IGFzIGEgZnVsbCBodG1sIGRvY3VtZW50XG4gKiAgICBhbmQgYXNzaWducyBpdCBhcyB0aGUgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZS5cbiAqICBAbWV0aG9kIHt2b2lkfSBhdXRvSGVpZ2h0KCkgLSBhbHRlcnMgdGhlIGhlaWdodCBvZiB0aGUgaWZyYW1lIHRvIGJlIHRoZSBtaW5pbXVtIG5lZWRlZCB0b1xuICogICAgZWxpbWluYXRlIGEgc2Nyb2xsYmFyLiAgQXV0b21hdGljYWxseSBjYWxsZWQgb24gYSBwZXIgYW5pbWF0aW9uIGZyYW1lIGJhc2lzLlxuICogIEBtZXRob2Qge0RPTUVsZW1lbnR9IGdldERvY3VtZW50KCkgLSByZXR1cm5zIHRoZSBpZnJhbWUncyBkb2N1bWVudCBvYmplY3RcbiAqICBAbWV0aG9kIHt2b2lkfSB0b2dnbGVHcmlkKCkgLSBhZGRzL3JlbW92ZXMgdGhlICdzaG93LWdyaWQnIGNsYXNzIHRvIHRoZSA8aHRtbD4gZWxlbWVudFxuICogICAgc28gd2UgY2FuIHNob3cgYSBncmlkIG92ZXJsYXlcbiAqICBAbWV0aG9kIHt2b2lkfSBzZXRXaWR0aCh3aWR0aCkgLSBzZXRzIHRoZSB3aWR0aCBvZiB0aGUgaWZyYW1lLCB1c2VmdWwgZm9yIHNob3dpbmdcbiAqICAgIG1lZGlhIHF1ZXJpZXNcbiAqICAgIEBwYXJhbSB7aW50fSB3aWR0aCAtIHdpZHRoIGluIHBpeGVscy4gUmVzZXRzIHRvIGRlZmF1bHQgc2l6ZSBpZiBmYWxzeVxuICpcbiAqICBAcHJvcCBlbGVtZW50IC0gdGhlIGFjdHVhbCBpZnJhbWUgZWxlbWVudFxuICpcbiAqICBwYXRoOiAuL2FwcC9odG1sX3NhbXBsZVxuICogIG9yZGVyOiAwXG4gKi9cbnZhciBIdG1sU2FtcGxlID0gZnVuY3Rpb24gKHNvdXJjZUVsZW1lbnQpIHtcbiAgdGhpcy5zb3VyY2VFbGVtZW50ID0gc291cmNlRWxlbWVudDtcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgdGhpcy5zb3VyY2VFbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKSk7XG4gIGlmIChzb3VyY2VFbGVtZW50LmRhdGFzZXQgJiYgc291cmNlRWxlbWVudC5kYXRhc2V0LmhlaWdodExpbWl0KSB7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm1heEhlaWdodCA9IHNvdXJjZUVsZW1lbnQuZGF0YXNldC5oZWlnaHRMaW1pdDtcbiAgfVxuXG4gIHRoaXMuYnVpbGRDb250ZW50KCk7XG4gIHRoaXMuc291cmNlRWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh0aGlzLmVsZW1lbnQsIHRoaXMuc291cmNlRWxlbWVudCk7XG5cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgKGZ1bmN0aW9uIGNoZWNrSWZyYW1lSGVpZ2h0ICgpIHtcbiAgICBfdGhpcy5hdXRvSGVpZ2h0KCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrSWZyYW1lSGVpZ2h0KTtcbiAgfSkoKTtcblxuICBzYW1wbGVzLnB1c2godGhpcyk7XG59XG5IdG1sU2FtcGxlLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqICBidWlsZENvbnRlbnQgY3JlYXRlcyBhIHN0cmluZyB0byB1c2UgYXMgdGhlIGRvY3VtZW50IGZvciB0aGUgaWZyYW1lXG4gICAqL1xuICBidWlsZENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGVudCA9ICc8IWRvY3R5cGUgaHRtbD4nO1xuICAgIGNvbnRlbnQgKz0gJzxodG1sIGNsYXNzPVwic2hvdy1kZXYgJyArICh0aGlzLnNvdXJjZUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmcycpID8gJ2ZzJyA6ICdub3QtZnMnKSArICh0aGlzLnNvdXJjZUVsZW1lbnQuZGF0YXNldCAmJiB0aGlzLnNvdXJjZUVsZW1lbnQuZGF0YXNldC5oZWlnaHRMaW1pdCA/ICcgc2Nyb2xsYWJsZScgOiAnIG5vdC1zY3JvbGxhYmxlJykgKyAnXCI+PGhlYWQ+JztcbiAgICBmb3JFYWNoKG1ldGFzLGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICBjb250ZW50ICs9IG1ldGEub3V0ZXJIVE1MO1xuICAgIH0pO1xuICAgIGZvckVhY2goc3R5bGVzLGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgY29udGVudCArPSAnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCInICsgc3R5bGUgKyAnXCI+JztcbiAgICB9KTtcbiAgICBjb250ZW50ICs9ICc8L2hlYWQ+PGJvZHk+JztcbiAgICBjb250ZW50ICs9IHRoaXMuc291cmNlRWxlbWVudC5pbm5lckhUTUw7XG4gICAgZm9yRWFjaChzY3JpcHRzLGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgIGNvbnRlbnQgKz0gJzxzY3JpcHQgc3JjPVwiJyArIHNjcmlwdCArICdcIj48L3NjcmlwdD4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gXCI8L2JvZHk+PC9odG1sPlwiO1xuICAgIHRoaXMuZWxlbWVudC5zcmNkb2MgPSBjb250ZW50O1xuICB9LFxuICAvKipcbiAgICogIGF1dG9IZWlnaHQgdXBkYXRlcyB0aGUgaGVpZ2h0IG9mIHRoZSBpZnJhbWUgdG8gZXhhY3RseSBjb250YWluIGl0cyBjb250ZW50XG4gICAqL1xuICBhdXRvSGVpZ2h0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRvYyA9IHRoaXMuZ2V0RG9jdW1lbnQoKTtcbiAgICBpZiAoZG9jKSB7XG4gICAgICB2YXIgZG9jSGVpZ2h0ID0gZ2V0RG9jdW1lbnRIZWlnaHQoZG9jKTtcbiAgICAgIGlmIChkb2NIZWlnaHQgIT0gdGhpcy5lbGVtZW50LmhlaWdodClcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgZG9jSGVpZ2h0KTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiAgZ2V0RG9jdW1lbnQgZ2V0cyB0aGUgaW50ZXJuYWwgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZVxuICAgKi9cbiAgZ2V0RG9jdW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudCB8fCAodGhpcy5lbGVtZW50LmNvbnRlbnRXaW5kb3cgJiYgdGhpcy5lbGVtZW50LmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQpO1xuICB9LFxuICAvKipcbiAgICogIGFkZHMvcmVtb3ZlcyB0aGUgJ3Nob3ctZ3JpZCcgY2xhc3MgdG8gdGhlIDxodG1sPiBlbGVtZW50IHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gICAqL1xuICB0b2dnbGVHcmlkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nZXREb2N1bWVudCgpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJylbMF0uY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy1ncmlkJyk7XG4gIH0sXG4gIC8qKlxuICAgKiAgc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nIG1lZGlhIHF1ZXJpZXNcbiAgICovXG4gIHNldFdpZHRoOiBmdW5jdGlvbiAodykge1xuICAgIGlmICh3KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB3ICsgJ3B4JztcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdyZXNpemVkJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJyc7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplZCcpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlSHRtbFNhbXBsZXMgKCkge1xuICAvLyBnZXQgc3R5bGVzIGFuZCBzY3JpcHRzXG4gIHN0eWxlcyA9IHdpbmRvdy5hZyAmJiB3aW5kb3cuYWcuc3R5bGVzIHx8IFtdO1xuICBzY3JpcHRzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zY3JpcHRzIHx8IFtdO1xuICAvLyBnZXQgYWxsIG91ciBjdXN0b20gZWxlbWVudHNcbiAgdmFyIGVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYWtlLWlmcmFtZScpO1xuICBmb3IgKHZhciBpID0gZWxzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgbmV3IEh0bWxTYW1wbGUoZWxzW2ldKTtcbiAgfTtcbn1cblxuLyoqXG4gKiAgVG9nZ2xlIEhUTUwgU2FtcGxlIEdyaWRzXG4gKlxuICogIFRvZ2dsZXMgYSBgLnNob3ctZ3JpZGAgY2xhc3Mgb24gdGhlIGA8aHRtbD5gIGVsZW1lbnQgaW5zaWRlIGFsbCB0aGVcbiAqICBpZnJhbWVzLiAgV2l0aCB0aGUgaW4tZnJhbWUuY3NzIHN0eWxlc2hlZXQgaW5jbHVkZWQsIHRoaXMgd2lsbCB0dXJuIG9uIGEgMTJcbiAqICBjb2x1bW4gZ3JpZCBvdmVybGF5LlxuICpcbiAqICBqczpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykudG9nZ2xlR3JpZHMoKVxuICpcbiAqICBwYXRoOiAuL2FwcC9odG1sX3NhbXBsZVxuICovXG52YXIgdG9nZ2xlR3JpZHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnRvZ2dsZUdyaWQoKTtcbiAgfSk7XG59XG5cbi8qKipcbiAqICBzZXRXaWR0aHNcbiAqXG4gKiAgU2V0cyBhbGwgYEh0bWxTYW1wbGVgcyB0byB0aGUgcHJvdmlkZWQgd2lkdGguXG4gKlxuICogIGpzOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5zZXRXaWR0aHMod2lkdGgpO1xuICpcbiAqICBAcGFyYW0ge2ludH0gd2lkdGhcbiAqXG4gKiAgcGF0aDogLi9hcHAvaHRtbF9zYW1wbGVcbiAqL1xudmFyIHNldFdpZHRocyA9IGZ1bmN0aW9uICh3KSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnNldFdpZHRoKHcpO1xuICB9KTtcbn1cblxuLy8gbGlzdGVuIGZvciBpbnB1dCBjaGFuZ2VcbnZhciBzaXplSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZSgnaHRtbFNhbXBsZVNpemUnKVswXTtcbmlmIChzaXplSW5wdXQpIHtcbiAgc2l6ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgc2V0V2lkdGhzKHRoaXMudmFsdWUpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIdG1sU2FtcGxlO1xubW9kdWxlLmV4cG9ydHMubWFrZUFsbCA9IG1ha2VIdG1sU2FtcGxlcztcbm1vZHVsZS5leHBvcnRzLnRvZ2dsZUdyaWRzID0gdG9nZ2xlR3JpZHM7XG5tb2R1bGUuZXhwb3J0cy5zZXRXaWR0aHMgPSBzZXRXaWR0aHM7XG4iLCIvKioqXG4gKiBUcmF5XG4gKlxuICogVGhlIGNvbGxhcHNhYmxlIHNpZGViYXIsIHdpdGggcG9zc2liaWxpdHkgb2YgbXVsdGlwbGUgdGllcnMuXG4gKlxuICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50XG4gKlxuICogQHByb3Age1RyYXlUaWVyIGFycmF5fSB0aWVyc1xuICogQHByb3Age2Jvb2xlYW59IGlzT3BlblxuICpcbiAqIEBtZXRob2Qge3ZvaWR9IGNsb3NlKCkgLSBjbG9zZSB0cmF5IGFuZCBhbGwgaXRzIHRpZXJzXG4gKiBAbWV0aG9kIHt2b2lkfSBjbG9zZVRpZXJzKCkgLSBjbG9zZSBhbGwgdGllcnNcbiAqIEBtZXRob2Qge3ZvaWR9IGNoZWNrU2hvdWxkQ2xvc2UoKSAtIGNoZWNrIGlmIHdlIG5lZWQgdG8gY2xvc2UgdGhlIHRyYXkgZHVlIHRvIGFsbCB0aWVycyBiZWluZyBjbG9zZWRcbiAqIEBtZXRob2Qge3ZvaWR9IHVwZGF0ZVBvc2l0aW9uKCkgLSB1cGRhdGUgdG9wL2JvdHRvbSBvZiBlbGVtZW50LCBhc3N1bWluZyBmaXhlZCBwb3NcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG5cbi8vIHNldHRpbmdzXG5cbi8vIHRoZSBjbGFzc1xudmFyIFRyYXkgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLm9mZnNldFBhcmVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgdGhpcy5pc09wZW4gPSB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1vcGVuJyk7XG4gIHRoaXMudGllcnMgPSBbXTtcblxuICB2YXIgdGllckVscyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudHJheV9fdGllcicpO1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGllckVscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHRoaXMudGllcnMucHVzaChuZXcgVHJheVRpZXIgKHRpZXJFbHNbaV0sIHRoaXMpKTtcbiAgfVxuXG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHZhciBsYXN0U2Nyb2xsID0gMDtcbiAgKGZ1bmN0aW9uIGNoZWNrU2Nyb2xsICgpIHtcbiAgICBpZiAod2luZG93LnNjcm9sbFkgIT09IGxhc3RTY3JvbGwpIHtcbiAgICAgIF90aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICBsYXN0U2Nyb2xsID0gd2luZG93LnNjcm9sbFk7XG4gICAgfVxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2hlY2tTY3JvbGwpO1xuICB9KSgpO1xuICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG59XG5UcmF5LnByb3RvdHlwZSA9IHtcbiAgc2V0T3BlbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gIH0sXG4gIHNldENsb3NlZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gIH0sXG4gIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbG9zZVRpZXJzKCk7XG4gICAgdGhpcy5zZXRDbG9zZWQoKTtcbiAgfSxcbiAgY2xvc2VUaWVyczogZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnRpZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0aGlzLnRpZXJzW2ldLmNsb3NlKCk7XG4gICAgfVxuICB9LFxuICBjaGVja1Nob3VsZENsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMudGllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnRpZXJzW2ldLmlzT3BlbilcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldENsb3NlZCgpO1xuICB9LFxuICB1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjbGlwUmVjdCA9IHRoaXMub2Zmc2V0UGFyZW50LmdldENsaWVudFJlY3RzKClbMF07XG4gICAgdmFyIHRvcCA9IE1hdGgubWF4KGNsaXBSZWN0LnRvcCwgMCk7XG4gICAgdmFyIGJvdHRvbSA9IE1hdGgubWF4KHdpbmRvdy5pbm5lckhlaWdodCAtIGNsaXBSZWN0LmJvdHRvbSwgMCk7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmJvdHRvbSA9IGJvdHRvbSArICdweCc7XG4gIH1cbn1cblxuLyoqKlxuICogVHJheSBUaWVyXG4gKlxuICogSW5kaXZpZHVhbCB0aWVyIG9mIHRoZSB0cmF5LiAgQ2xvc2VzIG90aGVyIHRpZXJzIHdoZW4gb3BlbmVkLCBhbmQgbWFya3MgcGFyZW50XG4gKiB0cmF5IG9wZW4gYXMgd2VsbC5cbiAqXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7VHJheX0gcGFyZW50VHJheVxuICpcbiAqIEBtZXRob2Qge3ZvaWR9IG9wZW4oKVxuICogQG1ldGhvZCB7dm9pZH0gY2xvc2UoKVxuICogQG1ldGhvZCB7dm9pZH0gdG9nZ2xlKClcbiAqXG4gKiBAcHJvcCB7Ym9vbGVhbn0gaXNPcGVuXG4gKi9cbnZhciBUcmF5VGllciA9IGZ1bmN0aW9uIChlbGVtZW50LCBwYXJlbnRUcmF5KSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMucGFyZW50VHJheSA9IHBhcmVudFRyYXk7XG5cbiAgdGhpcy50b2dnbGVFbGVtZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudHJheV9fb3BlbmVyJyk7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIGlmICh0aGlzLnRvZ2dsZUVsZW1lbnQpIHtcbiAgICB0aGlzLnRvZ2dsZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy50b2dnbGUoKTtcbiAgICB9KTtcbiAgfVxufVxuVHJheVRpZXIucHJvdG90eXBlID0ge1xuICBvcGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wYXJlbnRUcmF5LmNsb3NlVGllcnMoKTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcbiAgICB0aGlzLnBhcmVudFRyYXkuc2V0T3BlbigpO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICB0aGlzLnBhcmVudFRyYXkuY2hlY2tTaG91bGRDbG9zZSgpO1xuICB9LFxuICB0b2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pc09wZW4gPyB0aGlzLmNsb3NlKCkgOiB0aGlzLm9wZW4oKTtcbiAgfVxufVxuXG4vLyBhdXRvaW5pdFxudmFyIHRyYXlFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudHJheScpO1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRyYXlFbHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgbmV3IFRyYXkodHJheUVsc1tpXSk7XG59XG4iLCIvKioqXG4gKiBVcGRhdGUgSW5wdXRcbiAqXG4gKiBBdXRvbWF0aWNhbGx5IHVwZGF0ZSBhbiBpbnB1dCdzIHZhbHVlIG9uIGNsaWNrIG9mIGFuIGVsZW1lbnQuXG4gKlxuICogVGhlIGVsZW1lbnQgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBgW2RhdGEtdXBkYXRlPXtpbnB1dE5hbWV9XWAuIElmIGl0IGhhcyB0aGUgY2xhc3NcbiAqIGBqcy11cGRhdGUtaW5wdXRgLCBpdCB3aWxsIGJlIGluaXRpYWxpemVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50XG4gKlxuICogaHRtbDpcbiAqICAgPGlucHV0IG5hbWU9XCJleGFtcGxlXCI+XG4gKiAgIDxidXR0b24gY2xhc3M9XCJidXR0b24ganMtdXBkYXRlLWlucHV0XCIgZGF0YS11cGRhdGU9XCJleGFtcGxlXCIgdmFsdWU9XCIyMDBcIj5NYWtlIDIwMDwvYnV0dG9uPlxuICpcbiAqIGpzOlxuICogICB2YXIgdXBkYXRlQnRuID0gbmV3IFVwZGF0ZUlucHV0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXVwZGF0ZV0nKSk7XG4gKi9cbi8vIHJlcXVpcmVtZW50c1xuXG4vLyBzZXR0aW5nc1xuXG4vLyBjbGFzc1xudmFyIFVwZGF0ZUlucHV0ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiJyArIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXVwZGF0ZScpICsgJ1wiXScpO1xuXG4gIGlmICh0aGlzLmVsZW1lbnQgJiYgdGhpcy5pbnB1dCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIF90aGlzLmlucHV0LnZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgIGlmIChcImNyZWF0ZUV2ZW50XCIgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJIVE1MRXZlbnRzXCIpO1xuICAgICAgICAgIGV2dC5pbml0RXZlbnQoXCJjaGFuZ2VcIiwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIF90aGlzLmlucHV0LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgICAgICBfdGhpcy5pbnB1dC5maXJlRXZlbnQoXCJvbmNoYW5nZVwiKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBhdXRvIGluaXRcbnZhciB1cGRhdGVJbnB1dEVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy11cGRhdGUtaW5wdXQnKTtcbmZvciAodmFyIGkgPSAwLCBsZW4gPSB1cGRhdGVJbnB1dEVscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICBuZXcgVXBkYXRlSW5wdXQodXBkYXRlSW5wdXRFbHNbaV0pO1xufVxuIiwiLyoqXG4gKiAgaGFuZGxlIGhhc2hjaGFuZ2VcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgYW5pbWF0ZVNjcm9sbCA9IHJlcXVpcmUoJ2xpYi9hbmltYXRlU2Nyb2xsVG8nKTtcbnZhciBnZXRQYWdlT2Zmc2V0ID0gcmVxdWlyZSgnbGliL2dldFBhZ2VPZmZzZXQnKTtcblxuLy8gc2V0dGluZ3NcbnZhciBPRkZTRVQgPSAzMjtcblxuLy8gbGlzdGVuZXJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKC9eIy8sJycpKTtcbiAgYW5pbWF0ZVNjcm9sbChnZXRQYWdlT2Zmc2V0KGVsKS50b3AgLSBPRkZTRVQpO1xufSk7XG4iLCIvKipcbiAqICB3aG9sZSBkYW1uIHNjcmlwdFxuICpcbiAqICBUaGlzIHNob3VsZCBpbmNsdWRlIG9iamVjdHMsIHdoaWNoIGluIHR1cm4gaW5jbHVkZSB0aGUgbGliIGZpbGVzIHRoZXkgbmVlZC5cbiAqICBUaGlzIGtlZXBzIHVzIHVzaW5nIGEgbW9kdWxhciBhcHByb2FjaCB0byBkZXYgd2hpbGUgYWxzbyBvbmx5IGluY2x1ZGluZyB0aGVcbiAqICBwYXJ0cyBvZiB0aGUgbGlicmFyeSB3ZSBuZWVkLlxuICovXG5yZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLm1ha2VBbGwoKTtcbnJlcXVpcmUoJ2FwcC9oYXNoY2hhbmdlJyk7XG5yZXF1aXJlKCdhcHAvQ29weWFibGUnKTtcbnJlcXVpcmUoJ2FwcC9Db2xsYXBzYWJsZScpO1xucmVxdWlyZSgnYXBwL1RyYXknKTtcbnJlcXVpcmUoJ2FwcC9VcGRhdGVJbnB1dCcpO1xuIiwiLyoqXG4gKiAgQW5pbWF0ZSBTY3JvbGwgdG8gUG9zaXRpb25cbiAqXG4gKiAgQW5pbWF0ZXMgd2luZG93IHNjcm9sbCBwb3NpdGlvblxuICpcbiAqICBAcGFyYW0ge2ludH0gLSBlbmQgcG9zaXRpb24gaW4gcGl4ZWxzXG4gKlxuICogIGpzOlxuICogICAgdmFyIGFuaW1hdGVTY3JvbGwgPSByZXF1aXJlKCdsaWIvYW5pbWF0ZVNjcm9sbFRvJyk7XG4gKiAgICBhbmltYXRlU2Nyb2xsKHRvcCk7XG4gKi9cblxuLy8gcmVxdWlyZW1lbnRzXG52YXIgZWFzZXMgPSByZXF1aXJlKCdsaWIvZWFzZXMnKTtcblxuLy8gc2V0dGluZ3NcbnZhciBtaW5EdXJhdGlvbiA9IDEwMDA7XG5cbi8vIHRoZSBhbmltYXRpb24gY29udHJvbGxlclxudmFyIHN0YXJ0VGltZSxcbiAgICBkdXJhdGlvbixcbiAgICBzdGFydFBvcyxcbiAgICBkZWx0YVNjcm9sbCxcbiAgICBsYXN0U2Nyb2xsXG4gICAgO1xuXG4oZnVuY3Rpb24gdXBkYXRlU2Nyb2xsICgpIHtcbiAgbGFzdFNjcm9sbCA9IHdpbmRvdy5zY3JvbGxZO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlU2Nyb2xsKTtcbn0pKCk7XG5cbnZhciBhbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24gKGN1cnJlbnRUaW1lKSB7XG4gIHZhciBkZWx0YVRpbWUgPSBjdXJyZW50VGltZSAtIHN0YXJ0VGltZTtcbiAgaWYgKGRlbHRhVGltZSA8IGR1cmF0aW9uKSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIGVhc2VzLmVhc2VJbk91dChzdGFydFBvcywgZGVsdGFTY3JvbGwsIGRlbHRhVGltZSAvIGR1cmF0aW9uKSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGFuaW1hdGVTY3JvbGwobmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCBzdGFydFBvcyArIGRlbHRhU2Nyb2xsKTtcbiAgfVxufVxuXG52YXIgc3RhcnRBbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24gKGVuZFNjcm9sbCkge1xuICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgc3RhcnRQb3MgPSBsYXN0U2Nyb2xsO1xuICBkZWx0YVNjcm9sbCA9IGVuZFNjcm9sbCAtIHN0YXJ0UG9zO1xuICBkdXJhdGlvbiA9IE1hdGgubWF4KG1pbkR1cmF0aW9uLCBNYXRoLmFicyhkZWx0YVNjcm9sbCkgKiAuMSk7XG4gIGFuaW1hdGVTY3JvbGwoc3RhcnRUaW1lKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFydEFuaW1hdGVTY3JvbGw7XG4iLCIvKipcbiAqICBhIGJ1bmNoIG9mIGVhc2luZyBmdW5jdGlvbnMgZm9yIG1ha2luZyBhbmltYXRpb25zXG4gKiAgdGVzdGluZyBpcyBmYWlybHkgc3ViamVjdGl2ZSwgc28gbm90IGF1dG9tYXRlZFxuICovXG5cbnZhciBlYXNlcyA9IHtcbiAgJ2Vhc2VJbk91dCcgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICBpZiAocCA8IC41KSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoMiAqIHAgKiBwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoLTIgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICAgIH1cbiAgfSxcbiAgJ2Vhc2VJbk91dEN1YmljJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIGlmIChwIDwgLjUpIHtcbiAgICAgIHJldHVybiBzICsgYyAqICg0ICogcCAqIHAgKiBwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoNCAqIChwIC0gMSkgKiAocCAtIDEpICogKHAgLSAxKSArIDEpXG4gICAgfVxuICB9LFxuICAnZWFzZUluJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIHAgKiBwO1xuICB9LFxuICAnZWFzZUluQ3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKHAgKiBwICogcCk7XG4gIH0sXG4gICdlYXNlT3V0JyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqICgtMSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gIH0sXG4gICdlYXNlT3V0Q3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKChwIC0gMSkgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICB9LFxuICAnbGluZWFyJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIHA7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZWFzZXM7XG4iLCIvKioqXG4gKiAgR2V0IFBhZ2UgT2Zmc2V0XG4gKlxuICogIEdldCBhIERPTUVsZW1lbnQncyBvZmZzZXQgZnJvbSBwYWdlXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH1cbiAqICBAcmV0dXJucyBvYmplY3RcbiAqICAgIEBwcm9wIHtudW1iZXJ9IGxlZnRcbiAqICAgIEBwcm9wIHtudW1iZXJ9IHRvcFxuICpcbiAqICBqczpcbiAqICAgIHZhciBnZXRQYWdlT2Zmc2V0ID0gcmVxdWlyZSgnbGliL2dldFBhZ2VPZmZzZXQnKTtcbiAqICAgIGdldFBhZ2VPZmZzZXQoc29tZUVsZW1lbnQpO1xuICovXG5mdW5jdGlvbiBnZXRQYWdlT2Zmc2V0IChlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudCkge1xuICAgIHRocm93ICdnZXRQYWdlT2Zmc2V0IHBhc3NlZCBhbiBpbnZhbGlkIGVsZW1lbnQnO1xuICB9XG4gIHZhciBwYWdlT2Zmc2V0WCA9IGVsZW1lbnQub2Zmc2V0TGVmdCxcbiAgICAgIHBhZ2VPZmZzZXRZID0gZWxlbWVudC5vZmZzZXRUb3A7XG5cbiAgd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudCkge1xuICAgIHBhZ2VPZmZzZXRYICs9IGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBwYWdlT2Zmc2V0WSArPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbGVmdCA6IHBhZ2VPZmZzZXRYLFxuICAgIHRvcCA6IHBhZ2VPZmZzZXRZXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQYWdlT2Zmc2V0O1xuIiwiLyoqKlxuICogZm9yRWFjaCBGdW5jdGlvblxuICpcbiAqIEl0ZXJhdGUgb3ZlciBhbiBhcnJheSwgcGFzc2luZyB0aGUgdmFsdWUgdG8gdGhlIHBhc3NlZCBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIHRvIGNhbGxcbiAqXG4gKiBqczpcbiAqICAgdmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG4gKiAgIGZvckVhY2goc29tZUFycmF5LCBmdW5jdGlvbiAoaXRlbSkgeyBhbGVydChpdGVtKSB9KTtcbiAqL1xuZnVuY3Rpb24gZm9yRWFjaCAoYXJyLCBmbikge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZm4uY2FsbChhcnJbaV0sYXJyW2ldLGFycik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JFYWNoO1xuIl19
