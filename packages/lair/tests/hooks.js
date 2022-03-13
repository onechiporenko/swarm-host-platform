/* eslint-disable */
var chai = require('chai');
var chaiAssertionsCount = require('chai-assertions-count');

chai.use(chaiAssertionsCount);

module.exports = {
  beforeEach: function () {
    chai.Assertion.resetAssertsCheck();
  },
  afterEach: function () {
    chai.Assertion.checkAssertionsCount();
    chai.Assertion.checkExpectsCount();
  },
};
