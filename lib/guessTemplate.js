/**
 * Guesses what template to use based on defined variables
 */
function guessTemplate (object) {
  if (object.js) {
    return 'js';
  }
  else if (object.html) {
    return 'html';
  }
  else if (object.code || object.css || object.scss)
    return 'code';

  // fallback
  return 'default';
}

module.exports = guessTemplate;
