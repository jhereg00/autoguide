/***
 *  Controls and Nav
 *
 *  When required, automatically enables control buttons/toggles.
 *
 *  js:
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
