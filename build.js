'use strict';

var fs = require('fs');
var https = require('https');
var concat = require('concat-stream');
var trim = require('trim');
var bail = require('bail');
var unified = require('unified');
var html = require('rehype-parse');
var q = require('hast-util-select');
var toString = require('hast-util-to-string');
var ev = require('hast-util-is-event-handler');
var map = require('./');

/* Global attributes. */
var globals = map['*'];

if (!globals) {
  globals = [];
  map['*'] = globals;
}

var counter = 0;
var expect = 3;

/* Crawl HTML 4. */
https.get('https://www.w3.org/TR/html4/index/attributes.html', function (res) {
  res.pipe(concat(onconcat)).on('error', bail);

  function onconcat(buf) {
    q.selectAll('table tr', unified().use(html).parse(buf)).forEach(each);

    done();

    function each(node) {
      var name = q.select('[title="Name"]', node);
      var elements = q.select('[title="Related Elements"]', node);

      if (!name || !elements) {
        return;
      }

      name = trim(toString(name));
      elements = toString(elements);

      if (!name || ev(name)) {
        return;
      }

      if (/All elements/.test(elements)) {
        elements = ['*'];
      } else {
        elements = elements.split(/,/g);
      }

      elements.forEach(add(name));
    }
  }
});

/* Crawl W3C HTML 5. */
https.get('https://www.w3.org/TR/html5/index.html', function (res) {
  res.pipe(concat(onconcat)).on('error', bail);

  function onconcat(buf) {
    var table = q.select('#attributes-1 ~ table', unified().use(html).parse(buf));

    q.selectAll('tr:not(:first-child)', table).forEach(each);

    done();

    function each(node) {
      var name = toString(node.children[0]).trim();
      var elements = toString(node.children[1]).trim();

      if (/HTML elements/.test(elements)) {
        elements = ['*'];
      } else {
        elements = elements.split(/;/g).map(trim);
      }

      elements.forEach(add(name));
    }
  }
});

/* Crawl WHATWG HTML. */
https.get('https://www.w3.org/TR/html5/index.html', function (res) {
  res.pipe(concat(onconcat)).on('error', bail);

  function onconcat(buf) {
    q.selectAll('#attributes-1 tbody tr:not(:first-child)', unified().use(html).parse(buf)).forEach(each);

    done();

    function each(node) {
      var name = toString(node.children[0]).trim();
      var elements = toString(node.children[1]).trim();

      if (/HTML elements/.test(elements)) {
        elements = ['*'];
      } else {
        elements = elements.split(/;/g).map(trim);
      }

      elements.forEach(add(name));
    }
  }
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
