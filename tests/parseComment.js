var expect = require('chai').expect;
var util = require('util');

var parseComment = require('../lib/parseComment');

var testData =
'/***\n' +
' * Test Title\n' +
' * \n' +
' * Test description.\n' +
' * \n' +
' * Test description second paragraph.\n' +
' * \n' +
' * arbitraryVariable: arbitraryValue\n' +
' * \n' +
' * arbitraryDescription:\n' +
' *   This is an arbitrary\n' +
' *   multiline description\n' +
' * \n' +
' *   With a paragraph and _markdown_.\n' +
' * \n' +
' * @arbitraryArray myVal1\n' +
' * @arbitraryArray myVal2\n' +
' * @arbitraryArray myVal3\n' +
' * @otherArray myVal4 - inline description\n' +
' * @otherArray {string} myVal5\n' +
' *   multiline description\n' +
' *   multiline description\n' +
' */';

describe('parseComment', function () {
  var parsed = parseComment(testData);
  //console.log(util.inspect(parsed));
  it ('should return a js object', function () {
    expect(parsed).to.exist;
    expect(typeof parsed).to.equal('object');
  });
  it ('should contain a title property', function () {
    expect(parsed.title).to.exist;
    expect(parsed.title).to.equal('Test Title');
  });
  it ('should contain a description property with formatting preserved.', function () {
    expect(parsed.description).to.exist;
    expect(parsed.description).to.equal(
      'Test description.\n' +
      '\n' +
      'Test description second paragraph.');
  });
  it ('should contain arbitraryVariable', function () {
    expect(parsed['arbitraryVariable']).to.exist;
    expect(parsed['arbitraryVariable']).to.equal('arbitraryValue');
  });
  it ('should contain arbitraryDescription', function () {
    expect(parsed['arbitraryDescription']).to.exist;
    expect(parsed['arbitraryDescription']).to.equal(
      'This is an arbitrary\n' +
      '  multiline description\n' +
      '\n' +
      '  With a paragraph and _markdown_.');
  });
  it ('should contain arbitraryArray', function () {
    expect(parsed['arbitraryArray']).to.exist;
    expect(parsed['arbitraryArray'].length).to.equal(3);
    expect(parsed['arbitraryArray'][1]).to.eql({ name: 'myVal2' });
  });
});
