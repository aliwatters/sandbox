'use strict';

var test = require('tape');

var tests = 1;
var testsComplete = 0;

function runTests() {
  test('placeholder', function(t) {
    t.plan(1);
  });
}

server.start(runTests);
