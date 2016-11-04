/***
 * Update Input
 *
 * Automatically update an input's value on click of an element.
 *
 * The element is expected to have `[data-update={inputName}]`. If it has the class
 * `js-update-input`, it will be initialized automatically.
 *
 * @param {DOMElement} element
 *
 * html:
 *   <input name="example">
 *   <button class="button js-update-input" data-update="example" value="200">Make 200</button>
 *
 * js:
 *   var updateBtn = new UpdateInput(document.querySelector('[data-update]'));
 */
// requirements

// settings

// class
var UpdateInput = function (element) {
  this.element = element;
  this.input = document.querySelector('[name="' + element.getAttribute('data-update') + '"]');

  if (this.element && this.input) {
    var _this = this;
    this.element.addEventListener('click', function (e) {
      e.preventDefault();
      _this.input.value = this.value;
      if ("createEvent" in document) {
          var evt = document.createEvent("HTMLEvents");
          evt.initEvent("change", false, true);
          _this.input.dispatchEvent(evt);
      }
      else
          _this.input.fireEvent("onchange");
    });
  }
}

// auto init
var updateInputEls = document.querySelectorAll('.js-update-input');
for (var i = 0, len = updateInputEls.length; i < len; i++) {
  new UpdateInput(updateInputEls[i]);
}
