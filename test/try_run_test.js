"use strict";

var tryRun = require("../lib/try_run");
var expect = require("expect.js");

describe("tryRun", function () {
  var innerErr = new Error("Inner function failed");

  describe("without configured retry", function () {
    it("calls the provided function once", function (done) {
      var innerCalls = 0;
      tryRun(0, {}, function (callback) {
        innerCalls += 1;
        callback(innerErr);
      }, function (err) {
        expect(innerCalls).to.equal(1);
        expect(err).to.equal(innerErr);
        done();
      });
    });
  });

  describe("with configured retry", function () {
    var retryOptions = {
      retries: 2,
      timeout: 10
    };

    it("calls the provided function once when no error is returned", function (done) {
      var innerCalls = 0;
      tryRun(0, retryOptions, function (callback) {
        innerCalls += 1;
        callback(null);
      }, function (err) {
        expect(err).to.not.be.ok();
        expect(innerCalls).to.be(1);
        done();
      });
    });

    it("retries up-to connectRetries when the function returns an error", function (done) {
      var innerCalls = 0;
      tryRun(0, retryOptions, function (callback) {
        innerCalls += 1;
        callback(innerErr);
      }, function (err) {
        expect(err).to.equal(innerErr);
        expect(innerCalls).to.be(3);
        done();
      });
    });

    it("waits timeout between retries", function (done) {
      var start = Date.now();
      tryRun(0, retryOptions, function (callback) {
        callback(innerErr);
      }, function () {
        var end = Date.now();
        expect(end - start).greaterThan(19); // Double timeout-1
        done();
      });
    });
  });
});
