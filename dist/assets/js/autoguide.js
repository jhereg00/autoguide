(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/***
 *  Controls
 *
 *  When required, automatically enables control buttons/toggles.
 *
 *  code:
 *    require('app/controls');
 */
// requirements
var toggleGrids = require('app/makeHtmlSamples').toggleGrids;

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

},{"app/makeHtmlSamples":2}],2:[function(require,module,exports){
/***
 *  Html Sample
 *
 *  Searches for all `<make-iframe>` elements and does just that: makes them iframes.
 *  It also includes the stylesheets and scripts present in the window level `ag`
 *  object.  Those should be populated by the template.
 *
 *  This code is based _**heavily**_ on [iframify](https://github.com/edenspiekermann/iframify/blob/master/iframify.js).
 *  So, thanks to that Hugo Giraudel guy.
 *
 *  code:
 *    require('app/makeHtmlSamples')(); // goes through the whole page and does its thing
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

var HtmlSample = function (sourceElement) {
  this.sourceElement = sourceElement;
  this.element = document.createElement('iframe');
  this.element.setAttribute('class', this.sourceElement.getAttribute('class'));

  this.buildContent();
  this.sourceElement.parentNode.replaceChild(this.element, this.sourceElement);

  var _this = this;
  (function checkIframeHeight () {
    _this.setSize();
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
   *  setSize updates the height of the iframe to exactly contain its content
   */
  setSize: function () {
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

module.exports = makeHtmlSamples;

/***
 *  Toggle HTML Sample Grids
 *
 *  Toggles a `.show-grid` class on the `&lt;html&gt;` element inside all the
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
module.exports.toggleGrids = toggleGrids;

},{}],3:[function(require,module,exports){
/**
 *  whole damn script
 *
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */
require('app/makeHtmlSamples')();
require('app/controls');

},{"app/controls":1,"app/makeHtmlSamples":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvY29udHJvbHMuanMiLCJhcHAvbWFrZUh0bWxTYW1wbGVzLmpzIiwiYXV0b2d1aWRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKipcbiAqICBDb250cm9sc1xuICpcbiAqICBXaGVuIHJlcXVpcmVkLCBhdXRvbWF0aWNhbGx5IGVuYWJsZXMgY29udHJvbCBidXR0b25zL3RvZ2dsZXMuXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvY29udHJvbHMnKTtcbiAqL1xuLy8gcmVxdWlyZW1lbnRzXG52YXIgdG9nZ2xlR3JpZHMgPSByZXF1aXJlKCdhcHAvbWFrZUh0bWxTYW1wbGVzJykudG9nZ2xlR3JpZHM7XG5cbi8vIHNldHRpbmdzXG5cbi8vIGdldCBlbGVtZW50cyBhbmQgYXBwbHkgbGlzdGVuZXJzXG52YXIgc2hvd0dyaWRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dHcmlkcycpO1xuaWYgKHNob3dHcmlkcylcbiAgc2hvd0dyaWRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICB0b2dnbGVHcmlkcygpO1xuICB9KTtcblxudmFyIHNob3dEZXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd0RldicpO1xuaWYgKHNob3dEZXYpXG4gIHNob3dEZXYuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy1kZXYnKTtcbiAgfSk7XG4iLCIvKioqXG4gKiAgSHRtbCBTYW1wbGVcbiAqXG4gKiAgU2VhcmNoZXMgZm9yIGFsbCBgPG1ha2UtaWZyYW1lPmAgZWxlbWVudHMgYW5kIGRvZXMganVzdCB0aGF0OiBtYWtlcyB0aGVtIGlmcmFtZXMuXG4gKiAgSXQgYWxzbyBpbmNsdWRlcyB0aGUgc3R5bGVzaGVldHMgYW5kIHNjcmlwdHMgcHJlc2VudCBpbiB0aGUgd2luZG93IGxldmVsIGBhZ2BcbiAqICBvYmplY3QuICBUaG9zZSBzaG91bGQgYmUgcG9wdWxhdGVkIGJ5IHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiAgVGhpcyBjb2RlIGlzIGJhc2VkIF8qKmhlYXZpbHkqKl8gb24gW2lmcmFtaWZ5XShodHRwczovL2dpdGh1Yi5jb20vZWRlbnNwaWVrZXJtYW5uL2lmcmFtaWZ5L2Jsb2IvbWFzdGVyL2lmcmFtaWZ5LmpzKS5cbiAqICBTbywgdGhhbmtzIHRvIHRoYXQgSHVnbyBHaXJhdWRlbCBndXkuXG4gKlxuICogIGNvZGU6XG4gKiAgICByZXF1aXJlKCdhcHAvbWFrZUh0bWxTYW1wbGVzJykoKTsgLy8gZ29lcyB0aHJvdWdoIHRoZSB3aG9sZSBwYWdlIGFuZCBkb2VzIGl0cyB0aGluZ1xuICovXG4vLyByZXF1aXJlbWVudHNcblxuLy8gc2V0dGluZ3NcblxuLy8gaGVscGVyc1xuLyoqXG4gKiBHZXQgZG9jdW1lbnQgaGVpZ2h0IChzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTE0NTg1MC8pXG4gKlxuICogQHBhcmFtICB7RG9jdW1lbnR9IGRvY1xuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXREb2N1bWVudEhlaWdodCAoZG9jKSB7XG4gIGRvYyA9IGRvYyB8fCBkb2N1bWVudDtcbiAgdmFyIGJvZHkgPSBkb2MuYm9keTtcbiAgdmFyIGh0bWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG4gIGlmICghYm9keSB8fCAhaHRtbClcbiAgICByZXR1cm4gMDtcblxuICByZXR1cm4gTWF0aC5tYXgoXG4gICAgYm9keS5zY3JvbGxIZWlnaHQsIGJvZHkub2Zmc2V0SGVpZ2h0LFxuICAgIGh0bWwuY2xpZW50SGVpZ2h0LCBodG1sLnNjcm9sbEhlaWdodCwgaHRtbC5vZmZzZXRIZWlnaHRcbiAgKTtcbn1cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIGFycmF5LCBwYXNzaW5nIHRoZSB2YWx1ZSB0byB0aGUgcGFzc2VkIGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gdG8gY2FsbFxuICovXG5mdW5jdGlvbiBmb3JFYWNoIChhcnIsIGZuKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBmbi5jYWxsKGFycltpXSxhcnJbaV0sYXJyKTtcbiAgfVxufVxuXG4vLyBkbyB0aGluZ3MhXG4vLyBnZXQgc29tZSBtZXRhIHRhZ3NcbnZhciBtZXRhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGEnKTtcbnZhciBzdHlsZXMsIHNjcmlwdHM7XG52YXIgc2FtcGxlcyA9IFtdO1xuXG52YXIgSHRtbFNhbXBsZSA9IGZ1bmN0aW9uIChzb3VyY2VFbGVtZW50KSB7XG4gIHRoaXMuc291cmNlRWxlbWVudCA9IHNvdXJjZUVsZW1lbnQ7XG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsIHRoaXMuc291cmNlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykpO1xuXG4gIHRoaXMuYnVpbGRDb250ZW50KCk7XG4gIHRoaXMuc291cmNlRWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh0aGlzLmVsZW1lbnQsIHRoaXMuc291cmNlRWxlbWVudCk7XG5cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgKGZ1bmN0aW9uIGNoZWNrSWZyYW1lSGVpZ2h0ICgpIHtcbiAgICBfdGhpcy5zZXRTaXplKCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrSWZyYW1lSGVpZ2h0KTtcbiAgfSkoKTtcblxuICBzYW1wbGVzLnB1c2godGhpcyk7XG59XG5IdG1sU2FtcGxlLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqICBidWlsZENvbnRlbnQgY3JlYXRlcyBhIHN0cmluZyB0byB1c2UgYXMgdGhlIGRvY3VtZW50IGZvciB0aGUgaWZyYW1lXG4gICAqL1xuICBidWlsZENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGVudCA9ICc8IWRvY3R5cGUgaHRtbD4nO1xuICAgIGNvbnRlbnQgKz0gJzxodG1sIGNsYXNzPVwic2hvdy1kZXYgJyArICh0aGlzLnNvdXJjZUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmcycpID8gJ2ZzJyA6ICdub3QtZnMnKSArICdcIj48aGVhZD4nO1xuICAgIGZvckVhY2gobWV0YXMsZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgIGNvbnRlbnQgKz0gbWV0YS5vdXRlckhUTUw7XG4gICAgfSk7XG4gICAgZm9yRWFjaChzdHlsZXMsZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICBjb250ZW50ICs9ICc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIicgKyBzdHlsZSArICdcIj4nO1xuICAgIH0pO1xuICAgIGNvbnRlbnQgKz0gJzwvaGVhZD48Ym9keT4nO1xuICAgIGNvbnRlbnQgKz0gdGhpcy5zb3VyY2VFbGVtZW50LmlubmVySFRNTDtcbiAgICBmb3JFYWNoKHNjcmlwdHMsZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgY29udGVudCArPSAnPHNjcmlwdCBzcmM9XCInICsgc2NyaXB0ICsgJ1wiPjwvc2NyaXB0Pic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSBcIjwvYm9keT48L2h0bWw+XCI7XG4gICAgdGhpcy5lbGVtZW50LnNyY2RvYyA9IGNvbnRlbnQ7XG4gIH0sXG4gIC8qKlxuICAgKiAgc2V0U2l6ZSB1cGRhdGVzIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSB0byBleGFjdGx5IGNvbnRhaW4gaXRzIGNvbnRlbnRcbiAgICovXG4gIHNldFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9jID0gdGhpcy5nZXREb2N1bWVudCgpO1xuICAgIHZhciBkb2NIZWlnaHQgPSBnZXREb2N1bWVudEhlaWdodChkb2MpO1xuICAgIGlmIChkb2NIZWlnaHQgIT0gdGhpcy5lbGVtZW50LmhlaWdodClcbiAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGRvY0hlaWdodCk7XG4gIH0sXG4gIC8qKlxuICAgKiAgZ2V0RG9jdW1lbnQgZ2V0cyB0aGUgaW50ZXJuYWwgZG9jdW1lbnQgb2YgdGhlIGlmcmFtZVxuICAgKi9cbiAgZ2V0RG9jdW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudCB8fCB0aGlzLmVsZW1lbnQuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgfSxcbiAgLyoqXG4gICAqICBhZGRzL3JlbW92ZXMgdGhlICdzaG93LWdyaWQnIGNsYXNzIHRvIHRoZSA8aHRtbD4gZWxlbWVudCBzbyB3ZSBjYW4gc2hvdyBhIGdyaWQgb3ZlcmxheVxuICAgKi9cbiAgdG9nZ2xlR3JpZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2V0RG9jdW1lbnQoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpWzBdLmNsYXNzTGlzdC50b2dnbGUoJ3Nob3ctZ3JpZCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VIdG1sU2FtcGxlcyAoKSB7XG4gIC8vIGdldCBzdHlsZXMgYW5kIHNjcmlwdHNcbiAgc3R5bGVzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zdHlsZXMgfHwgW107XG4gIHNjcmlwdHMgPSB3aW5kb3cuYWcgJiYgd2luZG93LmFnLnNjcmlwdHMgfHwgW107XG4gIC8vIGdldCBhbGwgb3VyIGN1c3RvbSBlbGVtZW50c1xuICB2YXIgZWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ha2UtaWZyYW1lJyk7XG4gIGZvciAodmFyIGkgPSBlbHMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICBuZXcgSHRtbFNhbXBsZShlbHNbaV0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1ha2VIdG1sU2FtcGxlcztcblxuLyoqKlxuICogIFRvZ2dsZSBIVE1MIFNhbXBsZSBHcmlkc1xuICpcbiAqICBUb2dnbGVzIGEgYC5zaG93LWdyaWRgIGNsYXNzIG9uIHRoZSBgJmx0O2h0bWwmZ3Q7YCBlbGVtZW50IGluc2lkZSBhbGwgdGhlXG4gKiAgaWZyYW1lcy4gIFdpdGggdGhlIGluLWZyYW1lLmNzcyBzdHlsZXNoZWV0IGluY2x1ZGVkLCB0aGlzIHdpbGwgdHVybiBvbiBhIDEyXG4gKiAgY29sdW1uIGdyaWQgb3ZlcmxheS5cbiAqXG4gKiAgY29kZTpcbiAqICAgIHJlcXVpcmUoJ2FwcC9tYWtlSHRtbFNhbXBsZXMnKS50b2dnbGVHcmlkcygpXG4gKi9cbnZhciB0b2dnbGVHcmlkcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yRWFjaChzYW1wbGVzLCBmdW5jdGlvbiAocykge1xuICAgIHMudG9nZ2xlR3JpZCgpO1xuICB9KTtcbn1cbm1vZHVsZS5leHBvcnRzLnRvZ2dsZUdyaWRzID0gdG9nZ2xlR3JpZHM7XG4iLCIvKipcbiAqICB3aG9sZSBkYW1uIHNjcmlwdFxuICpcbiAqICBUaGlzIHNob3VsZCBpbmNsdWRlIG9iamVjdHMsIHdoaWNoIGluIHR1cm4gaW5jbHVkZSB0aGUgbGliIGZpbGVzIHRoZXkgbmVlZC5cbiAqICBUaGlzIGtlZXBzIHVzIHVzaW5nIGEgbW9kdWxhciBhcHByb2FjaCB0byBkZXYgd2hpbGUgYWxzbyBvbmx5IGluY2x1ZGluZyB0aGVcbiAqICBwYXJ0cyBvZiB0aGUgbGlicmFyeSB3ZSBuZWVkLlxuICovXG5yZXF1aXJlKCdhcHAvbWFrZUh0bWxTYW1wbGVzJykoKTtcbnJlcXVpcmUoJ2FwcC9jb250cm9scycpO1xuIl19
