/***
 * Tray
 *
 * The collapsable sidebar, with possibility of multiple tiers.
 *
 * @param {DOMElement} element
 *
 * @prop {TrayTier array} tiers
 * @prop {boolean} isOpen
 *
 * @method {void} close() - close tray and all its tiers
 * @method {void} closeTiers() - close all tiers
 * @method {void} checkShouldClose() - check if we need to close the tray due to all tiers being closed
 * @method {void} updatePosition() - update top/bottom of element, assuming fixed pos
 */
// requirements

// settings

// the class
var Tray = function (element) {
  this.element = element;
  this.offsetParent = element.parentElement;
  this.isOpen = this.element.classList.contains('is-open');
  this.tiers = [];

  var tierEls = this.element.querySelectorAll('.tray__tier');
  for (var i = 0, len = tierEls.length; i < len; i++) {
    this.tiers.push(new TrayTier (tierEls[i], this));
  }

  var _this = this;
  var lastScroll = 0;
  (function checkScroll () {
    if (window.scrollY !== lastScroll) {
      _this.updatePosition();
      lastScroll = window.scrollY;
    }
    window.requestAnimationFrame(checkScroll);
  })();
  this.updatePosition();
}
Tray.prototype = {
  setOpen: function () {
    this.element.classList.add('is-open');
  },
  setClosed: function () {
    this.element.classList.remove('is-open');
  },
  close: function () {
    this.closeTiers();
    this.setClosed();
  },
  closeTiers: function () {
    for (var i = 0, len = this.tiers.length; i < len; i++) {
      this.tiers[i].close();
    }
  },
  checkShouldClose: function () {
    for (var i = 0, len = this.tiers.length; i < len; i++) {
      if (this.tiers[i].isOpen)
        return;
    }
    this.setClosed();
  },
  updatePosition: function () {
    var clipRect = this.offsetParent.getClientRects()[0];
    var top = Math.max(clipRect.top, 0);
    var bottom = Math.max(window.innerHeight - clipRect.bottom, 0);
    this.element.style.top = top + 'px';
    this.element.style.bottom = bottom + 'px';
  }
}

/***
 * Tray Tier
 *
 * Individual tier of the tray.  Closes other tiers when opened, and marks parent
 * tray open as well.
 *
 * @param {DOMElement} element
 * @param {Tray} parentTray
 *
 * @method {void} open()
 * @method {void} close()
 * @method {void} toggle()
 *
 * @prop {boolean} isOpen
 */
var TrayTier = function (element, parentTray) {
  this.element = element;
  this.parentTray = parentTray;

  this.toggleElement = element.querySelector('.tray__opener');
  var _this = this;
  if (this.toggleElement) {
    this.toggleElement.addEventListener('click', function () {
      _this.toggle();
    });
  }
}
TrayTier.prototype = {
  open: function () {
    this.parentTray.closeTiers();
    this.element.classList.add('is-open');
    this.isOpen = true;
    this.parentTray.setOpen();
  },
  close: function () {
    this.element.classList.remove('is-open');
    this.isOpen = false;
    this.parentTray.checkShouldClose();
  },
  toggle: function () {
    return this.isOpen ? this.close() : this.open();
  }
}

// autoinit
var trayEls = document.querySelectorAll('.tray');
for (var i = 0, len = trayEls.length; i < len; i++) {
  new Tray(trayEls[i]);
}
