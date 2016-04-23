var merge = require('./tool.js');
var expect = require('chai').expect;

describe('测试merge', function() {
  it('[1,2,3] 和 [4,5,6] merge之后应该等于 [1,2,3,4,5,6]', function() {
    expect(merge([1,2,3], [4,5,6]).length).to.be.equal([1,2,3,4,5,6].length);
  });

});
