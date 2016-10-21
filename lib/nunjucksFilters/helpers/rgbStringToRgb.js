function rgbStringToRgb (str) {
  var result = /^rgba?\((\d{1,3})\s?,\s?(\d{1,3})\s?,\s?(\d{1,3})\s?(,\s?[\.\d]+)\)$/i.exec(str);
  return result ? {
    r: result[1],
    g: result[2],
    b: result[3]
  } : null
}

module.exports = rgbStringToRgb;
