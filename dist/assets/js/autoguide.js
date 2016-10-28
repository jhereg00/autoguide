(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/***
 *  Copyable
 *
 *  Makes an element clickable, copying a string to the user's clipboard.
 *
 *  @param {DOMElement} element
 *  @param {string} string to copy
 *
 *  @method {DOMElement} makeInput() - internal function to make the input from
 *    which the string will be copied.
 *  @method copy() - copies string to clipboard. Listener is automatically added,
 *    so you shouldn't need to manually call this.
 *
 *  template: js
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
 *  Make All Html Samples
 *
 *  Searches for all `<make-iframe>` elements and does just that: makes them iframes.
 *  It also includes the stylesheets and scripts present in the window level `ag`
 *  object.  Those should be populated by the template.
 *
 *  code:
 *    require('app/HtmlSample').makeAll(); // goes through the whole page and does its thing
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
 *  code:
 *    require('app/makeHtmlSamples').toggleGrids()
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
 *  code:
 *    require('app/HtmlSample').setWidths(width);
 *
 *  @param {int} width
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
 *  code:
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
 *  code:
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
 * code:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29weWFibGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL2hhc2hjaGFuZ2UuanMiLCJhdXRvZ3VpZGUuanMiLCJsaWIvYW5pbWF0ZVNjcm9sbFRvLmpzIiwibGliL2Vhc2VzLmpzIiwibGliL2dldFBhZ2VPZmZzZXQuanMiLCJsaWIvdXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKioqXG4gKiAgQ29weWFibGVcbiAqXG4gKiAgTWFrZXMgYW4gZWxlbWVudCBjbGlja2FibGUsIGNvcHlpbmcgYSBzdHJpbmcgdG8gdGhlIHVzZXIncyBjbGlwYm9hcmQuXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudFxuICogIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgdG8gY29weVxuICpcbiAqICBAbWV0aG9kIHtET01FbGVtZW50fSBtYWtlSW5wdXQoKSAtIGludGVybmFsIGZ1bmN0aW9uIHRvIG1ha2UgdGhlIGlucHV0IGZyb21cbiAqICAgIHdoaWNoIHRoZSBzdHJpbmcgd2lsbCBiZSBjb3BpZWQuXG4gKiAgQG1ldGhvZCBjb3B5KCkgLSBjb3BpZXMgc3RyaW5nIHRvIGNsaXBib2FyZC4gTGlzdGVuZXIgaXMgYXV0b21hdGljYWxseSBhZGRlZCxcbiAqICAgIHNvIHlvdSBzaG91bGRuJ3QgbmVlZCB0byBtYW51YWxseSBjYWxsIHRoaXMuXG4gKlxuICogIHRlbXBsYXRlOiBqc1xuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuXG4vLyBzZXR0aW5nc1xuXG4vLyB0aGUgY2xhc3NcbnZhciBDb3B5YWJsZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBzdHJpbmcpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG5cbiAgaWYgKGRvY3VtZW50LmV4ZWNDb21tYW5kKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdjb3B5YWJsZS1lbmFibGVkJyk7XG4gICAgdGhpcy5tYWtlSW5wdXQoKTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy5jb3B5KCk7XG4gICAgfSk7XG4gIH1cbn1cbkNvcHlhYmxlLnByb3RvdHlwZSA9IHtcbiAgbWFrZUlucHV0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgdGhpcy5pbnB1dC5jbGFzc0xpc3QuYWRkKCd2aXN1YWxseWhpZGRlbicpO1xuICAgIHRoaXMuaW5wdXQudmFsdWUgPSB0aGlzLnN0cmluZztcbiAgICByZXR1cm4gdGhpcy5pbnB1dDtcbiAgfSxcbiAgY29weTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmlucHV0LCB0aGlzLmVsZW1lbnQpO1xuICAgIHRoaXMuaW5wdXQuc2VsZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7fTtcbiAgICB0aGlzLmlucHV0LmJsdXIoKTtcbiAgICB0aGlzLmlucHV0LnJlbW92ZSgpO1xuICB9XG59XG5cbi8vIGF1dG8tZ2VuZXJhdGVcbnZhciBjb3B5YWJsZXMgPSBbXTtcbnZhciBjb3B5YWJsZUVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWNvcHldJyk7XG5mb3JFYWNoKGNvcHlhYmxlRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgY29weWFibGVzLnB1c2gobmV3IENvcHlhYmxlIChlbCwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNvcHknKSkpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29weWFibGU7XG4iLCIvKioqXG4gKiAgTWFrZSBBbGwgSHRtbCBTYW1wbGVzXG4gKlxuICogIFNlYXJjaGVzIGZvciBhbGwgYDxtYWtlLWlmcmFtZT5gIGVsZW1lbnRzIGFuZCBkb2VzIGp1c3QgdGhhdDogbWFrZXMgdGhlbSBpZnJhbWVzLlxuICogIEl0IGFsc28gaW5jbHVkZXMgdGhlIHN0eWxlc2hlZXRzIGFuZCBzY3JpcHRzIHByZXNlbnQgaW4gdGhlIHdpbmRvdyBsZXZlbCBgYWdgXG4gKiAgb2JqZWN0LiAgVGhvc2Ugc2hvdWxkIGJlIHBvcHVsYXRlZCBieSB0aGUgdGVtcGxhdGUuXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLm1ha2VBbGwoKTsgLy8gZ29lcyB0aHJvdWdoIHRoZSB3aG9sZSBwYWdlIGFuZCBkb2VzIGl0cyB0aGluZ1xuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuXG4vLyBzZXR0aW5nc1xuXG4vLyBoZWxwZXJzXG4vKipcbiAqIEdldCBkb2N1bWVudCBoZWlnaHQgKHN0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTQ1ODUwLylcbiAqXG4gKiBAcGFyYW0gIHtEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldERvY3VtZW50SGVpZ2h0IChkb2MpIHtcbiAgZG9jID0gZG9jIHx8IGRvY3VtZW50O1xuICB2YXIgYm9keSA9IGRvYy5ib2R5O1xuICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgaWYgKCFib2R5IHx8ICFodG1sKVxuICAgIHJldHVybiAwO1xuXG4gIHJldHVybiBNYXRoLm1heChcbiAgICBib2R5Lm9mZnNldEhlaWdodCxcbiAgICBodG1sLm9mZnNldEhlaWdodFxuICApO1xufVxuXG4vLyBkbyB0aGluZ3MhXG4vLyBnZXQgc29tZSBtZXRhIHRhZ3NcbnZhciBtZXRhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGEnKTtcbnZhciBzdHlsZXMsIHNjcmlwdHM7XG52YXIgc2FtcGxlcyA9IFtdO1xuXG4vKioqXG4gKiAgYEh0bWxTYW1wbGVgIENsYXNzXG4gKlxuICogIENvbnRyb2xzIGFuIGluZGl2aWR1YWwgSFRNTCBTYW1wbGUsIHdoaWNoIGlzIGFuIGlmcmFtZSB0aGF0IGxvYWRzIHRoZSBjc3MgYW5kXG4gKiAgc2NyaXB0cyB0aGF0IHRoZSBzdHlsZWd1aWRlIGlzIG1lYW50IHRvIHNob3cuIEl0IGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmRcbiAqICBzY3JpcHRzIHByZXNlbnQgaW4gdGhlIHdpbmRvdyBsZXZlbCBgYWdgIG9iamVjdC5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSBzb3VyY2VFbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gdHVybiBpbnRvIGFuIGlmcmFtZVxuICpcbiAqICBAbWV0aG9kIHt2b2lkfSBidWlsZENvbnRlbnQoKSAtIGJ1aWxkcyBhIHN0cmluZyBvZiB0aGUgZWxlbWVudCBhcyBhIGZ1bGwgaHRtbCBkb2N1bWVudFxuICogICAgYW5kIGFzc2lnbnMgaXQgYXMgdGhlIGRvY3VtZW50IG9mIHRoZSBpZnJhbWUuXG4gKiAgQG1ldGhvZCB7dm9pZH0gYXV0b0hlaWdodCgpIC0gYWx0ZXJzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBiZSB0aGUgbWluaW11bSBuZWVkZWQgdG9cbiAqICAgIGVsaW1pbmF0ZSBhIHNjcm9sbGJhci4gIEF1dG9tYXRpY2FsbHkgY2FsbGVkIG9uIGEgcGVyIGFuaW1hdGlvbiBmcmFtZSBiYXNpcy5cbiAqICBAbWV0aG9kIHtET01FbGVtZW50fSBnZXREb2N1bWVudCgpIC0gcmV0dXJucyB0aGUgaWZyYW1lJ3MgZG9jdW1lbnQgb2JqZWN0XG4gKiAgQG1ldGhvZCB7dm9pZH0gdG9nZ2xlR3JpZCgpIC0gYWRkcy9yZW1vdmVzIHRoZSAnc2hvdy1ncmlkJyBjbGFzcyB0byB0aGUgPGh0bWw+IGVsZW1lbnRcbiAqICAgIHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gKiAgQG1ldGhvZCB7dm9pZH0gc2V0V2lkdGgod2lkdGgpIC0gc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nXG4gKiAgICBtZWRpYSBxdWVyaWVzXG4gKiAgICBAcGFyYW0ge2ludH0gd2lkdGggLSB3aWR0aCBpbiBwaXhlbHMuIFJlc2V0cyB0byBkZWZhdWx0IHNpemUgaWYgZmFsc3lcbiAqXG4gKiAgQHByb3AgZWxlbWVudCAtIHRoZSBhY3R1YWwgaWZyYW1lIGVsZW1lbnRcbiAqL1xudmFyIEh0bWxTYW1wbGUgPSBmdW5jdGlvbiAoc291cmNlRWxlbWVudCkge1xuICB0aGlzLnNvdXJjZUVsZW1lbnQgPSBzb3VyY2VFbGVtZW50O1xuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCB0aGlzLnNvdXJjZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpKTtcblxuICB0aGlzLmJ1aWxkQ29udGVudCgpO1xuICB0aGlzLnNvdXJjZUVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQodGhpcy5lbGVtZW50LCB0aGlzLnNvdXJjZUVsZW1lbnQpO1xuXG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIChmdW5jdGlvbiBjaGVja0lmcmFtZUhlaWdodCAoKSB7XG4gICAgX3RoaXMuYXV0b0hlaWdodCgpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjaGVja0lmcmFtZUhlaWdodCk7XG4gIH0pKCk7XG5cbiAgc2FtcGxlcy5wdXNoKHRoaXMpO1xufVxuSHRtbFNhbXBsZS5wcm90b3R5cGUgPSB7XG4gIC8qKlxuICAgKiAgYnVpbGRDb250ZW50IGNyZWF0ZXMgYSBzdHJpbmcgdG8gdXNlIGFzIHRoZSBkb2N1bWVudCBmb3IgdGhlIGlmcmFtZVxuICAgKi9cbiAgYnVpbGRDb250ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnRlbnQgPSAnPCFkb2N0eXBlIGh0bWw+JztcbiAgICBjb250ZW50ICs9ICc8aHRtbCBjbGFzcz1cInNob3ctZGV2ICcgKyAodGhpcy5zb3VyY2VFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnZnMnKSA/ICdmcycgOiAnbm90LWZzJykgKyAnXCI+PGhlYWQ+JztcbiAgICBmb3JFYWNoKG1ldGFzLGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICBjb250ZW50ICs9IG1ldGEub3V0ZXJIVE1MO1xuICAgIH0pO1xuICAgIGZvckVhY2goc3R5bGVzLGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgY29udGVudCArPSAnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCInICsgc3R5bGUgKyAnXCI+JztcbiAgICB9KTtcbiAgICBjb250ZW50ICs9ICc8L2hlYWQ+PGJvZHk+JztcbiAgICBjb250ZW50ICs9IHRoaXMuc291cmNlRWxlbWVudC5pbm5lckhUTUw7XG4gICAgZm9yRWFjaChzY3JpcHRzLGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgIGNvbnRlbnQgKz0gJzxzY3JpcHQgc3JjPVwiJyArIHNjcmlwdCArICdcIj48L3NjcmlwdD4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gXCI8L2JvZHk+PC9odG1sPlwiO1xuICAgIHRoaXMuZWxlbWVudC5zcmNkb2MgPSBjb250ZW50O1xuICB9LFxuICAvKipcbiAgICogIGF1dG9IZWlnaHQgdXBkYXRlcyB0aGUgaGVpZ2h0IG9mIHRoZSBpZnJhbWUgdG8gZXhhY3RseSBjb250YWluIGl0cyBjb250ZW50XG4gICAqL1xuICBhdXRvSGVpZ2h0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRvYyA9IHRoaXMuZ2V0RG9jdW1lbnQoKTtcbiAgICBpZiAoZG9jKSB7XG4gICAgICB2YXIgZG9jSGVpZ2h0ID0gZ2V0RG9jdW1lbnRIZWlnaHQoZG9jKTtcbiAgICAgIGlmIChkb2NIZWlnaHQgIT0gdGhpcy5lbGVtZW50LmhlaWdodClcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgZG9jSGVpZ2h0KTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiAgZ2V0RG9jdW1lbnQgZ2V0cyB0aGUgaW50ZXJuYWwgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZVxuICAgKi9cbiAgZ2V0RG9jdW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudCB8fCAodGhpcy5lbGVtZW50LmNvbnRlbnRXaW5kb3cgJiYgdGhpcy5lbGVtZW50LmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQpO1xuICB9LFxuICAvKipcbiAgICogIGFkZHMvcmVtb3ZlcyB0aGUgJ3Nob3ctZ3JpZCcgY2xhc3MgdG8gdGhlIDxodG1sPiBlbGVtZW50IHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gICAqL1xuICB0b2dnbGVHcmlkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nZXREb2N1bWVudCgpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJylbMF0uY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy1ncmlkJyk7XG4gIH0sXG4gIC8qKlxuICAgKiAgc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nIG1lZGlhIHF1ZXJpZXNcbiAgICovXG4gIHNldFdpZHRoOiBmdW5jdGlvbiAodykge1xuICAgIGlmICh3KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB3ICsgJ3B4JztcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdyZXNpemVkJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJyc7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplZCcpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlSHRtbFNhbXBsZXMgKCkge1xuICAvLyBnZXQgc3R5bGVzIGFuZCBzY3JpcHRzXG4gIHN0eWxlcyA9IHdpbmRvdy5hZyAmJiB3aW5kb3cuYWcuc3R5bGVzIHx8IFtdO1xuICBzY3JpcHRzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zY3JpcHRzIHx8IFtdO1xuICAvLyBnZXQgYWxsIG91ciBjdXN0b20gZWxlbWVudHNcbiAgdmFyIGVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYWtlLWlmcmFtZScpO1xuICBmb3IgKHZhciBpID0gZWxzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgbmV3IEh0bWxTYW1wbGUoZWxzW2ldKTtcbiAgfTtcbn1cblxuLyoqKlxuICogIFRvZ2dsZSBIVE1MIFNhbXBsZSBHcmlkc1xuICpcbiAqICBUb2dnbGVzIGEgYC5zaG93LWdyaWRgIGNsYXNzIG9uIHRoZSBgPGh0bWw+YCBlbGVtZW50IGluc2lkZSBhbGwgdGhlXG4gKiAgaWZyYW1lcy4gIFdpdGggdGhlIGluLWZyYW1lLmNzcyBzdHlsZXNoZWV0IGluY2x1ZGVkLCB0aGlzIHdpbGwgdHVybiBvbiBhIDEyXG4gKiAgY29sdW1uIGdyaWQgb3ZlcmxheS5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9tYWtlSHRtbFNhbXBsZXMnKS50b2dnbGVHcmlkcygpXG4gKi9cbnZhciB0b2dnbGVHcmlkcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yRWFjaChzYW1wbGVzLCBmdW5jdGlvbiAocykge1xuICAgIHMudG9nZ2xlR3JpZCgpO1xuICB9KTtcbn1cblxuLyoqKlxuICogIHNldFdpZHRoc1xuICpcbiAqICBTZXRzIGFsbCBgSHRtbFNhbXBsZWBzIHRvIHRoZSBwcm92aWRlZCB3aWR0aC5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykuc2V0V2lkdGhzKHdpZHRoKTtcbiAqXG4gKiAgQHBhcmFtIHtpbnR9IHdpZHRoXG4gKi9cbnZhciBzZXRXaWR0aHMgPSBmdW5jdGlvbiAodykge1xuICBmb3JFYWNoKHNhbXBsZXMsIGZ1bmN0aW9uIChzKSB7XG4gICAgcy5zZXRXaWR0aCh3KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSHRtbFNhbXBsZTtcbm1vZHVsZS5leHBvcnRzLm1ha2VBbGwgPSBtYWtlSHRtbFNhbXBsZXM7XG5tb2R1bGUuZXhwb3J0cy50b2dnbGVHcmlkcyA9IHRvZ2dsZUdyaWRzO1xubW9kdWxlLmV4cG9ydHMuc2V0V2lkdGhzID0gc2V0V2lkdGhzO1xuIiwiLy8gcmVxdWlyZW1lbnRzXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gY2xhc3Nlc1xuLyoqKlxuICogIFRyYXkgVGllclxuICpcbiAqICBDb250cm9scyBhbiBpbmRpdmlkdWFsIHRpZXIgb2YgdGhlIFRyYXkuIE5vdCBhIGJpZyBkZWFsLCBqdXN0IGhhbmRsZXMgb3Blbi9jbG9zZVxuICogIGFuZCBvcGVuZXIgY2xpY2sgZXZlbnRzLlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IC5hZy10cmF5X190aWVyIGVsZW1lbnRcbiAqICBAcGFyYW0ge1RyYXl9IHBhcmVudCB0cmF5IG9iamVjdFxuICpcbiAqICBAbWV0aG9kIG9wZW4oKVxuICogIEBtZXRob2QgY2xvc2UoKVxuICogIEBtZXRob2QgdG9nZ2xlKClcbiAqXG4gKiAgQHByb3Age2Jvb2xlYW59IGlzT3BlblxuICovXG52YXIgVGllciA9IGZ1bmN0aW9uIChlbCwgdHJheSkge1xuICB0aGlzLmVsZW1lbnQgPSBlbDtcbiAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgdGhpcy50cmF5ID0gdHJheTtcblxuICB0aGlzLm9wZW5lciA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5hZy10cmF5X190aWVyLW9wZW5lcicpO1xuICBpZiAodGhpcy5vcGVuZXIpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMub3BlbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIF90aGlzLnRvZ2dsZSgpO1xuICAgIH0pO1xuICB9XG59XG5UaWVyLnByb3RvdHlwZSA9IHtcbiAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgIHRoaXMudHJheS5vcGVuKCk7XG4gIH0sXG4gIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xuICAgIHRoaXMudHJheS5hdXRvQ2xvc2UoKTtcbiAgfSxcbiAgdG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNPcGVuID8gdGhpcy5jbG9zZSgpIDogdGhpcy5vcGVuKCk7XG4gIH1cbn1cblxuLyoqKlxuICogIFRyYXlcbiAqXG4gKiAgQ29udHJvbHMgdGhlIHRyYXkuIEluaXRpYWxpemVzIGF1dG9tYXRpY2FsbHksIGJ1dCBzdHJpY3RseSB0aGUgb2JqZWN0IGlzIHBhc3NlZFxuICogIGEgYERPTUVsZW1lbnRgLiBPbmx5IDEgaW5zdGFuY2UgaW50ZW5kZWQsIHNvIHRoYXQncyB0aGUgZXhwb3J0IGZyb20gdGhpcyBmaWxlLlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IC5hZy10cmF5IGVsZW1lbnRcbiAqXG4gKiAgQG1ldGhvZCBvcGVuKClcbiAqICBAbWV0aG9kIGNsb3NlKCkgLSBhbHNvIGNsb3NlcyBhbGwgdGllcnNcbiAqICBAbWV0aG9kIGF1dG9DbG9zZSgpIC0gY2xvc2VzIF9pZl8gYWxsIHRpZXJzIGFyZSBhbHJlYWR5IGNsb3NlZCBhcyB3ZWxsXG4gKlxuICogIEBwcm9wIHtUaWVyW119IHRpZXJzIC0gYXJyYXkgb2YgYWxsIHRoZSB0aWVycyBpbiB0aGUgdHJheVxuICovXG52YXIgVHJheSA9IGZ1bmN0aW9uIChlbCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLmVsZW1lbnQgPSBlbDtcblxuICB2YXIgdGllckVscyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5hZy10cmF5X190aWVyJyk7XG4gIHRoaXMudGllcnMgPSBbXTtcbiAgZm9yRWFjaCh0aWVyRWxzLCBmdW5jdGlvbiAodGllckVsKSB7XG4gICAgX3RoaXMudGllcnMucHVzaChuZXcgVGllciAodGllckVsLCBfdGhpcykpO1xuICB9KTtcblxuICAvLyBjbG9zZSBpZiBjbGljayBvbiBiYWNrZ3JvdW5kXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgZG8ge1xuICAgICAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnYWctdHJheV9fdGllcicpKVxuICAgICAgICByZXR1cm47XG4gICAgICBlbHNlIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FnLXRyYXknKSlcbiAgICAgICAgYnJlYWs7XG4gICAgfSB3aGlsZSAoKGVsID0gZWwucGFyZW50Tm9kZSkgJiYgKGVsLmNsYXNzTGlzdCAhPT0gdW5kZWZpbmVkKSk7XG4gICAgX3RoaXMuY2xvc2UoKTtcbiAgfSk7XG59XG5UcmF5LnByb3RvdHlwZSA9IHtcbiAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XG4gIH0sXG4gIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gaWYgYW55IHRpZXJzIGFyZSBvcGVuLCBjbG9zZSB0aGVtLCBhbmQgdGhleSB3aWxsIGNhbGwgLmF1dG9DbG9zZSgpIHRvIGNvbnRpbnVlIHRoaXNcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy50aWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMudGllcnNbaV0uaXNPcGVuKVxuICAgICAgICB0aGlzLnRpZXJzW2ldLmNsb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gIH0sXG4gIGF1dG9DbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzaG91bGRDbG9zZSA9IHRydWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMudGllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnRpZXJzW2ldLmlzT3Blbikge1xuICAgICAgICBzaG91bGRDbG9zZSA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNob3VsZENsb3NlKVxuICAgICAgdGhpcy5jbG9zZSgpO1xuICB9XG59XG5cbnZhciB0cmF5RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYWctdHJheScpO1xudmFyIHRyYXk7XG5pZiAodHJheUVsKVxuICB0cmF5ID0gbmV3IFRyYXkgKHRyYXlFbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gdHJheTtcbiIsIi8qKlxuICogIGhhbmRsZSBoYXNoY2hhbmdlXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIHRyYXkgPSByZXF1aXJlKCdhcHAvVHJheScpO1xudmFyIGFuaW1hdGVTY3JvbGwgPSByZXF1aXJlKCdsaWIvYW5pbWF0ZVNjcm9sbFRvJyk7XG52YXIgZ2V0UGFnZU9mZnNldCA9IHJlcXVpcmUoJ2xpYi9nZXRQYWdlT2Zmc2V0Jyk7XG5cbi8vIHNldHRpbmdzXG52YXIgT0ZGU0VUID0gMzI7XG5cbi8vIGxpc3RlbmVyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdHJheS5jbG9zZSgpO1xuICB2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKC9eIy8sJycpKTtcbiAgYW5pbWF0ZVNjcm9sbChnZXRQYWdlT2Zmc2V0KGVsKS50b3AgLSBPRkZTRVQpO1xufSk7XG4iLCIvKipcbiAqICB3aG9sZSBkYW1uIHNjcmlwdFxuICpcbiAqICBUaGlzIHNob3VsZCBpbmNsdWRlIG9iamVjdHMsIHdoaWNoIGluIHR1cm4gaW5jbHVkZSB0aGUgbGliIGZpbGVzIHRoZXkgbmVlZC5cbiAqICBUaGlzIGtlZXBzIHVzIHVzaW5nIGEgbW9kdWxhciBhcHByb2FjaCB0byBkZXYgd2hpbGUgYWxzbyBvbmx5IGluY2x1ZGluZyB0aGVcbiAqICBwYXJ0cyBvZiB0aGUgbGlicmFyeSB3ZSBuZWVkLlxuICovXG5yZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLm1ha2VBbGwoKTtcbi8vIHJlcXVpcmUoJ2FwcC9jb250cm9scycpO1xuLy8gcmVxdWlyZSgnYXBwL1RyYXknKTtcbnJlcXVpcmUoJ2FwcC9oYXNoY2hhbmdlJyk7XG5yZXF1aXJlKCdhcHAvQ29weWFibGUnKTtcbiIsIi8qKlxuICogIEFuaW1hdGUgU2Nyb2xsIHRvIFBvc2l0aW9uXG4gKlxuICogIEFuaW1hdGVzIHdpbmRvdyBzY3JvbGwgcG9zaXRpb25cbiAqXG4gKiAgQHBhcmFtIHtpbnR9IC0gZW5kIHBvc2l0aW9uIGluIHBpeGVsc1xuICpcbiAqICBjb2RlOlxuICogICAgdmFyIGFuaW1hdGVTY3JvbGwgPSByZXF1aXJlKCdsaWIvYW5pbWF0ZVNjcm9sbFRvJyk7XG4gKiAgICBhbmltYXRlU2Nyb2xsKHRvcCk7XG4gKi9cblxuLy8gcmVxdWlyZW1lbnRzXG52YXIgZWFzZXMgPSByZXF1aXJlKCdsaWIvZWFzZXMnKTtcblxuLy8gc2V0dGluZ3NcbnZhciBtaW5EdXJhdGlvbiA9IDEwMDA7XG5cbi8vIHRoZSBhbmltYXRpb24gY29udHJvbGxlclxudmFyIHN0YXJ0VGltZSxcbiAgICBkdXJhdGlvbixcbiAgICBzdGFydFBvcyxcbiAgICBkZWx0YVNjcm9sbCxcbiAgICBsYXN0U2Nyb2xsXG4gICAgO1xuXG4oZnVuY3Rpb24gdXBkYXRlU2Nyb2xsICgpIHtcbiAgbGFzdFNjcm9sbCA9IHdpbmRvdy5zY3JvbGxZO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlU2Nyb2xsKTtcbn0pKCk7XG5cbnZhciBhbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24gKGN1cnJlbnRUaW1lKSB7XG4gIHZhciBkZWx0YVRpbWUgPSBjdXJyZW50VGltZSAtIHN0YXJ0VGltZTtcbiAgaWYgKGRlbHRhVGltZSA8IGR1cmF0aW9uKSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIGVhc2VzLmVhc2VJbk91dChzdGFydFBvcywgZGVsdGFTY3JvbGwsIGRlbHRhVGltZSAvIGR1cmF0aW9uKSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGFuaW1hdGVTY3JvbGwobmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCBzdGFydFBvcyArIGRlbHRhU2Nyb2xsKTtcbiAgfVxufVxuXG52YXIgc3RhcnRBbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24gKGVuZFNjcm9sbCkge1xuICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgc3RhcnRQb3MgPSBsYXN0U2Nyb2xsO1xuICBkZWx0YVNjcm9sbCA9IGVuZFNjcm9sbCAtIHN0YXJ0UG9zO1xuICBkdXJhdGlvbiA9IE1hdGgubWF4KG1pbkR1cmF0aW9uLCBNYXRoLmFicyhkZWx0YVNjcm9sbCkgKiAuMSk7XG4gIGFuaW1hdGVTY3JvbGwoc3RhcnRUaW1lKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFydEFuaW1hdGVTY3JvbGw7XG4iLCIvKipcbiAqICBhIGJ1bmNoIG9mIGVhc2luZyBmdW5jdGlvbnMgZm9yIG1ha2luZyBhbmltYXRpb25zXG4gKiAgdGVzdGluZyBpcyBmYWlybHkgc3ViamVjdGl2ZSwgc28gbm90IGF1dG9tYXRlZFxuICovXG5cbnZhciBlYXNlcyA9IHtcbiAgJ2Vhc2VJbk91dCcgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICBpZiAocCA8IC41KSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoMiAqIHAgKiBwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoLTIgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICAgIH1cbiAgfSxcbiAgJ2Vhc2VJbk91dEN1YmljJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIGlmIChwIDwgLjUpIHtcbiAgICAgIHJldHVybiBzICsgYyAqICg0ICogcCAqIHAgKiBwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoNCAqIChwIC0gMSkgKiAocCAtIDEpICogKHAgLSAxKSArIDEpXG4gICAgfVxuICB9LFxuICAnZWFzZUluJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIHAgKiBwO1xuICB9LFxuICAnZWFzZUluQ3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKHAgKiBwICogcCk7XG4gIH0sXG4gICdlYXNlT3V0JyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqICgtMSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gIH0sXG4gICdlYXNlT3V0Q3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKChwIC0gMSkgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICB9LFxuICAnbGluZWFyJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIHA7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZWFzZXM7XG4iLCIvKioqXG4gKiAgR2V0IFBhZ2UgT2Zmc2V0XG4gKlxuICogIEdldCBhIERPTUVsZW1lbnQncyBvZmZzZXQgZnJvbSBwYWdlXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH1cbiAqICBAcmV0dXJucyBvYmplY3RcbiAqICAgIEBwcm9wIHtudW1iZXJ9IGxlZnRcbiAqICAgIEBwcm9wIHtudW1iZXJ9IHRvcFxuICpcbiAqICBjb2RlOlxuICogICAgdmFyIGdldFBhZ2VPZmZzZXQgPSByZXF1aXJlKCdsaWIvZ2V0UGFnZU9mZnNldCcpO1xuICogICAgZ2V0UGFnZU9mZnNldChzb21lRWxlbWVudCk7XG4gKi9cbmZ1bmN0aW9uIGdldFBhZ2VPZmZzZXQgKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgdGhyb3cgJ2dldFBhZ2VPZmZzZXQgcGFzc2VkIGFuIGludmFsaWQgZWxlbWVudCc7XG4gIH1cbiAgdmFyIHBhZ2VPZmZzZXRYID0gZWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgICAgcGFnZU9mZnNldFkgPSBlbGVtZW50Lm9mZnNldFRvcDtcblxuICB3aGlsZSAoZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50KSB7XG4gICAgcGFnZU9mZnNldFggKz0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIHBhZ2VPZmZzZXRZICs9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsZWZ0IDogcGFnZU9mZnNldFgsXG4gICAgdG9wIDogcGFnZU9mZnNldFlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFBhZ2VPZmZzZXQ7XG4iLCIvKioqXG4gKiBmb3JFYWNoIEZ1bmN0aW9uXG4gKlxuICogSXRlcmF0ZSBvdmVyIGFuIGFycmF5LCBwYXNzaW5nIHRoZSB2YWx1ZSB0byB0aGUgcGFzc2VkIGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gdG8gY2FsbFxuICpcbiAqIGNvZGU6XG4gKiAgIHZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuICogICBmb3JFYWNoKHNvbWVBcnJheSwgZnVuY3Rpb24gKGl0ZW0pIHsgYWxlcnQoaXRlbSkgfSk7XG4gKi9cbmZ1bmN0aW9uIGZvckVhY2ggKGFyciwgZm4pIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGZuLmNhbGwoYXJyW2ldLGFycltpXSxhcnIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiJdfQ==
