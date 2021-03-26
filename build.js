'use strict'

var fs = require('fs')
var https = require('https')
var concat = require('concat-stream')
var bail = require('bail')
var unified = require('unified')
var html = require('rehype-parse')
var q = require('hast-util-select')
var toString = require('hast-util-to-string')
var map = require('.')

var processor = unified().use(html)

// Global attributes.
var globals = map['*']

if (!globals) {
  globals = []
  map['*'] = globals
}

// Crawl WHATWG HTML.
https.get('https://html.spec.whatwg.org/multipage/indices.html', onhtml)

function onhtml(response) {
  response.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buf) {
    var nodes = q.selectAll('#attributes-1 tbody tr', processor.parse(buf))
    var index = -1
    var result = {}
    var keys
    var key
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
        : elements.split(/;/g).map((d) => d.replace(/\([^)]+\)/g, '').trim())

      while (++offset < elements.length) {
        tagName = elements[offset].toLowerCase().trim()
        attributes = map[tagName] || (map[tagName] = [])

        if (!attributes.includes(name)) {
          attributes.push(name)
        }
      }
    }

    keys = Object.keys(map).sort()
    index = -1

    while (++index < keys.length) {
      key = keys[index]
      map[key].sort()

      if (key !== '*') {
        map[key] = map[key].filter(function (attribute) {
          return !globals.includes(attribute)
        })
      }

      if (map[key].length > 0) {
        result[key] = map[key]
      }
    }

    fs.writeFile('index.json', JSON.stringify(result, null, 2) + '\n', bail)
  }
}
