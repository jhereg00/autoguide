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
