/**
 * Guesses what template to use based on defined variables
 */
function guessTemplate (object) {
  if (object.html)
    return 'html';

  // fallback
  return 'default';
}

module.exports = guessTemplate;
