/***
 * Collapsable
 *
 * Auto-initialized class that looks for `.js-collapsable` with `.js-collapsable__toggle`
 * and `.js-collapsable__content`.
 *
 * Add the class `is-open` to the `.js-collapsable` element to have it open itself
 * immediately.  `is-open` is also the state class that gets toggled.
 *
 * @param {DOMElement} element
 *   expected to have children with `.js-collapsable__toggle` and `.js-collapsable__content`
 *
 * @method {void} toggle() - toggles open/closed
 * @method {void} open() - opens __content, or does nothing if already open
 * @method {void} close() - closes __content, or does nothing if already closed
 *
 * @prop {boolean} isOpen
 *
 * html:
 *   <div class="js-collapsable">
 *     <button class="js-collapsable__toggle">Toggle</button>
 *     <div class="js-collapsable__content">
 *       <ul><li>fill</li><li>some</li><li>space</li></ul>
 *     </div>
 *   </div>
 *
 * js:
 *   // create (not necessary, since it already looks for all .js-collapsable elements)
 *   var collapsable = new Collapsable (document.querySelector('.js-collapsable'));
 *   // toggle it open/closed
 *   collapsable.toggle();
 */
// requirements

// settings

// main class
var Collapsable = function (element) {
  this.element = element;
  this.toggleElement = element.querySelector('.js-collapsable__toggle');
  this.contentElement = element.querySelector('.js-collapsable__content');

  if (!this.element || !this.toggleElement || !this.contentElement) {
    return console.error(this.element, this.toggleElement, this.contentElement);
  }
  else {
    var _this = this;
    this.toggleElement.addEventListener('click', function (e) {
      e.preventDefault();
      _this.toggle();
    });

    if (this.element.classList.contains('is-open')) {
      this.open();
    }
  }
}
Collapsable.prototype = {
  toggle: function () {
    return this.isOpen ? this.close() : this.open();
  },
  open: function () {
    this.element.classList.add('is-open');
    this.contentElement.style.height = this.contentElement.scrollHeight + 'px';
    this.isOpen = true;
  },
  close: function () {
    this.element.classList.remove('is-open');
    this.contentElement.style.height = '0';
    this.isOpen = false;
  }
}

// init them all
var collapsableEls = document.querySelectorAll('.js-collapsable');
for (var i = 0, len = collapsableEls.length; i < len; i++) {
  new Collapsable(collapsableEls[i]);
}
