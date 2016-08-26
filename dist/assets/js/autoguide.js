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
var forEach = require('util/forEach');

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
    body.scrollHeight, body.offsetHeight,
    html.clientHeight, html.scrollHeight, html.offsetHeight
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

},{"util/forEach":5}],2:[function(require,module,exports){
// requirements
var forEach = require('util/forEach');

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

},{"util/forEach":5}],3:[function(require,module,exports){
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
var forEach = require('util/forEach');

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
var sizeMobile = document.getElementById('sizeMobile');
if (sizeMobile)
  sizeMobile.addEventListener('click', function (e) {
    e.preventDefault();
    setWidths(320);
  });

},{"app/HtmlSample":1,"util/forEach":5}],4:[function(require,module,exports){
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

},{"app/HtmlSample":1,"app/Tray":2,"app/controls":3}],5:[function(require,module,exports){
/***
 * forEach Function
 *
 * Iterate over an array, passing the value to the passed function
 *
 * @param {Array} array to iterate
 * @param {function} fn to call
 *
 * code:
 *   var forEach = require('util/forEach');
 *   forEach(someArray, function (item) { alert(item) });
 */
function forEach (arr, fn) {
  for (var i = 0, len = arr.length; i < len; i++) {
    fn.call(arr[i],arr[i],arr);
  }
}

module.exports = forEach;

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9UcmF5LmpzIiwiYXBwL2NvbnRyb2xzLmpzIiwiYXV0b2d1aWRlLmpzIiwidXRpbC9mb3JFYWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqKlxuICogIE1ha2UgQWxsIEh0bWwgU2FtcGxlc1xuICpcbiAqICBTZWFyY2hlcyBmb3IgYWxsIGA8bWFrZS1pZnJhbWU+YCBlbGVtZW50cyBhbmQgZG9lcyBqdXN0IHRoYXQ6IG1ha2VzIHRoZW0gaWZyYW1lcy5cbiAqICBJdCBhbHNvIGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmQgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYFxuICogIG9iamVjdC4gIFRob3NlIHNob3VsZCBiZSBwb3B1bGF0ZWQgYnkgdGhlIHRlbXBsYXRlLlxuICpcbiAqICBjb2RlOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5tYWtlQWxsKCk7IC8vIGdvZXMgdGhyb3VnaCB0aGUgd2hvbGUgcGFnZSBhbmQgZG9lcyBpdHMgdGhpbmdcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ3V0aWwvZm9yRWFjaCcpO1xuXG4vLyBzZXR0aW5nc1xuXG4vLyBoZWxwZXJzXG4vKipcbiAqIEdldCBkb2N1bWVudCBoZWlnaHQgKHN0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTQ1ODUwLylcbiAqXG4gKiBAcGFyYW0gIHtEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldERvY3VtZW50SGVpZ2h0IChkb2MpIHtcbiAgZG9jID0gZG9jIHx8IGRvY3VtZW50O1xuICB2YXIgYm9keSA9IGRvYy5ib2R5O1xuICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgaWYgKCFib2R5IHx8ICFodG1sKVxuICAgIHJldHVybiAwO1xuXG4gIHJldHVybiBNYXRoLm1heChcbiAgICBib2R5LnNjcm9sbEhlaWdodCwgYm9keS5vZmZzZXRIZWlnaHQsXG4gICAgaHRtbC5jbGllbnRIZWlnaHQsIGh0bWwuc2Nyb2xsSGVpZ2h0LCBodG1sLm9mZnNldEhlaWdodFxuICApO1xufVxuXG4vLyBkbyB0aGluZ3MhXG4vLyBnZXQgc29tZSBtZXRhIHRhZ3NcbnZhciBtZXRhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGEnKTtcbnZhciBzdHlsZXMsIHNjcmlwdHM7XG52YXIgc2FtcGxlcyA9IFtdO1xuXG4vKioqXG4gKiAgYEh0bWxTYW1wbGVgIENsYXNzXG4gKlxuICogIENvbnRyb2xzIGFuIGluZGl2aWR1YWwgSFRNTCBTYW1wbGUsIHdoaWNoIGlzIGFuIGlmcmFtZSB0aGF0IGxvYWRzIHRoZSBjc3MgYW5kXG4gKiAgc2NyaXB0cyB0aGF0IHRoZSBzdHlsZWd1aWRlIGlzIG1lYW50IHRvIHNob3cuIEl0IGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmRcbiAqICBzY3JpcHRzIHByZXNlbnQgaW4gdGhlIHdpbmRvdyBsZXZlbCBgYWdgIG9iamVjdC5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSBzb3VyY2VFbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gdHVybiBpbnRvIGFuIGlmcmFtZVxuICpcbiAqICBAbWV0aG9kIHt2b2lkfSBidWlsZENvbnRlbnQoKSAtIGJ1aWxkcyBhIHN0cmluZyBvZiB0aGUgZWxlbWVudCBhcyBhIGZ1bGwgaHRtbCBkb2N1bWVudFxuICogICAgYW5kIGFzc2lnbnMgaXQgYXMgdGhlIGRvY3VtZW50IG9mIHRoZSBpZnJhbWUuXG4gKiAgQG1ldGhvZCB7dm9pZH0gYXV0b0hlaWdodCgpIC0gYWx0ZXJzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBiZSB0aGUgbWluaW11bSBuZWVkZWQgdG9cbiAqICAgIGVsaW1pbmF0ZSBhIHNjcm9sbGJhci4gIEF1dG9tYXRpY2FsbHkgY2FsbGVkIG9uIGEgcGVyIGFuaW1hdGlvbiBmcmFtZSBiYXNpcy5cbiAqICBAbWV0aG9kIHtET01FbGVtZW50fSBnZXREb2N1bWVudCgpIC0gcmV0dXJucyB0aGUgaWZyYW1lJ3MgZG9jdW1lbnQgb2JqZWN0XG4gKiAgQG1ldGhvZCB7dm9pZH0gdG9nZ2xlR3JpZCgpIC0gYWRkcy9yZW1vdmVzIHRoZSAnc2hvdy1ncmlkJyBjbGFzcyB0byB0aGUgPGh0bWw+IGVsZW1lbnRcbiAqICAgIHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gKiAgQG1ldGhvZCB7dm9pZH0gc2V0V2lkdGgod2lkdGgpIC0gc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nXG4gKiAgICBtZWRpYSBxdWVyaWVzXG4gKiAgICBAcGFyYW0ge2ludH0gd2lkdGggLSB3aWR0aCBpbiBwaXhlbHMuIFJlc2V0cyB0byBkZWZhdWx0IHNpemUgaWYgZmFsc3lcbiAqXG4gKiAgQHByb3AgZWxlbWVudCAtIHRoZSBhY3R1YWwgaWZyYW1lIGVsZW1lbnRcbiAqL1xudmFyIEh0bWxTYW1wbGUgPSBmdW5jdGlvbiAoc291cmNlRWxlbWVudCkge1xuICB0aGlzLnNvdXJjZUVsZW1lbnQgPSBzb3VyY2VFbGVtZW50O1xuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCB0aGlzLnNvdXJjZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpKTtcblxuICB0aGlzLmJ1aWxkQ29udGVudCgpO1xuICB0aGlzLnNvdXJjZUVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQodGhpcy5lbGVtZW50LCB0aGlzLnNvdXJjZUVsZW1lbnQpO1xuXG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIChmdW5jdGlvbiBjaGVja0lmcmFtZUhlaWdodCAoKSB7XG4gICAgX3RoaXMuYXV0b0hlaWdodCgpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjaGVja0lmcmFtZUhlaWdodCk7XG4gIH0pKCk7XG5cbiAgc2FtcGxlcy5wdXNoKHRoaXMpO1xufVxuSHRtbFNhbXBsZS5wcm90b3R5cGUgPSB7XG4gIC8qKlxuICAgKiAgYnVpbGRDb250ZW50IGNyZWF0ZXMgYSBzdHJpbmcgdG8gdXNlIGFzIHRoZSBkb2N1bWVudCBmb3IgdGhlIGlmcmFtZVxuICAgKi9cbiAgYnVpbGRDb250ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnRlbnQgPSAnPCFkb2N0eXBlIGh0bWw+JztcbiAgICBjb250ZW50ICs9ICc8aHRtbCBjbGFzcz1cInNob3ctZGV2ICcgKyAodGhpcy5zb3VyY2VFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnZnMnKSA/ICdmcycgOiAnbm90LWZzJykgKyAnXCI+PGhlYWQ+JztcbiAgICBmb3JFYWNoKG1ldGFzLGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICBjb250ZW50ICs9IG1ldGEub3V0ZXJIVE1MO1xuICAgIH0pO1xuICAgIGZvckVhY2goc3R5bGVzLGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgY29udGVudCArPSAnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCInICsgc3R5bGUgKyAnXCI+JztcbiAgICB9KTtcbiAgICBjb250ZW50ICs9ICc8L2hlYWQ+PGJvZHk+JztcbiAgICBjb250ZW50ICs9IHRoaXMuc291cmNlRWxlbWVudC5pbm5lckhUTUw7XG4gICAgZm9yRWFjaChzY3JpcHRzLGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgIGNvbnRlbnQgKz0gJzxzY3JpcHQgc3JjPVwiJyArIHNjcmlwdCArICdcIj48L3NjcmlwdD4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gXCI8L2JvZHk+PC9odG1sPlwiO1xuICAgIHRoaXMuZWxlbWVudC5zcmNkb2MgPSBjb250ZW50O1xuICB9LFxuICAvKipcbiAgICogIGF1dG9IZWlnaHQgdXBkYXRlcyB0aGUgaGVpZ2h0IG9mIHRoZSBpZnJhbWUgdG8gZXhhY3RseSBjb250YWluIGl0cyBjb250ZW50XG4gICAqL1xuICBhdXRvSGVpZ2h0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRvYyA9IHRoaXMuZ2V0RG9jdW1lbnQoKTtcbiAgICB2YXIgZG9jSGVpZ2h0ID0gZ2V0RG9jdW1lbnRIZWlnaHQoZG9jKTtcbiAgICBpZiAoZG9jSGVpZ2h0ICE9IHRoaXMuZWxlbWVudC5oZWlnaHQpXG4gICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBkb2NIZWlnaHQpO1xuICB9LFxuICAvKipcbiAgICogIGdldERvY3VtZW50IGdldHMgdGhlIGludGVybmFsIGRvY3VtZW50IG9mIHRoZSBpZnJhbWVcbiAgICovXG4gIGdldERvY3VtZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jb250ZW50RG9jdW1lbnQgfHwgdGhpcy5lbGVtZW50LmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIH0sXG4gIC8qKlxuICAgKiAgYWRkcy9yZW1vdmVzIHRoZSAnc2hvdy1ncmlkJyBjbGFzcyB0byB0aGUgPGh0bWw+IGVsZW1lbnQgc28gd2UgY2FuIHNob3cgYSBncmlkIG92ZXJsYXlcbiAgICovXG4gIHRvZ2dsZUdyaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdldERvY3VtZW50KCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKVswXS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93LWdyaWQnKTtcbiAgfSxcbiAgLyoqXG4gICAqICBzZXRzIHRoZSB3aWR0aCBvZiB0aGUgaWZyYW1lLCB1c2VmdWwgZm9yIHNob3dpbmcgbWVkaWEgcXVlcmllc1xuICAgKi9cbiAgc2V0V2lkdGg6IGZ1bmN0aW9uICh3KSB7XG4gICAgaWYgKHcpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHcgKyAncHgnO1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZWQnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSAnJztcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdyZXNpemVkJyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VIdG1sU2FtcGxlcyAoKSB7XG4gIC8vIGdldCBzdHlsZXMgYW5kIHNjcmlwdHNcbiAgc3R5bGVzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zdHlsZXMgfHwgW107XG4gIHNjcmlwdHMgPSB3aW5kb3cuYWcgJiYgd2luZG93LmFnLnNjcmlwdHMgfHwgW107XG4gIC8vIGdldCBhbGwgb3VyIGN1c3RvbSBlbGVtZW50c1xuICB2YXIgZWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ha2UtaWZyYW1lJyk7XG4gIGZvciAodmFyIGkgPSBlbHMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICBuZXcgSHRtbFNhbXBsZShlbHNbaV0pO1xuICB9O1xufVxuXG4vKioqXG4gKiAgVG9nZ2xlIEhUTUwgU2FtcGxlIEdyaWRzXG4gKlxuICogIFRvZ2dsZXMgYSBgLnNob3ctZ3JpZGAgY2xhc3Mgb24gdGhlIGA8aHRtbD5gIGVsZW1lbnQgaW5zaWRlIGFsbCB0aGVcbiAqICBpZnJhbWVzLiAgV2l0aCB0aGUgaW4tZnJhbWUuY3NzIHN0eWxlc2hlZXQgaW5jbHVkZWQsIHRoaXMgd2lsbCB0dXJuIG9uIGEgMTJcbiAqICBjb2x1bW4gZ3JpZCBvdmVybGF5LlxuICpcbiAqICBjb2RlOlxuICogICAgcmVxdWlyZSgnYXBwL21ha2VIdG1sU2FtcGxlcycpLnRvZ2dsZUdyaWRzKClcbiAqL1xudmFyIHRvZ2dsZUdyaWRzID0gZnVuY3Rpb24gKCkge1xuICBmb3JFYWNoKHNhbXBsZXMsIGZ1bmN0aW9uIChzKSB7XG4gICAgcy50b2dnbGVHcmlkKCk7XG4gIH0pO1xufVxuXG4vKioqXG4gKiAgc2V0V2lkdGhzXG4gKlxuICogIFNldHMgYWxsIGBIdG1sU2FtcGxlYHMgdG8gdGhlIHByb3ZpZGVkIHdpZHRoLlxuICpcbiAqICBjb2RlOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5zZXRXaWR0aHMod2lkdGgpO1xuICpcbiAqICBAcGFyYW0ge2ludH0gd2lkdGhcbiAqL1xudmFyIHNldFdpZHRocyA9IGZ1bmN0aW9uICh3KSB7XG4gIGZvckVhY2goc2FtcGxlcywgZnVuY3Rpb24gKHMpIHtcbiAgICBzLnNldFdpZHRoKHcpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIdG1sU2FtcGxlO1xubW9kdWxlLmV4cG9ydHMubWFrZUFsbCA9IG1ha2VIdG1sU2FtcGxlcztcbm1vZHVsZS5leHBvcnRzLnRvZ2dsZUdyaWRzID0gdG9nZ2xlR3JpZHM7XG5tb2R1bGUuZXhwb3J0cy5zZXRXaWR0aHMgPSBzZXRXaWR0aHM7XG4iLCIvLyByZXF1aXJlbWVudHNcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgndXRpbC9mb3JFYWNoJyk7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGNsYXNzZXNcbi8qKipcbiAqICBUcmF5IFRpZXJcbiAqXG4gKiAgQ29udHJvbHMgYW4gaW5kaXZpZHVhbCB0aWVyIG9mIHRoZSBUcmF5LiBOb3QgYSBiaWcgZGVhbCwganVzdCBoYW5kbGVzIG9wZW4vY2xvc2VcbiAqICBhbmQgb3BlbmVyIGNsaWNrIGV2ZW50cy5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSAuYWctdHJheV9fdGllciBlbGVtZW50XG4gKiAgQHBhcmFtIHtUcmF5fSBwYXJlbnQgdHJheSBvYmplY3RcbiAqXG4gKiAgQG1ldGhvZCBvcGVuKClcbiAqICBAbWV0aG9kIGNsb3NlKClcbiAqICBAbWV0aG9kIHRvZ2dsZSgpXG4gKlxuICogIEBwcm9wIHtib29sZWFufSBpc09wZW5cbiAqL1xudmFyIFRpZXIgPSBmdW5jdGlvbiAoZWwsIHRyYXkpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWw7XG4gIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gIHRoaXMudHJheSA9IHRyYXk7XG5cbiAgdGhpcy5vcGVuZXIgPSBlbC5xdWVyeVNlbGVjdG9yKCcuYWctdHJheV9fdGllci1vcGVuZXInKTtcbiAgaWYgKHRoaXMub3BlbmVyKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLm9wZW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBfdGhpcy50b2dnbGUoKTtcbiAgICB9KTtcbiAgfVxufVxuVGllci5wcm90b3R5cGUgPSB7XG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgICB0aGlzLnRyYXkub3BlbigpO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICB0aGlzLnRyYXkuYXV0b0Nsb3NlKCk7XG4gIH0sXG4gIHRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmlzT3BlbiA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICB9XG59XG5cbi8qKipcbiAqICBUcmF5XG4gKlxuICogIENvbnRyb2xzIHRoZSB0cmF5LiBJbml0aWFsaXplcyBhdXRvbWF0aWNhbGx5LCBidXQgc3RyaWN0bHkgdGhlIG9iamVjdCBpcyBwYXNzZWRcbiAqICBhIGBET01FbGVtZW50YC4gT25seSAxIGluc3RhbmNlIGludGVuZGVkLCBzbyB0aGF0J3MgdGhlIGV4cG9ydCBmcm9tIHRoaXMgZmlsZS5cbiAqXG4gKiAgQHBhcmFtIHtET01FbGVtZW50fSAuYWctdHJheSBlbGVtZW50XG4gKlxuICogIEBtZXRob2Qgb3BlbigpXG4gKiAgQG1ldGhvZCBjbG9zZSgpIC0gYWxzbyBjbG9zZXMgYWxsIHRpZXJzXG4gKiAgQG1ldGhvZCBhdXRvQ2xvc2UoKSAtIGNsb3NlcyBfaWZfIGFsbCB0aWVycyBhcmUgYWxyZWFkeSBjbG9zZWQgYXMgd2VsbFxuICpcbiAqICBAcHJvcCB7VGllcltdfSB0aWVycyAtIGFycmF5IG9mIGFsbCB0aGUgdGllcnMgaW4gdGhlIHRyYXlcbiAqL1xudmFyIFRyYXkgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5lbGVtZW50ID0gZWw7XG5cbiAgdmFyIHRpZXJFbHMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCcuYWctdHJheV9fdGllcicpO1xuICB0aGlzLnRpZXJzID0gW107XG4gIGZvckVhY2godGllckVscywgZnVuY3Rpb24gKHRpZXJFbCkge1xuICAgIF90aGlzLnRpZXJzLnB1c2gobmV3IFRpZXIgKHRpZXJFbCwgX3RoaXMpKTtcbiAgfSk7XG5cbiAgLy8gY2xvc2UgaWYgY2xpY2sgb24gYmFja2dyb3VuZFxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIGRvIHtcbiAgICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FnLXRyYXlfX3RpZXInKSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgZWxzZSBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdhZy10cmF5JykpXG4gICAgICAgIGJyZWFrO1xuICAgIH0gd2hpbGUgKChlbCA9IGVsLnBhcmVudE5vZGUpICYmIChlbC5jbGFzc0xpc3QgIT09IHVuZGVmaW5lZCkpO1xuICAgIF90aGlzLmNsb3NlKCk7XG4gIH0pO1xufVxuVHJheS5wcm90b3R5cGUgPSB7XG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICB9LFxuICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIC8vIGlmIGFueSB0aWVycyBhcmUgb3BlbiwgY2xvc2UgdGhlbSwgYW5kIHRoZXkgd2lsbCBjYWxsIC5hdXRvQ2xvc2UoKSB0byBjb250aW51ZSB0aGlzXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMudGllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnRpZXJzW2ldLmlzT3BlbilcbiAgICAgICAgdGhpcy50aWVyc1tpXS5jbG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xuICB9LFxuICBhdXRvQ2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2hvdWxkQ2xvc2UgPSB0cnVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnRpZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy50aWVyc1tpXS5pc09wZW4pIHtcbiAgICAgICAgc2hvdWxkQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzaG91bGRDbG9zZSlcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxufVxuXG52YXIgdHJheUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFnLXRyYXknKTtcbnZhciB0cmF5O1xuaWYgKHRyYXlFbClcbiAgdHJheSA9IG5ldyBUcmF5ICh0cmF5RWwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRyYXk7XG4iLCIvKioqXG4gKiAgQ29udHJvbHMgYW5kIE5hdlxuICpcbiAqICBXaGVuIHJlcXVpcmVkLCBhdXRvbWF0aWNhbGx5IGVuYWJsZXMgY29udHJvbCBidXR0b25zL3RvZ2dsZXMuXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvY29udHJvbHMnKTtcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgdG9nZ2xlR3JpZHMgPSByZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLnRvZ2dsZUdyaWRzO1xudmFyIHNldFdpZHRocyA9IHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykuc2V0V2lkdGhzO1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCd1dGlsL2ZvckVhY2gnKTtcblxuLy8gc2V0dGluZ3NcblxuLy8gZ2V0IGVsZW1lbnRzIGFuZCBhcHBseSBsaXN0ZW5lcnNcbnZhciBzaG93R3JpZHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd0dyaWRzJyk7XG5pZiAoc2hvd0dyaWRzKVxuICBzaG93R3JpZHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZUdyaWRzKCk7XG4gIH0pO1xuXG52YXIgc2hvd0RldiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaG93RGV2Jyk7XG5pZiAoc2hvd0RldilcbiAgc2hvd0Rldi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93LWRldicpO1xuICB9KTtcblxuLy8gc2l6ZSBpZnJhbWVzXG52YXIgc2l6ZU1vYmlsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaXplTW9iaWxlJyk7XG5pZiAoc2l6ZU1vYmlsZSlcbiAgc2l6ZU1vYmlsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNldFdpZHRocygzMjApO1xuICB9KTtcbiIsIi8qKlxuICogIHdob2xlIGRhbW4gc2NyaXB0XG4gKlxuICogIFRoaXMgc2hvdWxkIGluY2x1ZGUgb2JqZWN0cywgd2hpY2ggaW4gdHVybiBpbmNsdWRlIHRoZSBsaWIgZmlsZXMgdGhleSBuZWVkLlxuICogIFRoaXMga2VlcHMgdXMgdXNpbmcgYSBtb2R1bGFyIGFwcHJvYWNoIHRvIGRldiB3aGlsZSBhbHNvIG9ubHkgaW5jbHVkaW5nIHRoZVxuICogIHBhcnRzIG9mIHRoZSBsaWJyYXJ5IHdlIG5lZWQuXG4gKi9cbnJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykubWFrZUFsbCgpO1xucmVxdWlyZSgnYXBwL2NvbnRyb2xzJyk7XG5yZXF1aXJlKCdhcHAvVHJheScpO1xuIiwiLyoqKlxuICogZm9yRWFjaCBGdW5jdGlvblxuICpcbiAqIEl0ZXJhdGUgb3ZlciBhbiBhcnJheSwgcGFzc2luZyB0aGUgdmFsdWUgdG8gdGhlIHBhc3NlZCBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIHRvIGNhbGxcbiAqXG4gKiBjb2RlOlxuICogICB2YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ3V0aWwvZm9yRWFjaCcpO1xuICogICBmb3JFYWNoKHNvbWVBcnJheSwgZnVuY3Rpb24gKGl0ZW0pIHsgYWxlcnQoaXRlbSkgfSk7XG4gKi9cbmZ1bmN0aW9uIGZvckVhY2ggKGFyciwgZm4pIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGZuLmNhbGwoYXJyW2ldLGFycltpXSxhcnIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiJdfQ==
