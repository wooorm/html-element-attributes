/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module html-element-attributes
 * @fileoverview Test suite for `html-element-attributes`.
 */

'use strict';

/* eslint-env node */

/*
 * Module dependencies.
 */

var test = require('tape');
var htmlElementAttributes = require('./index.js');

/*
 * Tests.
 */

test('htmlElementAttributes', function (t) {
    var tagName;

    t.equal(
        typeof htmlElementAttributes,
        'object',
        'should be an `object`'
    );

    for (tagName in htmlElementAttributes) {
        t.ok(
            Array.isArray(htmlElementAttributes[tagName]),
            '`' + tagName + '` should be an `array`'
        );
    }

    t.end();
});
