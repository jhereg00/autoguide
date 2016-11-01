/**
 * Guesses what template to use based on defined variables
 */
function guessTemplate (object) {
  if (object.html)
    return 'html';
  else if (object.code || object.css || object.js || object.scss)
    return 'code';

  // fallback
  return 'default';
}

module.exports = guessTemplate;
