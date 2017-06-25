'use strict';

var assert = require('assert');
var test = require('tape');
var htmlElementAttributes = require('./');

test('htmlElementAttributes', function (t) {
  t.equal(
    typeof htmlElementAttributes,
    'object',
    'should be an `object`'
  );

  t.doesNotThrow(
    function () {
      Object.keys(htmlElementAttributes).forEach(function (name) {
        assert.ok(Array.isArray(htmlElementAttributes[name]), name);
      });
    },
    'values should be array'
  );

  t.doesNotThrow(
    function () {
      Object.keys(htmlElementAttributes).forEach(function (name) {
        var props = htmlElementAttributes[name];

        props.forEach(function (prop) {
          var label = prop + ' in ' + name;
          assert.ok(typeof prop, 'string', label + ' should be string');
          assert.equal(prop, prop.toLowerCase(), label + ' should be lower-case');
          assert.equal(prop, prop.trim(), label + ' should be trimmed');
          assert.ok(/^[a-z-]+$/.test(prop), label + ' should be `a-z-`');
        });
      });
    },
    'name should be lower-case, alphabetical strings'
  );

  t.end();
});
