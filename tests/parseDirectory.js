var expect = require('chai').expect;

var parseDirectory = require('../lib/parseDirectory');

var testDirectory = './tests/test-data/';

describe('parseDirectory', function () {
  var err, parsed;
  before(function (done) {
    parseDirectory(testDirectory, function (_err, _data) {
      err = _err;
      parsed = _data;
      done();
    });
  });
  it ('returns an array of all comments found in all files in the directory', function () {
    expect(err).to.be.null;
    expect(parsed.length).to.equal(7);
  });
})
