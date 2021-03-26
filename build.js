'use strict'

var fs = require('fs')
var https = require('https')
var concat = require('concat-stream')
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
var expect = 2

// Crawl HTML 4.
https.get('https://www.w3.org/TR/html4/index/attributes.html', onhtml4)

// Crawl WHATWG HTML.
https.get('https://html.spec.whatwg.org/multipage/indices.html', onhtml)

function onhtml4(response) {
  response.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buf) {
    var nodes = q.selectAll('table tr', processor.parse(buf))
    var index = -1
    var offset
    var name
    var elements
    var tagName
    var attributes

    // Throw if we didn’t match, e.g., when the spec updates.
    if (nodes.length === 0) {
      throw new Error('Missing results in html4')
    }

    while (++index < nodes.length) {
      name = q.select('[title="Name"]', nodes[index])
      elements = q.select('[title="Related Elements"]', nodes[index])

      if (!name || !elements) {
        continue
      }

      name = toString(name).trim()
      elements = toString(elements)

      if (!name || ev(name)) {
        continue
      }

      elements = /All elements/.test(elements) ? ['*'] : elements.split(/,/g)
      offset = -1
      while (++offset < elements.length) {
        tagName = elements[offset].toLowerCase().trim()
        attributes = map[tagName] || (map[tagName] = [])

        if (!attributes.includes(name)) {
          attributes.push(name)
        }
      }
    }

    done()
  }
}

function onhtml(response) {
  response.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buf) {
    var nodes = q.selectAll('#attributes-1 tbody tr', processor.parse(buf))
    var index = -1
    var name
    var elements
    var tagName
    var attributes
    var offset

    // Throw if we didn’t match, e.g., when the spec updates.
    if (nodes.length === 0) {
      throw new Error('Missing results in html')
    }

    while (++index < nodes.length) {
      name = toString(nodes[index].children[0]).trim()
      elements = toString(nodes[index].children[1]).trim()

      if (/custom elements/i.test(elements)) {
        continue
      }

      offset = -1
      elements = /HTML elements/.test(elements)
        ? ['*']
        : elements.split(/;/g).map((d) => d.trim())

      while (++offset < elements.length) {
        tagName = elements[offset].toLowerCase().trim()
        attributes = map[tagName] || (map[tagName] = [])

        if (!attributes.includes(name)) {
          attributes.push(name)
        }
      }
    }

    done()
  }
}

// Generate the map.
function done() {
  counter++

  if (counter !== expect) {
    return
  }

  var result = {}
  var keys = Object.keys(map).sort()
  var index = -1
  var key

  while (++index < keys.length) {
    key = keys[index]
    result[key] = map[key]
    map[key] = map[key].sort()

    if (key === '*') {
      continue
    }

    map[key] = map[key].filter(function (attribute) {
      return !globals.includes(attribute)
    })

    if (map[key].length === 0) {
      delete map[key]
    }
  }

  fs.writeFile('index.json', JSON.stringify(result, 0, 2) + '\n', bail)
}
