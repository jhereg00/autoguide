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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29weWFibGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL2NvbnRyb2xzLmpzIiwiYXBwL2hhc2hjaGFuZ2UuanMiLCJhdXRvZ3VpZGUuanMiLCJsaWIvYW5pbWF0ZVNjcm9sbFRvLmpzIiwibGliL2Vhc2VzLmpzIiwibGliL2dldFBhZ2VPZmZzZXQuanMiLCJsaWIvdXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqKlxuICogIENvcHlhYmxlXG4gKlxuICogIE1ha2VzIGFuIGVsZW1lbnQgY2xpY2thYmxlLCBjb3B5aW5nIGEgc3RyaW5nIHRvIHRoZSB1c2VyJ3MgY2xpcGJvYXJkLlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnRcbiAqICBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIHRvIGNvcHlcbiAqXG4gKiAgQG1ldGhvZCB7RE9NRWxlbWVudH0gbWFrZUlucHV0KCkgLSBpbnRlcm5hbCBmdW5jdGlvbiB0byBtYWtlIHRoZSBpbnB1dCBmcm9tXG4gKiAgICB3aGljaCB0aGUgc3RyaW5nIHdpbGwgYmUgY29waWVkLlxuICogIEBtZXRob2QgY29weSgpIC0gY29waWVzIHN0cmluZyB0byBjbGlwYm9hcmQuIExpc3RlbmVyIGlzIGF1dG9tYXRpY2FsbHkgYWRkZWQsXG4gKiAgICBzbyB5b3Ugc2hvdWxkbid0IG5lZWQgdG8gbWFudWFsbHkgY2FsbCB0aGlzLlxuICpcbiAqICB0ZW1wbGF0ZToganNcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gdGhlIGNsYXNzXG52YXIgQ29weWFibGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgc3RyaW5nKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuXG4gIGlmIChkb2N1bWVudC5leGVjQ29tbWFuZCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnY29weWFibGUtZW5hYmxlZCcpO1xuICAgIHRoaXMubWFrZUlucHV0KCk7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgX3RoaXMuY29weSgpO1xuICAgIH0pO1xuICB9XG59XG5Db3B5YWJsZS5wcm90b3R5cGUgPSB7XG4gIG1ha2VJbnB1dDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHRoaXMuaW5wdXQuY2xhc3NMaXN0LmFkZCgndmlzdWFsbHloaWRkZW4nKTtcbiAgICB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5zdHJpbmc7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQ7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5pbnB1dCwgdGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLmlucHV0LnNlbGVjdCgpO1xuICAgIHRyeSB7XG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgIH0gY2F0Y2ggKGVycikge307XG4gICAgdGhpcy5pbnB1dC5ibHVyKCk7XG4gICAgdGhpcy5pbnB1dC5yZW1vdmUoKTtcbiAgfVxufVxuXG4vLyBhdXRvLWdlbmVyYXRlXG52YXIgY29weWFibGVzID0gW107XG52YXIgY29weWFibGVFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1jb3B5XScpO1xuZm9yRWFjaChjb3B5YWJsZUVscywgZnVuY3Rpb24gKGVsKSB7XG4gIGNvcHlhYmxlcy5wdXNoKG5ldyBDb3B5YWJsZSAoZWwsIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jb3B5JykpKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvcHlhYmxlO1xuIiwiLyoqKlxuICogIE1ha2UgQWxsIEh0bWwgU2FtcGxlc1xuICpcbiAqICBTZWFyY2hlcyBmb3IgYWxsIGA8bWFrZS1pZnJhbWU+YCBlbGVtZW50cyBhbmQgZG9lcyBqdXN0IHRoYXQ6IG1ha2VzIHRoZW0gaWZyYW1lcy5cbiAqICBJdCBhbHNvIGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmQgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYFxuICogIG9iamVjdC4gIFRob3NlIHNob3VsZCBiZSBwb3B1bGF0ZWQgYnkgdGhlIHRlbXBsYXRlLlxuICpcbiAqICBjb2RlOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5tYWtlQWxsKCk7IC8vIGdvZXMgdGhyb3VnaCB0aGUgd2hvbGUgcGFnZSBhbmQgZG9lcyBpdHMgdGhpbmdcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gaGVscGVyc1xuLyoqXG4gKiBHZXQgZG9jdW1lbnQgaGVpZ2h0IChzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTE0NTg1MC8pXG4gKlxuICogQHBhcmFtICB7RG9jdW1lbnR9IGRvY1xuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXREb2N1bWVudEhlaWdodCAoZG9jKSB7XG4gIGRvYyA9IGRvYyB8fCBkb2N1bWVudDtcbiAgdmFyIGJvZHkgPSBkb2MuYm9keTtcbiAgdmFyIGh0bWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG4gIGlmICghYm9keSB8fCAhaHRtbClcbiAgICByZXR1cm4gMDtcblxuICByZXR1cm4gTWF0aC5tYXgoXG4gICAgYm9keS5vZmZzZXRIZWlnaHQsXG4gICAgaHRtbC5vZmZzZXRIZWlnaHRcbiAgKTtcbn1cblxuLy8gZG8gdGhpbmdzIVxuLy8gZ2V0IHNvbWUgbWV0YSB0YWdzXG52YXIgbWV0YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhJyk7XG52YXIgc3R5bGVzLCBzY3JpcHRzO1xudmFyIHNhbXBsZXMgPSBbXTtcblxuLyoqKlxuICogIGBIdG1sU2FtcGxlYCBDbGFzc1xuICpcbiAqICBDb250cm9scyBhbiBpbmRpdmlkdWFsIEhUTUwgU2FtcGxlLCB3aGljaCBpcyBhbiBpZnJhbWUgdGhhdCBsb2FkcyB0aGUgY3NzIGFuZFxuICogIHNjcmlwdHMgdGhhdCB0aGUgc3R5bGVndWlkZSBpcyBtZWFudCB0byBzaG93LiBJdCBpbmNsdWRlcyB0aGUgc3R5bGVzaGVldHMgYW5kXG4gKiAgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYCBvYmplY3QuXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH0gc291cmNlRWxlbWVudCAtIHRoZSBlbGVtZW50IHRvIHR1cm4gaW50byBhbiBpZnJhbWVcbiAqXG4gKiAgQG1ldGhvZCB7dm9pZH0gYnVpbGRDb250ZW50KCkgLSBidWlsZHMgYSBzdHJpbmcgb2YgdGhlIGVsZW1lbnQgYXMgYSBmdWxsIGh0bWwgZG9jdW1lbnRcbiAqICAgIGFuZCBhc3NpZ25zIGl0IGFzIHRoZSBkb2N1bWVudCBvZiB0aGUgaWZyYW1lLlxuICogIEBtZXRob2Qge3ZvaWR9IGF1dG9IZWlnaHQoKSAtIGFsdGVycyB0aGUgaGVpZ2h0IG9mIHRoZSBpZnJhbWUgdG8gYmUgdGhlIG1pbmltdW0gbmVlZGVkIHRvXG4gKiAgICBlbGltaW5hdGUgYSBzY3JvbGxiYXIuICBBdXRvbWF0aWNhbGx5IGNhbGxlZCBvbiBhIHBlciBhbmltYXRpb24gZnJhbWUgYmFzaXMuXG4gKiAgQG1ldGhvZCB7RE9NRWxlbWVudH0gZ2V0RG9jdW1lbnQoKSAtIHJldHVybnMgdGhlIGlmcmFtZSdzIGRvY3VtZW50IG9iamVjdFxuICogIEBtZXRob2Qge3ZvaWR9IHRvZ2dsZUdyaWQoKSAtIGFkZHMvcmVtb3ZlcyB0aGUgJ3Nob3ctZ3JpZCcgY2xhc3MgdG8gdGhlIDxodG1sPiBlbGVtZW50XG4gKiAgICBzbyB3ZSBjYW4gc2hvdyBhIGdyaWQgb3ZlcmxheVxuICogIEBtZXRob2Qge3ZvaWR9IHNldFdpZHRoKHdpZHRoKSAtIHNldHMgdGhlIHdpZHRoIG9mIHRoZSBpZnJhbWUsIHVzZWZ1bCBmb3Igc2hvd2luZ1xuICogICAgbWVkaWEgcXVlcmllc1xuICogICAgQHBhcmFtIHtpbnR9IHdpZHRoIC0gd2lkdGggaW4gcGl4ZWxzLiBSZXNldHMgdG8gZGVmYXVsdCBzaXplIGlmIGZhbHN5XG4gKlxuICogIEBwcm9wIGVsZW1lbnQgLSB0aGUgYWN0dWFsIGlmcmFtZSBlbGVtZW50XG4gKi9cbnZhciBIdG1sU2FtcGxlID0gZnVuY3Rpb24gKHNvdXJjZUVsZW1lbnQpIHtcbiAgdGhpcy5zb3VyY2VFbGVtZW50ID0gc291cmNlRWxlbWVudDtcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgdGhpcy5zb3VyY2VFbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKSk7XG5cbiAgdGhpcy5idWlsZENvbnRlbnQoKTtcbiAgdGhpcy5zb3VyY2VFbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRoaXMuZWxlbWVudCwgdGhpcy5zb3VyY2VFbGVtZW50KTtcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuICAoZnVuY3Rpb24gY2hlY2tJZnJhbWVIZWlnaHQgKCkge1xuICAgIF90aGlzLmF1dG9IZWlnaHQoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2hlY2tJZnJhbWVIZWlnaHQpO1xuICB9KSgpO1xuXG4gIHNhbXBsZXMucHVzaCh0aGlzKTtcbn1cbkh0bWxTYW1wbGUucHJvdG90eXBlID0ge1xuICAvKipcbiAgICogIGJ1aWxkQ29udGVudCBjcmVhdGVzIGEgc3RyaW5nIHRvIHVzZSBhcyB0aGUgZG9jdW1lbnQgZm9yIHRoZSBpZnJhbWVcbiAgICovXG4gIGJ1aWxkQ29udGVudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ZW50ID0gJzwhZG9jdHlwZSBodG1sPic7XG4gICAgY29udGVudCArPSAnPGh0bWwgY2xhc3M9XCJzaG93LWRldiAnICsgKHRoaXMuc291cmNlRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZzJykgPyAnZnMnIDogJ25vdC1mcycpICsgJ1wiPjxoZWFkPic7XG4gICAgZm9yRWFjaChtZXRhcyxmdW5jdGlvbiAobWV0YSkge1xuICAgICAgY29udGVudCArPSBtZXRhLm91dGVySFRNTDtcbiAgICB9KTtcbiAgICBmb3JFYWNoKHN0eWxlcyxmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIGNvbnRlbnQgKz0gJzxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiJyArIHN0eWxlICsgJ1wiPic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSAnPC9oZWFkPjxib2R5Pic7XG4gICAgY29udGVudCArPSB0aGlzLnNvdXJjZUVsZW1lbnQuaW5uZXJIVE1MO1xuICAgIGZvckVhY2goc2NyaXB0cyxmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICBjb250ZW50ICs9ICc8c2NyaXB0IHNyYz1cIicgKyBzY3JpcHQgKyAnXCI+PC9zY3JpcHQ+JztcbiAgICB9KTtcbiAgICBjb250ZW50ICs9IFwiPC9ib2R5PjwvaHRtbD5cIjtcbiAgICB0aGlzLmVsZW1lbnQuc3JjZG9jID0gY29udGVudDtcbiAgfSxcbiAgLyoqXG4gICAqICBhdXRvSGVpZ2h0IHVwZGF0ZXMgdGhlIGhlaWdodCBvZiB0aGUgaWZyYW1lIHRvIGV4YWN0bHkgY29udGFpbiBpdHMgY29udGVudFxuICAgKi9cbiAgYXV0b0hlaWdodDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkb2MgPSB0aGlzLmdldERvY3VtZW50KCk7XG4gICAgdmFyIGRvY0hlaWdodCA9IGdldERvY3VtZW50SGVpZ2h0KGRvYyk7XG4gICAgaWYgKGRvY0hlaWdodCAhPSB0aGlzLmVsZW1lbnQuaGVpZ2h0KVxuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgZG9jSGVpZ2h0KTtcbiAgfSxcbiAgLyoqXG4gICAqICBnZXREb2N1bWVudCBnZXRzIHRoZSBpbnRlcm5hbCBkb2N1bWVudCBvZiB0aGUgaWZyYW1lXG4gICAqL1xuICBnZXREb2N1bWVudDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50IHx8IHRoaXMuZWxlbWVudC5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICB9LFxuICAvKipcbiAgICogIGFkZHMvcmVtb3ZlcyB0aGUgJ3Nob3ctZ3JpZCcgY2xhc3MgdG8gdGhlIDxodG1sPiBlbGVtZW50IHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gICAqL1xuICB0b2dnbGVHcmlkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nZXREb2N1bWVudCgpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJylbMF0uY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy1ncmlkJyk7XG4gIH0sXG4gIC8qKlxuICAgKiAgc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nIG1lZGlhIHF1ZXJpZXNcbiAgICovXG4gIHNldFdpZHRoOiBmdW5jdGlvbiAodykge1xuICAgIGlmICh3KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB3ICsgJ3B4JztcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdyZXNpemVkJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJyc7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplZCcpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlSHRtbFNhbXBsZXMgKCkge1xuICAvLyBnZXQgc3R5bGVzIGFuZCBzY3JpcHRzXG4gIHN0eWxlcyA9IHdpbmRvdy5hZyAmJiB3aW5kb3cuYWcuc3R5bGVzIHx8IFtdO1xuICBzY3JpcHRzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zY3JpcHRzIHx8IFtdO1xuICAvLyBnZXQgYWxsIG91ciBjdXN0b20gZWxlbWVudHNcbiAgdmFyIGVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYWtlLWlmcmFtZScpO1xuICBmb3IgKHZhciBpID0gZWxzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgbmV3IEh0bWxTYW1wbGUoZWxzW2ldKTtcbiAgfTtcbn1cblxuLyoqKlxuICogIFRvZ2dsZSBIVE1MIFNhbXBsZSBHcmlkc1xuICpcbiAqICBUb2dnbGVzIGEgYC5zaG93LWdyaWRgIGNsYXNzIG9uIHRoZSBgPGh0bWw+YCBlbGVtZW50IGluc2lkZSBhbGwgdGhlXG4gKiAgaWZyYW1lcy4gIFdpdGggdGhlIGluLWZyYW1lLmNzcyBzdHlsZXNoZWV0IGluY2x1ZGVkLCB0aGlzIHdpbGwgdHVybiBvbiBhIDEyXG4gKiAgY29sdW1uIGdyaWQgb3ZlcmxheS5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9tYWtlSHRtbFNhbXBsZXMnKS50b2dnbGVHcmlkcygpXG4gKi9cbnZhciB0b2dnbGVHcmlkcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yRWFjaChzYW1wbGVzLCBmdW5jdGlvbiAocykge1xuICAgIHMudG9nZ2xlR3JpZCgpO1xuICB9KTtcbn1cblxuLyoqKlxuICogIHNldFdpZHRoc1xuICpcbiAqICBTZXRzIGFsbCBgSHRtbFNhbXBsZWBzIHRvIHRoZSBwcm92aWRlZCB3aWR0aC5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykuc2V0V2lkdGhzKHdpZHRoKTtcbiAqXG4gKiAgQHBhcmFtIHtpbnR9IHdpZHRoXG4gKi9cbnZhciBzZXRXaWR0aHMgPSBmdW5jdGlvbiAodykge1xuICBmb3JFYWNoKHNhbXBsZXMsIGZ1bmN0aW9uIChzKSB7XG4gICAgcy5zZXRXaWR0aCh3KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSHRtbFNhbXBsZTtcbm1vZHVsZS5leHBvcnRzLm1ha2VBbGwgPSBtYWtlSHRtbFNhbXBsZXM7XG5tb2R1bGUuZXhwb3J0cy50b2dnbGVHcmlkcyA9IHRvZ2dsZUdyaWRzO1xubW9kdWxlLmV4cG9ydHMuc2V0V2lkdGhzID0gc2V0V2lkdGhzO1xuIiwiLy8gcmVxdWlyZW1lbnRzXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gY2xhc3Nlc1xuLyoqKlxuICogIFRyYXkgVGllclxuICpcbiAqICBDb250cm9scyBhbiBpbmRpdmlkdWFsIHRpZXIgb2YgdGhlIFRyYXkuIE5vdCBhIGJpZyBkZWFsLCBqdXN0IGhhbmRsZXMgb3Blbi9jbG9zZVxuICogIGFuZCBvcGVuZXIgY2xpY2sgZXZlbnRzLlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IC5hZy10cmF5X190aWVyIGVsZW1lbnRcbiAqICBAcGFyYW0ge1RyYXl9IHBhcmVudCB0cmF5IG9iamVjdFxuICpcbiAqICBAbWV0aG9kIG9wZW4oKVxuICogIEBtZXRob2QgY2xvc2UoKVxuICogIEBtZXRob2QgdG9nZ2xlKClcbiAqXG4gKiAgQHByb3Age2Jvb2xlYW59IGlzT3BlblxuICovXG52YXIgVGllciA9IGZ1bmN0aW9uIChlbCwgdHJheSkge1xuICB0aGlzLmVsZW1lbnQgPSBlbDtcbiAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgdGhpcy50cmF5ID0gdHJheTtcblxuICB0aGlzLm9wZW5lciA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5hZy10cmF5X190aWVyLW9wZW5lcicpO1xuICBpZiAodGhpcy5vcGVuZXIpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMub3BlbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIF90aGlzLnRvZ2dsZSgpO1xuICAgIH0pO1xuICB9XG59XG5UaWVyLnByb3RvdHlwZSA9IHtcbiAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgIHRoaXMudHJheS5vcGVuKCk7XG4gIH0sXG4gIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xuICAgIHRoaXMudHJheS5hdXRvQ2xvc2UoKTtcbiAgfSxcbiAgdG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNPcGVuID8gdGhpcy5jbG9zZSgpIDogdGhpcy5vcGVuKCk7XG4gIH1cbn1cblxuLyoqKlxuICogIFRyYXlcbiAqXG4gKiAgQ29udHJvbHMgdGhlIHRyYXkuIEluaXRpYWxpemVzIGF1dG9tYXRpY2FsbHksIGJ1dCBzdHJpY3RseSB0aGUgb2JqZWN0IGlzIHBhc3NlZFxuICogIGEgYERPTUVsZW1lbnRgLiBPbmx5IDEgaW5zdGFuY2UgaW50ZW5kZWQsIHNvIHRoYXQncyB0aGUgZXhwb3J0IGZyb20gdGhpcyBmaWxlLlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IC5hZy10cmF5IGVsZW1lbnRcbiAqXG4gKiAgQG1ldGhvZCBvcGVuKClcbiAqICBAbWV0aG9kIGNsb3NlKCkgLSBhbHNvIGNsb3NlcyBhbGwgdGllcnNcbiAqICBAbWV0aG9kIGF1dG9DbG9zZSgpIC0gY2xvc2VzIF9pZl8gYWxsIHRpZXJzIGFyZSBhbHJlYWR5IGNsb3NlZCBhcyB3ZWxsXG4gKlxuICogIEBwcm9wIHtUaWVyW119IHRpZXJzIC0gYXJyYXkgb2YgYWxsIHRoZSB0aWVycyBpbiB0aGUgdHJheVxuICovXG52YXIgVHJheSA9IGZ1bmN0aW9uIChlbCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLmVsZW1lbnQgPSBlbDtcblxuICB2YXIgdGllckVscyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5hZy10cmF5X190aWVyJyk7XG4gIHRoaXMudGllcnMgPSBbXTtcbiAgZm9yRWFjaCh0aWVyRWxzLCBmdW5jdGlvbiAodGllckVsKSB7XG4gICAgX3RoaXMudGllcnMucHVzaChuZXcgVGllciAodGllckVsLCBfdGhpcykpO1xuICB9KTtcblxuICAvLyBjbG9zZSBpZiBjbGljayBvbiBiYWNrZ3JvdW5kXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgZG8ge1xuICAgICAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnYWctdHJheV9fdGllcicpKVxuICAgICAgICByZXR1cm47XG4gICAgICBlbHNlIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FnLXRyYXknKSlcbiAgICAgICAgYnJlYWs7XG4gICAgfSB3aGlsZSAoKGVsID0gZWwucGFyZW50Tm9kZSkgJiYgKGVsLmNsYXNzTGlzdCAhPT0gdW5kZWZpbmVkKSk7XG4gICAgX3RoaXMuY2xvc2UoKTtcbiAgfSk7XG59XG5UcmF5LnByb3RvdHlwZSA9IHtcbiAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XG4gIH0sXG4gIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gaWYgYW55IHRpZXJzIGFyZSBvcGVuLCBjbG9zZSB0aGVtLCBhbmQgdGhleSB3aWxsIGNhbGwgLmF1dG9DbG9zZSgpIHRvIGNvbnRpbnVlIHRoaXNcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy50aWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMudGllcnNbaV0uaXNPcGVuKVxuICAgICAgICB0aGlzLnRpZXJzW2ldLmNsb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gIH0sXG4gIGF1dG9DbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzaG91bGRDbG9zZSA9IHRydWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMudGllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnRpZXJzW2ldLmlzT3Blbikge1xuICAgICAgICBzaG91bGRDbG9zZSA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNob3VsZENsb3NlKVxuICAgICAgdGhpcy5jbG9zZSgpO1xuICB9XG59XG5cbnZhciB0cmF5RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYWctdHJheScpO1xudmFyIHRyYXk7XG5pZiAodHJheUVsKVxuICB0cmF5ID0gbmV3IFRyYXkgKHRyYXlFbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gdHJheTtcbiIsIi8qKipcbiAqICBDb250cm9scyBhbmQgTmF2XG4gKlxuICogIFdoZW4gcmVxdWlyZWQsIGF1dG9tYXRpY2FsbHkgZW5hYmxlcyBjb250cm9sIGJ1dHRvbnMvdG9nZ2xlcy5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9jb250cm9scycpO1xuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciB0b2dnbGVHcmlkcyA9IHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykudG9nZ2xlR3JpZHM7XG52YXIgc2V0V2lkdGhzID0gcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5zZXRXaWR0aHM7XG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gZ2V0IGVsZW1lbnRzIGFuZCBhcHBseSBsaXN0ZW5lcnNcbnZhciBzaG93R3JpZHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd0dyaWRzJyk7XG5pZiAoc2hvd0dyaWRzKVxuICBzaG93R3JpZHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUdyaWRzKCk7XG4gIH0pO1xuXG52YXIgc2hvd0RldiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaG93RGV2Jyk7XG5pZiAoc2hvd0RldilcbiAgc2hvd0Rldi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93LWRldicpO1xuICB9KTtcblxuLy8gc2l6ZSBpZnJhbWVzXG52YXIgc2FtcGxlU2l6ZVJhZGlvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdzYW1wbGVTaXplJyk7XG5mb3JFYWNoKHNhbXBsZVNpemVSYWRpb3MsIGZ1bmN0aW9uIChyYWRpbykge1xuICByYWRpby5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0aGlzLmNoZWNrZWQpIHtcbiAgICAgIHNldFdpZHRocyh0aGlzLnZhbHVlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICghdGhpcy52YWx1ZSkge1xuICAgIHRoaXMuY2hlY2tlZCA9IHRydWU7XG4gIH1cbn0pO1xuIiwiLyoqXG4gKiAgaGFuZGxlIGhhc2hjaGFuZ2VcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgdHJheSA9IHJlcXVpcmUoJ2FwcC9UcmF5Jyk7XG52YXIgYW5pbWF0ZVNjcm9sbCA9IHJlcXVpcmUoJ2xpYi9hbmltYXRlU2Nyb2xsVG8nKTtcbnZhciBnZXRQYWdlT2Zmc2V0ID0gcmVxdWlyZSgnbGliL2dldFBhZ2VPZmZzZXQnKTtcblxuLy8gc2V0dGluZ3NcbnZhciBPRkZTRVQgPSAzMjtcblxuLy8gbGlzdGVuZXJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB0cmF5LmNsb3NlKCk7XG4gIHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoL14jLywnJykpO1xuICBhbmltYXRlU2Nyb2xsKGdldFBhZ2VPZmZzZXQoZWwpLnRvcCAtIE9GRlNFVCk7XG59KTtcbiIsIi8qKlxuICogIHdob2xlIGRhbW4gc2NyaXB0XG4gKlxuICogIFRoaXMgc2hvdWxkIGluY2x1ZGUgb2JqZWN0cywgd2hpY2ggaW4gdHVybiBpbmNsdWRlIHRoZSBsaWIgZmlsZXMgdGhleSBuZWVkLlxuICogIFRoaXMga2VlcHMgdXMgdXNpbmcgYSBtb2R1bGFyIGFwcHJvYWNoIHRvIGRldiB3aGlsZSBhbHNvIG9ubHkgaW5jbHVkaW5nIHRoZVxuICogIHBhcnRzIG9mIHRoZSBsaWJyYXJ5IHdlIG5lZWQuXG4gKi9cbnJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykubWFrZUFsbCgpO1xucmVxdWlyZSgnYXBwL2NvbnRyb2xzJyk7XG5yZXF1aXJlKCdhcHAvVHJheScpO1xucmVxdWlyZSgnYXBwL2hhc2hjaGFuZ2UnKTtcbnJlcXVpcmUoJ2FwcC9Db3B5YWJsZScpO1xuIiwiLyoqXG4gKiAgQW5pbWF0ZSBTY3JvbGwgdG8gUG9zaXRpb25cbiAqXG4gKiAgQW5pbWF0ZXMgd2luZG93IHNjcm9sbCBwb3NpdGlvblxuICpcbiAqICBAcGFyYW0ge2ludH0gLSBlbmQgcG9zaXRpb24gaW4gcGl4ZWxzXG4gKlxuICogIGNvZGU6XG4gKiAgICB2YXIgYW5pbWF0ZVNjcm9sbCA9IHJlcXVpcmUoJ2xpYi9hbmltYXRlU2Nyb2xsVG8nKTtcbiAqICAgIGFuaW1hdGVTY3JvbGwodG9wKTtcbiAqL1xuXG4vLyByZXF1aXJlbWVudHNcbnZhciBlYXNlcyA9IHJlcXVpcmUoJ2xpYi9lYXNlcycpO1xuXG4vLyBzZXR0aW5nc1xudmFyIG1pbkR1cmF0aW9uID0gMTAwMDtcblxuLy8gdGhlIGFuaW1hdGlvbiBjb250cm9sbGVyXG52YXIgc3RhcnRUaW1lLFxuICAgIGR1cmF0aW9uLFxuICAgIHN0YXJ0UG9zLFxuICAgIGRlbHRhU2Nyb2xsLFxuICAgIGxhc3RTY3JvbGxcbiAgICA7XG5cbihmdW5jdGlvbiB1cGRhdGVTY3JvbGwgKCkge1xuICBsYXN0U2Nyb2xsID0gd2luZG93LnNjcm9sbFk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGVTY3JvbGwpO1xufSkoKTtcblxudmFyIGFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcbiAgdmFyIGRlbHRhVGltZSA9IGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lO1xuICBpZiAoZGVsdGFUaW1lIDwgZHVyYXRpb24pIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgZWFzZXMuZWFzZUluT3V0KHN0YXJ0UG9zLCBkZWx0YVNjcm9sbCwgZGVsdGFUaW1lIC8gZHVyYXRpb24pKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgYW5pbWF0ZVNjcm9sbChuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIHN0YXJ0UG9zICsgZGVsdGFTY3JvbGwpO1xuICB9XG59XG5cbnZhciBzdGFydEFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbiAoZW5kU2Nyb2xsKSB7XG4gIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICBzdGFydFBvcyA9IGxhc3RTY3JvbGw7XG4gIGRlbHRhU2Nyb2xsID0gZW5kU2Nyb2xsIC0gc3RhcnRQb3M7XG4gIGR1cmF0aW9uID0gTWF0aC5tYXgobWluRHVyYXRpb24sIE1hdGguYWJzKGRlbHRhU2Nyb2xsKSAqIC4xKTtcbiAgYW5pbWF0ZVNjcm9sbChzdGFydFRpbWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0QW5pbWF0ZVNjcm9sbDtcbiIsIi8qKlxuICogIGEgYnVuY2ggb2YgZWFzaW5nIGZ1bmN0aW9ucyBmb3IgbWFraW5nIGFuaW1hdGlvbnNcbiAqICB0ZXN0aW5nIGlzIGZhaXJseSBzdWJqZWN0aXZlLCBzbyBub3QgYXV0b21hdGVkXG4gKi9cblxudmFyIGVhc2VzID0ge1xuICAnZWFzZUluT3V0JyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIGlmIChwIDwgLjUpIHtcbiAgICAgIHJldHVybiBzICsgYyAqICgyICogcCAqIHApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBzICsgYyAqICgtMiAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gICAgfVxuICB9LFxuICAnZWFzZUluT3V0Q3ViaWMnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgaWYgKHAgPCAuNSkge1xuICAgICAgcmV0dXJuIHMgKyBjICogKDQgKiBwICogcCAqIHApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBzICsgYyAqICg0ICogKHAgLSAxKSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSlcbiAgICB9XG4gIH0sXG4gICdlYXNlSW4nIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogcCAqIHA7XG4gIH0sXG4gICdlYXNlSW5DdWJpYycgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiAocCAqIHAgKiBwKTtcbiAgfSxcbiAgJ2Vhc2VPdXQnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogKC0xICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKTtcbiAgfSxcbiAgJ2Vhc2VPdXRDdWJpYycgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiAoKHAgLSAxKSAqIChwIC0gMSkgKiAocCAtIDEpICsgMSk7XG4gIH0sXG4gICdsaW5lYXInIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgcmV0dXJuIHMgKyBjICogcDtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBlYXNlcztcbiIsIi8qKipcbiAqICBHZXQgUGFnZSBPZmZzZXRcbiAqXG4gKiAgR2V0IGEgRE9NRWxlbWVudCdzIG9mZnNldCBmcm9tIHBhZ2VcbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fVxuICogIEByZXR1cm5zIG9iamVjdFxuICogICAgQHByb3Age251bWJlcn0gbGVmdFxuICogICAgQHByb3Age251bWJlcn0gdG9wXG4gKlxuICogIGNvZGU6XG4gKiAgICB2YXIgZ2V0UGFnZU9mZnNldCA9IHJlcXVpcmUoJ2xpYi9nZXRQYWdlT2Zmc2V0Jyk7XG4gKiAgICBnZXRQYWdlT2Zmc2V0KHNvbWVFbGVtZW50KTtcbiAqL1xuZnVuY3Rpb24gZ2V0UGFnZU9mZnNldCAoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQpIHtcbiAgICB0aHJvdyAnZ2V0UGFnZU9mZnNldCBwYXNzZWQgYW4gaW52YWxpZCBlbGVtZW50JztcbiAgfVxuICB2YXIgcGFnZU9mZnNldFggPSBlbGVtZW50Lm9mZnNldExlZnQsXG4gICAgICBwYWdlT2Zmc2V0WSA9IGVsZW1lbnQub2Zmc2V0VG9wO1xuXG4gIHdoaWxlIChlbGVtZW50ID0gZWxlbWVudC5vZmZzZXRQYXJlbnQpIHtcbiAgICBwYWdlT2Zmc2V0WCArPSBlbGVtZW50Lm9mZnNldExlZnQ7XG4gICAgcGFnZU9mZnNldFkgKz0gZWxlbWVudC5vZmZzZXRUb3A7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGxlZnQgOiBwYWdlT2Zmc2V0WCxcbiAgICB0b3AgOiBwYWdlT2Zmc2V0WVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UGFnZU9mZnNldDtcbiIsIi8qKipcbiAqIGZvckVhY2ggRnVuY3Rpb25cbiAqXG4gKiBJdGVyYXRlIG92ZXIgYW4gYXJyYXksIHBhc3NpbmcgdGhlIHZhbHVlIHRvIHRoZSBwYXNzZWQgZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiB0byBjYWxsXG4gKlxuICogY29kZTpcbiAqICAgdmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG4gKiAgIGZvckVhY2goc29tZUFycmF5LCBmdW5jdGlvbiAoaXRlbSkgeyBhbGVydChpdGVtKSB9KTtcbiAqL1xuZnVuY3Rpb24gZm9yRWFjaCAoYXJyLCBmbikge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZm4uY2FsbChhcnJbaV0sYXJyW2ldLGFycik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JFYWNoO1xuIl19
