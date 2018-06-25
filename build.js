'use strict'

var fs = require('fs')
var https = require('https')
var concat = require('concat-stream')
var trim = require('trim')
var bail = require('bail')
var unified = require('unified')
var html = require('rehype-parse')
var q = require('hast-util-select')
var toString = require('hast-util-to-string')
var ev = require('hast-util-is-event-handler')
var map = require('.')

var processor = unified().use(html)

// Global attributes.
var globals = map['*']

if (!globals) {
  globals = []
  map['*'] = globals
}

var counter = 0
var expect = 3

// Crawl HTML 4.
https.get('https://www.w3.org/TR/html4/index/attributes.html', onhtml4)

// Crawl W3C HTML 5.
https.get('https://www.w3.org/TR/html5/fullindex.html', onhtml5)

// Crawl WHATWG HTML.
https.get('https://html.spec.whatwg.org/multipage/indices.html', onhtml)

function onhtml4(res) {
  res.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buf) {
    var nodes = q.selectAll('table tr', processor.parse(buf))

    // Throw if we didn’t match, e.g., when the spec updates.
    if (nodes.length === 0) {
      throw new Error('Missing results in html4')
    }

    nodes.forEach(each)

    done()
  }

  function each(node) {
    var name = q.select('[title="Name"]', node)
    var elements = q.select('[title="Related Elements"]', node)

    if (!name || !elements) {
      return
    }

    name = trim(toString(name))
    elements = toString(elements)

    if (!name || ev(name)) {
      return
    }

    if (/All elements/.test(elements)) {
      elements = ['*']
    } else {
      elements = elements.split(/,/g)
    }

    elements.forEach(add(name))
  }
}

function onhtml5(res) {
  res.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buf) {
    var table = q.select('#attributes-table ~ table', processor.parse(buf))
    var nodes = q.selectAll('tbody tr', table)

    // Throw if we didn’t match, e.g., when the spec updates.
    if (nodes.length === 0) {
      throw new Error('Missing results in html5')
    }

    nodes.forEach(each)

    done()
  }

  function each(node) {
    var name = toString(q.select('th', node)).trim()
    var elements = toString(q.select('td', node)).trim()

    if (/HTML elements/.test(elements)) {
      elements = ['*']
    } else {
      elements = elements.split(/;/g).map(trim)
    }

    elements.forEach(add(name))
  }
}

function onhtml(res) {
  res.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buf) {
    var nodes = q.selectAll('#attributes-1 tbody tr', processor.parse(buf))

    // Throw if we didn’t match, e.g., when the spec updates.
    if (nodes.length === 0) {
      throw new Error('Missing results in html')
    }

    nodes.forEach(each)

    done()
  }

  function each(node) {
    var name = toString(node.children[0]).trim()
    var elements = toString(node.children[1]).trim()

    if (/HTML elements/.test(elements)) {
      elements = ['*']
    } else {
      elements = elements.split(/;/g).map(trim)
    }

    elements.forEach(add(name))
  }
}

// Generate the map.
function done() {
  var result

  counter++

  if (counter !== expect) {
    return
  }

  result = {}

  Object.keys(map)
    .sort()
    .forEach(each)

  fs.writeFile('index.json', JSON.stringify(result, 0, 2) + '\n', bail)

  function each(key) {
    result[key] = map[key]
    map[key] = map[key].sort()

    if (key === '*') {
      return
    }

    map[key] = map[key].filter(function(attribute) {
      return globals.indexOf(attribute) === -1
    })

    if (map[key].length === 0) {
      delete map[key]
    }
  }
}

function add(name) {
  return fn

  function fn(element) {
    var tagName = element.toLowerCase().trim()
    var attributes = map[tagName] || (map[tagName] = [])

    if (attributes.indexOf(name) === -1) {
      attributes.push(name)
    }
  }
}
