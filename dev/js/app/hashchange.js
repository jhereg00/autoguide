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
