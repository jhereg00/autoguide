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
