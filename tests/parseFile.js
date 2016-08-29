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
    expect(parsed.length).to.equal(3);
    expect(parsed[0].title).to.equal('First Comment Title');
  });
  it('adds a property to each comment identifying its parent path relative to caller as an array', function () {
    expect(parsed[1].filePath).to.eql(testFile.split('/'));
  });
});
