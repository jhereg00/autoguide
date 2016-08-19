var expect = require('chai').expect;

var parseSassVars = require('../lib/parseSassVars');

var testFile = './tests/test-data/test-vars.scss';
var testDir = './tests/test-data';
describe('parseSassVars', function () {
  var parsed;
  before(function (done) {
    parseSassVars(testFile, function (err, data) {
      parsed = data;
      done();
    });
  });
  it('returns an array of one object when passed a filename', function () {
    expect(parsed).to.be.an('Array');
    expect(parsed.length).to.equal(1);
    expect(parsed[0].filePath).to.equal(testFile);
    expect(parsed[0].vars.$white).to.equal('#ffffff');
  });
  it('should name the objects in the array', function () {
    expect(parsed[0].title).to.exist;
    expect(parsed[0].title).to.equal('test-vars');
  });
  it('returns an array of objects with parsed files when passed a dir name, skipping ones with no vars', function (done) {
    parseSassVars(testDir, function fromMocha (err, data) {
      parsed = data;

      expect(parsed).to.be.an('Array');
      expect(parsed.length).to.equal(2);

      done();
    });
  });
});
