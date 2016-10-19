var expect = require('chai').expect;
var util = require('util');

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
      //console.log(util.inspect(sorted));
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
    expect(sorted[sorted.length - 1].title.toLowerCase()).to.equal(testOrder[2]);
    expect(sorted[1].title).to.not.equal(testOrder[0]).and.to.not.equal(testOrder[2]);
  });
  it('should nest subElements', function () {
    expect(sorted[0].subElements).to.exist.and.to.be.an('array');
  });
  it('should honor user defined paths', function () {
    for(var someIndex = 0; someIndex < sorted.length && sorted[someIndex].title != "some"; someIndex++){};
    expect(sorted[someIndex].subElements[0].title).to.equal('arbitrary');
    expect(sorted[someIndex].subElements[0].subElements[0].subElements[0]).to.exist;
  });
  it('should honor user defined order vars', function () {
    for(var order1Index = 0; order1Index < sorted.length && sorted[order1Index].order != 1; order1Index++){};
    for(var order2Index = 0; order2Index < sorted.length && sorted[order2Index].order != 2; order2Index++){};
    expect(order1Index).to.be.below(order2Index);
  });
});
