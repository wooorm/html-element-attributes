/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module html-element-attributes:script:build
 * @fileoverview Crawl the tables.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var https = require('https');
var cheerio = require('cheerio');
var trim = require('trim');
var bail = require('bail');
var map = require('..');

/*
 * Global attributes.
 */

var globals = map['*'];

if (!globals) {
    globals = map['*'] = [];
}

/*
 * Input / output locations.
 */

var html4 = 'https://www.w3.org/TR/html4/index/attributes.html';
var w3c = 'https://www.w3.org/TR/html5/index.html';
var whatwg = 'https://html.spec.whatwg.org/multipage/indices.html';
var output = path.join(__dirname, '..', 'index.json');

/**
 * Load.
 *
 * @param {string} url - Resource to crawl.
 * @param {Function} callback - Invoked with document.
 */
function load(url, callback) {
    https.get(url, function (res, err) {
        var value = '';

        if (err) {
            return callback(err);
        }

        res
            .setEncoding('utf8')
            .on('data', function (buf) {
                value += buf;
            }).on('end', function () {
                return callback(null, value);
            });
    });
}

var counter = 0;
var expect = 3;

/**
 * Generate the map.
 */
function done() {
    var key;

    counter++;

    if (counter !== expect) {
        return;
    }

    for (key in map) {
        map[key] = map[key].sort();

        if (key === '*') {
            continue;
        }

        map[key] = map[key].filter(function (attribute) {
            return globals.indexOf(attribute) === -1;
        });

        if (!map[key].length) {
            delete map[key];
        }

    }

    fs.writeFile(output, JSON.stringify(map, 0, 2) + '\n', bail);
}

/*
 * Crawl HTML 4.
 */

load(html4, function (err, doc) {
    if (err) {
        bail(err);
    }

    var $ = cheerio.load(doc);
    var rows = $('table tr');
    var position = -1;
    var length = rows.length;
    var node;
    var name;
    var elements;

    while (++position < length) {
        node = $(rows[position]);
        name = trim(node.find('[title="Name"]').text());
        elements = node.find('[title="Related Elements"]').text();

        if (!name || name.slice(0, 2) === 'on') {
            continue;
        }

        if (/All elements/.test(elements)) {
            elements = ['*'];
        } else {
            elements = elements.split(/,/g);
        }

        elements.forEach(function (element) {
            var attributes;

            element = trim(element).toLowerCase();
            attributes = map[element] || (map[element] = []);

            if (attributes.indexOf(name) === -1) {
                attributes.push(name);
            }
        });
    }

    done();
});

/*
 * Crawl W3C HTML 5.
 */

load(w3c, function (err, doc) {
    if (err) {
        bail(err);
    }

    var $ = cheerio.load(doc);
    var rows = $('#attributes-1').next().next().find('tr');
    var position = 0;
    var length = rows.length;
    var name;
    var elements;

    while (++position < length) {
        name = $(rows[position].children[0]).text().trim();
        elements = $(rows[position].children[1]).text().trim();

        if (/HTML elements/.test(elements)) {
            elements = ['*'];
        } else {
            elements = elements.split(/;/g).map(trim);
        }

        elements.forEach(function (element) {
            var attributes = map[element] || (map[element] = []);

            if (attributes.indexOf(name) === -1) {
                attributes.push(name);
            }
        });
    }

    done();
});

/*
 * Crawl WHATWG HTML 5.
 */

load(whatwg, function (err, doc) {
    if (err) {
        bail(err);
    }

    var $ = cheerio.load(doc);
    var rows = $('#attributes-1 tbody tr');
    var position = 0;
    var length = rows.length;
    var name;
    var elements;

    while (++position < length) {
        name = $(rows[position].children[0]).text().trim();
        elements = $(rows[position].children[1]).text().trim();

        if (/HTML elements/.test(elements)) {
            elements = ['*'];
        } else {
            elements = elements.split(/;/g).map(trim);
        }

        elements.forEach(function (element) {
            var attributes = map[element] || (map[element] = []);

            if (attributes.indexOf(name) === -1) {
                attributes.push(name);
            }
        });
    }

    done();
});
