(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/***
 *  Copyable
 *
 *  Makes an element clickable, copying a string to the user's clipboard.  To see
 *  how it looks, check out [the html sample](#/atoms/copyable-element).
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

},{"lib/util/forEach":9}],2:[function(require,module,exports){
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

/***
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

},{"lib/util/forEach":9}],3:[function(require,module,exports){
// requirements
var forEach = require('lib/util/forEach');

// settings

// classes
/***
 *  Tray Tier
 *
 *  Controls an individual tier of the Tray. Not a big deal, just handles open/close
 *  and opener click events.
 *
 *  @param {DOMElement} .ag-tray__tier element
 *  @param {Tray} parent tray object
 *
 *  @method open()
 *  @method close()
 *  @method toggle()
 *
 *  @prop {boolean} isOpen
 */
var Tier = function (el, tray) {
  this.element = el;
  this.isOpen = false;
  this.tray = tray;

  this.opener = el.querySelector('.ag-tray__tier-opener');
  if (this.opener) {
    var _this = this;
    this.opener.addEventListener('click', function (e) {
      e.preventDefault();
      _this.toggle();
    });
  }
}
Tier.prototype = {
  open: function () {
    this.isOpen = true;
    this.element.classList.add('open');
    this.tray.open();
  },
  close: function () {
    this.isOpen = false;
    this.element.classList.remove('open');
    this.tray.autoClose();
  },
  toggle: function () {
    return this.isOpen ? this.close() : this.open();
  }
}

/***
 *  Tray
 *
 *  Controls the tray. Initializes automatically, but strictly the object is passed
 *  a `DOMElement`. Only 1 instance intended, so that's the export from this file.
 *
 *  @param {DOMElement} .ag-tray element
 *
 *  @method open()
 *  @method close() - also closes all tiers
 *  @method autoClose() - closes _if_ all tiers are already closed as well
 *
 *  @prop {Tier[]} tiers - array of all the tiers in the tray
 */
var Tray = function (el) {
  var _this = this;
  this.element = el;

  var tierEls = el.querySelectorAll('.ag-tray__tier');
  this.tiers = [];
  forEach(tierEls, function (tierEl) {
    _this.tiers.push(new Tier (tierEl, _this));
  });

  // close if click on background
  this.element.addEventListener('click', function (e) {
    var el = e.target;
    do {
      if (el.classList.contains('ag-tray__tier'))
        return;
      else if (el.classList.contains('ag-tray'))
        break;
    } while ((el = el.parentNode) && (el.classList !== undefined));
    _this.close();
  });
}
Tray.prototype = {
  open: function () {
    this.element.classList.add('open');
  },
  close: function () {
    // if any tiers are open, close them, and they will call .autoClose() to continue this
    for (var i = 0, len = this.tiers.length; i < len; i++) {
      if (this.tiers[i].isOpen)
        this.tiers[i].close();
    }
    this.element.classList.remove('open');
  },
  autoClose: function () {
    var shouldClose = true;
    for (var i = 0, len = this.tiers.length; i < len; i++) {
      if (this.tiers[i].isOpen) {
        shouldClose = false;
        break;
      }
    }
    if (shouldClose)
      this.close();
  }
}

var trayEl = document.querySelector('.ag-tray');
var tray;
if (trayEl)
  tray = new Tray (trayEl);

module.exports = tray;

},{"lib/util/forEach":9}],4:[function(require,module,exports){
/**
 *  handle hashchange
 */
// requirements
var tray = require('app/Tray');
var animateScroll = require('lib/animateScrollTo');
var getPageOffset = require('lib/getPageOffset');

// settings
var OFFSET = 32;

// listener
window.addEventListener('hashchange', function (e) {
  e.preventDefault();
  tray.close();
  var el = document.getElementById(window.location.hash.replace(/^#/,''));
  animateScroll(getPageOffset(el).top - OFFSET);
});

},{"app/Tray":3,"lib/animateScrollTo":6,"lib/getPageOffset":8}],5:[function(require,module,exports){
/**
 *  whole damn script
 *
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */
require('app/HtmlSample').makeAll();
// require('app/controls');
// require('app/Tray');
require('app/hashchange');
require('app/Copyable');

},{"app/Copyable":1,"app/HtmlSample":2,"app/hashchange":4}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29weWFibGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL2hhc2hjaGFuZ2UuanMiLCJhdXRvZ3VpZGUuanMiLCJsaWIvYW5pbWF0ZVNjcm9sbFRvLmpzIiwibGliL2Vhc2VzLmpzIiwibGliL2dldFBhZ2VPZmZzZXQuanMiLCJsaWIvdXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqKlxuICogIENvcHlhYmxlXG4gKlxuICogIE1ha2VzIGFuIGVsZW1lbnQgY2xpY2thYmxlLCBjb3B5aW5nIGEgc3RyaW5nIHRvIHRoZSB1c2VyJ3MgY2xpcGJvYXJkLiAgVG8gc2VlXG4gKiAgaG93IGl0IGxvb2tzLCBjaGVjayBvdXQgW3RoZSBodG1sIHNhbXBsZV0oIy9hdG9tcy9jb3B5YWJsZS1lbGVtZW50KS5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50XG4gKiAgQHBhcmFtIHtzdHJpbmd9IHN0cmluZyB0byBjb3B5XG4gKlxuICogIEBtZXRob2Qge0RPTUVsZW1lbnR9IG1ha2VJbnB1dCgpIC0gaW50ZXJuYWwgZnVuY3Rpb24gdG8gbWFrZSB0aGUgaW5wdXQgZnJvbVxuICogICAgd2hpY2ggdGhlIHN0cmluZyB3aWxsIGJlIGNvcGllZC5cbiAqICBAbWV0aG9kIGNvcHkoKSAtIGNvcGllcyBzdHJpbmcgdG8gY2xpcGJvYXJkLiBMaXN0ZW5lciBpcyBhdXRvbWF0aWNhbGx5IGFkZGVkLFxuICogICAgc28geW91IHNob3VsZG4ndCBuZWVkIHRvIG1hbnVhbGx5IGNhbGwgdGhpcy5cbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gdGhlIGNsYXNzXG52YXIgQ29weWFibGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgc3RyaW5nKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuXG4gIGlmIChkb2N1bWVudC5leGVjQ29tbWFuZCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnY29weWFibGUtZW5hYmxlZCcpO1xuICAgIHRoaXMubWFrZUlucHV0KCk7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgX3RoaXMuY29weSgpO1xuICAgIH0pO1xuICB9XG59XG5Db3B5YWJsZS5wcm90b3R5cGUgPSB7XG4gIG1ha2VJbnB1dDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHRoaXMuaW5wdXQuY2xhc3NMaXN0LmFkZCgndmlzdWFsbHloaWRkZW4nKTtcbiAgICB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5zdHJpbmc7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQ7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5pbnB1dCwgdGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLmlucHV0LnNlbGVjdCgpO1xuICAgIHRyeSB7XG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgIH0gY2F0Y2ggKGVycikge307XG4gICAgdGhpcy5pbnB1dC5ibHVyKCk7XG4gICAgdGhpcy5pbnB1dC5yZW1vdmUoKTtcbiAgfVxufVxuXG4vLyBhdXRvLWdlbmVyYXRlXG52YXIgY29weWFibGVzID0gW107XG52YXIgY29weWFibGVFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1jb3B5XScpO1xuZm9yRWFjaChjb3B5YWJsZUVscywgZnVuY3Rpb24gKGVsKSB7XG4gIGNvcHlhYmxlcy5wdXNoKG5ldyBDb3B5YWJsZSAoZWwsIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jb3B5JykpKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvcHlhYmxlO1xuIiwiLyoqKlxuICogSFRNTCBTYW1wbGVcbiAqXG4gKiBUaGUgaWZyYW1lcyB0aGF0IHNob3cgYW4gZXhhbXBsZSBvZiB0aGUgb3V0cHV0IG9mIGEgY29tcG9uZW50LlxuICovXG5cbi8qKipcbiAqICBNYWtlIEFsbCBIdG1sIFNhbXBsZXNcbiAqXG4gKiAgU2VhcmNoZXMgZm9yIGFsbCBgPG1ha2UtaWZyYW1lPmAgZWxlbWVudHMgYW5kIGRvZXMganVzdCB0aGF0OiBtYWtlcyB0aGVtIGlmcmFtZXMuXG4gKiAgSXQgYWxzbyBpbmNsdWRlcyB0aGUgc3R5bGVzaGVldHMgYW5kIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2BcbiAqICBvYmplY3QuICBUaG9zZSBzaG91bGQgYmUgcG9wdWxhdGVkIGJ5IHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiAganM6XG4gKiAgICByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLm1ha2VBbGwoKTsgLy8gZ29lcyB0aHJvdWdoIHRoZSB3aG9sZSBwYWdlIGFuZCBkb2VzIGl0cyB0aGluZ1xuICpcbiAqICBwYXRoOiAuL2FwcC9odG1sX3NhbXBsZVxuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuXG4vLyBzZXR0aW5nc1xuXG4vLyBoZWxwZXJzXG4vKipcbiAqIEdldCBkb2N1bWVudCBoZWlnaHQgKHN0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTQ1ODUwLylcbiAqXG4gKiBAcGFyYW0gIHtEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldERvY3VtZW50SGVpZ2h0IChkb2MpIHtcbiAgZG9jID0gZG9jIHx8IGRvY3VtZW50O1xuICB2YXIgYm9keSA9IGRvYy5ib2R5O1xuICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgaWYgKCFib2R5IHx8ICFodG1sKVxuICAgIHJldHVybiAwO1xuXG4gIHJldHVybiBNYXRoLm1heChcbiAgICBib2R5Lm9mZnNldEhlaWdodCxcbiAgICBodG1sLm9mZnNldEhlaWdodFxuICApO1xufVxuXG4vLyBkbyB0aGluZ3MhXG4vLyBnZXQgc29tZSBtZXRhIHRhZ3NcbnZhciBtZXRhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGEnKTtcbnZhciBzdHlsZXMsIHNjcmlwdHM7XG52YXIgc2FtcGxlcyA9IFtdO1xuXG4vKioqXG4gKiAgYEh0bWxTYW1wbGVgIENsYXNzXG4gKlxuICogIENvbnRyb2xzIGFuIGluZGl2aWR1YWwgSFRNTCBTYW1wbGUsIHdoaWNoIGlzIGFuIGlmcmFtZSB0aGF0IGxvYWRzIHRoZSBjc3MgYW5kXG4gKiAgc2NyaXB0cyB0aGF0IHRoZSBzdHlsZWd1aWRlIGlzIG1lYW50IHRvIHNob3cuIEl0IGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmRcbiAqICBzY3JpcHRzIHByZXNlbnQgaW4gdGhlIHdpbmRvdyBsZXZlbCBgYWdgIG9iamVjdC5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSBzb3VyY2VFbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gdHVybiBpbnRvIGFuIGlmcmFtZVxuICpcbiAqICBAbWV0aG9kIHt2b2lkfSBidWlsZENvbnRlbnQoKSAtIGJ1aWxkcyBhIHN0cmluZyBvZiB0aGUgZWxlbWVudCBhcyBhIGZ1bGwgaHRtbCBkb2N1bWVudFxuICogICAgYW5kIGFzc2lnbnMgaXQgYXMgdGhlIGRvY3VtZW50IG9mIHRoZSBpZnJhbWUuXG4gKiAgQG1ldGhvZCB7dm9pZH0gYXV0b0hlaWdodCgpIC0gYWx0ZXJzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBiZSB0aGUgbWluaW11bSBuZWVkZWQgdG9cbiAqICAgIGVsaW1pbmF0ZSBhIHNjcm9sbGJhci4gIEF1dG9tYXRpY2FsbHkgY2FsbGVkIG9uIGEgcGVyIGFuaW1hdGlvbiBmcmFtZSBiYXNpcy5cbiAqICBAbWV0aG9kIHtET01FbGVtZW50fSBnZXREb2N1bWVudCgpIC0gcmV0dXJucyB0aGUgaWZyYW1lJ3MgZG9jdW1lbnQgb2JqZWN0XG4gKiAgQG1ldGhvZCB7dm9pZH0gdG9nZ2xlR3JpZCgpIC0gYWRkcy9yZW1vdmVzIHRoZSAnc2hvdy1ncmlkJyBjbGFzcyB0byB0aGUgPGh0bWw+IGVsZW1lbnRcbiAqICAgIHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gKiAgQG1ldGhvZCB7dm9pZH0gc2V0V2lkdGgod2lkdGgpIC0gc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nXG4gKiAgICBtZWRpYSBxdWVyaWVzXG4gKiAgICBAcGFyYW0ge2ludH0gd2lkdGggLSB3aWR0aCBpbiBwaXhlbHMuIFJlc2V0cyB0byBkZWZhdWx0IHNpemUgaWYgZmFsc3lcbiAqXG4gKiAgQHByb3AgZWxlbWVudCAtIHRoZSBhY3R1YWwgaWZyYW1lIGVsZW1lbnRcbiAqXG4gKiAgcGF0aDogLi9hcHAvaHRtbF9zYW1wbGVcbiAqICBvcmRlcjogMFxuICovXG52YXIgSHRtbFNhbXBsZSA9IGZ1bmN0aW9uIChzb3VyY2VFbGVtZW50KSB7XG4gIHRoaXMuc291cmNlRWxlbWVudCA9IHNvdXJjZUVsZW1lbnQ7XG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsIHRoaXMuc291cmNlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykpO1xuXG4gIHRoaXMuYnVpbGRDb250ZW50KCk7XG4gIHRoaXMuc291cmNlRWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh0aGlzLmVsZW1lbnQsIHRoaXMuc291cmNlRWxlbWVudCk7XG5cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgKGZ1bmN0aW9uIGNoZWNrSWZyYW1lSGVpZ2h0ICgpIHtcbiAgICBfdGhpcy5hdXRvSGVpZ2h0KCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrSWZyYW1lSGVpZ2h0KTtcbiAgfSkoKTtcblxuICBzYW1wbGVzLnB1c2godGhpcyk7XG59XG5IdG1sU2FtcGxlLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqICBidWlsZENvbnRlbnQgY3JlYXRlcyBhIHN0cmluZyB0byB1c2UgYXMgdGhlIGRvY3VtZW50IGZvciB0aGUgaWZyYW1lXG4gICAqL1xuICBidWlsZENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGVudCA9ICc8IWRvY3R5cGUgaHRtbD4nO1xuICAgIGNvbnRlbnQgKz0gJzxodG1sIGNsYXNzPVwic2hvdy1kZXYgJyArICh0aGlzLnNvdXJjZUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmcycpID8gJ2ZzJyA6ICdub3QtZnMnKSArICdcIj48aGVhZD4nO1xuICAgIGZvckVhY2gobWV0YXMsZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgIGNvbnRlbnQgKz0gbWV0YS5vdXRlckhUTUw7XG4gICAgfSk7XG4gICAgZm9yRWFjaChzdHlsZXMsZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICBjb250ZW50ICs9ICc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIicgKyBzdHlsZSArICdcIj4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gJzwvaGVhZD48Ym9keT4nO1xuICAgIGNvbnRlbnQgKz0gdGhpcy5zb3VyY2VFbGVtZW50LmlubmVySFRNTDtcbiAgICBmb3JFYWNoKHNjcmlwdHMsZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgY29udGVudCArPSAnPHNjcmlwdCBzcmM9XCInICsgc2NyaXB0ICsgJ1wiPjwvc2NyaXB0Pic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSBcIjwvYm9keT48L2h0bWw+XCI7XG4gICAgdGhpcy5lbGVtZW50LnNyY2RvYyA9IGNvbnRlbnQ7XG4gIH0sXG4gIC8qKlxuICAgKiAgYXV0b0hlaWdodCB1cGRhdGVzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBleGFjdGx5IGNvbnRhaW4gaXRzIGNvbnRlbnRcbiAgICovXG4gIGF1dG9IZWlnaHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9jID0gdGhpcy5nZXREb2N1bWVudCgpO1xuICAgIGlmIChkb2MpIHtcbiAgICAgIHZhciBkb2NIZWlnaHQgPSBnZXREb2N1bWVudEhlaWdodChkb2MpO1xuICAgICAgaWYgKGRvY0hlaWdodCAhPSB0aGlzLmVsZW1lbnQuaGVpZ2h0KVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBkb2NIZWlnaHQpO1xuICAgIH1cbiAgfSxcbiAgLyoqXG4gICAqICBnZXREb2N1bWVudCBnZXRzIHRoZSBpbnRlcm5hbCBkb2N1bWVudCBvZiB0aGUgaWZyYW1lXG4gICAqL1xuICBnZXREb2N1bWVudDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50IHx8ICh0aGlzLmVsZW1lbnQuY29udGVudFdpbmRvdyAmJiB0aGlzLmVsZW1lbnQuY29udGVudFdpbmRvdy5kb2N1bWVudCk7XG4gIH0sXG4gIC8qKlxuICAgKiAgYWRkcy9yZW1vdmVzIHRoZSAnc2hvdy1ncmlkJyBjbGFzcyB0byB0aGUgPGh0bWw+IGVsZW1lbnQgc28gd2UgY2FuIHNob3cgYSBncmlkIG92ZXJsYXlcbiAgICovXG4gIHRvZ2dsZUdyaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdldERvY3VtZW50KCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKVswXS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93LWdyaWQnKTtcbiAgfSxcbiAgLyoqXG4gICAqICBzZXRzIHRoZSB3aWR0aCBvZiB0aGUgaWZyYW1lLCB1c2VmdWwgZm9yIHNob3dpbmcgbWVkaWEgcXVlcmllc1xuICAgKi9cbiAgc2V0V2lkdGg6IGZ1bmN0aW9uICh3KSB7XG4gICAgaWYgKHcpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHcgKyAncHgnO1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZWQnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSAnJztcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdyZXNpemVkJyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VIdG1sU2FtcGxlcyAoKSB7XG4gIC8vIGdldCBzdHlsZXMgYW5kIHNjcmlwdHNcbiAgc3R5bGVzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zdHlsZXMgfHwgW107XG4gIHNjcmlwdHMgPSB3aW5kb3cuYWcgJiYgd2luZG93LmFnLnNjcmlwdHMgfHwgW107XG4gIC8vIGdldCBhbGwgb3VyIGN1c3RvbSBlbGVtZW50c1xuICB2YXIgZWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ha2UtaWZyYW1lJyk7XG4gIGZvciAodmFyIGkgPSBlbHMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICBuZXcgSHRtbFNhbXBsZShlbHNbaV0pO1xuICB9O1xufVxuXG4vKioqXG4gKiAgVG9nZ2xlIEhUTUwgU2FtcGxlIEdyaWRzXG4gKlxuICogIFRvZ2dsZXMgYSBgLnNob3ctZ3JpZGAgY2xhc3Mgb24gdGhlIGA8aHRtbD5gIGVsZW1lbnQgaW5zaWRlIGFsbCB0aGVcbiAqICBpZnJhbWVzLiAgV2l0aCB0aGUgaW4tZnJhbWUuY3NzIHN0eWxlc2hlZXQgaW5jbHVkZWQsIHRoaXMgd2lsbCB0dXJuIG9uIGEgMTJcbiAqICBjb2x1bW4gZ3JpZCBvdmVybGF5LlxuICpcbiAqICBqczpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykudG9nZ2xlR3JpZHMoKVxuICpcbiAqICBwYXRoOiAuL2FwcC9odG1sX3NhbXBsZVxuICovXG52YXIgdG9nZ2xlR3JpZHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnRvZ2dsZUdyaWQoKTtcbiAgfSk7XG59XG5cbi8qKipcbiAqICBzZXRXaWR0aHNcbiAqXG4gKiAgU2V0cyBhbGwgYEh0bWxTYW1wbGVgcyB0byB0aGUgcHJvdmlkZWQgd2lkdGguXG4gKlxuICogIGpzOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5zZXRXaWR0aHMod2lkdGgpO1xuICpcbiAqICBAcGFyYW0ge2ludH0gd2lkdGhcbiAqXG4gKiAgcGF0aDogLi9hcHAvaHRtbF9zYW1wbGVcbiAqL1xudmFyIHNldFdpZHRocyA9IGZ1bmN0aW9uICh3KSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnNldFdpZHRoKHcpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIdG1sU2FtcGxlO1xubW9kdWxlLmV4cG9ydHMubWFrZUFsbCA9IG1ha2VIdG1sU2FtcGxlcztcbm1vZHVsZS5leHBvcnRzLnRvZ2dsZUdyaWRzID0gdG9nZ2xlR3JpZHM7XG5tb2R1bGUuZXhwb3J0cy5zZXRXaWR0aHMgPSBzZXRXaWR0aHM7XG4iLCIvLyByZXF1aXJlbWVudHNcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuXG4vLyBzZXR0aW5nc1xuXG4vLyBjbGFzc2VzXG4vKioqXG4gKiAgVHJheSBUaWVyXG4gKlxuICogIENvbnRyb2xzIGFuIGluZGl2aWR1YWwgdGllciBvZiB0aGUgVHJheS4gTm90IGEgYmlnIGRlYWwsIGp1c3QgaGFuZGxlcyBvcGVuL2Nsb3NlXG4gKiAgYW5kIG9wZW5lciBjbGljayBldmVudHMuXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH0gLmFnLXRyYXlfX3RpZXIgZWxlbWVudFxuICogIEBwYXJhbSB7VHJheX0gcGFyZW50IHRyYXkgb2JqZWN0XG4gKlxuICogIEBtZXRob2Qgb3BlbigpXG4gKiAgQG1ldGhvZCBjbG9zZSgpXG4gKiAgQG1ldGhvZCB0b2dnbGUoKVxuICpcbiAqICBAcHJvcCB7Ym9vbGVhbn0gaXNPcGVuXG4gKi9cbnZhciBUaWVyID0gZnVuY3Rpb24gKGVsLCB0cmF5KSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsO1xuICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICB0aGlzLnRyYXkgPSB0cmF5O1xuXG4gIHRoaXMub3BlbmVyID0gZWwucXVlcnlTZWxlY3RvcignLmFnLXRyYXlfX3RpZXItb3BlbmVyJyk7XG4gIGlmICh0aGlzLm9wZW5lcikge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5vcGVuZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgX3RoaXMudG9nZ2xlKCk7XG4gICAgfSk7XG4gIH1cbn1cblRpZXIucHJvdG90eXBlID0ge1xuICBvcGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XG4gICAgdGhpcy50cmF5Lm9wZW4oKTtcbiAgfSxcbiAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgdGhpcy50cmF5LmF1dG9DbG9zZSgpO1xuICB9LFxuICB0b2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pc09wZW4gPyB0aGlzLmNsb3NlKCkgOiB0aGlzLm9wZW4oKTtcbiAgfVxufVxuXG4vKioqXG4gKiAgVHJheVxuICpcbiAqICBDb250cm9scyB0aGUgdHJheS4gSW5pdGlhbGl6ZXMgYXV0b21hdGljYWxseSwgYnV0IHN0cmljdGx5IHRoZSBvYmplY3QgaXMgcGFzc2VkXG4gKiAgYSBgRE9NRWxlbWVudGAuIE9ubHkgMSBpbnN0YW5jZSBpbnRlbmRlZCwgc28gdGhhdCdzIHRoZSBleHBvcnQgZnJvbSB0aGlzIGZpbGUuXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH0gLmFnLXRyYXkgZWxlbWVudFxuICpcbiAqICBAbWV0aG9kIG9wZW4oKVxuICogIEBtZXRob2QgY2xvc2UoKSAtIGFsc28gY2xvc2VzIGFsbCB0aWVyc1xuICogIEBtZXRob2QgYXV0b0Nsb3NlKCkgLSBjbG9zZXMgX2lmXyBhbGwgdGllcnMgYXJlIGFscmVhZHkgY2xvc2VkIGFzIHdlbGxcbiAqXG4gKiAgQHByb3Age1RpZXJbXX0gdGllcnMgLSBhcnJheSBvZiBhbGwgdGhlIHRpZXJzIGluIHRoZSB0cmF5XG4gKi9cbnZhciBUcmF5ID0gZnVuY3Rpb24gKGVsKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMuZWxlbWVudCA9IGVsO1xuXG4gIHZhciB0aWVyRWxzID0gZWwucXVlcnlTZWxlY3RvckFsbCgnLmFnLXRyYXlfX3RpZXInKTtcbiAgdGhpcy50aWVycyA9IFtdO1xuICBmb3JFYWNoKHRpZXJFbHMsIGZ1bmN0aW9uICh0aWVyRWwpIHtcbiAgICBfdGhpcy50aWVycy5wdXNoKG5ldyBUaWVyICh0aWVyRWwsIF90aGlzKSk7XG4gIH0pO1xuXG4gIC8vIGNsb3NlIGlmIGNsaWNrIG9uIGJhY2tncm91bmRcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICBkbyB7XG4gICAgICBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdhZy10cmF5X190aWVyJykpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGVsc2UgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnYWctdHJheScpKVxuICAgICAgICBicmVhaztcbiAgICB9IHdoaWxlICgoZWwgPSBlbC5wYXJlbnROb2RlKSAmJiAoZWwuY2xhc3NMaXN0ICE9PSB1bmRlZmluZWQpKTtcbiAgICBfdGhpcy5jbG9zZSgpO1xuICB9KTtcbn1cblRyYXkucHJvdG90eXBlID0ge1xuICBvcGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgfSxcbiAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBpZiBhbnkgdGllcnMgYXJlIG9wZW4sIGNsb3NlIHRoZW0sIGFuZCB0aGV5IHdpbGwgY2FsbCAuYXV0b0Nsb3NlKCkgdG8gY29udGludWUgdGhpc1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnRpZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy50aWVyc1tpXS5pc09wZW4pXG4gICAgICAgIHRoaXMudGllcnNbaV0uY2xvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgfSxcbiAgYXV0b0Nsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNob3VsZENsb3NlID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy50aWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMudGllcnNbaV0uaXNPcGVuKSB7XG4gICAgICAgIHNob3VsZENsb3NlID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2hvdWxkQ2xvc2UpXG4gICAgICB0aGlzLmNsb3NlKCk7XG4gIH1cbn1cblxudmFyIHRyYXlFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hZy10cmF5Jyk7XG52YXIgdHJheTtcbmlmICh0cmF5RWwpXG4gIHRyYXkgPSBuZXcgVHJheSAodHJheUVsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB0cmF5O1xuIiwiLyoqXG4gKiAgaGFuZGxlIGhhc2hjaGFuZ2VcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgdHJheSA9IHJlcXVpcmUoJ2FwcC9UcmF5Jyk7XG52YXIgYW5pbWF0ZVNjcm9sbCA9IHJlcXVpcmUoJ2xpYi9hbmltYXRlU2Nyb2xsVG8nKTtcbnZhciBnZXRQYWdlT2Zmc2V0ID0gcmVxdWlyZSgnbGliL2dldFBhZ2VPZmZzZXQnKTtcblxuLy8gc2V0dGluZ3NcbnZhciBPRkZTRVQgPSAzMjtcblxuLy8gbGlzdGVuZXJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB0cmF5LmNsb3NlKCk7XG4gIHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoL14jLywnJykpO1xuICBhbmltYXRlU2Nyb2xsKGdldFBhZ2VPZmZzZXQoZWwpLnRvcCAtIE9GRlNFVCk7XG59KTtcbiIsIi8qKlxuICogIHdob2xlIGRhbW4gc2NyaXB0XG4gKlxuICogIFRoaXMgc2hvdWxkIGluY2x1ZGUgb2JqZWN0cywgd2hpY2ggaW4gdHVybiBpbmNsdWRlIHRoZSBsaWIgZmlsZXMgdGhleSBuZWVkLlxuICogIFRoaXMga2VlcHMgdXMgdXNpbmcgYSBtb2R1bGFyIGFwcHJvYWNoIHRvIGRldiB3aGlsZSBhbHNvIG9ubHkgaW5jbHVkaW5nIHRoZVxuICogIHBhcnRzIG9mIHRoZSBsaWJyYXJ5IHdlIG5lZWQuXG4gKi9cbnJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykubWFrZUFsbCgpO1xuLy8gcmVxdWlyZSgnYXBwL2NvbnRyb2xzJyk7XG4vLyByZXF1aXJlKCdhcHAvVHJheScpO1xucmVxdWlyZSgnYXBwL2hhc2hjaGFuZ2UnKTtcbnJlcXVpcmUoJ2FwcC9Db3B5YWJsZScpO1xuIiwiLyoqXG4gKiAgQW5pbWF0ZSBTY3JvbGwgdG8gUG9zaXRpb25cbiAqXG4gKiAgQW5pbWF0ZXMgd2luZG93IHNjcm9sbCBwb3NpdGlvblxuICpcbiAqICBAcGFyYW0ge2ludH0gLSBlbmQgcG9zaXRpb24gaW4gcGl4ZWxzXG4gKlxuICogIGpzOlxuICogICAgdmFyIGFuaW1hdGVTY3JvbGwgPSByZXF1aXJlKCdsaWIvYW5pbWF0ZVNjcm9sbFRvJyk7XG4gKiAgICBhbmltYXRlU2Nyb2xsKHRvcCk7XG4gKi9cblxuLy8gcmVxdWlyZW1lbnRzXG52YXIgZWFzZXMgPSByZXF1aXJlKCdsaWIvZWFzZXMnKTtcblxuLy8gc2V0dGluZ3NcbnZhciBtaW5EdXJhdGlvbiA9IDEwMDA7XG5cbi8vIHRoZSBhbmltYXRpb24gY29udHJvbGxlclxudmFyIHN0YXJ0VGltZSxcbiAgICBkdXJhdGlvbixcbiAgICBzdGFydFBvcyxcbiAgICBkZWx0YVNjcm9sbCxcbiAgICBsYXN0U2Nyb2xsXG4gICAgO1xuXG4oZnVuY3Rpb24gdXBkYXRlU2Nyb2xsICgpIHtcbiAgbGFzdFNjcm9sbCA9IHdpbmRvdy5zY3JvbGxZO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlU2Nyb2xsKTtcbn0pKCk7XG5cbnZhciBhbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24gKGN1cnJlbnRUaW1lKSB7XG4gIHZhciBkZWx0YVRpbWUgPSBjdXJyZW50VGltZSAtIHN0YXJ0VGltZTtcbiAgaWYgKGRlbHRhVGltZSA8IGR1cmF0aW9uKSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIGVhc2VzLmVhc2VJbk91dChzdGFydFBvcywgZGVsdGFTY3JvbGwsIGRlbHRhVGltZSAvIGR1cmF0aW9uKSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGFuaW1hdGVTY3JvbGwobmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCBzdGFydFBvcyArIGRlbHRhU2Nyb2xsKTtcbiAgfVxufVxuXG52YXIgc3RhcnRBbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24gKGVuZFNjcm9sbCkge1xuICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgc3RhcnRQb3MgPSBsYXN0U2Nyb2xsO1xuICBkZWx0YVNjcm9sbCA9IGVuZFNjcm9sbCAtIHN0YXJ0UG9zO1xuICBkdXJhdGlvbiA9IE1hdGgubWF4KG1pbkR1cmF0aW9uLCBNYXRoLmFicyhkZWx0YVNjcm9sbCkgKiAuMSk7XG4gIGFuaW1hdGVTY3JvbGwoc3RhcnRUaW1lKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFydEFuaW1hdGVTY3JvbGw7XG4iLCIvKipcbiAqICBhIGJ1bmNoIG9mIGVhc2luZyBmdW5jdGlvbnMgZm9yIG1ha2luZyBhbmltYXRpb25zXG4gKiAgdGVzdGluZyBpcyBmYWlybHkgc3ViamVjdGl2ZSwgc28gbm90IGF1dG9tYXRlZFxuICovXG5cbnZhciBlYXNlcyA9IHtcbiAgJ2Vhc2VJbk91dCcgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICBpZiAocCA8IC41KSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoMiAqIHAgKiBwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoLTIgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICAgIH1cbiAgfSxcbiAgJ2Vhc2VJbk91dEN1YmljJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIGlmIChwIDwgLjUpIHtcbiAgICAgIHJldHVybiBzICsgYyAqICg0ICogcCAqIHAgKiBwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoNCAqIChwIC0gMSkgKiAocCAtIDEpICogKHAgLSAxKSArIDEpXG4gICAgfVxuICB9LFxuICAnZWFzZUluJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIHAgKiBwO1xuICB9LFxuICAnZWFzZUluQ3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKHAgKiBwICogcCk7XG4gIH0sXG4gICdlYXNlT3V0JyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqICgtMSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gIH0sXG4gICdlYXNlT3V0Q3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKChwIC0gMSkgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICB9LFxuICAnbGluZWFyJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIHA7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZWFzZXM7XG4iLCIvKioqXG4gKiAgR2V0IFBhZ2UgT2Zmc2V0XG4gKlxuICogIEdldCBhIERPTUVsZW1lbnQncyBvZmZzZXQgZnJvbSBwYWdlXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH1cbiAqICBAcmV0dXJucyBvYmplY3RcbiAqICAgIEBwcm9wIHtudW1iZXJ9IGxlZnRcbiAqICAgIEBwcm9wIHtudW1iZXJ9IHRvcFxuICpcbiAqICBqczpcbiAqICAgIHZhciBnZXRQYWdlT2Zmc2V0ID0gcmVxdWlyZSgnbGliL2dldFBhZ2VPZmZzZXQnKTtcbiAqICAgIGdldFBhZ2VPZmZzZXQoc29tZUVsZW1lbnQpO1xuICovXG5mdW5jdGlvbiBnZXRQYWdlT2Zmc2V0IChlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudCkge1xuICAgIHRocm93ICdnZXRQYWdlT2Zmc2V0IHBhc3NlZCBhbiBpbnZhbGlkIGVsZW1lbnQnO1xuICB9XG4gIHZhciBwYWdlT2Zmc2V0WCA9IGVsZW1lbnQub2Zmc2V0TGVmdCxcbiAgICAgIHBhZ2VPZmZzZXRZID0gZWxlbWVudC5vZmZzZXRUb3A7XG5cbiAgd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudCkge1xuICAgIHBhZ2VPZmZzZXRYICs9IGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBwYWdlT2Zmc2V0WSArPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbGVmdCA6IHBhZ2VPZmZzZXRYLFxuICAgIHRvcCA6IHBhZ2VPZmZzZXRZXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQYWdlT2Zmc2V0O1xuIiwiLyoqKlxuICogZm9yRWFjaCBGdW5jdGlvblxuICpcbiAqIEl0ZXJhdGUgb3ZlciBhbiBhcnJheSwgcGFzc2luZyB0aGUgdmFsdWUgdG8gdGhlIHBhc3NlZCBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIHRvIGNhbGxcbiAqXG4gKiBqczpcbiAqICAgdmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG4gKiAgIGZvckVhY2goc29tZUFycmF5LCBmdW5jdGlvbiAoaXRlbSkgeyBhbGVydChpdGVtKSB9KTtcbiAqL1xuZnVuY3Rpb24gZm9yRWFjaCAoYXJyLCBmbikge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZm4uY2FsbChhcnJbaV0sYXJyW2ldLGFycik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JFYWNoO1xuIl19
