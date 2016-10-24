(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"lib/util/forEach":8}],2:[function(require,module,exports){
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

},{"lib/util/forEach":8}],3:[function(require,module,exports){
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

},{"app/Tray":2,"lib/animateScrollTo":5,"lib/getPageOffset":7}],4:[function(require,module,exports){
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
// require('app/Copyable');

},{"app/HtmlSample":1,"app/hashchange":3}],5:[function(require,module,exports){
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

},{"lib/eases":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL2hhc2hjaGFuZ2UuanMiLCJhdXRvZ3VpZGUuanMiLCJsaWIvYW5pbWF0ZVNjcm9sbFRvLmpzIiwibGliL2Vhc2VzLmpzIiwibGliL2dldFBhZ2VPZmZzZXQuanMiLCJsaWIvdXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKipcbiAqICBNYWtlIEFsbCBIdG1sIFNhbXBsZXNcbiAqXG4gKiAgU2VhcmNoZXMgZm9yIGFsbCBgPG1ha2UtaWZyYW1lPmAgZWxlbWVudHMgYW5kIGRvZXMganVzdCB0aGF0OiBtYWtlcyB0aGVtIGlmcmFtZXMuXG4gKiAgSXQgYWxzbyBpbmNsdWRlcyB0aGUgc3R5bGVzaGVldHMgYW5kIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2BcbiAqICBvYmplY3QuICBUaG9zZSBzaG91bGQgYmUgcG9wdWxhdGVkIGJ5IHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykubWFrZUFsbCgpOyAvLyBnb2VzIHRocm91Z2ggdGhlIHdob2xlIHBhZ2UgYW5kIGRvZXMgaXRzIHRoaW5nXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGhlbHBlcnNcbi8qKlxuICogR2V0IGRvY3VtZW50IGhlaWdodCAoc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExNDU4NTAvKVxuICpcbiAqIEBwYXJhbSAge0RvY3VtZW50fSBkb2NcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RG9jdW1lbnRIZWlnaHQgKGRvYykge1xuICBkb2MgPSBkb2MgfHwgZG9jdW1lbnQ7XG4gIHZhciBib2R5ID0gZG9jLmJvZHk7XG4gIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcblxuICBpZiAoIWJvZHkgfHwgIWh0bWwpXG4gICAgcmV0dXJuIDA7XG5cbiAgcmV0dXJuIE1hdGgubWF4KFxuICAgIGJvZHkub2Zmc2V0SGVpZ2h0LFxuICAgIGh0bWwub2Zmc2V0SGVpZ2h0XG4gICk7XG59XG5cbi8vIGRvIHRoaW5ncyFcbi8vIGdldCBzb21lIG1ldGEgdGFnc1xudmFyIG1ldGFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YScpO1xudmFyIHN0eWxlcywgc2NyaXB0cztcbnZhciBzYW1wbGVzID0gW107XG5cbi8qKipcbiAqICBgSHRtbFNhbXBsZWAgQ2xhc3NcbiAqXG4gKiAgQ29udHJvbHMgYW4gaW5kaXZpZHVhbCBIVE1MIFNhbXBsZSwgd2hpY2ggaXMgYW4gaWZyYW1lIHRoYXQgbG9hZHMgdGhlIGNzcyBhbmRcbiAqICBzY3JpcHRzIHRoYXQgdGhlIHN0eWxlZ3VpZGUgaXMgbWVhbnQgdG8gc2hvdy4gSXQgaW5jbHVkZXMgdGhlIHN0eWxlc2hlZXRzIGFuZFxuICogIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2Agb2JqZWN0LlxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9IHNvdXJjZUVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byB0dXJuIGludG8gYW4gaWZyYW1lXG4gKlxuICogIEBtZXRob2Qge3ZvaWR9IGJ1aWxkQ29udGVudCgpIC0gYnVpbGRzIGEgc3RyaW5nIG9mIHRoZSBlbGVtZW50IGFzIGEgZnVsbCBodG1sIGRvY3VtZW50XG4gKiAgICBhbmQgYXNzaWducyBpdCBhcyB0aGUgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZS5cbiAqICBAbWV0aG9kIHt2b2lkfSBhdXRvSGVpZ2h0KCkgLSBhbHRlcnMgdGhlIGhlaWdodCBvZiB0aGUgaWZyYW1lIHRvIGJlIHRoZSBtaW5pbXVtIG5lZWRlZCB0b1xuICogICAgZWxpbWluYXRlIGEgc2Nyb2xsYmFyLiAgQXV0b21hdGljYWxseSBjYWxsZWQgb24gYSBwZXIgYW5pbWF0aW9uIGZyYW1lIGJhc2lzLlxuICogIEBtZXRob2Qge0RPTUVsZW1lbnR9IGdldERvY3VtZW50KCkgLSByZXR1cm5zIHRoZSBpZnJhbWUncyBkb2N1bWVudCBvYmplY3RcbiAqICBAbWV0aG9kIHt2b2lkfSB0b2dnbGVHcmlkKCkgLSBhZGRzL3JlbW92ZXMgdGhlICdzaG93LWdyaWQnIGNsYXNzIHRvIHRoZSA8aHRtbD4gZWxlbWVudFxuICogICAgc28gd2UgY2FuIHNob3cgYSBncmlkIG92ZXJsYXlcbiAqICBAbWV0aG9kIHt2b2lkfSBzZXRXaWR0aCh3aWR0aCkgLSBzZXRzIHRoZSB3aWR0aCBvZiB0aGUgaWZyYW1lLCB1c2VmdWwgZm9yIHNob3dpbmdcbiAqICAgIG1lZGlhIHF1ZXJpZXNcbiAqICAgIEBwYXJhbSB7aW50fSB3aWR0aCAtIHdpZHRoIGluIHBpeGVscy4gUmVzZXRzIHRvIGRlZmF1bHQgc2l6ZSBpZiBmYWxzeVxuICpcbiAqICBAcHJvcCBlbGVtZW50IC0gdGhlIGFjdHVhbCBpZnJhbWUgZWxlbWVudFxuICovXG52YXIgSHRtbFNhbXBsZSA9IGZ1bmN0aW9uIChzb3VyY2VFbGVtZW50KSB7XG4gIHRoaXMuc291cmNlRWxlbWVudCA9IHNvdXJjZUVsZW1lbnQ7XG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsIHRoaXMuc291cmNlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykpO1xuXG4gIHRoaXMuYnVpbGRDb250ZW50KCk7XG4gIHRoaXMuc291cmNlRWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh0aGlzLmVsZW1lbnQsIHRoaXMuc291cmNlRWxlbWVudCk7XG5cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgKGZ1bmN0aW9uIGNoZWNrSWZyYW1lSGVpZ2h0ICgpIHtcbiAgICBfdGhpcy5hdXRvSGVpZ2h0KCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrSWZyYW1lSGVpZ2h0KTtcbiAgfSkoKTtcblxuICBzYW1wbGVzLnB1c2godGhpcyk7XG59XG5IdG1sU2FtcGxlLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqICBidWlsZENvbnRlbnQgY3JlYXRlcyBhIHN0cmluZyB0byB1c2UgYXMgdGhlIGRvY3VtZW50IGZvciB0aGUgaWZyYW1lXG4gICAqL1xuICBidWlsZENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGVudCA9ICc8IWRvY3R5cGUgaHRtbD4nO1xuICAgIGNvbnRlbnQgKz0gJzxodG1sIGNsYXNzPVwic2hvdy1kZXYgJyArICh0aGlzLnNvdXJjZUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmcycpID8gJ2ZzJyA6ICdub3QtZnMnKSArICdcIj48aGVhZD4nO1xuICAgIGZvckVhY2gobWV0YXMsZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgIGNvbnRlbnQgKz0gbWV0YS5vdXRlckhUTUw7XG4gICAgfSk7XG4gICAgZm9yRWFjaChzdHlsZXMsZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICBjb250ZW50ICs9ICc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIicgKyBzdHlsZSArICdcIj4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gJzwvaGVhZD48Ym9keT4nO1xuICAgIGNvbnRlbnQgKz0gdGhpcy5zb3VyY2VFbGVtZW50LmlubmVySFRNTDtcbiAgICBmb3JFYWNoKHNjcmlwdHMsZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgY29udGVudCArPSAnPHNjcmlwdCBzcmM9XCInICsgc2NyaXB0ICsgJ1wiPjwvc2NyaXB0Pic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSBcIjwvYm9keT48L2h0bWw+XCI7XG4gICAgdGhpcy5lbGVtZW50LnNyY2RvYyA9IGNvbnRlbnQ7XG4gIH0sXG4gIC8qKlxuICAgKiAgYXV0b0hlaWdodCB1cGRhdGVzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBleGFjdGx5IGNvbnRhaW4gaXRzIGNvbnRlbnRcbiAgICovXG4gIGF1dG9IZWlnaHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9jID0gdGhpcy5nZXREb2N1bWVudCgpO1xuICAgIHZhciBkb2NIZWlnaHQgPSBnZXREb2N1bWVudEhlaWdodChkb2MpO1xuICAgIGlmIChkb2NIZWlnaHQgIT0gdGhpcy5lbGVtZW50LmhlaWdodClcbiAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGRvY0hlaWdodCk7XG4gIH0sXG4gIC8qKlxuICAgKiAgZ2V0RG9jdW1lbnQgZ2V0cyB0aGUgaW50ZXJuYWwgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZVxuICAgKi9cbiAgZ2V0RG9jdW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudCB8fCB0aGlzLmVsZW1lbnQuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgfSxcbiAgLyoqXG4gICAqICBhZGRzL3JlbW92ZXMgdGhlICdzaG93LWdyaWQnIGNsYXNzIHRvIHRoZSA8aHRtbD4gZWxlbWVudCBzbyB3ZSBjYW4gc2hvdyBhIGdyaWQgb3ZlcmxheVxuICAgKi9cbiAgdG9nZ2xlR3JpZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2V0RG9jdW1lbnQoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpWzBdLmNsYXNzTGlzdC50b2dnbGUoJ3Nob3ctZ3JpZCcpO1xuICB9LFxuICAvKipcbiAgICogIHNldHMgdGhlIHdpZHRoIG9mIHRoZSBpZnJhbWUsIHVzZWZ1bCBmb3Igc2hvd2luZyBtZWRpYSBxdWVyaWVzXG4gICAqL1xuICBzZXRXaWR0aDogZnVuY3Rpb24gKHcpIHtcbiAgICBpZiAodykge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdyArICdweCc7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgncmVzaXplZCcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9ICcnO1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Jlc2l6ZWQnKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZUh0bWxTYW1wbGVzICgpIHtcbiAgLy8gZ2V0IHN0eWxlcyBhbmQgc2NyaXB0c1xuICBzdHlsZXMgPSB3aW5kb3cuYWcgJiYgd2luZG93LmFnLnN0eWxlcyB8fCBbXTtcbiAgc2NyaXB0cyA9IHdpbmRvdy5hZyAmJiB3aW5kb3cuYWcuc2NyaXB0cyB8fCBbXTtcbiAgLy8gZ2V0IGFsbCBvdXIgY3VzdG9tIGVsZW1lbnRzXG4gIHZhciBlbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWFrZS1pZnJhbWUnKTtcbiAgZm9yICh2YXIgaSA9IGVscy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgIG5ldyBIdG1sU2FtcGxlKGVsc1tpXSk7XG4gIH07XG59XG5cbi8qKipcbiAqICBUb2dnbGUgSFRNTCBTYW1wbGUgR3JpZHNcbiAqXG4gKiAgVG9nZ2xlcyBhIGAuc2hvdy1ncmlkYCBjbGFzcyBvbiB0aGUgYDxodG1sPmAgZWxlbWVudCBpbnNpZGUgYWxsIHRoZVxuICogIGlmcmFtZXMuICBXaXRoIHRoZSBpbi1mcmFtZS5jc3Mgc3R5bGVzaGVldCBpbmNsdWRlZCwgdGhpcyB3aWxsIHR1cm4gb24gYSAxMlxuICogIGNvbHVtbiBncmlkIG92ZXJsYXkuXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvbWFrZUh0bWxTYW1wbGVzJykudG9nZ2xlR3JpZHMoKVxuICovXG52YXIgdG9nZ2xlR3JpZHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnRvZ2dsZUdyaWQoKTtcbiAgfSk7XG59XG5cbi8qKipcbiAqICBzZXRXaWR0aHNcbiAqXG4gKiAgU2V0cyBhbGwgYEh0bWxTYW1wbGVgcyB0byB0aGUgcHJvdmlkZWQgd2lkdGguXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLnNldFdpZHRocyh3aWR0aCk7XG4gKlxuICogIEBwYXJhbSB7aW50fSB3aWR0aFxuICovXG52YXIgc2V0V2lkdGhzID0gZnVuY3Rpb24gKHcpIHtcbiAgZm9yRWFjaChzYW1wbGVzLCBmdW5jdGlvbiAocykge1xuICAgIHMuc2V0V2lkdGgodyk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEh0bWxTYW1wbGU7XG5tb2R1bGUuZXhwb3J0cy5tYWtlQWxsID0gbWFrZUh0bWxTYW1wbGVzO1xubW9kdWxlLmV4cG9ydHMudG9nZ2xlR3JpZHMgPSB0b2dnbGVHcmlkcztcbm1vZHVsZS5leHBvcnRzLnNldFdpZHRocyA9IHNldFdpZHRocztcbiIsIi8vIHJlcXVpcmVtZW50c1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCdsaWIvdXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGNsYXNzZXNcbi8qKipcbiAqICBUcmF5IFRpZXJcbiAqXG4gKiAgQ29udHJvbHMgYW4gaW5kaXZpZHVhbCB0aWVyIG9mIHRoZSBUcmF5LiBOb3QgYSBiaWcgZGVhbCwganVzdCBoYW5kbGVzIG9wZW4vY2xvc2VcbiAqICBhbmQgb3BlbmVyIGNsaWNrIGV2ZW50cy5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSAuYWctdHJheV9fdGllciBlbGVtZW50XG4gKiAgQHBhcmFtIHtUcmF5fSBwYXJlbnQgdHJheSBvYmplY3RcbiAqXG4gKiAgQG1ldGhvZCBvcGVuKClcbiAqICBAbWV0aG9kIGNsb3NlKClcbiAqICBAbWV0aG9kIHRvZ2dsZSgpXG4gKlxuICogIEBwcm9wIHtib29sZWFufSBpc09wZW5cbiAqL1xudmFyIFRpZXIgPSBmdW5jdGlvbiAoZWwsIHRyYXkpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWw7XG4gIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gIHRoaXMudHJheSA9IHRyYXk7XG5cbiAgdGhpcy5vcGVuZXIgPSBlbC5xdWVyeVNlbGVjdG9yKCcuYWctdHJheV9fdGllci1vcGVuZXInKTtcbiAgaWYgKHRoaXMub3BlbmVyKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLm9wZW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy50b2dnbGUoKTtcbiAgICB9KTtcbiAgfVxufVxuVGllci5wcm90b3R5cGUgPSB7XG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgICB0aGlzLnRyYXkub3BlbigpO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICB0aGlzLnRyYXkuYXV0b0Nsb3NlKCk7XG4gIH0sXG4gIHRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmlzT3BlbiA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICB9XG59XG5cbi8qKipcbiAqICBUcmF5XG4gKlxuICogIENvbnRyb2xzIHRoZSB0cmF5LiBJbml0aWFsaXplcyBhdXRvbWF0aWNhbGx5LCBidXQgc3RyaWN0bHkgdGhlIG9iamVjdCBpcyBwYXNzZWRcbiAqICBhIGBET01FbGVtZW50YC4gT25seSAxIGluc3RhbmNlIGludGVuZGVkLCBzbyB0aGF0J3MgdGhlIGV4cG9ydCBmcm9tIHRoaXMgZmlsZS5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSAuYWctdHJheSBlbGVtZW50XG4gKlxuICogIEBtZXRob2Qgb3BlbigpXG4gKiAgQG1ldGhvZCBjbG9zZSgpIC0gYWxzbyBjbG9zZXMgYWxsIHRpZXJzXG4gKiAgQG1ldGhvZCBhdXRvQ2xvc2UoKSAtIGNsb3NlcyBfaWZfIGFsbCB0aWVycyBhcmUgYWxyZWFkeSBjbG9zZWQgYXMgd2VsbFxuICpcbiAqICBAcHJvcCB7VGllcltdfSB0aWVycyAtIGFycmF5IG9mIGFsbCB0aGUgdGllcnMgaW4gdGhlIHRyYXlcbiAqL1xudmFyIFRyYXkgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5lbGVtZW50ID0gZWw7XG5cbiAgdmFyIHRpZXJFbHMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCcuYWctdHJheV9fdGllcicpO1xuICB0aGlzLnRpZXJzID0gW107XG4gIGZvckVhY2godGllckVscywgZnVuY3Rpb24gKHRpZXJFbCkge1xuICAgIF90aGlzLnRpZXJzLnB1c2gobmV3IFRpZXIgKHRpZXJFbCwgX3RoaXMpKTtcbiAgfSk7XG5cbiAgLy8gY2xvc2UgaWYgY2xpY2sgb24gYmFja2dyb3VuZFxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIGRvIHtcbiAgICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FnLXRyYXlfX3RpZXInKSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgZWxzZSBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdhZy10cmF5JykpXG4gICAgICAgIGJyZWFrO1xuICAgIH0gd2hpbGUgKChlbCA9IGVsLnBhcmVudE5vZGUpICYmIChlbC5jbGFzc0xpc3QgIT09IHVuZGVmaW5lZCkpO1xuICAgIF90aGlzLmNsb3NlKCk7XG4gIH0pO1xufVxuVHJheS5wcm90b3R5cGUgPSB7XG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIC8vIGlmIGFueSB0aWVycyBhcmUgb3BlbiwgY2xvc2UgdGhlbSwgYW5kIHRoZXkgd2lsbCBjYWxsIC5hdXRvQ2xvc2UoKSB0byBjb250aW51ZSB0aGlzXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMudGllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnRpZXJzW2ldLmlzT3BlbilcbiAgICAgICAgdGhpcy50aWVyc1tpXS5jbG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xuICB9LFxuICBhdXRvQ2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2hvdWxkQ2xvc2UgPSB0cnVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnRpZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy50aWVyc1tpXS5pc09wZW4pIHtcbiAgICAgICAgc2hvdWxkQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzaG91bGRDbG9zZSlcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxufVxuXG52YXIgdHJheUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFnLXRyYXknKTtcbnZhciB0cmF5O1xuaWYgKHRyYXlFbClcbiAgdHJheSA9IG5ldyBUcmF5ICh0cmF5RWwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRyYXk7XG4iLCIvKipcbiAqICBoYW5kbGUgaGFzaGNoYW5nZVxuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciB0cmF5ID0gcmVxdWlyZSgnYXBwL1RyYXknKTtcbnZhciBhbmltYXRlU2Nyb2xsID0gcmVxdWlyZSgnbGliL2FuaW1hdGVTY3JvbGxUbycpO1xudmFyIGdldFBhZ2VPZmZzZXQgPSByZXF1aXJlKCdsaWIvZ2V0UGFnZU9mZnNldCcpO1xuXG4vLyBzZXR0aW5nc1xudmFyIE9GRlNFVCA9IDMyO1xuXG4vLyBsaXN0ZW5lclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHRyYXkuY2xvc2UoKTtcbiAgdmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQod2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCcnKSk7XG4gIGFuaW1hdGVTY3JvbGwoZ2V0UGFnZU9mZnNldChlbCkudG9wIC0gT0ZGU0VUKTtcbn0pO1xuIiwiLyoqXG4gKiAgd2hvbGUgZGFtbiBzY3JpcHRcbiAqXG4gKiAgVGhpcyBzaG91bGQgaW5jbHVkZSBvYmplY3RzLCB3aGljaCBpbiB0dXJuIGluY2x1ZGUgdGhlIGxpYiBmaWxlcyB0aGV5IG5lZWQuXG4gKiAgVGhpcyBrZWVwcyB1cyB1c2luZyBhIG1vZHVsYXIgYXBwcm9hY2ggdG8gZGV2IHdoaWxlIGFsc28gb25seSBpbmNsdWRpbmcgdGhlXG4gKiAgcGFydHMgb2YgdGhlIGxpYnJhcnkgd2UgbmVlZC5cbiAqL1xucmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5tYWtlQWxsKCk7XG4vLyByZXF1aXJlKCdhcHAvY29udHJvbHMnKTtcbi8vIHJlcXVpcmUoJ2FwcC9UcmF5Jyk7XG5yZXF1aXJlKCdhcHAvaGFzaGNoYW5nZScpO1xuLy8gcmVxdWlyZSgnYXBwL0NvcHlhYmxlJyk7XG4iLCIvKipcbiAqICBBbmltYXRlIFNjcm9sbCB0byBQb3NpdGlvblxuICpcbiAqICBBbmltYXRlcyB3aW5kb3cgc2Nyb2xsIHBvc2l0aW9uXG4gKlxuICogIEBwYXJhbSB7aW50fSAtIGVuZCBwb3NpdGlvbiBpbiBwaXhlbHNcbiAqXG4gKiAgY29kZTpcbiAqICAgIHZhciBhbmltYXRlU2Nyb2xsID0gcmVxdWlyZSgnbGliL2FuaW1hdGVTY3JvbGxUbycpO1xuICogICAgYW5pbWF0ZVNjcm9sbCh0b3ApO1xuICovXG5cbi8vIHJlcXVpcmVtZW50c1xudmFyIGVhc2VzID0gcmVxdWlyZSgnbGliL2Vhc2VzJyk7XG5cbi8vIHNldHRpbmdzXG52YXIgbWluRHVyYXRpb24gPSAxMDAwO1xuXG4vLyB0aGUgYW5pbWF0aW9uIGNvbnRyb2xsZXJcbnZhciBzdGFydFRpbWUsXG4gICAgZHVyYXRpb24sXG4gICAgc3RhcnRQb3MsXG4gICAgZGVsdGFTY3JvbGwsXG4gICAgbGFzdFNjcm9sbFxuICAgIDtcblxuKGZ1bmN0aW9uIHVwZGF0ZVNjcm9sbCAoKSB7XG4gIGxhc3RTY3JvbGwgPSB3aW5kb3cuc2Nyb2xsWTtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZVNjcm9sbCk7XG59KSgpO1xuXG52YXIgYW5pbWF0ZVNjcm9sbCA9IGZ1bmN0aW9uIChjdXJyZW50VGltZSkge1xuICB2YXIgZGVsdGFUaW1lID0gY3VycmVudFRpbWUgLSBzdGFydFRpbWU7XG4gIGlmIChkZWx0YVRpbWUgPCBkdXJhdGlvbikge1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCBlYXNlcy5lYXNlSW5PdXQoc3RhcnRQb3MsIGRlbHRhU2Nyb2xsLCBkZWx0YVRpbWUgLyBkdXJhdGlvbikpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICBhbmltYXRlU2Nyb2xsKG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgc3RhcnRQb3MgKyBkZWx0YVNjcm9sbCk7XG4gIH1cbn1cblxudmFyIHN0YXJ0QW5pbWF0ZVNjcm9sbCA9IGZ1bmN0aW9uIChlbmRTY3JvbGwpIHtcbiAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIHN0YXJ0UG9zID0gbGFzdFNjcm9sbDtcbiAgZGVsdGFTY3JvbGwgPSBlbmRTY3JvbGwgLSBzdGFydFBvcztcbiAgZHVyYXRpb24gPSBNYXRoLm1heChtaW5EdXJhdGlvbiwgTWF0aC5hYnMoZGVsdGFTY3JvbGwpICogLjEpO1xuICBhbmltYXRlU2Nyb2xsKHN0YXJ0VGltZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhcnRBbmltYXRlU2Nyb2xsO1xuIiwiLyoqXG4gKiAgYSBidW5jaCBvZiBlYXNpbmcgZnVuY3Rpb25zIGZvciBtYWtpbmcgYW5pbWF0aW9uc1xuICogIHRlc3RpbmcgaXMgZmFpcmx5IHN1YmplY3RpdmUsIHNvIG5vdCBhdXRvbWF0ZWRcbiAqL1xuXG52YXIgZWFzZXMgPSB7XG4gICdlYXNlSW5PdXQnIDogZnVuY3Rpb24gKHMsYyxwKSB7XG4gICAgaWYgKHAgPCAuNSkge1xuICAgICAgcmV0dXJuIHMgKyBjICogKDIgKiBwICogcCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHMgKyBjICogKC0yICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKTtcbiAgICB9XG4gIH0sXG4gICdlYXNlSW5PdXRDdWJpYycgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICBpZiAocCA8IC41KSB7XG4gICAgICByZXR1cm4gcyArIGMgKiAoNCAqIHAgKiBwICogcCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHMgKyBjICogKDQgKiAocCAtIDEpICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKVxuICAgIH1cbiAgfSxcbiAgJ2Vhc2VJbicgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiBwICogcDtcbiAgfSxcbiAgJ2Vhc2VJbkN1YmljJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqIChwICogcCAqIHApO1xuICB9LFxuICAnZWFzZU91dCcgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiAoLTEgKiAocCAtIDEpICogKHAgLSAxKSArIDEpO1xuICB9LFxuICAnZWFzZU91dEN1YmljJyA6IGZ1bmN0aW9uIChzLGMscCkge1xuICAgIHJldHVybiBzICsgYyAqICgocCAtIDEpICogKHAgLSAxKSAqIChwIC0gMSkgKyAxKTtcbiAgfSxcbiAgJ2xpbmVhcicgOiBmdW5jdGlvbiAocyxjLHApIHtcbiAgICByZXR1cm4gcyArIGMgKiBwO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGVhc2VzO1xuIiwiLyoqKlxuICogIEdldCBQYWdlIE9mZnNldFxuICpcbiAqICBHZXQgYSBET01FbGVtZW50J3Mgb2Zmc2V0IGZyb20gcGFnZVxuICpcbiAqICBAcGFyYW0ge0RPTUVsZW1lbnR9XG4gKiAgQHJldHVybnMgb2JqZWN0XG4gKiAgICBAcHJvcCB7bnVtYmVyfSBsZWZ0XG4gKiAgICBAcHJvcCB7bnVtYmVyfSB0b3BcbiAqXG4gKiAgY29kZTpcbiAqICAgIHZhciBnZXRQYWdlT2Zmc2V0ID0gcmVxdWlyZSgnbGliL2dldFBhZ2VPZmZzZXQnKTtcbiAqICAgIGdldFBhZ2VPZmZzZXQoc29tZUVsZW1lbnQpO1xuICovXG5mdW5jdGlvbiBnZXRQYWdlT2Zmc2V0IChlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudCkge1xuICAgIHRocm93ICdnZXRQYWdlT2Zmc2V0IHBhc3NlZCBhbiBpbnZhbGlkIGVsZW1lbnQnO1xuICB9XG4gIHZhciBwYWdlT2Zmc2V0WCA9IGVsZW1lbnQub2Zmc2V0TGVmdCxcbiAgICAgIHBhZ2VPZmZzZXRZID0gZWxlbWVudC5vZmZzZXRUb3A7XG5cbiAgd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudCkge1xuICAgIHBhZ2VPZmZzZXRYICs9IGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBwYWdlT2Zmc2V0WSArPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbGVmdCA6IHBhZ2VPZmZzZXRYLFxuICAgIHRvcCA6IHBhZ2VPZmZzZXRZXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQYWdlT2Zmc2V0O1xuIiwiLyoqKlxuICogZm9yRWFjaCBGdW5jdGlvblxuICpcbiAqIEl0ZXJhdGUgb3ZlciBhbiBhcnJheSwgcGFzc2luZyB0aGUgdmFsdWUgdG8gdGhlIHBhc3NlZCBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIHRvIGNhbGxcbiAqXG4gKiBjb2RlOlxuICogICB2YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xpYi91dGlsL2ZvckVhY2gnKTtcbiAqICAgZm9yRWFjaChzb21lQXJyYXksIGZ1bmN0aW9uIChpdGVtKSB7IGFsZXJ0KGl0ZW0pIH0pO1xuICovXG5mdW5jdGlvbiBmb3JFYWNoIChhcnIsIGZuKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBmbi5jYWxsKGFycltpXSxhcnJbaV0sYXJyKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2g7XG4iXX0=
