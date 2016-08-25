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
/**
 * Iterate over an array, passing the value to the passed function
 *
 * @param {Array} array to iterate
 * @param {function} fn to call
 */
function forEach (arr, fn) {
  for (var i = 0, len = arr.length; i < len; i++) {
    fn.call(arr[i],arr[i],arr);
  }
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

},{}],2:[function(require,module,exports){
/***
 *  Controls
 *
 *  When required, automatically enables control buttons/toggles.
 *
 *  code:
 *    require('app/controls');
 */
// requirements
var toggleGrids = require('app/HtmlSample').toggleGrids;
var setWidths = require('app/HtmlSample').setWidths;

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

},{"app/HtmlSample":1}],3:[function(require,module,exports){
/**
 *  whole damn script
 *
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */
require('app/HtmlSample').makeAll();
require('app/controls');

},{"app/HtmlSample":1,"app/controls":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvSHRtbFNhbXBsZS5qcyIsImFwcC9jb250cm9scy5qcyIsImF1dG9ndWlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqKlxuICogIE1ha2UgQWxsIEh0bWwgU2FtcGxlc1xuICpcbiAqICBTZWFyY2hlcyBmb3IgYWxsIGA8bWFrZS1pZnJhbWU+YCBlbGVtZW50cyBhbmQgZG9lcyBqdXN0IHRoYXQ6IG1ha2VzIHRoZW0gaWZyYW1lcy5cbiAqICBJdCBhbHNvIGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmQgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYFxuICogIG9iamVjdC4gIFRob3NlIHNob3VsZCBiZSBwb3B1bGF0ZWQgYnkgdGhlIHRlbXBsYXRlLlxuICpcbiAqICBjb2RlOlxuICogICAgcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5tYWtlQWxsKCk7IC8vIGdvZXMgdGhyb3VnaCB0aGUgd2hvbGUgcGFnZSBhbmQgZG9lcyBpdHMgdGhpbmdcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG5cbi8vIHNldHRpbmdzXG5cbi8vIGhlbHBlcnNcbi8qKlxuICogR2V0IGRvY3VtZW50IGhlaWdodCAoc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExNDU4NTAvKVxuICpcbiAqIEBwYXJhbSAge0RvY3VtZW50fSBkb2NcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RG9jdW1lbnRIZWlnaHQgKGRvYykge1xuICBkb2MgPSBkb2MgfHwgZG9jdW1lbnQ7XG4gIHZhciBib2R5ID0gZG9jLmJvZHk7XG4gIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcblxuICBpZiAoIWJvZHkgfHwgIWh0bWwpXG4gICAgcmV0dXJuIDA7XG5cbiAgcmV0dXJuIE1hdGgubWF4KFxuICAgIGJvZHkuc2Nyb2xsSGVpZ2h0LCBib2R5Lm9mZnNldEhlaWdodCxcbiAgICBodG1sLmNsaWVudEhlaWdodCwgaHRtbC5zY3JvbGxIZWlnaHQsIGh0bWwub2Zmc2V0SGVpZ2h0XG4gICk7XG59XG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBhcnJheSwgcGFzc2luZyB0aGUgdmFsdWUgdG8gdGhlIHBhc3NlZCBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIHRvIGNhbGxcbiAqL1xuZnVuY3Rpb24gZm9yRWFjaCAoYXJyLCBmbikge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZm4uY2FsbChhcnJbaV0sYXJyW2ldLGFycik7XG4gIH1cbn1cblxuLy8gZG8gdGhpbmdzIVxuLy8gZ2V0IHNvbWUgbWV0YSB0YWdzXG52YXIgbWV0YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhJyk7XG52YXIgc3R5bGVzLCBzY3JpcHRzO1xudmFyIHNhbXBsZXMgPSBbXTtcblxuLyoqKlxuICogIGBIdG1sU2FtcGxlYCBDbGFzc1xuICpcbiAqICBDb250cm9scyBhbiBpbmRpdmlkdWFsIEhUTUwgU2FtcGxlLCB3aGljaCBpcyBhbiBpZnJhbWUgdGhhdCBsb2FkcyB0aGUgY3NzIGFuZFxuICogIHNjcmlwdHMgdGhhdCB0aGUgc3R5bGVndWlkZSBpcyBtZWFudCB0byBzaG93LiBJdCBpbmNsdWRlcyB0aGUgc3R5bGVzaGVldHMgYW5kXG4gKiAgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYCBvYmplY3QuXG4gKlxuICogIEBwYXJhbSB7RE9NRWxlbWVudH0gc291cmNlRWxlbWVudCAtIHRoZSBlbGVtZW50IHRvIHR1cm4gaW50byBhbiBpZnJhbWVcbiAqXG4gKiAgQG1ldGhvZCB7dm9pZH0gYnVpbGRDb250ZW50KCkgLSBidWlsZHMgYSBzdHJpbmcgb2YgdGhlIGVsZW1lbnQgYXMgYSBmdWxsIGh0bWwgZG9jdW1lbnRcbiAqICAgIGFuZCBhc3NpZ25zIGl0IGFzIHRoZSBkb2N1bWVudCBvZiB0aGUgaWZyYW1lLlxuICogIEBtZXRob2Qge3ZvaWR9IGF1dG9IZWlnaHQoKSAtIGFsdGVycyB0aGUgaGVpZ2h0IG9mIHRoZSBpZnJhbWUgdG8gYmUgdGhlIG1pbmltdW0gbmVlZGVkIHRvXG4gKiAgICBlbGltaW5hdGUgYSBzY3JvbGxiYXIuICBBdXRvbWF0aWNhbGx5IGNhbGxlZCBvbiBhIHBlciBhbmltYXRpb24gZnJhbWUgYmFzaXMuXG4gKiAgQG1ldGhvZCB7RE9NRWxlbWVudH0gZ2V0RG9jdW1lbnQoKSAtIHJldHVybnMgdGhlIGlmcmFtZSdzIGRvY3VtZW50IG9iamVjdFxuICogIEBtZXRob2Qge3ZvaWR9IHRvZ2dsZUdyaWQoKSAtIGFkZHMvcmVtb3ZlcyB0aGUgJ3Nob3ctZ3JpZCcgY2xhc3MgdG8gdGhlIDxodG1sPiBlbGVtZW50XG4gKiAgICBzbyB3ZSBjYW4gc2hvdyBhIGdyaWQgb3ZlcmxheVxuICogIEBtZXRob2Qge3ZvaWR9IHNldFdpZHRoKHdpZHRoKSAtIHNldHMgdGhlIHdpZHRoIG9mIHRoZSBpZnJhbWUsIHVzZWZ1bCBmb3Igc2hvd2luZ1xuICogICAgbWVkaWEgcXVlcmllc1xuICogICAgQHBhcmFtIHtpbnR9IHdpZHRoIC0gd2lkdGggaW4gcGl4ZWxzLiBSZXNldHMgdG8gZGVmYXVsdCBzaXplIGlmIGZhbHN5XG4gKlxuICogIEBwcm9wIGVsZW1lbnQgLSB0aGUgYWN0dWFsIGlmcmFtZSBlbGVtZW50XG4gKi9cbnZhciBIdG1sU2FtcGxlID0gZnVuY3Rpb24gKHNvdXJjZUVsZW1lbnQpIHtcbiAgdGhpcy5zb3VyY2VFbGVtZW50ID0gc291cmNlRWxlbWVudDtcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgdGhpcy5zb3VyY2VFbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKSk7XG5cbiAgdGhpcy5idWlsZENvbnRlbnQoKTtcbiAgdGhpcy5zb3VyY2VFbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRoaXMuZWxlbWVudCwgdGhpcy5zb3VyY2VFbGVtZW50KTtcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuICAoZnVuY3Rpb24gY2hlY2tJZnJhbWVIZWlnaHQgKCkge1xuICAgIF90aGlzLmF1dG9IZWlnaHQoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2hlY2tJZnJhbWVIZWlnaHQpO1xuICB9KSgpO1xuXG4gIHNhbXBsZXMucHVzaCh0aGlzKTtcbn1cbkh0bWxTYW1wbGUucHJvdG90eXBlID0ge1xuICAvKipcbiAgICogIGJ1aWxkQ29udGVudCBjcmVhdGVzIGEgc3RyaW5nIHRvIHVzZSBhcyB0aGUgZG9jdW1lbnQgZm9yIHRoZSBpZnJhbWVcbiAgICovXG4gIGJ1aWxkQ29udGVudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ZW50ID0gJzwhZG9jdHlwZSBodG1sPic7XG4gICAgY29udGVudCArPSAnPGh0bWwgY2xhc3M9XCJzaG93LWRldiAnICsgKHRoaXMuc291cmNlRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZzJykgPyAnZnMnIDogJ25vdC1mcycpICsgJ1wiPjxoZWFkPic7XG4gICAgZm9yRWFjaChtZXRhcyxmdW5jdGlvbiAobWV0YSkge1xuICAgICAgY29udGVudCArPSBtZXRhLm91dGVySFRNTDtcbiAgICB9KTtcbiAgICBmb3JFYWNoKHN0eWxlcyxmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIGNvbnRlbnQgKz0gJzxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiJyArIHN0eWxlICsgJ1wiPic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSAnPC9oZWFkPjxib2R5Pic7XG4gICAgY29udGVudCArPSB0aGlzLnNvdXJjZUVsZW1lbnQuaW5uZXJIVE1MO1xuICAgIGZvckVhY2goc2NyaXB0cyxmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICBjb250ZW50ICs9ICc8c2NyaXB0IHNyYz1cIicgKyBzY3JpcHQgKyAnXCI+PC9zY3JpcHQ+JztcbiAgICB9KTtcbiAgICBjb250ZW50ICs9IFwiPC9ib2R5PjwvaHRtbD5cIjtcbiAgICB0aGlzLmVsZW1lbnQuc3JjZG9jID0gY29udGVudDtcbiAgfSxcbiAgLyoqXG4gICAqICBhdXRvSGVpZ2h0IHVwZGF0ZXMgdGhlIGhlaWdodCBvZiB0aGUgaWZyYW1lIHRvIGV4YWN0bHkgY29udGFpbiBpdHMgY29udGVudFxuICAgKi9cbiAgYXV0b0hlaWdodDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkb2MgPSB0aGlzLmdldERvY3VtZW50KCk7XG4gICAgdmFyIGRvY0hlaWdodCA9IGdldERvY3VtZW50SGVpZ2h0KGRvYyk7XG4gICAgaWYgKGRvY0hlaWdodCAhPSB0aGlzLmVsZW1lbnQuaGVpZ2h0KVxuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgZG9jSGVpZ2h0KTtcbiAgfSxcbiAgLyoqXG4gICAqICBnZXREb2N1bWVudCBnZXRzIHRoZSBpbnRlcm5hbCBkb2N1bWVudCBvZiB0aGUgaWZyYW1lXG4gICAqL1xuICBnZXREb2N1bWVudDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50IHx8IHRoaXMuZWxlbWVudC5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICB9LFxuICAvKipcbiAgICogIGFkZHMvcmVtb3ZlcyB0aGUgJ3Nob3ctZ3JpZCcgY2xhc3MgdG8gdGhlIDxodG1sPiBlbGVtZW50IHNvIHdlIGNhbiBzaG93IGEgZ3JpZCBvdmVybGF5XG4gICAqL1xuICB0b2dnbGVHcmlkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nZXREb2N1bWVudCgpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJylbMF0uY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy1ncmlkJyk7XG4gIH0sXG4gIC8qKlxuICAgKiAgc2V0cyB0aGUgd2lkdGggb2YgdGhlIGlmcmFtZSwgdXNlZnVsIGZvciBzaG93aW5nIG1lZGlhIHF1ZXJpZXNcbiAgICovXG4gIHNldFdpZHRoOiBmdW5jdGlvbiAodykge1xuICAgIGlmICh3KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB3ICsgJ3B4JztcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdyZXNpemVkJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJyc7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplZCcpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlSHRtbFNhbXBsZXMgKCkge1xuICAvLyBnZXQgc3R5bGVzIGFuZCBzY3JpcHRzXG4gIHN0eWxlcyA9IHdpbmRvdy5hZyAmJiB3aW5kb3cuYWcuc3R5bGVzIHx8IFtdO1xuICBzY3JpcHRzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zY3JpcHRzIHx8IFtdO1xuICAvLyBnZXQgYWxsIG91ciBjdXN0b20gZWxlbWVudHNcbiAgdmFyIGVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYWtlLWlmcmFtZScpO1xuICBmb3IgKHZhciBpID0gZWxzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgbmV3IEh0bWxTYW1wbGUoZWxzW2ldKTtcbiAgfTtcbn1cblxuLyoqKlxuICogIFRvZ2dsZSBIVE1MIFNhbXBsZSBHcmlkc1xuICpcbiAqICBUb2dnbGVzIGEgYC5zaG93LWdyaWRgIGNsYXNzIG9uIHRoZSBgPGh0bWw+YCBlbGVtZW50IGluc2lkZSBhbGwgdGhlXG4gKiAgaWZyYW1lcy4gIFdpdGggdGhlIGluLWZyYW1lLmNzcyBzdHlsZXNoZWV0IGluY2x1ZGVkLCB0aGlzIHdpbGwgdHVybiBvbiBhIDEyXG4gKiAgY29sdW1uIGdyaWQgb3ZlcmxheS5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9tYWtlSHRtbFNhbXBsZXMnKS50b2dnbGVHcmlkcygpXG4gKi9cbnZhciB0b2dnbGVHcmlkcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yRWFjaChzYW1wbGVzLCBmdW5jdGlvbiAocykge1xuICAgIHMudG9nZ2xlR3JpZCgpO1xuICB9KTtcbn1cblxuLyoqKlxuICogIHNldFdpZHRoc1xuICpcbiAqICBTZXRzIGFsbCBgSHRtbFNhbXBsZWBzIHRvIHRoZSBwcm92aWRlZCB3aWR0aC5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykuc2V0V2lkdGhzKHdpZHRoKTtcbiAqXG4gKiAgQHBhcmFtIHtpbnR9IHdpZHRoXG4gKi9cbnZhciBzZXRXaWR0aHMgPSBmdW5jdGlvbiAodykge1xuICBmb3JFYWNoKHNhbXBsZXMsIGZ1bmN0aW9uIChzKSB7XG4gICAgcy5zZXRXaWR0aCh3KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSHRtbFNhbXBsZTtcbm1vZHVsZS5leHBvcnRzLm1ha2VBbGwgPSBtYWtlSHRtbFNhbXBsZXM7XG5tb2R1bGUuZXhwb3J0cy50b2dnbGVHcmlkcyA9IHRvZ2dsZUdyaWRzO1xubW9kdWxlLmV4cG9ydHMuc2V0V2lkdGhzID0gc2V0V2lkdGhzO1xuIiwiLyoqKlxuICogIENvbnRyb2xzXG4gKlxuICogIFdoZW4gcmVxdWlyZWQsIGF1dG9tYXRpY2FsbHkgZW5hYmxlcyBjb250cm9sIGJ1dHRvbnMvdG9nZ2xlcy5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9jb250cm9scycpO1xuICovXG4vLyByZXF1aXJlbWVudHNcbnZhciB0b2dnbGVHcmlkcyA9IHJlcXVpcmUoJ2FwcC9IdG1sU2FtcGxlJykudG9nZ2xlR3JpZHM7XG52YXIgc2V0V2lkdGhzID0gcmVxdWlyZSgnYXBwL0h0bWxTYW1wbGUnKS5zZXRXaWR0aHM7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGdldCBlbGVtZW50cyBhbmQgYXBwbHkgbGlzdGVuZXJzXG52YXIgc2hvd0dyaWRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dHcmlkcycpO1xuaWYgKHNob3dHcmlkcylcbiAgc2hvd0dyaWRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVHcmlkcygpO1xuICB9KTtcblxudmFyIHNob3dEZXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd0RldicpO1xuaWYgKHNob3dEZXYpXG4gIHNob3dEZXYuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy1kZXYnKTtcbiAgfSk7XG5cbi8vIHNpemUgaWZyYW1lc1xudmFyIHNpemVNb2JpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2l6ZU1vYmlsZScpO1xuaWYgKHNpemVNb2JpbGUpXG4gIHNpemVNb2JpbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZXRXaWR0aHMoMzIwKTtcbiAgfSk7XG4iLCIvKipcbiAqICB3aG9sZSBkYW1uIHNjcmlwdFxuICpcbiAqICBUaGlzIHNob3VsZCBpbmNsdWRlIG9iamVjdHMsIHdoaWNoIGluIHR1cm4gaW5jbHVkZSB0aGUgbGliIGZpbGVzIHRoZXkgbmVlZC5cbiAqICBUaGlzIGtlZXBzIHVzIHVzaW5nIGEgbW9kdWxhciBhcHByb2FjaCB0byBkZXYgd2hpbGUgYWxzbyBvbmx5IGluY2x1ZGluZyB0aGVcbiAqICBwYXJ0cyBvZiB0aGUgbGlicmFyeSB3ZSBuZWVkLlxuICovXG5yZXF1aXJlKCdhcHAvSHRtbFNhbXBsZScpLm1ha2VBbGwoKTtcbnJlcXVpcmUoJ2FwcC9jb250cm9scycpO1xuIl19
