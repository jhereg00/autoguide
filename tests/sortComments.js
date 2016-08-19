var expect = require('chai').expect;

var sortComments = require('../lib/sortComments');
var parseDirectory = require('../lib/parseDirectory');

var testDir = './tests/test-data';
var testOrder = [
  'subdir',
  '*',
  'first comment title'
];

describe('sortComments', function () {
  var parsed, sorted;
  before(function (done) {
    parseDirectory(testDir, function (err, data) {
      parsed = data;
      sorted = sortComments(parsed, testOrder);
      done();
    });
  });
  it('should return an array', function () {
    expect(sorted).to.be.an('array');
  });
  it('should order based on passed array', function () {
    expect(sorted[0].title.toLowerCase()).to.equal(testOrder[0]);
  });
  it('should put non-matching sections at \'*\' in order array', function () {
    expect(sorted[2].title.toLowerCase()).to.equal(testOrder[2]);
    expect(sorted[1].title).to.not.equal(testOrder[0]).and.to.not.equal(testOrder[2]);
  });
  it('should nest subElements', function () {
    expect(sorted[0].subElements).to.exist.and.to.be.an('array');
  });
});
