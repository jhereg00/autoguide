(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
 *    makeHtmlSamples(); // goes through the whole page and does its thing
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
}
HtmlSample.prototype = {
  /**
   *  buildContent creates a string to use as the document for the iframe
   */
  buildContent: function () {
    var content = '<!doctype html>';
    content += '<html><head>';
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

},{}],2:[function(require,module,exports){
/**
 *  whole damn script
 *
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */
require('app/makeHtmlSamples')();

},{"app/makeHtmlSamples":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvbWFrZUh0bWxTYW1wbGVzLmpzIiwiYXV0b2d1aWRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKipcbiAqICBIdG1sIFNhbXBsZVxuICpcbiAqICBTZWFyY2hlcyBmb3IgYWxsIGA8bWFrZS1pZnJhbWU+YCBlbGVtZW50cyBhbmQgZG9lcyBqdXN0IHRoYXQ6IG1ha2VzIHRoZW0gaWZyYW1lcy5cbiAqICBJdCBhbHNvIGluY2x1ZGVzIHRoZSBzdHlsZXNoZWV0cyBhbmQgc2NyaXB0cyBwcmVzZW50IGluIHRoZSB3aW5kb3cgbGV2ZWwgYGFnYFxuICogIG9iamVjdC4gIFRob3NlIHNob3VsZCBiZSBwb3B1bGF0ZWQgYnkgdGhlIHRlbXBsYXRlLlxuICpcbiAqICBUaGlzIGNvZGUgaXMgYmFzZWQgXyoqaGVhdmlseSoqXyBvbiBbaWZyYW1pZnldKGh0dHBzOi8vZ2l0aHViLmNvbS9lZGVuc3BpZWtlcm1hbm4vaWZyYW1pZnkvYmxvYi9tYXN0ZXIvaWZyYW1pZnkuanMpLlxuICogIFNvLCB0aGFua3MgdG8gdGhhdCBIdWdvIEdpcmF1ZGVsIGd1eS5cbiAqXG4gKiAgY29kZTpcbiAqICAgIG1ha2VIdG1sU2FtcGxlcygpOyAvLyBnb2VzIHRocm91Z2ggdGhlIHdob2xlIHBhZ2UgYW5kIGRvZXMgaXRzIHRoaW5nXG4gKi9cbi8vIHJlcXVpcmVtZW50c1xuXG4vLyBzZXR0aW5nc1xuXG4vLyBoZWxwZXJzXG4vKipcbiAqIEdldCBkb2N1bWVudCBoZWlnaHQgKHN0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTQ1ODUwLylcbiAqXG4gKiBAcGFyYW0gIHtEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldERvY3VtZW50SGVpZ2h0IChkb2MpIHtcbiAgZG9jID0gZG9jIHx8IGRvY3VtZW50O1xuICB2YXIgYm9keSA9IGRvYy5ib2R5O1xuICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgaWYgKCFib2R5IHx8ICFodG1sKVxuICAgIHJldHVybiAwO1xuXG4gIHJldHVybiBNYXRoLm1heChcbiAgICBib2R5LnNjcm9sbEhlaWdodCwgYm9keS5vZmZzZXRIZWlnaHQsXG4gICAgaHRtbC5jbGllbnRIZWlnaHQsIGh0bWwuc2Nyb2xsSGVpZ2h0LCBodG1sLm9mZnNldEhlaWdodFxuICApO1xufVxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gYXJyYXksIHBhc3NpbmcgdGhlIHZhbHVlIHRvIHRoZSBwYXNzZWQgZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiB0byBjYWxsXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2ggKGFyciwgZm4pIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGZuLmNhbGwoYXJyW2ldLGFycltpXSxhcnIpO1xuICB9XG59XG5cbi8vIGRvIHRoaW5ncyFcbi8vIGdldCBzb21lIG1ldGEgdGFnc1xudmFyIG1ldGFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YScpO1xudmFyIHN0eWxlcywgc2NyaXB0cztcblxudmFyIEh0bWxTYW1wbGUgPSBmdW5jdGlvbiAoc291cmNlRWxlbWVudCkge1xuICB0aGlzLnNvdXJjZUVsZW1lbnQgPSBzb3VyY2VFbGVtZW50O1xuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCB0aGlzLnNvdXJjZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpKTtcblxuICB0aGlzLmJ1aWxkQ29udGVudCgpO1xuICB0aGlzLnNvdXJjZUVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQodGhpcy5lbGVtZW50LCB0aGlzLnNvdXJjZUVsZW1lbnQpO1xuXG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIChmdW5jdGlvbiBjaGVja0lmcmFtZUhlaWdodCAoKSB7XG4gICAgX3RoaXMuc2V0U2l6ZSgpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjaGVja0lmcmFtZUhlaWdodCk7XG4gIH0pKCk7XG59XG5IdG1sU2FtcGxlLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqICBidWlsZENvbnRlbnQgY3JlYXRlcyBhIHN0cmluZyB0byB1c2UgYXMgdGhlIGRvY3VtZW50IGZvciB0aGUgaWZyYW1lXG4gICAqL1xuICBidWlsZENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGVudCA9ICc8IWRvY3R5cGUgaHRtbD4nO1xuICAgIGNvbnRlbnQgKz0gJzxodG1sPjxoZWFkPic7XG4gICAgZm9yRWFjaChtZXRhcyxmdW5jdGlvbiAobWV0YSkge1xuICAgICAgY29udGVudCArPSBtZXRhLm91dGVySFRNTDtcbiAgICB9KTtcbiAgICBmb3JFYWNoKHN0eWxlcyxmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIGNvbnRlbnQgKz0gJzxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiJyArIHN0eWxlICsgJ1wiPic7XG4gICAgfSk7XG4gICAgY29udGVudCArPSAnPC9oZWFkPjxib2R5Pic7XG4gICAgY29udGVudCArPSB0aGlzLnNvdXJjZUVsZW1lbnQuaW5uZXJIVE1MO1xuICAgIGZvckVhY2goc2NyaXB0cyxmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICBjb250ZW50ICs9ICc8c2NyaXB0IHNyYz1cIicgKyBzY3JpcHQgKyAnXCI+PC9zY3JpcHQ+JztcbiAgICB9KTtcbiAgICBjb250ZW50ICs9IFwiPC9ib2R5PjwvaHRtbD5cIjtcbiAgICB0aGlzLmVsZW1lbnQuc3JjZG9jID0gY29udGVudDtcbiAgfSxcbiAgLyoqXG4gICAqICBzZXRTaXplIHVwZGF0ZXMgdGhlIGhlaWdodCBvZiB0aGUgaWZyYW1lIHRvIGV4YWN0bHkgY29udGFpbiBpdHMgY29udGVudFxuICAgKi9cbiAgc2V0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkb2MgPSB0aGlzLmdldERvY3VtZW50KCk7XG4gICAgdmFyIGRvY0hlaWdodCA9IGdldERvY3VtZW50SGVpZ2h0KGRvYyk7XG4gICAgaWYgKGRvY0hlaWdodCAhPSB0aGlzLmVsZW1lbnQuaGVpZ2h0KVxuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgZG9jSGVpZ2h0KTtcbiAgfSxcbiAgLyoqXG4gICAqICBnZXREb2N1bWVudCBnZXRzIHRoZSBpbnRlcm5hbCBkb2N1bWVudCBvZiB0aGUgaWZyYW1lXG4gICAqL1xuICBnZXREb2N1bWVudDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50IHx8IHRoaXMuZWxlbWVudC5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VIdG1sU2FtcGxlcyAoKSB7XG4gIC8vIGdldCBzdHlsZXMgYW5kIHNjcmlwdHNcbiAgc3R5bGVzID0gd2luZG93LmFnICYmIHdpbmRvdy5hZy5zdHlsZXMgfHwgW107XG4gIHNjcmlwdHMgPSB3aW5kb3cuYWcgJiYgd2luZG93LmFnLnNjcmlwdHMgfHwgW107XG4gIC8vIGdldCBhbGwgb3VyIGN1c3RvbSBlbGVtZW50c1xuICB2YXIgZWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ha2UtaWZyYW1lJyk7XG4gIGZvciAodmFyIGkgPSBlbHMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICBuZXcgSHRtbFNhbXBsZShlbHNbaV0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1ha2VIdG1sU2FtcGxlcztcbiIsIi8qKlxuICogIHdob2xlIGRhbW4gc2NyaXB0XG4gKlxuICogIFRoaXMgc2hvdWxkIGluY2x1ZGUgb2JqZWN0cywgd2hpY2ggaW4gdHVybiBpbmNsdWRlIHRoZSBsaWIgZmlsZXMgdGhleSBuZWVkLlxuICogIFRoaXMga2VlcHMgdXMgdXNpbmcgYSBtb2R1bGFyIGFwcHJvYWNoIHRvIGRldiB3aGlsZSBhbHNvIG9ubHkgaW5jbHVkaW5nIHRoZVxuICogIHBhcnRzIG9mIHRoZSBsaWJyYXJ5IHdlIG5lZWQuXG4gKi9cbnJlcXVpcmUoJ2FwcC9tYWtlSHRtbFNhbXBsZXMnKSgpO1xuIl19
