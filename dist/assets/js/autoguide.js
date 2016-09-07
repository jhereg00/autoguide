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

},{"lib/util/forEach":10}],2:[function(require,module,exports){
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
    var docHeight = getDocumentHeight(doc);
    if (docHeight != this.element.height)
      this.element.setAttribute('height', docHeight);
  },
  /**
   *  getDocument gets the internal document of the iframe
   */
  getDocument: function () {
    return this.element.contentDocument || this.element.contentWindow.document;
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

},{"lib/util/forEach":10}],3:[function(require,module,exports){
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

},{"lib/util/forEach":10}],4:[function(require,module,exports){
/***
 *  Controls and Nav
 *
 *  When required, automatically enables control buttons/toggles.
 *
 *  code:
 *    require('app/controls');
 */
// requirements
var toggleGrids = require('app/HtmlSample').toggleGrids;
var setWidths = require('app/HtmlSample').setWidths;
var forEach = require('lib/util/forEach');

// settings

// get elements and apply listeners
var showGrids = document.getElementById('showGrids');
if (showGrids)
  showGrids.addEventListener('change', function () {
    toggleGrids();
  });

var showDev = document.getElementById('showDev');
if (showDev)
  showDev.addEventListener('change', function () {
    document.body.classList.toggle('show-dev');
  });

// size iframes
var sampleSizeRadios = document.getElementsByName('sampleSize');
forEach(sampleSizeRadios, function (radio) {
  radio.addEventListener('change', function (e) {
    if (this.checked) {
      setWidths(this.value);
    }
  });

  if (!this.value) {
    this.checked = true;
  }
});

},{"app/HtmlSample":2,"lib/util/forEach":10}],5:[function(require,module,exports){
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

},{"app/Tray":3,"lib/animateScrollTo":7,"lib/getPageOffset":9}],6:[function(require,module,exports){
/**
 *  whole damn script
 *
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */
require('app/HtmlSample').makeAll();
require('app/controls');
require('app/Tray');
require('app/hashchange');
require('app/Copyable');

},{"app/Copyable":1,"app/HtmlSample":2,"app/Tray":3,"app/controls":4,"app/hashchange":5}],7:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29weWFibGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL2NvbnRyb2xzLmpzIiwiYXBwL2hhc2hjaGFuZ2UuanMiLCJhdXRvZ3VpZGUuanMiLCJsaWIvYW5pbWF0ZVNjcm9sbFRvLmpzIiwibGliL2Vhc2VzLmpzIiwibGliL2dldFBhZ2VPZmZzZXQuanMiLCJsaWIvdXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKioqXG4gKiAgQ29weWFibGVcbiAqXG4gKiAgTWFrZXMgYW4gZWxlbWVudCBjbGlja2FibGUsIGNvcHlpbmcgYSBzdHJpbmcgdG8gdGhlIHVzZXIncyBjbGlwYm9hcmQuXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudFxuICogIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgdG8gY29weVxuICpcbiAqICBAbWV0aG9kIHtET01FbGVtZW50fSBtYWtlSW5wdXQoKSAtIGludGVybmFsIGZ1bmN0aW9uIHRvIG1ha2UgdGhlIGlucHV0IGZyb21cbiAqICAgIHdoaWNoIHRoZSBzdHJpbmcgd2lsbCBiZSBjb3BpZWQuXG4gKiAgQG1ldGhvZCBjb3B5KCkgLSBjb3BpZXMgc3RyaW5nIHRvIGNsaXBib2FyZC4gTGlzdGVuZXIgaXMgYXV0b21hdGljYWxseSBhZGRlZCxcbiAqICAgIHNvIHlvdSBzaG91bGRuJ3QgbmVlZCB0byBtYW51YWxseSBjYWxsIHRoaXMuXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIHRoZSBjbGFzc1xudmFyIENvcHlhYmxlID0gZnVuY3Rpb24gKGVsZW1lbnQsIHN0cmluZykge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcblxuICBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2NvcHlhYmxlLWVuYWJsZWQnKTtcbiAgICB0aGlzLm1ha2VJbnB1dCgpO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIF90aGlzLmNvcHkoKTtcbiAgICB9KTtcbiAgfVxufVxuQ29weWFibGUucHJvdG90eXBlID0ge1xuICBtYWtlSW5wdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICB0aGlzLmlucHV0LmNsYXNzTGlzdC5hZGQoJ3Zpc3VhbGx5aGlkZGVuJyk7XG4gICAgdGhpcy5pbnB1dC52YWx1ZSA9IHRoaXMuc3RyaW5nO1xuICAgIHJldHVybiB0aGlzLmlucHV0O1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuaW5wdXQsIHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5pbnB1dC5zZWxlY3QoKTtcbiAgICB0cnkge1xuICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcbiAgICB9IGNhdGNoIChlcnIpIHt9O1xuICAgIHRoaXMuaW5wdXQuYmx1cigpO1xuICAgIHRoaXMuaW5wdXQucmVtb3ZlKCk7XG4gIH1cbn1cblxuLy8gYXV0by1nZW5lcmF0ZVxudmFyIGNvcHlhYmxlcyA9IFtdO1xudmFyIGNvcHlhYmxlRWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtY29weV0nKTtcbmZvckVhY2goY29weWFibGVFbHMsIGZ1bmN0aW9uIChlbCkge1xuICBjb3B5YWJsZXMucHVzaChuZXcgQ29weWFibGUgKGVsLCBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29weScpKSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb3B5YWJsZTtcbiIsIi8qKipcbiAqICBNYWtlIEFsbCBIdG1sIFNhbXBsZXNcbiAqXG4gKiAgU2VhcmNoZXMgZm9yIGFsbCBgPG1ha2UtaWZyYW1lPmAgZWxlbWVudHMgYW5kIGRvZXMganVzdCB0aGF0OiBtYWtlcyB0aGVtIGlmcmFtZXMuXG4gKiAgSXQgYWxzbyBpbmNsdWRlcyB0aGUgc3R5bGVzaGVldHMgYW5kIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2BcbiAqICBvYmplY3QuICBUaG9zZSBzaG91bGQgYmUgcG9wdWxhdGVkIGJ5IHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykubWFrZUFsbCgpOyAvLyBnb2VzIHRocm91Z2ggdGhlIHdob2xlIHBhZ2UgYW5kIGRvZXMgaXRzIHRoaW5nXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGhlbHBlcnNcbi8qKlxuICogR2V0IGRvY3VtZW50IGhlaWdodCAoc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExNDU4NTAvKVxuICpcbiAqIEBwYXJhbSAge0RvY3VtZW50fSBkb2NcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RG9jdW1lbnRIZWlnaHQgKGRvYykge1xuICBkb2MgPSBkb2MgfHwgZG9jdW1lbnQ7XG4gIHZhciBib2R5ID0gZG9jLmJvZHk7XG4gIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcblxuICBpZiAoIWJvZHkgfHwgIWh0bWwpXG4gICAgcmV0dXJuIDA7XG5cbiAgcmV0dXJuIE1hdGgubWF4KFxuICAgIGJvZHkub2Zmc2V0SGVpZ2h0LFxuICAgIGh0bWwub2Zmc2V0SGVpZ2h0XG4gICk7XG59XG5cbi8vIGRvIHRoaW5ncyFcbi8vIGdldCBzb21lIG1ldGEgdGFnc1xudmFyIG1ldGFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YScpO1xudmFyIHN0eWxlcywgc2NyaXB0cztcbnZhciBzYW1wbGVzID0gW107XG5cbi8qKipcbiAqICBgSHRtbFNhbXBsZWAgQ2xhc3NcbiAqXG4gKiAgQ29udHJvbHMgYW4gaW5kaXZpZHVhbCBIVE1MIFNhbXBsZSwgd2hpY2ggaXMgYW4gaWZyYW1lIHRoYXQgbG9hZHMgdGhlIGNzcyBhbmRcbiAqICBzY3JpcHRzIHRoYXQgdGhlIHN0eWxlZ3VpZGUgaXMgbWVhbnQgdG8gc2hvdy4gSXQgaW5jbHVkZXMgdGhlIHN0eWxlc2hlZXRzIGFuZFxuICogIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2Agb2JqZWN0LlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IHNvdXJjZUVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byB0dXJuIGludG8gYW4gaWZyYW1lXG4gKlxuICogIEBtZXRob2Qge3ZvaWR9IGJ1aWxkQ29udGVudCgpIC0gYnVpbGRzIGEgc3RyaW5nIG9mIHRoZSBlbGVtZW50IGFzIGEgZnVsbCBodG1sIGRvY3VtZW50XG4gKiAgICBhbmQgYXNzaWducyBpdCBhcyB0aGUgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZS5cbiAqICBAbWV0aG9kIHt2b2lkfSBhdXRvSGVpZ2h0KCkgLSBhbHRlcnMgdGhlIGhlaWdodCBvZiB0aGUgaWZyYW1lIHRvIGJlIHRoZSBtaW5pbXVtIG5lZWRlZCB0b1xuICogICAgZWxpbWluYXRlIGEgc2Nyb2xsYmFyLiAgQXV0b21hdGljYWxseSBjYWxsZWQgb24gYSBwZXIgYW5pbWF0aW9uIGZyYW1lIGJhc2lzLlxuICogIEBtZXRob2Qge0RPTUVsZW1lbnR9IGdldERvY3VtZW50KCkgLSByZXR1cm5zIHRoZSBpZnJhbWUncyBkb2N1bWVudCBvYmplY3RcbiAqICBAbWV0aG9kIHt2b2lkfSB0b2dnbGVHcmlkKCkgLSBhZGRzL3JlbW92ZXMgdGhlICdzaG93LWdyaWQnIGNsYXNzIHRvIHRoZSA8aHRtbD4gZWxlbWVudFxuICogICAgc28gd2UgY2FuIHNob3cgYSBncmlkIG92ZXJsYXlcbiAqICBAbWV0aG9kIHt2b2lkfSBzZXRXaWR0aCh3aWR0aCkgLSBzZXRzIHRoZSB3aWR0aCBvZiB0aGUgaWZyYW1lLCB1c2VmdWwgZm9yIHNob3dpbmdcbiAqICAgIG1lZGlhIHF1ZXJpZXNcbiAqICAgIEBwYXJhbSB7aW50fSB3aWR0aCAtIHdpZHRoIGluIHBpeGVscy4gUmVzZXRzIHRvIGRlZmF1bHQgc2l6ZSBpZiBmYWxzeVxuICpcbiAqICBAcHJvcCBlbGVtZW50IC0gdGhlIGFjdHVhbCBpZnJhbWUgZWxlbWVudFxuICovXG52YXIgSHRtbFNhbXBsZSA9IGZ1bmN0aW9uIChzb3VyY2VFbGVtZW50KSB7XG4gIHRoaXMuc291cmNlRWxlbWVudCA9IHNvdXJjZUVsZW1lbnQ7XG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsIHRoaXMuc291cmNlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykpO1xuXG4gIHRoaXMuYnVpbGRDb250ZW50KCk7XG4gIHRoaXMuc291cmNlRWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh0aGlzLmVsZW1lbnQsIHRoaXMuc291cmNlRWxlbWVudCk7XG5cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgKGZ1bmN0aW9uIGNoZWNrSWZyYW1lSGVpZ2h0ICgpIHtcbiAgICBfdGhpcy5hdXRvSGVpZ2h0KCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrSWZyYW1lSGVpZ2h0KTtcbiAgfSkoKTtcblxuICBzYW1wbGVzLnB1c2godGhpcyk7XG59XG5IdG1sU2FtcGxlLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqICBidWlsZENvbnRlbnQgY3JlYXRlcyBhIHN0cmluZyB0byB1c2UgYXMgdGhlIGRvY3VtZW50IGZvciB0aGUgaWZyYW1lXG4gICAqL1xuICBidWlsZENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGVudCA9ICc8IWRvY3R5cGUgaHRtbD4nO1xuICAgIGNvbnRlbnQgKz0gJzxodG1sIGNsYXNzPVwic2hvdy1kZXYgJyArICh0aGlzLnNvdXJjZUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmcycpID8gJ2ZzJyA6ICdub3QtZnMnKSArICdcIj48aGVhZD4nO1xuICAgIGZvckVhY2gobWV0YXMsZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgIGNvbnRlbnQgKz0gbWV0YS5vdXRlckhUTUw7XG4gICAgfSk7XG4gICAgZm9yRWFjaChzdHlsZXMsZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICBjb250ZW50ICs9ICc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIicgKyBzdHlsZSArICdcIj4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gJzwvaGVhZD48Ym9keT4nO1xuICAgIGNvbnRlbnQgKz0gdGhpcy5zb3VyY2VFbGVtZW50LmlubmVySFRNTDtcbiAgICBmb3JFYWNoKHNjcmlwdHMsZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgY29udGVudCArPSAnPHNjcmlwdCBzcmM9XCInICsgc2NyaXB0ICsgJ1wiPjwvc2NyaXB0Pic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSBcIjwvYm9keT48L2h0bWw+XCI7XG4gICAgdGhpcy5lbGVtZW50LnNyY2RvYyA9IGNvbnRlbnQ7XG4gIH0sXG4gIC8qKlxuICAgKiAgYXV0b0hlaWdodCB1cGRhdGVzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBleGFjdGx5IGNvbnRhaW4gaXRzIGNvbnRlbnRcbiAgICovXG4gIGF1dG9IZWlnaHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9jID0gdGhpcy5nZXREb2N1bWVudCgpO1xuICAgIHZhciBkb2NIZWlnaHQgPSBnZXREb2N1bWVudEhlaWdodChkb2MpO1xuICAgIGlmIChkb2NIZWlnaHQgIT0gdGhpcy5lbGVtZW50LmhlaWdodClcbiAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGRvY0hlaWdodCk7XG4gIH0sXG4gIC8qKlxuICAgKiAgZ2V0RG9jdW1lbnQgZ2V0cyB0aGUgaW50ZXJuYWwgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZVxuICAgKi9cbiAgZ2V0RG9jdW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudCB8fCB0aGlzLmVsZW1lbnQuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgfSxcbiAgLyoqXG4gICAqICBhZGRzL3JlbW92ZXMgdGhlICdzaG93LWdyaWQnIGNsYXNzIHRvIHRoZSA8aHRtbD4gZWxlbWVudCBzbyB3ZSBjYW4gc2hvdyBhIGdyaWQgb3ZlcmxheVxuICAgKi9cbiAgdG9nZ2xlR3JpZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2V0RG9jdW1lbnQoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpWzBdLmNsYXNzTGlzdC50b2dnbGUoJ3Nob3ctZ3JpZCcpO1xuICB9LFxuICAvKipcbiAgICogIHNldHMgdGhlIHdpZHRoIG9mIHRoZSBpZnJhbWUsIHVzZWZ1bCBmb3Igc2hvd2luZyBtZWRpYSBxdWVyaWVzXG4gICAqL1xuICBzZXRXaWR0aDogZnVuY3Rpb24gKHcpIHtcbiAgICBpZiAodykge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdyArICdweCc7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgncmVzaXplZCcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9ICcnO1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Jlc2l6ZWQnKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZUh0bWxTYW1wbGVzICgpIHtcbiAgLy8gZ2V0IHN0eWxlcyBhbmQgc2NyaXB0c1xuICBzdHlsZXMgPSB3aW5kb3cuYWcgJiYgd2luZG93LmFnLnN0eWxlcyB8fCBbXTtcbiAgc2NyaXB0cyA9IHdpbmRvdy5hZyAmJiB3aW5kb3cuYWcuc2NyaXB0cyB8fCBbXTtcbiAgLy8gZ2V0IGFsbCBvdXIgY3VzdG9tIGVsZW1lbnRzXG4gIHZhciBlbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWFrZS1pZnJhbWUnKTtcbiAgZm9yICh2YXIgaSA9IGVscy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgIG5ldyBIdG1sU2FtcGxlKGVsc1tpXSk7XG4gIH07XG59XG5cbi8qKipcbiAqICBUb2dnbGUgSFRNTCBTYW1wbGUgR3JpZHNcbiAqXG4gKiAgVG9nZ2xlcyBhIGAuc2hvdy1ncmlkYCBjbGFzcyBvbiB0aGUgYDxodG1sPmAgZWxlbWVudCBpbnNpZGUgYWxsIHRoZVxuICogIGlmcmFtZXMuICBXaXRoIHRoZSBpbi1mcmFtZS5jc3Mgc3R5bGVzaGVldCBpbmNsdWRlZCwgdGhpcyB3aWxsIHR1cm4gb24gYSAxMlxuICogIGNvbHVtbiBncmlkIG92ZXJsYXkuXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvbWFrZUh0bWxTYW1wbGVzJykudG9nZ2xlR3JpZHMoKVxuICovXG52YXIgdG9nZ2xlR3JpZHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnRvZ2dsZUdyaWQoKTtcbiAgfSk7XG59XG5cbi8qKipcbiAqICBzZXRXaWR0aHNcbiAqXG4gKiAgU2V0cyBhbGwgYEh0bWxTYW1wbGVgcyB0byB0aGUgcHJvdmlkZWQgd2lkdGguXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLnNldFdpZHRocyh3aWR0aCk7XG4gKlxuICogIEBwYXJhbSB7aW50fSB3aWR0aFxuICovXG52YXIgc2V0V2lkdGhzID0gZnVuY3Rpb24gKHcpIHtcbiAgZm9yRWFjaChzYW1wbGVzLCBmdW5jdGlvbiAocykge1xuICAgIHMuc2V0V2lkdGgodyk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEh0bWxTYW1wbGU7XG5tb2R1bGUuZXhwb3J0cy5tYWtlQWxsID0gbWFrZUh0bWxTYW1wbGVzO1xubW9kdWxlLmV4cG9ydHMudG9nZ2xlR3JpZHMgPSB0b2dnbGVHcmlkcztcbm1vZHVsZS5leHBvcnRzLnNldFdpZHRocyA9IHNldFdpZHRocztcbiIsIi8vIHJlcXVpcmVtZW50c1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGNsYXNzZXNcbi8qKipcbiAqICBUcmF5IFRpZXJcbiAqXG4gKiAgQ29udHJvbHMgYW4gaW5kaXZpZHVhbCB0aWVyIG9mIHRoZSBUcmF5LiBOb3QgYSBiaWcgZGVhbCwganVzdCBoYW5kbGVzIG9wZW4vY2xvc2VcbiAqICBhbmQgb3BlbmVyIGNsaWNrIGV2ZW50cy5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSAuYWctdHJheV9fdGllciBlbGVtZW50XG4gKiAgQHBhcmFtIHtUcmF5fSBwYXJlbnQgdHJheSBvYmplY3RcbiAqXG4gKiAgQG1ldGhvZCBvcGVuKClcbiAqICBAbWV0aG9kIGNsb3NlKClcbiAqICBAbWV0aG9kIHRvZ2dsZSgpXG4gKlxuICogIEBwcm9wIHtib29sZWFufSBpc09wZW5cbiAqL1xudmFyIFRpZXIgPSBmdW5jdGlvbiAoZWwsIHRyYXkpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWw7XG4gIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gIHRoaXMudHJheSA9IHRyYXk7XG5cbiAgdGhpcy5vcGVuZXIgPSBlbC5xdWVyeVNlbGVjdG9yKCcuYWctdHJheV9fdGllci1vcGVuZXInKTtcbiAgaWYgKHRoaXMub3BlbmVyKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLm9wZW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy50b2dnbGUoKTtcbiAgICB9KTtcbiAgfVxufVxuVGllci5wcm90b3R5cGUgPSB7XG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgICB0aGlzLnRyYXkub3BlbigpO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICB0aGlzLnRyYXkuYXV0b0Nsb3NlKCk7XG4gIH0sXG4gIHRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmlzT3BlbiA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICB9XG59XG5cbi8qKipcbiAqICBUcmF5XG4gKlxuICogIENvbnRyb2xzIHRoZSB0cmF5LiBJbml0aWFsaXplcyBhdXRvbWF0aWNhbGx5LCBidXQgc3RyaWN0bHkgdGhlIG9iamVjdCBpcyBwYXNzZWRcbiAqICBhIGBET01FbGVtZW50YC4gT25seSAxIGluc3RhbmNlIGludGVuZGVkLCBzbyB0aGF0J3MgdGhlIGV4cG9ydCBmcm9tIHRoaXMgZmlsZS5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSAuYWctdHJheSBlbGVtZW50XG4gKlxuICogIEBtZXRob2Qgb3BlbigpXG4gKiAgQG1ldGhvZCBjbG9zZSgpIC0gYWxzbyBjbG9zZXMgYWxsIHRpZXJzXG4gKiAgQG1ldGhvZCBhdXRvQ2xvc2UoKSAtIGNsb3NlcyBfaWZfIGFsbCB0aWVycyBhcmUgYWxyZWFkeSBjbG9zZWQgYXMgd2VsbFxuICpcbiAqICBAcHJvcCB7VGllcltdfSB0aWVycyAtIGFycmF5IG9mIGFsbCB0aGUgdGllcnMgaW4gdGhlIHRyYXlcbiAqL1xudmFyIFRyYXkgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5lbGVtZW50ID0gZWw7XG5cbiAgdmFyIHRpZXJFbHMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCcuYWctdHJheV9fdGllcicpO1xuICB0aGlzLnRpZXJzID0gW107XG4gIGZvckVhY2godGllckVscywgZnVuY3Rpb24gKHRpZXJFbCkge1xuICAgIF90aGlzLnRpZXJzLnB1c2gobmV3IFRpZXIgKHRpZXJFbCwgX3RoaXMpKTtcbiAgfSk7XG5cbiAgLy8gY2xvc2UgaWYgY2xpY2sgb24gYmFja2dyb3VuZFxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIGRvIHtcbiAgICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FnLXRyYXlfX3RpZXInKSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgZWxzZSBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdhZy10cmF5JykpXG4gICAgICAgIGJyZWFrO1xuICAgIH0gd2hpbGUgKChlbCA9IGVsLnBhcmVudE5vZGUpICYmIChlbC5jbGFzc0xpc3QgIT09IHVuZGVmaW5lZCkpO1xuICAgIF90aGlzLmNsb3NlKCk7XG4gIH0pO1xufVxuVHJheS5wcm90b3R5cGUgPSB7XG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIC8vIGlmIGFueSB0aWVycyBhcmUgb3BlbiwgY2xvc2UgdGhlbSwgYW5kIHRoZXkgd2lsbCBjYWxsIC5hdXRvQ2xvc2UoKSB0byBjb250aW51ZSB0aGlzXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMudGllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnRpZXJzW2ldLmlzT3BlbilcbiAgICAgICAgdGhpcy50aWVyc1tpXS5jbG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xuICB9LFxuICBhdXRvQ2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2hvdWxkQ2xvc2UgPSB0cnVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnRpZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy50aWVyc1tpXS5pc09wZW4pIHtcbiAgICAgICAgc2hvdWxkQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzaG91bGRDbG9zZSlcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxufVxuXG52YXIgdHJheUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFnLXRyYXknKTtcbnZhciB0cmF5O1xuaWYgKHRyYXlFbClcbiAgdHJheSA9IG5ldyBUcmF5ICh0cmF5RWwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRyYXk7XG4iLCIvKioqXG4gKiAgQ29udHJvbHMgYW5kIE5hdlxuICpcbiAqICBXaGVuIHJlcXVpcmVkLCBhdXRvbWF0aWNhbGx5IGVuYWJsZXMgY29udHJvbCBidXR0b25zL3RvZ2dsZXMuXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvY29udHJvbHMnKTtcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgdG9nZ2xlR3JpZHMgPSByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLnRvZ2dsZUdyaWRzO1xudmFyIHNldFdpZHRocyA9IHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykuc2V0V2lkdGhzO1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGdldCBlbGVtZW50cyBhbmQgYXBwbHkgbGlzdGVuZXJzXG52YXIgc2hvd0dyaWRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dHcmlkcycpO1xuaWYgKHNob3dHcmlkcylcbiAgc2hvd0dyaWRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVHcmlkcygpO1xuICB9KTtcblxudmFyIHNob3dEZXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd0RldicpO1xuaWYgKHNob3dEZXYpXG4gIHNob3dEZXYuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy1kZXYnKTtcbiAgfSk7XG5cbi8vIHNpemUgaWZyYW1lc1xudmFyIHNhbXBsZVNpemVSYWRpb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZSgnc2FtcGxlU2l6ZScpO1xuZm9yRWFjaChzYW1wbGVTaXplUmFkaW9zLCBmdW5jdGlvbiAocmFkaW8pIHtcbiAgcmFkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICBzZXRXaWR0aHModGhpcy52YWx1ZSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoIXRoaXMudmFsdWUpIHtcbiAgICB0aGlzLmNoZWNrZWQgPSB0cnVlO1xuICB9XG59KTtcbiIsIi8qKlxuICogIGhhbmRsZSBoYXNoY2hhbmdlXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIHRyYXkgPSByZXF1aXJlKCdhcHAvVHJheScpO1xudmFyIGFuaW1hdGVTY3JvbGwgPSByZXF1aXJlKCdsaWIvYW5pbWF0ZVNjcm9sbFRvJyk7XG52YXIgZ2V0UGFnZU9mZnNldCA9IHJlcXVpcmUoJ2xpYi9nZXRQYWdlT2Zmc2V0Jyk7XG5cbi8vIHNldHRpbmdzXG52YXIgT0ZGU0VUID0gMzI7XG5cbi8vIGxpc3RlbmVyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdHJheS5jbG9zZSgpO1xuICB2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKC9eIy8sJycpKTtcbiAgYW5pbWF0ZVNjcm9sbChnZXRQYWdlT2Zmc2V0KGVsKS50b3AgLSBPRkZTRVQpO1xufSk7XG4iLCIvKipcbiAqICB3aG9sZSBkYW1uIHNjcmlwdFxuICpcbiAqICBUaGlzIHNob3VsZCBpbmNsdWRlIG9iamVjdHMsIHdoaWNoIGluIHR1cm4gaW5jbHVkZSB0aGUgbGliIGZpbGVzIHRoZXkgbmVlZC5cbiAqICBUaGlzIGtlZXBzIHVzIHVzaW5nIGEgbW9kdWxhciBhcHByb2FjaCB0byBkZXYgd2hpbGUgYWxzbyBvbmx5IGluY2x1ZGluZyB0aGVcbiAqICBwYXJ0cyBvZiB0aGUgbGlicmFyeSB3ZSBuZWVkLlxuICovXG5yZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLm1ha2VBbGwoKTtcbnJlcXVpcmUoJ2FwcC9jb250cm9scycpO1xucmVxdWlyZSgnYXBwL1RyYXknKTtcbnJlcXVpcmUoJ2FwcC9oYXNoY2hhbmdlJyk7XG5yZXF1aXJlKCdhcHAvQ29weWFibGUnKTtcbiIsIi8qKlxuICogIEFuaW1hdGUgU2Nyb2xsIHRvIFBvc2l0aW9uXG4gKlxuICogIEFuaW1hdGVzIHdpbmRvdyBzY3JvbGwgcG9zaXRpb25cbiAqXG4gKiAgQHBhcmFtIHtpbnR9IC0gZW5kIHBvc2l0aW9uIGluIHBpeGVsc1xuICpcbiAqICBjb2RlOlxuICogICAgdmFyIGFuaW1hdGVTY3JvbGwgPSByZXF1aXJlKCdsaWIvYW5pbWF0ZVNjcm9sbFRvJyk7XG4gKiAgICBhbmltYXRlU2Nyb2xsKHRvcCk7XG4gKi9cblxuLy8gcmVxdWlyZW1lbnRzXG52YXIgZWFzZXMgPSByZXF1aXJlKCdsaWIvZWFzZXMnKTtcblxuLy8gc2V0dGluZ3NcbnZhciBtaW5EdXJhdGlvbiA9IDEwMDA7XG5cbi8vIHRoZSBhbmltYXRpb24gY29udHJvbGxlclxudmFyIHN0YXJ0VGltZSxcbiAgICBkdXJhdGlvbixcbiAgICBzdGFydFBvcyxcbiAgICBkZWx0YVNjcm9sbCxcbiAgICBsYXN0U2Nyb2xsXG4gICAgO1xuXG4oZnVuY3Rpb24gdXBkYXRlU2Nyb2xsICgpIHtcbiAgbGFzdFNjcm9sbCA9IHdpbmRvdy5zY3JvbGxZO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlU2Nyb2xsKTtcbn0pKCk7XG5cbnZhciBhbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24gKGN1cnJlbnRUaW1lKSB7XG4gIHZhciBkZWx0YVRpbWUgPSBjdXJyZW50VGltZSAtIHN0YXJ0VGltZTtcbiAgaWYgKGRlbHRhVGltZSA8IGR1cmF0aW9uKSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIGVhc2VzLmVhc2VJbk91dChzdGFydFBvcywgZGVsdGFTY3JvbGwsIGRlbHRhVGltZSAvIGR1cmF0aW9uKSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGFuaW1hdGVTY3JvbGwobmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCBzdGFydFBvcyArIGRlbHRhU2Nyb2xsKTtcbiAgfVxufVxuXG52YXIgc3RhcnRBbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24gKGVuZFNjcm9sbCkge1xuICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgc3RhcnRQb3MgPSBsYXN0U2Nyb2xsO1xuICBkZWx0YVNjcm9sbCA9IGVuZFNjcm9sbCAtIHN0YXJ0UG9zO1xuICBkdXJhdGlvbiA9IE1hdGgubWF4KG1pbkR1cmF0aW9uLCBNYXRoLmFicyhkZWx0YVNjcm9sbCkgKiAuMSk7XG4gIGFuaW1hdGVTY3JvbGwoc3RhcnRUaW1lKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFydEFuaW1hdGVTY3JvbGw7XG4iLCIvKipcbiAqICBhIGJ1bmNoIG9mIGVhc2luZyBmdW5jdGlvbnMgZm9yIG1ha2luZyBhbmltYXRpb25zXG4gKiAgdGVzdGluZyBpcyBmYWlybHkgc3ViamVjdGl2ZSwgc28gbm90IGF1dG9tYXRlZFxuICovXG5cbnZhciBlYXNlcyA9IHtcbiAgJ2Vhc2VJbk91dCcgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICBpZiAocCA8IC41KSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoMiAqIHAgKiBwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoLTIgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICAgIH1cbiAgfSxcbiAgJ2Vhc2VJbk91dEN1YmljJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIGlmIChwIDwgLjUpIHtcbiAgICAgIHJldHVybiBzICsgYyAqICg0ICogcCAqIHAgKiBwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoNCAqIChwIC0gMSkgKiAocCAtIDEpICogKHAgLSAxKSArIDEpXG4gICAgfVxuICB9LFxuICAnZWFzZUluJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIHAgKiBwO1xuICB9LFxuICAnZWFzZUluQ3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKHAgKiBwICogcCk7XG4gIH0sXG4gICdlYXNlT3V0JyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqICgtMSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gIH0sXG4gICdlYXNlT3V0Q3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKChwIC0gMSkgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICB9LFxuICAnbGluZWFyJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIHA7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZWFzZXM7XG4iLCIvKioqXG4gKiAgR2V0IFBhZ2UgT2Zmc2V0XG4gKlxuICogIEdldCBhIERPTUVsZW1lbnQncyBvZmZzZXQgZnJvbSBwYWdlXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH1cbiAqICBAcmV0dXJucyBvYmplY3RcbiAqICAgIEBwcm9wIHtudW1iZXJ9IGxlZnRcbiAqICAgIEBwcm9wIHtudW1iZXJ9IHRvcFxuICpcbiAqICBjb2RlOlxuICogICAgdmFyIGdldFBhZ2VPZmZzZXQgPSByZXF1aXJlKCdsaWIvZ2V0UGFnZU9mZnNldCcpO1xuICogICAgZ2V0UGFnZU9mZnNldChzb21lRWxlbWVudCk7XG4gKi9cbmZ1bmN0aW9uIGdldFBhZ2VPZmZzZXQgKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgdGhyb3cgJ2dldFBhZ2VPZmZzZXQgcGFzc2VkIGFuIGludmFsaWQgZWxlbWVudCc7XG4gIH1cbiAgdmFyIHBhZ2VPZmZzZXRYID0gZWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgICAgcGFnZU9mZnNldFkgPSBlbGVtZW50Lm9mZnNldFRvcDtcblxuICB3aGlsZSAoZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50KSB7XG4gICAgcGFnZU9mZnNldFggKz0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIHBhZ2VPZmZzZXRZICs9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsZWZ0IDogcGFnZU9mZnNldFgsXG4gICAgdG9wIDogcGFnZU9mZnNldFlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFBhZ2VPZmZzZXQ7XG4iLCIvKioqXG4gKiBmb3JFYWNoIEZ1bmN0aW9uXG4gKlxuICogSXRlcmF0ZSBvdmVyIGFuIGFycmF5LCBwYXNzaW5nIHRoZSB2YWx1ZSB0byB0aGUgcGFzc2VkIGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gdG8gY2FsbFxuICpcbiAqIGNvZGU6XG4gKiAgIHZhciBmb3JFYWNoID0gcmVxdWlyZSgnbGliL3V0aWwvZm9yRWFjaCcpO1xuICogICBmb3JFYWNoKHNvbWVBcnJheSwgZnVuY3Rpb24gKGl0ZW0pIHsgYWxlcnQoaXRlbSkgfSk7XG4gKi9cbmZ1bmN0aW9uIGZvckVhY2ggKGFyciwgZm4pIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGZuLmNhbGwoYXJyW2ldLGFycltpXSxhcnIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiJdfQ==
