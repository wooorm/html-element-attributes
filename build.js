'use strict';

/* Dependencies. */
var fs = require('fs');
var https = require('https');
var cheerio = require('cheerio');
var trim = require('trim');
var bail = require('bail');
var concat = require('concat-stream');
var map = require('./');

/* Global attributes. */
var globals = map['*'];

if (!globals) {
  globals = map['*'] = [];
}

/* Input / output locations. */
var html4 = 'https://www.w3.org/TR/html4/index/attributes.html';
var w3c = 'https://www.w3.org/TR/html5/index.html';
var whatwg = 'https://html.spec.whatwg.org/multipage/indices.html';
var output = 'index.json';

var counter = 0;
var expect = 3;

/* Crawl HTML 4. */
load(html4, function (err, doc) {
  bail(err);

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

    elements.forEach(add(name));
  }

  done();
});

/* Crawl W3C HTML 5. */
load(w3c, function (err, doc) {
  bail(err);

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

    elements.forEach(add(name));
  }

  done();
});

/* Crawl WHATWG HTML 5. */
load(whatwg, function (err, doc) {
  bail(err);

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

    elements.forEach(add(name));
  }

  done();
});

/* Load. */
function load(url, callback) {
  https.get(url, function (res) {
    res
      .pipe(concat(function (buf) {
        callback(null, buf);
      }))
      .on('error', callback);
  });
}

/**
 * Generate the map.
 */
function done() {
  counter++;

  if (counter !== expect) {
    return;
  }

  Object.keys(map).forEach(function (key) {
    map[key] = map[key].sort();

    if (key === '*') {
      return;
    }

    map[key] = map[key].filter(function (attribute) {
      return globals.indexOf(attribute) === -1;
    });

    if (map[key].length === 0) {
      delete map[key];
    }
  });

  fs.writeFile(output, JSON.stringify(map, 0, 2) + '\n', bail);
}

function add(name) {
  return fn;
  function fn(element) {
    var tagName = element.toLowerCase().trim();
    var attributes = map[tagName] || (map[tagName] = []);

    if (attributes.indexOf(name) === -1) {
      attributes.push(name);
    }
  }
}
