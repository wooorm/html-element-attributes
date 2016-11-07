'use strict';

/* Dependencies. */
var fs = require('fs');
var jsdom = require('jsdom');
var trim = require('trim');
var bail = require('bail');
var ev = require('hast-util-is-event-handler');
var map = require('./');

/* Global attributes. */
var globals = map['*'];

if (!globals) {
  globals = map['*'] = [];
}

var counter = 0;
var expect = 3;

/* Crawl HTML 4. */
jsdom.env('https://www.w3.org/TR/html4/index/attributes.html', function (err, window) {
  bail(err);

  var rows = window.document.querySelectorAll('table tr');
  var position = -1;
  var length = rows.length;
  var node;
  var name;
  var elements;
  map = {};

  while (++position < length) {
    node = rows[position];
    name = node.querySelector('[title="Name"]');
    elements = node.querySelector('[title="Related Elements"]');

    if (!name || !elements) {
      continue;
    }

    name = trim(name.textContent);
    elements = elements.textContent;

    if (!name || ev(name)) {
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
jsdom.env('https://www.w3.org/TR/html5/index.html', function (err, window) {
  bail(err);

  var doc = window.document;
  var heading = doc.getElementById('attributes-1');
  var table = heading.nextElementSibling.nextElementSibling;
  var rows = table.getElementsByTagName('tr');
  var position = 0;
  var length = rows.length;
  var name;
  var elements;

  while (++position < length) {
    name = rows[position].children[0].textContent.trim();
    elements = rows[position].children[1].textContent.trim();

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
jsdom.env('https://html.spec.whatwg.org/multipage/indices.html', function (err, window) {
  bail(err);

  var rows = window.document.querySelectorAll('#attributes-1 tbody tr');
  var position = 0;
  var length = rows.length;
  var name;
  var elements;

  while (++position < length) {
    name = rows[position].children[0].textContent.trim();
    elements = rows[position].children[1].textContent.trim();

    if (/HTML elements/.test(elements)) {
      elements = ['*'];
    } else {
      elements = elements.split(/;/g).map(trim);
    }

    elements.forEach(add(name));
  }

  done();
});

/* Generate the map. */
function done() {
  var result;

  counter++;

  if (counter !== expect) {
    return;
  }

  result = {};

  Object.keys(map).sort().forEach(function (key) {
    result[key] = map[key];
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

  fs.writeFile('index.json', JSON.stringify(result, 0, 2) + '\n', bail);
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
