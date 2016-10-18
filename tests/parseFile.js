var expect = require('chai').expect;

var parseFile = require('../lib/parseFile');

var testFile = './tests/test-data/test-file-1.scss';

describe('parseFile', function () {
  var err;
  var parsed;
  before(function (done) {
    parseFile(testFile, function (_err, data) {
      err = _err;
      parsed = data;
      done();
    });
  });
  it('returns an array of parsed comments', function () {
    expect(err).to.be.null;
    expect(parsed.length).to.equal(4);
    expect(parsed[0].title).to.equal('First Comment Title');
  });
  it('adds a property to each comment identifying its parent path relative to caller as an array', function () {
    expect(parsed[1].filePath).to.eql(testFile.split('/'));
  });
  it ('passes content to be used to parse sassVars', function () {
    var colorsObject;
    for (var i = 0, len = parsed.length; i < len; i++) {
      if (parsed[i].title === 'Colors') {
        colorsObject = parsed[i];
        break;
      }
    }
    expect(colorsObject).to.exist;
    expect(colorsObject.sassVars).to.exist;
    expect(colorsObject.sassVars.$white).to.equal('#ffffff');
    expect(parsed[0].sassVars).to.not.exist;
  });
});
