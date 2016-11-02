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
